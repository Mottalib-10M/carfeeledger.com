/**
 * Colorado. Own engine because the generic one cannot express:
 * - specific ownership tax on 85% of MSRP with a year-of-service schedule that ends in a flat $3;
 * - FASTER road safety surcharge that changes on September 1, 2027 and EV road usage fees that change each July 1;
 * - plates and month tab only at the first registration; emissions test paid by the seller on a sale,
 *   then every two years at renewal in the Front Range program area.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line, localRate, taxableBase } from '../helpers';

type Br = [number | null, number];
type P = {
  tax: { stateRate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  sot: { valuePct: number; rates: number[]; flatFrom: number; flat: number };
  title: number;
  reg: { base: { upTo2000: number; per100To4500: number; base4500: number; per100Over4500: number }; age: Br[]; roadSafety: { until2027: Br[]; from2027: Br[] }; bridge: Br[]; clerk: number; ems: number; emisCounty: number; emisState: number; emisArea: number; post: number; miidb: number; yearTab: number; monthTab: number; plates: number };
  ev: { evFee: number; roadUsage: Record<string, [number, number]> };
  emissions: { amount: number; years: number; testFromAge: number };
};
const pick = (t: Br[], x: number) => (t.find(([up]) => up === null || x <= up) ?? t[t.length - 1])[1];

export function coBase(b: P['reg']['base'], lbs: number) {
  if (lbs <= 2000) return b.upTo2000;
  if (lbs <= 4500) return b.upTo2000 + Math.ceil((lbs - 2000) / 100) * b.per100To4500;
  return b.base4500 + Math.ceil((lbs - 4500) / 100) * b.per100Over4500;
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d) as (Record<string, unknown> & { name: string }) | undefined;
  const purchase = i.transaction === 'purchase';
  const k = age(i);
  if (purchase) {
    const base = taxableBase(i, p.tax);
    lines.push(line({ id: 'sales-tax', label: 'State sales/use tax (2.9%)', kind: 'tax', amount: base * p.tax.stateRate, when: 'once', source: 'denver-tax', note: 'On the price less the trade-in; due at titling, also on a private sale.' }));
    const lr = localRate(i, d);
    if (lr > 0) lines.push(line({ id: 'local-tax', label: `Local sales/use taxes (${+(lr * 100).toFixed(3)}%${c && i.localRateOverride === null ? `, ${c.name}` : ''})`, kind: 'tax', amount: base * lr, when: 'once', source: (c?.src as string) ?? 'denver-tax' }));
    lines.push(line({ id: 'title', label: 'Certificate of title (transfer of ownership)', kind: 'title', amount: p.title, when: 'once', source: 'dmv-title' }));
    lines.push(line({ id: 'plates', label: 'License plates (embossed set, material fee)', kind: 'plate', amount: p.reg.plates, when: 'once', source: 'dmv-fees-misc', note: 'Unless a current plate is transferred at the county office.' }));
    lines.push(line({ id: 'month-tab', label: 'Month tab (material fee)', kind: 'plate', amount: p.reg.monthTab, when: 'once', source: 'dmv-fees-misc' }));
  }
  // Specific ownership tax.
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  const sot = k >= p.sot.flatFrom ? p.sot.flat : msrp * p.sot.valuePct * p.sot.rates[Math.min(k, p.sot.rates.length - 1)];
  lines.push(line({ id: 'sot', label: k >= p.sot.flatFrom ? 'Specific ownership tax (tenth year or later: $3)' : `Specific ownership tax (${+(p.sot.rates[Math.min(k, p.sot.rates.length - 1)] * 100).toFixed(2)}% of 85% of MSRP, year ${k + 1})`, kind: 'value', amount: sot, when: 'cycle', source: 'crs-42-3-107', note: i.msrp > 0 ? undefined : 'Price used as MSRP (type the original MSRP for an exact figure).' }));
  // Registration fees.
  const lbs = i.weightLbs;
  lines.push(line({ id: 'reg', label: 'Registration fee (by weight)', kind: 'registration', amount: coBase(p.reg.base, lbs), when: 'cycle', source: 'crs-42-3-306' }));
  lines.push(line({ id: 'age-fee', label: 'Age of vehicle fee', kind: 'registration', amount: pick(p.reg.age, k), when: 'cycle', source: 'dmv-fees' }));
  lines.push(line({ id: 'road-safety', label: 'FASTER road safety surcharge', kind: 'registration', amount: pick(i.year >= 2027 && !purchase ? p.reg.roadSafety.from2027 : p.reg.roadSafety.until2027, lbs), when: 'cycle', source: 'dmv-fees', note: !purchase && i.year >= 2027 ? 'Rate from September 1, 2027.' : undefined }));
  lines.push(line({ id: 'bridge', label: 'FASTER bridge safety surcharge', kind: 'registration', amount: pick(p.reg.bridge, lbs), when: 'cycle', source: 'dmv-fees' }));
  const small = p.reg.clerk + p.reg.ems + p.reg.emisCounty + p.reg.emisState + p.reg.post + p.reg.miidb + p.reg.yearTab + (c?.emissions ? p.reg.emisArea : 0);
  lines.push(line({ id: 'reg-other', label: `Clerk hire, EMS, POST, emissions program, insurance database fees and year tab${c?.emissions ? ' (emissions area)' : ''}`, kind: 'registration', amount: small, when: 'cycle', source: 'dmv-fees-misc', note: `$4 + $2 + $1 + $0.70 + $0.50${c?.emissions ? ' + $1.50' : ''} + $0.10 + $0.48 tab.` }));
  if (i.fuel === 'ev' || i.fuel === 'phev') {
    const fy = String(i.year); // registration in the fall: fiscal year starting July 1 of that year
    const ru = p.ev.roadUsage[fy] ?? p.ev.roadUsage[Object.keys(p.ev.roadUsage).sort().pop()!];
    lines.push(line({ id: 'ev', label: 'Electric vehicle fee', kind: 'ev', amount: p.ev.evFee, when: 'cycle', source: 'dmv-fees', note: 'Indexed to inflation each fiscal year; 2026-27 amount.' }));
    lines.push(line({ id: 'ev-road-usage', label: `Road usage equalization fee (${i.fuel === 'ev' ? 'battery electric' : 'plug-in hybrid'})`, kind: 'ev', amount: i.fuel === 'ev' ? ru[0] : ru[1], when: 'cycle', source: 'dmv-ev' }));
  }
  if (!purchase && c?.emissions && i.fuel !== 'ev' && k >= p.emissions.testFromAge) lines.push(line({ id: 'emissions', label: 'Emissions test (Front Range program area, every two years)', kind: 'inspection', amount: p.emissions.amount, years: p.emissions.years, when: 'cycle', source: 'dmv-emissions' }));
  if (purchase && c?.emissions && i.condition === 'used') notes.push('In the emissions program area the seller must provide a passing emissions test when a vehicle more than seven model years old changes owner.');
  lines.push(line({ id: 'county-fees', label: 'County or regional registration fees, if any', kind: 'local', amount: null, when: 'cycle', source: 'dmv-fees', note: 'Some counties and regional transportation authorities add their own registration fees.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
