/**
 * Tennessee: 7% state sales tax on the whole taxable price, the local rate of the county (or city) on the first
 * $1,600 only, and the 2.75% state single article tax on the part between $1,600 and $3,200 (Tenn. Code Ann.
 * 67-6-702, DOR SUT-6). Electric, hybrid and plug-in hybrid fees change by renewal date (Pub. Ch. 159 of 2023),
 * which the generic engine cannot express.
 */
import type { FeeLine, StateEngine } from '../types';
import { county, forTransaction, line, localRate, taxableBase } from '../helpers';

type Step = { from: number; fee: number | null };
type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean; localFirst: number; singleArticle: { rate: number; from: number; to: number } };
  title: number;
  reg: number;
  ev: { ev: Step[]; hybrid: Step[] };
};
/** Fee in force for a registration in year y; null once the statute switches to inflation indexing not yet published. */
export function stepFee(steps: Step[], y: number): number | null {
  let fee: number | null = null;
  for (const s of steps) if (s.from <= y) fee = s.fee;
  return fee;
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  if (i.transaction === 'purchase') {
    const base = taxableBase(i, p.tax);
    const lr = localRate(i, d);
    const c = county(i, d);
    lines.push(line({ id: 'sales-tax', label: 'State sales tax (7%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: 'sales-tax', note: 'On the price minus the trade-in; the dealer document fee is taxed.' }));
    lines.push(line({ id: 'local-tax', label: `Local sales tax (${+(lr * 100).toFixed(3)}% on the first $1,600${c ? `, ${c.name}` : ''})`, kind: 'tax', amount: lr * Math.min(base, p.tax.localFirst), when: 'once', source: 'local-rates' }));
    const sa = p.tax.singleArticle;
    lines.push(line({ id: 'single-article', label: 'State single article tax (2.75% from $1,600 to $3,200)', kind: 'tax', amount: sa.rate * Math.max(0, Math.min(base, sa.to) - sa.from), when: 'once', source: 'single-article' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'title' }));
  }
  lines.push(line({ id: 'reg', label: 'Registration (standard passenger plate)', kind: 'registration', amount: p.reg, when: 'cycle', source: 'reg' }));
  if (i.fuel !== 'gas') {
    const steps = i.fuel === 'ev' ? p.ev.ev : p.ev.hybrid;
    const fee = stepFee(steps, i.year);
    lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? `Electric vehicle registration fee (${i.year})` : `Hybrid or plug-in hybrid registration fee (${i.year})`, kind: 'ev', amount: fee, when: 'cycle', source: 'ev-fee', note: fee === null ? 'From 2028 the fee is adjusted each year for inflation; the amount is not published yet.' : undefined }));
  }
  lines.push(line({ id: 'wheel-tax', label: 'County wheel tax and clerk fees', kind: 'local', amount: null, when: 'cycle', source: 'reg', note: 'Set by each county and collected by the county clerk with the registration.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
