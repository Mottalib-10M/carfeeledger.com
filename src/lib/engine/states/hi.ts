import type { FeeLine, StateEngine } from '../types';
import { age, bracket, county, forTransaction, line } from '../helpers';

type P = {
  get: { passOn: number };
  state: { reg: number; weight: { upTo: number | null; rate: number }[]; flatOver: number; flatAbove: number };
  ruc: number;
  inspection: { fee: number; newYears: number };
};
type C = { name: string; priced?: boolean; countyReg?: number; weightRate?: number; beautification?: number; emblem?: number; plate?: number; transfer?: number };

/**
 * Hawaii. No sales tax on the buyer: a dealer may visibly pass on its general excise tax (GET) up to the
 * maximum pass-on rate of its county. Registration is a yearly bundle: state registration fee and state weight
 * tax (HRS § 249-33) plus the county's registration fee, weight tax and beautification fee. Only Honolulu's
 * county figures were read on an official page; other counties show their county part without an amount.
 * Registration runs with the vehicle: after a private sale the buyer pays only the transfer fee, and the yearly
 * fees at the next expiration date (deferred).
 */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const c = county(i, d) as unknown as C;
  const lines: FeeLine[] = [];
  const purchase = i.transaction === 'purchase';
  const isNew = purchase && i.condition === 'new';
  const deferred = purchase && i.condition === 'used' ? true : undefined;
  if (purchase) {
    if (i.seller === 'dealer') lines.push(line({ id: 'get', label: `General excise tax passed on by the dealer (up to ${+(p.get.passOn * 100).toFixed(3)}%)`, kind: 'tax', amount: (i.price + i.docFee) * p.get.passOn, when: 'once', source: 'get', note: 'Maximum pass-on rate on the full price, trade-in not deducted; a dealer may pass on less.' }));
    if (isNew) lines.push(line({ id: 'plate', label: 'Initial plate fee', kind: 'plate', amount: c.priced ? c.plate ?? null : null, when: 'once', source: 'honolulu-reg', note: c.priced ? undefined : 'Set by the county; not read for this county.' }));
    else lines.push(line({ id: 'transfer', label: 'Ownership (title) transfer fee', kind: 'title', amount: c.priced ? c.transfer ?? null : null, when: 'once', source: 'honolulu-transfer', note: c.priced ? 'Within 30 days of the sale; a $50 penalty is added after that.' : 'Set by the county; not read for this county.' }));
  }
  const w = i.weightLbs;
  const stateWeight = w > p.state.flatAbove ? p.state.flatOver : w * bracket(p.state.weight, w).rate;
  lines.push(line({ id: 'state-reg', label: 'State registration fee', kind: 'registration', amount: p.state.reg, when: 'cycle', deferred, source: 'honolulu-reg' }));
  lines.push(line({ id: 'state-weight', label: `State vehicle weight tax (${w > 4000 ? w > 7000 ? '2.25' : '2' : '1.75'} cents a pound)`, kind: 'registration', amount: stateWeight, when: 'cycle', deferred, source: 'hrs-249-33' }));
  if (c.priced) {
    lines.push(line({ id: 'county-reg', label: `County registration fee (${c.name})`, kind: 'local', amount: c.countyReg ?? 0, when: 'cycle', deferred, source: 'honolulu-reg' }));
    lines.push(line({ id: 'county-weight', label: `County vehicle weight tax (${+((c.weightRate ?? 0) * 100).toFixed(2)} cents a pound)`, kind: 'local', amount: w * (c.weightRate ?? 0), when: 'cycle', deferred, source: 'honolulu-reg' }));
    lines.push(line({ id: 'beautification', label: 'Highway beautification fee', kind: 'local', amount: c.beautification ?? 0, when: 'cycle', deferred, source: 'honolulu-reg' }));
    lines.push(line({ id: 'emblem', label: 'Annual emblem', kind: 'plate', amount: c.emblem ?? 0, when: 'cycle', deferred, source: 'honolulu-reg' }));
  } else {
    lines.push(line({ id: 'county-fees', label: `County registration fee, weight tax and beautification fee (${c.name})`, kind: 'local', amount: null, when: 'cycle', deferred, source: 'hrs-249-33', note: 'Set by county ordinance; not read on an official page of this county for this release.' }));
  }
  if (i.fuel === 'ev' && !purchase) lines.push(line({ id: 'ev', label: 'State road usage charge (flat option)', kind: 'ev', amount: p.ruc, when: 'cycle', source: 'hiruc', note: 'Or $8 per 1,000 miles, capped at $50; not owed when the car is bought.' }));
  if (isNew) lines.push(line({ id: 'inspection', label: 'Safety inspection (first certificate, 2 years)', kind: 'inspection', amount: p.inspection.fee, years: p.inspection.newYears, when: 'cycle', source: 'inspection', note: 'Station fee set by HDOT.' }));
  else if (purchase || age(i) >= p.inspection.newYears) lines.push(line({ id: 'inspection', label: 'Yearly safety inspection', kind: 'inspection', amount: p.inspection.fee, years: 1, when: 'cycle', deferred, source: 'inspection', note: 'Station fee set by HDOT.' }));
  return { lines: forTransaction(i, lines), notes: [] };
};
export default compute;
