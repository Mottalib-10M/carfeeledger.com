import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { stateRate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  reg: { brackets: [number | null, number][]; evMin2yr: number; years: number; mctd2yr: number; useTaxSplitLbs: number };
  once: { plate: number; title: number };
  inspection: { safety: number; emissionsMetro: number; emissionsUpstate: number; emissionsExemptUnderAge: number; emissionsExemptOverAge: number };
};
export function nyReg(p: P, lbs: number, ev: boolean) {
  const row = p.reg.brackets.find(([up]) => up === null || lbs <= up)!;
  return ev ? Math.max(row[1], p.reg.evMin2yr) : row[1];
}
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d);
  const lr = localRate(i, d);
  if (i.transaction === 'purchase') {
    const base = taxableBase(i, p.tax);
    lines.push(line({ id: 'sales-tax', label: `Sales tax (4% state + ${+(lr * 100).toFixed(3)}% local)`, kind: 'tax', amount: base * (p.tax.stateRate + lr), when: 'once', source: 'pub718' }));
    lines.push(line({ id: 'title', label: 'Title certificate', kind: 'title', amount: p.once.title, when: 'once', source: 'fees' }));
    lines.push(line({ id: 'plate', label: 'Vehicle plates', kind: 'plate', amount: p.once.plate, when: 'once', source: 'fees' }));
  }
  const y = p.reg.years;
  lines.push(line({ id: 'reg', label: 'Registration (two years, by weight)', kind: 'registration', amount: nyReg(p, i.weightLbs, i.fuel === 'ev'), years: y, when: 'cycle', source: 'fees' }));
  const ut = (c?.useTax2yr as [number, number] | undefined) ?? [0, 0];
  const use = i.weightLbs <= p.reg.useTaxSplitLbs ? ut[0] : ut[1];
  if (use > 0) lines.push(line({ id: 'use-tax', label: `County vehicle use tax (${c?.name}, two years)`, kind: 'local', amount: use, years: y, when: 'cycle', source: 'fees' }));
  if (c?.mctd) lines.push(line({ id: 'mctd', label: 'MCTD supplemental fee (two years)', kind: 'local', amount: p.reg.mctd2yr, years: y, when: 'cycle', source: 'fees' }));
  // Yearly inspection at the maximum fee of the VS-77 chart.
  const a = age(i);
  const emis = i.fuel !== 'ev' && a >= p.inspection.emissionsExemptUnderAge && a < p.inspection.emissionsExemptOverAge;
  const fee = p.inspection.safety + (emis ? (c?.mctd ? p.inspection.emissionsMetro : p.inspection.emissionsUpstate) : 0);
  lines.push(line({ id: 'inspection', label: emis ? 'Safety and emissions inspection (maximum fee)' : 'Safety inspection (maximum fee)', kind: 'inspection', amount: fee, years: 1, when: 'cycle', source: 'vs77', note: 'Every 12 months and at each change of owner.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
