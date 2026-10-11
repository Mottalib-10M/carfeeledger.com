import type { FeeLine, StateEngine } from '../types';
import { forTransaction, line } from '../helpers';

type P = {
  tax: { rate: number; tradeInBase: number; tradeInBaseYear: number; tradeInStep: number; tradeInUnlimitedAbove: number };
  title: { fee: number };
  reg: { floorUpTo: number; floorTax: number; firstStepTax: number; firstStepUpTo: number; perThousand: number; reductions: number[]; addOn: number; addOnUntil: string; addOnLastYear: number };
  ev: { year: number; ev: number; phev: number; heavyFromLbs: number; evHeavy: number; phevHeavy: number };
};

/** MCL 257.801(1)(r): a result not in whole dollars goes down when it ends in 50 cents or less, up when 51 cents or more. */
export const miRound = (x: number) => { const c = Math.round(x * 100); const f = c % 100; return (c - f) / 100 + (f <= 50 ? 0 : 1); };

/** Trade-in credit cap of MCL 205.51(1)(d)(xii): $5,000 in 2019 + $1,000 a year; no limit once the amount exceeds $14,000. */
export function tradeInCap(p: P['tax'], year: number): number {
  const cap = p.tradeInBase + p.tradeInStep * Math.max(0, year - p.tradeInBaseYear);
  return cap > p.tradeInUnlimitedAbove ? Infinity : cap;
}

/** Base registration tax of MCL 257.801(1)(p)(i) on the list price. */
export function listTax(p: P['reg'], list: number): number {
  if (list <= p.floorUpTo) return p.floorTax;
  return p.firstStepTax + p.perThousand * Math.max(0, Math.ceil(list / 1000 - 1e-9) - p.firstStepUpTo / 1000);
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const dealer = i.seller === 'dealer';
  if (purchase) {
    const cap = tradeInCap(p.tax, i.year);
    const credit = dealer ? Math.min(i.tradeIn, cap) : 0;
    const base = Math.max(0, i.price + (dealer ? i.docFee : 0) - credit);
    lines.push(line({ id: 'sales-tax', label: dealer ? 'Sales tax (6%)' : 'Use tax on a private sale (6%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: dealer ? 'dealer-manual' : 'title-transfer', note: dealer && i.tradeIn > 0 ? (Number.isFinite(cap) ? `Trade-in credit limited to $${cap.toLocaleString('en-US')} in ${i.year}.` : 'Trade-in credit without limit.') : undefined }));
    lines.push(line({ id: 'title', label: 'Title transfer fee', kind: 'title', amount: p.title.fee, when: 'once', source: 'title-transfer' }));
  }
  const list = i.msrp > 0 ? i.msrp : i.price;
  const k = Math.max(0, i.year - i.modelYear);
  const factor = p.reg.reductions[Math.min(k, p.reg.reductions.length - 1)];
  const reg = miRound(listTax(p.reg, list) * factor);
  lines.push(line({ id: 'reg', label: `Registration tax on the list price${factor < 1 ? ` (${+(factor * 100).toFixed(1)}% of the first-year tax)` : ''}`, kind: 'registration', amount: reg, when: 'cycle', source: 'mcl-801', note: purchase ? 'Shown for 12 months; a new plate runs to your birthday, so the first payment is prorated.' : undefined }));
  // The two add-ons expire on October 1, 2027 under current law: kept through 2027, dropped after.
  if (i.year <= p.reg.addOnLastYear) lines.push(line({ id: 'reg-addon', label: 'Regulatory and transportation administration fees ($2.25 + $5.75)', kind: 'registration', amount: p.reg.addOn, when: 'cycle', source: 'mcl-801', note: `In force until ${p.reg.addOnUntil}.` }));
  if (i.fuel === 'ev' || i.fuel === 'phev') {
    const heavy = i.weightLbs > p.ev.heavyFromLbs;
    const amt = i.fuel === 'ev' ? (heavy ? p.ev.evHeavy : p.ev.ev) : heavy ? p.ev.phevHeavy : p.ev.phev;
    const known = i.year <= p.ev.year;
    lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Electric vehicle registration fees' : 'Plug-in hybrid registration fees', kind: 'ev', amount: known ? amt : null, when: 'cycle', source: 'ev-fee', note: known ? 'Base fee plus the gas-tax fee tied to the fuel tax (2026 amounts).' : `Follows the motor fuel tax, re-indexed each January; $${amt} in ${p.ev.year}.` }));
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
