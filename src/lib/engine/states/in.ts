/**
 * Indiana: the generic engine (params.g) for the sales tax, title, registration, TIIF, EV/hybrid fees and the
 * Lake/Porter emissions test, plus the yearly vehicle excise tax read from the BMV class-by-age table
 * (params.excise): class = manufacturer's original retail price (MSRP, else the price), age = registration
 * year - model year, the last column (9+) repeating.
 */
import type { StateEngine } from '../types';
import { age, bracket, line } from '../helpers';
import generic from '../generic';

type ExciseClass = { class: number; from: number; upTo: number | null; byAge: number[] };
type P = { excise: { classes: ExciseClass[]; source: string } };

export function exciseTax(p: P, retail: number, a: number): { cls: ExciseClass; amount: number } {
  const cls = bracket(p.excise.classes, retail);
  return { cls, amount: cls.byAge[Math.min(a, cls.byAge.length - 1)] };
}

const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const p = d.params as unknown as P;
  const retail = i.msrp > 0 ? i.msrp : i.price;
  const a = age(i);
  const { cls, amount } = exciseTax(p, retail, a);
  const ex = line({
    id: 'excise', label: `Vehicle excise tax (class ${cls.class}, age ${a >= 9 ? '9+' : a})`, kind: 'value', amount, years: 1, when: 'cycle', source: p.excise.source,
    note: `Class set by the original retail price${i.msrp > 0 ? '' : ' (the price typed is used; enter the MSRP if it differs)'}; the amount falls each year until age 9.`,
  });
  const k = r.lines.findIndex((l) => l.id === 'reg');
  const lines = [...r.lines];
  lines.splice(k + 1, 0, ex);
  return { lines, notes: r.notes };
};
export default compute;
