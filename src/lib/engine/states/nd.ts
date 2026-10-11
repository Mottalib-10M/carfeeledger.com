/**
 * North Dakota: the generic engine (params.g) for the 5% motor vehicle excise tax, the $5 title fee and the
 * electric / plug-in hybrid road use fees, plus the passenger registration fee of NDCC 39-04-19(2)(a), a table of
 * gross weight by years registered that the generic engine cannot read (params.nd). The year of registration is
 * counted from the model year (a 2026 model registered in 2026 is in its 1st year).
 */
import type { StateEngine } from '../types';
import { age, bracket, line } from '../helpers';
import generic from '../generic';

type Row = { upTo: number | null; byYears: number[] };
type P = { nd: { reg: Row[]; yearCols: number[]; regSource: string } };

/** Column index: years 1-6, 7-9, 10-12, 13+ (yearCols holds the first registration year of each column). */
export function ndReg(p: P['nd'], lbs: number, a: number) {
  const yearRegistered = a + 1;
  let col = 0;
  p.yearCols.forEach((from, k) => { if (yearRegistered >= from) col = k; });
  return bracket(p.reg, lbs).byYears[col];
}

const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const p = (d.params as unknown as P).nd;
  const a = age(i);
  const lines = r.lines.map((l) =>
    l.id === 'reg'
      ? line({ ...l, amount: ndReg(p, i.weightLbs, a), label: `Registration (by weight, year ${a + 1} of registration)`, source: p.regSource, note: 'Full-year fee; a car first registered after January pays only the remaining months (monthly proration).' })
      : l,
  );
  return { lines, notes: r.notes };
};
export default compute;
