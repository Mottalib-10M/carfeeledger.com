/**
 * North Carolina: the generic engine (params.g) for the 3% highway use tax, the title, the registration fee, the
 * county and regional transit registration taxes, the EV / plug-in hybrid fees and the county property tax range,
 * plus the yearly inspection (params.nc), which the generic engine cannot express as "either / or":
 * - in the 19 emissions counties, a gasoline car pays the combined safety + emissions fee, except when it is less
 *   than 3 model years old or 20 years old or more (then safety only);
 * - elsewhere, and for electric cars, the safety inspection only.
 * A car sold by a dealer was inspected before the sale, so the first inspection falls due at the first renewal
 * (deferred); a car bought from a private seller must be inspected before it is registered.
 */
import type { StateEngine } from '../types';
import { age, county, line } from '../helpers';
import generic from '../generic';

type P = { nc: { safety: number; combined: number; emissionsExemptUnder: number; emissionsExemptFrom: number; source: string } };

export function ncInspection(p: P['nc'], emissionsCounty: boolean, fuel: string, a: number) {
  const emissions = emissionsCounty && fuel !== 'ev' && a >= p.emissionsExemptUnder && a < p.emissionsExemptFrom;
  return { emissions, amount: emissions ? p.combined : p.safety };
}

const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const p = (d.params as unknown as P).nc;
  const c = county(i, d);
  const { emissions, amount } = ncInspection(p, Boolean(c?.emissions), i.fuel, age(i));
  const dealerPurchase = i.transaction === 'purchase' && i.seller === 'dealer';
  const lines = [...r.lines, line({
    id: 'inspection', label: emissions ? 'Annual safety and emissions inspection' : 'Annual safety inspection', kind: 'inspection', amount, years: 1, when: 'cycle', source: p.source,
    deferred: dealerPurchase ? true : undefined,
    note: dealerPurchase ? 'The dealer has the car inspected before the sale; your first inspection is due within 90 days before the first renewal.' : 'Paid to the inspection station; required within 90 days before each renewal.',
  })];
  return { lines, notes: r.notes };
};
export default compute;
