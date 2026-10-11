/**
 * New Mexico: the generic engine (params.g) for the 4% motor vehicle excise tax, the $3 title transaction fee,
 * the $2 administrative fee, the yearly add-on fees and the Bernalillo County Air Care test, plus two rules the
 * generic engine cannot express (params.nm):
 * - NMSA 66-6-2: the passenger registration fee depends on BOTH the gross factory shipping weight and whether the
 *   vehicle has had five years of registration (counted here from the model year);
 * - NMSA 66-6-6.4: the electric / plug-in hybrid fee starts on January 1, 2027 and rises each January until 2029.
 */
import type { StateEngine } from '../types';
import { age, bracket, line } from '../helpers';
import generic from '../generic';

type Row = { upTo: number | null; first5: number; after5: number };
type Step = { from: number; ev: number; phev: number };
type P = { nm: { reg: Row[]; reducedFromAge: number; regSource: string; ev: Step[]; evSource: string } };

export function nmReg(p: P['nm'], lbs: number, a: number) {
  const row = bracket(p.reg, lbs);
  return a >= p.reducedFromAge ? row.after5 : row.first5;
}
export function nmEvFee(p: P['nm'], year: number, fuel: string) {
  const step = [...p.ev].reverse().find((s) => year >= s.from);
  if (!step) return 0;
  return fuel === 'ev' ? step.ev : fuel === 'phev' ? step.phev : 0;
}

const compute: StateEngine = (i, d) => {
  const r = generic(i, d);
  const p = (d.params as unknown as P).nm;
  const a = age(i);
  const reduced = a >= p.reducedFromAge;
  const lines = r.lines.map((l) =>
    l.id === 'reg'
      ? line({ ...l, amount: nmReg(p, i.weightLbs, a), label: `Registration (by shipping weight, ${reduced ? 'after five years of registration' : 'first five years'})`, source: p.regSource })
      : l,
  );
  const ev = nmEvFee(p, i.year, i.fuel);
  if (ev > 0) {
    const k = lines.findIndex((l) => l.id === 'reg');
    lines.splice(k + 1, 0, line({ id: 'ev', label: i.fuel === 'ev' ? 'Electric vehicle registration fee' : 'Plug-in hybrid registration fee', kind: 'ev', amount: ev, years: 1, when: 'cycle', source: p.evSource, note: 'In force from January 1, 2027; $70 / $35 in 2027, $80 / $40 in 2028, $90 / $45 from 2029.' }));
  }
  return { lines, notes: r.notes };
};
export default compute;
