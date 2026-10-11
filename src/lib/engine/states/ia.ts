import type { FeeLine, StateEngine } from '../types';
import { age, forTransaction, line, taxableBase } from '../helpers';

type P = {
  fnr: { flat: number; rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  title: number;
  /** Iowa Code 321.109 and 321.113: pct of list price + perCwt per 100 lb (or fraction); value part reduced with age; flat fee from flatFromAge. */
  reg: { pct: number; perCwt: number; valueFactors: { minAge: number; factor: number }[]; minTotal: number; flatFromAge: number; flat: number };
  ev: { ev: number; phev: number };
};

/** Annual registration fee, or null when the list price is unknown (used car with no MSRP typed). */
export function iaReg(p: P, listPrice: number | null, lbs: number, a: number): number | null {
  if (a >= p.reg.flatFromAge) return p.reg.flat;
  if (listPrice === null) return null;
  let factor = 1;
  for (const f of p.reg.valueFactors) if (a >= f.minAge) factor = f.factor;
  const fee = listPrice * p.reg.pct * factor + Math.ceil(lbs / 100) * p.reg.perCwt;
  return factor < 1 ? Math.max(p.reg.minTotal, fee) : fee;
}

/** Iowa: fee for new registration ($10 + 5%), $30 title, registration on list price and weight, EV/PHEV fees. */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const a = age(i);
  if (i.transaction === 'purchase') {
    const base = taxableBase(i, p.fnr);
    lines.push(line({ id: 'sales-tax', label: 'Fee for new registration ($10 + 5%)', kind: 'tax', amount: p.fnr.flat + base * p.fnr.rate, when: 'once', source: 'code-321-105a', note: 'Trade-in deducted; collected by the county treasurer.' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'code-321-20' }));
  }
  // The list price is known when typed, or when this owner bought the car new (the price then stands for the list price).
  const boughtNew = i.year - i.ownedYears - i.modelYear <= 0;
  const list = i.msrp > 0 ? i.msrp : boughtNew ? i.price : null;
  const reg = iaReg(p, list, i.weightLbs, a);
  lines.push(line({
    id: 'reg', label: a >= p.reg.flatFromAge ? 'Annual registration (12 model years or older)' : 'Annual registration (1% of list price + 40¢ per 100 lb)', kind: 'registration', amount: reg, years: 1, when: 'cycle', source: 'code-321-109',
    note: reg === null ? 'Based on the original list price, not the price paid: type the MSRP to compute it.' : a > 7 && a < p.reg.flatFromAge ? 'Value part reduced for age (75% after seven model years, 50% after nine), $50 minimum.' : undefined,
  }));
  if (i.fuel === 'ev' || i.fuel === 'phev') lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Battery electric vehicle fee' : 'Plug-in hybrid fee', kind: 'ev', amount: i.fuel === 'ev' ? p.ev.ev : p.ev.phev, years: 1, when: 'cycle', source: 'code-321-116' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
