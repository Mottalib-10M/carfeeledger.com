import type { FeeLine, StateEngine } from '../types';
import { age, forTransaction, line, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  reg: { code7: number; code8: number; code8FromLbs: number; ttf1: number; ttf2: number; ttf2Years: number; csf: number; newTermYears: number };
  title: { fee: number; withLien: number };
  zev: { schedule: { from: string; fee: number }[] };
  inspection: { newExemptYears: number; years: number };
};
/** ZEV fee in force for a registration starting in July of `y` (registration years run July to June in the MVC schedule). */
export function zevFee(p: P, y: number) {
  let fee = 0;
  for (const s of p.zev.schedule) if (Number(s.from.slice(0, 4)) <= y) fee = s.fee;
  return fee;
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const isNew = purchase && i.condition === 'new';
  const a = age(i);
  if (purchase) {
    lines.push(line({ id: 'sales-tax', label: 'Sales tax (6.625%)', kind: 'tax', amount: taxableBase(i, p.tax) * p.tax.rate, when: 'once', source: 'tax-rate' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title.fee, when: 'once', source: 'regfees', note: `$${p.title.withLien} when a lien is recorded.` }));
  }
  const base = i.weightLbs >= p.reg.code8FromLbs ? p.reg.code8 : p.reg.code7;
  // Same arithmetic as the MVC calculator: base + 7.50 + 7.00 a year, + 12.50 a year while within two model years.
  const years = isNew ? p.reg.newTermYears : 1;
  const within2 = isNew ? p.reg.ttf2Years : a < 2 ? 1 : 0;
  const reg = (base + p.reg.ttf1 + p.reg.csf) * years + p.reg.ttf2 * within2;
  lines.push(line({ id: 'reg', label: `Registration (${i.weightLbs >= p.reg.code8FromLbs ? 'over' : 'under'} 3,500 lb${isNew ? ', four years required for a new car' : ''})`, kind: 'registration', amount: reg, years, when: 'cycle', source: 'calc-js' }));
  if (i.fuel === 'ev') {
    const fees = Array.from({ length: years }, (_, k) => zevFee(p, i.year + k));
    lines.push(line({ id: 'ev', label: years > 1 ? 'Zero emission vehicle fee (four years)' : 'Zero emission vehicle fee', kind: 'ev', amount: fees.reduce((s, x) => s + x, 0), years, when: 'cycle', source: 'regfees' }));
  }
  if (i.fuel !== 'ev' && a >= p.inspection.newExemptYears) lines.push(line({ id: 'inspection', label: 'Safety and emissions inspection (free at state facilities)', kind: 'inspection', amount: 0, years: p.inspection.years, when: 'cycle', source: 'insp', note: 'Private inspection facilities charge their own fee.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
