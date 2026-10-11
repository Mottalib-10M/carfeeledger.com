/**
 * Ohio: the generic engine (params.g) for the 5.75% state sales tax plus the county (and transit) rate, the title,
 * the $36 registration, the deputy registrar fee, the EV / hybrid fees and the permissive tax range, with two
 * rules it cannot express (params.oh):
 * - R.C. 5739.01(H)(2): the trade-in reduces the taxable price only on a NEW vehicle sold by a new motor vehicle
 *   dealer (a used car, or a private sale, is taxed on the full price);
 * - E-Check (Ohio EPA): emissions test in 7 northeast counties for gasoline and diesel cars from 6 years old and
 *   non-plug-in hybrids from 7 years old, through 26 years old; electric and plug-in cars are not tested.
 */
import type { StateData, StateEngine } from '../types';
import { age, county, line } from '../helpers';
import generic from '../generic';

type P = { g: { tax: { tradeInCredit: boolean } }; oh: { echeck: { gasFrom: number; hybridFrom: number; upTo: number; years: number; source: string } } };

export function echeckDue(p: P['oh']['echeck'], fuel: string, a: number) {
  if (fuel === 'ev' || fuel === 'phev') return false;
  return a >= (fuel === 'hybrid' ? p.hybridFrom : p.gasFrom) && a <= p.upTo;
}

const compute: StateEngine = (i, d) => {
  const params = d.params as unknown as P;
  const newDealer = i.condition === 'new' && i.seller === 'dealer';
  const dd: StateData = { ...d, params: { ...d.params, g: { ...params.g, tax: { ...params.g.tax, tradeInCredit: newDealer } } } };
  const r = generic(i, dd);
  const lines = [...r.lines];
  const k = lines.findIndex((l) => l.id === 'sales-tax');
  if (k >= 0 && i.tradeIn > 0) lines[k] = { ...lines[k], note: newDealer ? 'Trade-in deducted (new vehicle from a new-car dealer).' : 'No trade-in credit: Ohio allows it only on a new vehicle bought from a new-car dealer.' };
  const c = county(i, d);
  const e = params.oh.echeck;
  if (c?.echeck && echeckDue(e, i.fuel, age(i))) {
    lines.push(line({ id: 'e-check', label: 'E-Check emissions test', kind: 'inspection', amount: null, years: e.years, when: 'cycle', source: e.source, note: 'Every two years in 7 northeast Ohio counties (even model years in even calendar years); also required when you buy a car without a current passing test.' }));
  }
  return { lines, notes: r.notes };
};
export default compute;
