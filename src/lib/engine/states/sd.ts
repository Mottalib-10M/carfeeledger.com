/**
 * South Dakota: 4% motor vehicle excise tax on the purchase price net of any trade-in (SDCL 32-5B-1, 32-5B-4),
 * with the exemption of a car eleven or more model years old sold for $2,500 or less before trade-in (32-5B-2(12));
 * a yearly license fee by manufacturer's shipping weight (32-5-6) reduced to 70% once the car is ten years old
 * on January 1 (32-5-30); small state fees; the county wheel tax per wheel with a per-vehicle maximum (32-5A-1);
 * a $100 yearly fee on battery electric cars (32-5-188). The generic engine cannot apply the age reduction.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, bracket, county, forTransaction, line, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean; oldExempt: { minAge: number; maxPrice: number } };
  title: number;
  reg: { brackets: { upTo: number | null; amount: number }[]; oldFactor: number; oldFromAge: number };
  fees: { id: string; label: string; amount: number; source: string }[];
  wheels: number;
  ev: number;
};

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const a = age(i);
  if (i.transaction === 'purchase') {
    const exempt = a >= p.tax.oldExempt.minAge && i.price <= p.tax.oldExempt.maxPrice;
    lines.push(line({ id: 'sales-tax', label: 'Motor vehicle excise tax (4%)', kind: 'tax', amount: exempt ? 0 : taxableBase(i, p.tax) * p.tax.rate, when: 'once', source: 'excise', note: exempt ? 'Exempt: eleven or more model years old and sold for $2,500 or less before trade-in.' : 'On the price minus the trade-in, dealer or private sale.' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'dor-fees' }));
  }
  const old = a >= p.reg.oldFromAge;
  const reg = bracket(p.reg.brackets, i.weightLbs).amount * (old ? p.reg.oldFactor : 1);
  lines.push(line({ id: 'reg', label: `License fee by shipping weight${old ? ' (70%, ten years or older)' : ''}`, kind: 'registration', amount: reg, when: 'cycle', source: 'license-fee', note: i.transaction === 'purchase' ? 'Full-year amount; the first registration is prorated to your renewal month, set by the first letter of your last name.' : undefined }));
  for (const f of p.fees) lines.push(line({ id: f.id, label: f.label, kind: 'registration', amount: f.amount, when: 'cycle', source: f.source }));
  const c = county(i, d) as Record<string, unknown> | undefined;
  if (c && typeof c.wheelRate === 'number') {
    const amount = Math.min((c.wheelRate as number) * p.wheels, c.wheelMax as number);
    lines.push(line({ id: 'county-fee', label: `County wheel tax (${c.name as string})`, kind: 'local', amount, when: 'cycle', source: 'wheel', note: amount > 0 ? `$${c.wheelRate} per wheel on four wheels, county maximum $${c.wheelMax}.` : 'This county levies no wheel tax.' }));
  }
  if (i.fuel === 'ev') lines.push(line({ id: 'ev', label: 'Electric vehicle fee', kind: 'ev', amount: p.ev, when: 'cycle', source: 'ev-fee' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
