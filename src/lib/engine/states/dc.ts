import type { FeeLine, StateEngine } from '../types';
import { age, bracket, cents, forTransaction, line } from '../helpers';

type ExciseRow = { upTo: number | null; byMpg: number[]; ev: number };
type RegRow = { upTo: number | null; amount: number };
type P = {
  excise: { mpgBands: string[]; rows: ExciseRow[] };
  reg: { rows: RegRow[]; overLbs: number; perThousandOver: number; bev: { amount: number; years: number; underLbs: number; subtractLbs: number } };
  title: number;
  inspection: { newSticker: number; newYears: number; fee: number; years: number };
  regCard: number;
};

/**
 * District of Columbia (DC Code § 50-2201.03 and DC DMV fee pages, March 30, 2026 schedule).
 * - Excise tax at titling = fair market value x a rate set by unladen weight and city MPG (Feb. 17, 2025 table).
 *   The form does not ask the MPG, so a gasoline or hybrid car gets the official range of its weight class;
 *   a battery electric car has a single rate per weight class and is computed.
 * - Registration by weight class; a battery electric car under 5,000 lb subtracts 1,000 lb, and a brand-new one
 *   pays the Class V fee for its first two registration years.
 */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const purchase = i.transaction === 'purchase';
  const ev = i.fuel === 'ev';
  if (purchase) {
    const row = bracket(p.excise.rows, i.weightLbs);
    if (ev) {
      lines.push(line({ id: 'excise', label: `Excise tax (${+(row.ev * 100).toFixed(1)}% for an electric car of this weight)`, kind: 'tax', amount: i.price * row.ev, when: 'once', source: 'excise', note: 'Rate applied to the fair market value (NADA); the engine uses the price.' }));
    } else {
      const lo = Math.min(...row.byMpg), hi = Math.max(...row.byMpg);
      lines.push(line({ id: 'excise', label: `Excise tax (${+(lo * 100).toFixed(1)}% to ${+(hi * 100).toFixed(1)}% by city MPG)`, kind: 'tax', amount: null, range: [cents(i.price * lo), cents(i.price * hi)], when: 'once', source: 'excise', note: 'Fair market value times the rate of your weight class and city MPG: the lower the MPG, the higher the rate.' }));
    }
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'excise', note: '$20 more per lien recorded.' }));
  }
  const b = p.reg.bev;
  const bevLight = ev && i.weightLbs < b.underLbs;
  const brandNewBev = bevLight && ((purchase && i.condition === 'new') || (!purchase && i.ownedYears < b.years));
  let reg: number;
  let label: string;
  if (brandNewBev) { reg = b.amount; label = 'Registration, Class V (new electric car, first two years)'; }
  else {
    const w = bevLight ? i.weightLbs - b.subtractLbs : i.weightLbs;
    const row = bracket(p.reg.rows, w);
    reg = row.amount + (row.upTo === null && w > p.reg.overLbs ? Math.ceil((w - p.reg.overLbs) / 1000) * p.reg.perThousandOver : 0);
    label = `Registration by weight (${w.toLocaleString('en-US')} lb${bevLight ? ' after the 1,000 lb electric deduction' : ''})`;
  }
  lines.push(line({ id: 'reg', label, kind: 'registration', amount: reg, years: 1, when: 'cycle', source: 'reg-fees' }));
  lines.push(line({ id: 'reg-card', label: 'Registration card fee', kind: 'registration', amount: null, range: [0, p.regCard], when: 'cycle', source: 'reg-fees', note: 'Listed by DC DMV at $30 a year among additional fees; the page does not say it applies to every registration.' }));
  if (!ev) {
    if (purchase && i.condition === 'new') lines.push(line({ id: 'inspection', label: 'New car inspection sticker (4 years)', kind: 'inspection', amount: p.inspection.newSticker, years: p.inspection.newYears, when: 'cycle', source: 'inspection-fees', note: 'Brand-new cars are not taken through inspection.' }));
    else if (purchase || age(i) >= p.inspection.newYears) lines.push(line({ id: 'inspection', label: 'Emissions inspection (every two years)', kind: 'inspection', amount: p.inspection.fee, years: p.inspection.years, when: 'cycle', source: 'inspection-fees', note: 'Collected with the registration.' }));
  }
  return { lines: forTransaction(i, lines), notes: [] };
};
export default compute;
