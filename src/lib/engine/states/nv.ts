import type { FeeLine, StateEngine, VehicleInput } from '../types';
import { age, county, forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  title: number;
  plates: [number, number];
  reg: number;
  gst: { valuation: number; basic: number; supplemental: number; min: number; schedule: number[] };
  smog: { gasFromAge: number; hybridFromAge: number };
};

/** Index in the NRS 371.060 schedule: 0 = new (never registered anywhere), otherwise the age in years (at least 1). */
const depIndex = (i: VehicleInput) => (i.transaction === 'purchase' && i.condition === 'new' ? 0 : Math.max(1, age(i)));

export function nvGst(p: P, i: VehicleInput) {
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  const pct = p.gst.schedule[Math.min(depIndex(i), p.gst.schedule.length - 1)];
  const value = msrp * p.gst.valuation * pct;
  return { value, pct, basic: Math.max(p.gst.min, value * p.gst.basic), supplemental: value * p.gst.supplemental };
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d);
  if (i.transaction === 'purchase') {
    if (i.seller === 'dealer') {
      const lr = localRate(i, d);
      lines.push(line({ id: 'sales-tax', label: `Sales tax (${+((p.tax.rate + lr) * 100).toFixed(3)}%, ${c?.name ?? 'county rate'})`, kind: 'tax', amount: taxableBase(i, p.tax) * (p.tax.rate + lr), when: 'once', source: 'county-rates', note: 'On the price minus the trade-in; the dealer document fee is taxable.' }));
    } else {
      lines.push(line({ id: 'sales-tax', label: 'Sales tax (private party sale: none)', kind: 'tax', amount: 0, when: 'once', source: 'regfees' }));
    }
    lines.push(line({ id: 'title', label: 'First Nevada title', kind: 'title', amount: p.title, when: 'once', source: 'regfees' }));
    lines.push(line({ id: 'plate', label: 'Standard license plates', kind: 'plate', amount: null, range: p.plates, when: 'once', source: 'plates', note: 'DMV pages give $3.50 for standard plates and $10 plate recovery plus $1 prison fee for a set of two.' }));
  }
  lines.push(line({ id: 'reg', label: 'Registration fee (passenger car)', kind: 'registration', amount: p.reg, when: 'cycle', source: 'regfees' }));
  const g = nvGst(p, i);
  lines.push(line({ id: 'gst', label: `Governmental services tax (4% of 35% of MSRP at ${Math.round(g.pct * 100)}%)`, kind: 'value', amount: g.basic, when: 'cycle', source: 'nrs-371', note: g.basic === p.gst.min ? 'Minimum tax of $16 applies.' : undefined }));
  if (c?.supplemental) lines.push(line({ id: 'sgst', label: `Supplemental governmental services tax (1%, ${c.name})`, kind: 'value', amount: g.supplemental, when: 'cycle', source: 'regfees' }));
  const smogAge = i.fuel === 'gas' ? p.smog.gasFromAge : i.fuel === 'hybrid' ? p.smog.hybridFromAge : null;
  if (c?.smog && smogAge !== null && age(i) >= smogAge) lines.push(line({ id: 'smog', label: 'Emissions test (station price)', kind: 'inspection', amount: null, when: 'cycle', source: 'emission', note: 'Every year in the Las Vegas and Reno urban areas; stations set their own price.' }));
  if (i.msrp <= 0 && i.condition === 'used') notes.push('The governmental services tax is based on the original MSRP, not the price you paid; type the MSRP for an exact figure on a used car.');
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
