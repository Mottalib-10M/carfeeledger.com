import type { StateEngine } from '../types';
import generic from '../generic';
import { cents, taxableBase } from '../helpers';

type Lux = { threshold: number; rate: number };

/**
 * Connecticut: the generic engine handles the fees; this wrapper fixes the purchase tax.
 * - 7.75% instead of 6.35% when the sales price exceeds $50,000 (CGS § 12-408(1)(H)); DRS tests the threshold
 *   on the price before the trade-in, then taxes the price less the trade-in (CGS § 12-430(4)).
 * - The trade-in credit applies only to a purchase from a licensed dealer (DMV sales tax page).
 */
const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const p = d.params as { lux: Lux; g: { tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean } } };
  const lux = i.price > p.lux.threshold;
  const base = i.seller === 'dealer' ? taxableBase(i, p.g.tax) : i.price;
  for (const l of r.lines) if (l.id === 'sales-tax') {
    l.amount = cents(base * (lux ? p.lux.rate : p.g.tax.rate));
    if (lux) {
      l.label = 'Sales and use tax (7.75% above $50,000)';
      l.note = 'A price over $50,000 before the trade-in is taxed at 7.75% on the whole price less the trade-in.';
    }
  }
  return r;
};
export default compute;
