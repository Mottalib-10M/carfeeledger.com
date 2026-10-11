/**
 * Arkansas. Own engine because the generic one cannot express the used-vehicle tiers of Act 1013 of 2021
 * (no tax under $4,000; 3.5% state rate from $4,000 to $9,999, the tier being read on the price before any
 * trade-in) together with local taxes that apply only to the first $2,500 ($25 per 1% of local rate).
 */
import type { FeeLine, StateEngine } from '../types';
import { county, forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { stateRate: number; tradeInCredit: boolean; docFeeTaxable: boolean; localFirst: number; usedExemptBelow: number; usedReducedBelow: number; usedReducedRate: number };
  reg: { car: [number | null, number][]; truck: number; decal: number; postage: number };
  title: number;
  ev: { ev: number; phev: number; hybrid: number };
};

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d) as (Record<string, unknown> & { name: string }) | undefined;
  if (i.transaction === 'purchase') {
    const base = taxableBase(i, p.tax);
    const used = i.condition === 'used';
    const exempt = used && i.price < p.tax.usedExemptBelow;
    const reduced = used && !exempt && i.price < p.tax.usedReducedBelow;
    const full = typeof c?.stateRate === 'number' ? (c.stateRate as number) : p.tax.stateRate;
    const rate = exempt ? 0 : reduced ? p.tax.usedReducedRate : full;
    const lbl = exempt ? 'State sales tax (used vehicle under $4,000: none)' : reduced ? 'State sales tax (used vehicle $4,000 to $9,999: 3.5%)' : `State sales tax (${+(rate * 100).toFixed(3)}%)`;
    lines.push(line({ id: 'sales-tax', label: lbl, kind: 'tax', amount: base * rate, when: 'once', source: exempt || reduced ? 'act-1013' : 'dfa-registration', note: used ? 'The $4,000 and $10,000 thresholds are read on the price before any trade-in.' : 'Trade-in deducted.' }));
    const lr = localRate(i, d);
    if (lr > 0 && !exempt) lines.push(line({ id: 'local-tax', label: `City and county tax (${+(lr * 100).toFixed(3)}% on the first $${p.tax.localFirst.toLocaleString('en-US')})`, kind: 'tax', amount: lr * Math.min(base, p.tax.localFirst), when: 'once', source: 'dfa-local-rates', note: 'Each local tax is capped at $25 for each 1% of rate.' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'dfa-fee-schedule' }));
  }
  const reg = i.body === 'truck' ? p.reg.truck : (p.reg.car.find(([up]) => up === null || i.weightLbs <= up) ?? p.reg.car[p.reg.car.length - 1])[1];
  lines.push(line({ id: 'reg', label: i.body === 'truck' ? 'Registration (truck or van rated 1 ton or less)' : 'Registration (passenger car, by weight)', kind: 'registration', amount: reg, when: 'cycle', source: 'dfa-fee-schedule' }));
  lines.push(line({ id: 'decal', label: 'Validation decal fee', kind: 'registration', amount: p.reg.decal, when: 'cycle', source: 'dfa-fee-schedule' }));
  lines.push(line({ id: 'postage', label: 'Postage', kind: 'registration', amount: p.reg.postage, when: 'cycle', source: 'dfa-fee-schedule' }));
  const ev = i.fuel === 'ev' ? p.ev.ev : i.fuel === 'phev' ? p.ev.phev : i.fuel === 'hybrid' ? p.ev.hybrid : 0;
  if (ev) lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Electric vehicle fee' : i.fuel === 'phev' ? 'Plug-in hybrid fee' : 'Hybrid vehicle fee', kind: 'ev', amount: ev, when: 'cycle', source: 'act-376' }));
  lines.push(line({ id: 'ppt', label: 'County personal property tax on the vehicle', kind: 'value', amount: null, when: 'cycle', source: 'dfa-assessment', note: 'Assessed by the county assessor and billed by the county collector each year; proof of payment is needed to register.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
