import type { StateEngine } from '../types';
import generic from '../generic';
import { cents } from '../helpers';

type DocFee = { under400: number; upTo500: number; per100: number };

/**
 * Delaware motor vehicle document fee, 30 Del. C. § 3002(c) as amended by 85 Del. Laws c. 40 (October 1, 2025):
 * $8 below $400, $13.75 from $400 to $500, then $5.25 for each additional $100 of purchase price or fraction,
 * rounded to the nearest dollar. "Purchase price" is the price less any trade-in (§ 3001(5)).
 */
export function documentFee(p: DocFee, price: number) {
  if (price < 400) return p.under400;
  if (price <= 500) return p.upTo500;
  return Math.round(cents(p.upTo500 + p.per100 * Math.ceil((price - 500) / 100 - 1e-9)) + 1e-9);
}

/** Everything else (title, $40 registration, alternative fuel fee, free inspection) runs on the generic engine. */
const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const p = (d.params as { docFee: DocFee }).docFee;
  const base = Math.max(0, i.price - i.tradeIn);
  for (const l of r.lines) if (l.id === 'sales-tax') {
    l.amount = documentFee(p, base);
    l.note = `$13.75 for the first $500, then $5.25 per extra $100 or fraction of $${base.toLocaleString('en-US')}, rounded to the dollar.`;
  }
  return r;
};
export default compute;
