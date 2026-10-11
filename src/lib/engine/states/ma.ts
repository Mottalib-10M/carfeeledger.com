import type { FeeLine, StateEngine } from '../types';
import { forTransaction, line } from '../helpers';

type P = {
  tax: { rate: number };
  title: { fee: number };
  reg: { fee: number; years: number };
  excise: { perThousand: number; yearBefore: number; schedule: number[]; min: number };
  inspection: { fee: number };
};

/**
 * Massachusetts: 6.25% sales or use tax (trade-in credit and taxable doc fee only on a sale by a Massachusetts dealer),
 * $75 title, $60 two-year passenger registration, the municipal motor vehicle excise of G.L. c. 60A §1
 * ($25 per $1,000 of a valuation set as a percentage of the manufacturer's list price by year of manufacture),
 * and the $35 yearly inspection.
 */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const dealer = i.seller === 'dealer';
  if (purchase) {
    const base = Math.max(0, i.price + (dealer ? i.docFee : 0) - (dealer ? i.tradeIn : 0));
    lines.push(line({ id: 'sales-tax', label: dealer ? 'Sales tax (6.25%)' : 'Use tax on a private sale (6.25%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: dealer ? 'dd14-1' : 'cmr', note: dealer ? (i.tradeIn > 0 ? 'Trade-in allowance deducted (sale by a Massachusetts dealer).' : undefined) : 'Charged on the price or the average trade-in value of the car, whichever is greater; no trade-in credit.' }));
    if (!dealer) notes.push('Private sale: the use tax is computed on the price paid or the NADA average trade-in value, whichever is greater; the calculator uses the price.');
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title.fee, when: 'once', source: 'fees' }));
  }
  lines.push(line({ id: 'reg', label: 'Passenger registration (2 years)', kind: 'registration', amount: p.reg.fee, years: p.reg.years, when: 'cycle', source: 'fees' }));
  // Valuation: % of the list price by year of manufacture (model year); the year before the model year = 50%.
  const k = i.year - i.modelYear;
  const pct = k < 0 ? p.excise.yearBefore : p.excise.schedule[Math.min(k, p.excise.schedule.length - 1)];
  const list = i.msrp > 0 ? i.msrp : i.price;
  const excise = Math.max(p.excise.min, (list * pct * p.excise.perThousand) / 1000);
  lines.push(line({ id: 'excise', label: `Motor vehicle excise (${Math.round(pct * 100)}% of the list price, $25 per $1,000)`, kind: 'value', amount: excise, when: 'cycle', source: 'c60a', deferred: purchase ? true : undefined, note: purchase ? 'Billed later by your city or town for the calendar year, prorated by month when the car is registered after January.' : 'Billed by your city or town for the calendar year.' }));
  lines.push(line({ id: 'inspection', label: 'Yearly safety and emissions inspection', kind: 'inspection', amount: p.inspection.fee, when: 'cycle', source: 'inspection', note: purchase ? 'Due within 7 days of registering the car, then every year.' : undefined }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
