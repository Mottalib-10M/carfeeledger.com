/**
 * Oklahoma (68 O.S. §§ 2103, 2104, 2106, 1355; 47 O.S. §§ 1132, 1132.7; Service Oklahoma fee page).
 * - Excise tax at title transfer: 3.25% of the value of a new vehicle; on a used vehicle $20 on the first $1,500 of
 *   value and 3.25% of the rest. Since July 1, 2026 the value is the actual sales price (Laws 2025, c. 252). The
 *   amount is rounded to the nearest dollar. The trade-in is not deducted (see gaps).
 * - Sales tax: 1.25% of the gross receipts of a dealer sale, computed on the price less the trade-in. Whether it
 *   applies to a private sale is not stated in the text read: range [0, 1.25%].
 * - Registration by years of registration (counted from the model year), title fee, insurance verification fee,
 *   EV / plug-in hybrid motor fuels tax fee.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, bracket, forTransaction, line, roundDollar } from '../helpers';

type P = {
  excise: { newRate: number; usedFlat: number; usedFlatUpTo: number; usedRate: number; source: string };
  salesTax: { rate: number; source: string };
  reg: { brackets: { upTo: number | null; amount: number }[]; source: string };
  once: { title: number; insurance: number; source: string; insuranceSource: string };
  ev: { ev: number; phev: number; source: string };
};

export function okExcise(p: P['excise'], value: number, isNew: boolean) {
  const raw = isNew ? value * p.newRate : value <= p.usedFlatUpTo ? p.usedFlat : p.usedFlat + (value - p.usedFlatUpTo) * p.usedRate;
  return roundDollar(raw);
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const isNew = i.condition === 'new';
  if (i.transaction === 'purchase') {
    lines.push(line({ id: 'sales-tax', label: isNew ? 'Motor vehicle excise tax (3.25%)' : 'Motor vehicle excise tax ($20 on the first $1,500, then 3.25%)', kind: 'tax', amount: okExcise(p.excise, i.price, isNew), when: 'once', source: p.excise.source, note: 'On the actual sales price, rounded to the nearest dollar; the trade-in is not deducted.' }));
    const stBase = Math.max(0, i.price - i.tradeIn);
    if (i.seller === 'dealer') {
      lines.push(line({ id: 'sales-tax-125', label: 'State sales tax on vehicles (1.25%)', kind: 'tax', amount: stBase * p.salesTax.rate, when: 'once', source: p.salesTax.source, note: i.tradeIn > 0 ? 'Charged on the price less the trade-in.' : undefined }));
    } else {
      lines.push(line({ id: 'sales-tax-125', label: 'State sales tax on vehicles (1.25%), if charged on a private sale', kind: 'tax', amount: null, range: [0, Math.round(stBase * p.salesTax.rate * 100) / 100], when: 'once', source: p.salesTax.source, note: 'The law levies it on sales of vehicles; the texts read do not say whether Service Oklahoma charges it on a private sale.' }));
    }
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.once.title, when: 'once', source: p.once.source }));
    lines.push(line({ id: 'insurance', label: 'Insurance verification fee', kind: 'other', amount: p.once.insurance, when: 'once', source: p.once.insuranceSource }));
  }
  const a = age(i);
  lines.push(line({ id: 'reg', label: `Registration (year ${a + 1} of registration)`, kind: 'registration', amount: bracket(p.reg.brackets, a).amount, years: 1, when: 'cycle', source: p.reg.source }));
  const ev = i.fuel === 'ev' ? p.ev.ev : i.fuel === 'phev' ? p.ev.phev : 0;
  if (ev > 0) lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Motor fuels tax fee (electric)' : 'Motor fuels tax fee (plug-in hybrid)', kind: 'ev', amount: ev, years: 1, when: 'cycle', source: p.ev.source }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
