import type { StateEngine } from '../types';
import generic from '../generic';
import { cents, county, line, taxableBase } from '../helpers';

/**
 * Idaho: the generic engine computes the 6% tax, the age-based registration, the EMS/ISP fees, the county
 * registration admin fee (counties[].localFee) and the Ada County highway district fee. This wrapper adds what
 * it cannot express:
 * - the county title admin fee charged on top of the $14 state title fee (counties[].titleAdmin, ITD table);
 * - no trade-in credit on a private sale (Tax Commission vehicle guide).
 */
const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const g = (d.params as { g: { tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean } } }).g;
  if (i.transaction !== 'purchase') return r;
  if (i.seller === 'private' && i.tradeIn > 0) {
    for (const l of r.lines) if (l.id === 'sales-tax') l.amount = cents(taxableBase({ ...i, tradeIn: 0 }, g.tax) * g.tax.rate);
  }
  const c = county(i, d);
  const fee = typeof c?.titleAdmin === 'number' ? c.titleAdmin : 0;
  if (fee > 0) {
    const at = r.lines.findIndex((l) => l.id === 'title') + 1;
    r.lines.splice(at, 0, line({ id: 'title-admin', label: `County title admin fee (${c!.name})`, kind: 'title', amount: fee, when: 'once', source: 'itd-reg' }));
  }
  return r;
};
export default compute;
