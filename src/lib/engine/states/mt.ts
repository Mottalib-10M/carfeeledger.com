import type { FeeLine, StateEngine, VehicleInput } from '../types';
import { cents, county, forTransaction, line } from '../helpers';

type P = {
  reg: { brackets: { maxAge: number | null; amount: number }[]; luxury: { msrpOver: number; maxAge: number; amount: number } };
  mhp: number;
  parks: number;
  parksPermanent: number;
  tbi: number;
  title: number;
  plate: number;
  adminRate: number;
  ev: { class2From: number; ev: [number, number]; phev: [number, number]; evPermanent: [number, number]; phevPermanent: [number, number] };
  optionTax: { maxRate: number; minValue: number; car: number[]; truck: number[] };
  permanent: { fromAge: number; fee: number; insurance: number; optionTaxTimes: number };
  gvwTruck: [number, number];
};

/** Montana age: calendar year minus model year; a next-year model is -1 (61-3-501, table of 61-3-503). */
const mtAge = (i: VehicleInput) => i.year - i.modelYear;
/** Depreciated MSRP of 61-3-503: MSRP x percentage by type and age (age -1 = index 0), $500 minimum. */
export function mtValue(p: P, i: VehicleInput) {
  const t = i.body === 'truck' ? p.optionTax.truck : p.optionTax.car;
  const k = Math.max(0, Math.min(mtAge(i) + 1, t.length - 1));
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  return Math.max(p.optionTax.minValue, msrp * t[k]);
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const a = Math.max(0, mtAge(i));
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  const fees: FeeLine[] = [];
  if (purchase) {
    fees.push(line({ id: 'title', label: 'Certificate of title (light vehicle)', kind: 'title', amount: p.title, when: 'once', source: 'mca-title' }));
    fees.push(line({ id: 'plate', label: 'New standard license plates', kind: 'plate', amount: p.plate, when: 'once', source: 'mca-reg', note: 'Not charged when you transfer plates you already own.' }));
  }
  const reg = p.reg.brackets.find((b) => b.maxAge === null || a <= b.maxAge)!.amount;
  fees.push(line({ id: 'reg', label: `Light vehicle registration (${a <= 4 ? '4 years old or less' : a <= 10 ? '5 to 10 years old' : '11 years old or more'})`, kind: 'registration', amount: reg, when: 'cycle', source: 'mca-reg' }));
  if (msrp > p.reg.luxury.msrpOver && a <= p.reg.luxury.maxAge) fees.push(line({ id: 'luxury', label: 'Additional fee, MSRP over $150,000', kind: 'registration', amount: p.reg.luxury.amount, when: 'cycle', source: 'mca-reg' }));
  fees.push(line({ id: 'mhp', label: 'Highway Patrol salary and retention fee', kind: 'registration', amount: p.mhp, when: 'cycle', source: 'mca-reg' }));
  fees.push(line({ id: 'parks', label: 'State parks and fishing access fee (you may opt out)', kind: 'other', amount: p.parks, when: 'cycle', source: 'mca-reg', note: 'Not collected if you certify you will not use the vehicle to visit state parks.' }));
  fees.push(line({ id: 'tbi', label: 'Brain injury program donation (automatic unless you opt out)', kind: 'other', amount: p.tbi, when: 'cycle', source: 'mca-303' }));
  if (i.fuel === 'ev' || i.fuel === 'phev') {
    const k = i.weightLbs >= p.ev.class2From ? 1 : 0;
    fees.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Electric vehicle registration fee' : 'Plug-in hybrid registration fee', kind: 'ev', amount: (i.fuel === 'ev' ? p.ev.ev : p.ev.phev)[k], when: 'cycle', source: 'mca-ev' }));
  }
  if (i.body === 'truck') fees.push(line({ id: 'gvw', label: 'Light truck gross vehicle weight fee (1/2 to 1 ton)', kind: 'registration', amount: null, range: p.gvwTruck, when: 'cycle', source: 'yellowstone', note: '$7 for a 1/2-ton, $12.50 for a 3/4-ton, $17.50 for a 1-ton rated capacity.' }));
  const base = fees.filter((l) => l.amount !== null).reduce((s, l) => s + (l.amount as number), 0);
  lines.push(...fees);
  lines.push(line({ id: 'admin', label: 'MVD administrative fee (3% of the fees above)', kind: 'other', amount: base * p.adminRate, when: 'cycle', source: 'mca-admin' }));
  const c = county(i, d);
  const value = mtValue(p, i);
  const rate = typeof c?.optionRate === 'number' ? c.optionRate : null;
  if (rate !== null) {
    if (rate > 0) lines.push(line({ id: 'option-tax', label: `County option tax (${+(rate * 100).toFixed(2)}% of the depreciated MSRP, ${c!.name})`, kind: 'value', amount: value * rate, when: 'cycle', source: 'yellowstone' }));
  } else {
    lines.push(line({ id: 'option-tax', label: 'County option tax (up to 0.7% of the depreciated MSRP)', kind: 'value', amount: null, range: [0, cents(value * p.optionTax.maxRate)], when: 'cycle', source: 'mca-option', note: 'Each county sets its own rate or flat fee by vote; ask your county treasurer.' }));
  }
  if (a >= p.permanent.fromAge) {
    const opt = rate !== null ? value * rate * p.permanent.optionTaxTimes : null;
    const evp = i.fuel === 'ev' ? p.ev.evPermanent : i.fuel === 'phev' ? p.ev.phevPermanent : null;
    const fixed = p.permanent.fee + p.mhp + p.parksPermanent + p.permanent.insurance + (evp ? evp[i.weightLbs >= p.ev.class2From ? 1 : 0] : 0);
    notes.push(`This car is 11 years old or more: instead of renewing every year you may register it permanently for $${p.permanent.fee.toFixed(2)} plus the $${p.mhp} patrol fee, the optional $${p.parksPermanent} parks fee, a $${p.permanent.insurance} insurance verification fee${evp ? ', the one-time electric fee' : ''} and five years of county option tax${opt !== null ? ` (about $${cents(fixed * (1 + p.adminRate) + opt).toFixed(2)} in all)` : ''}; it ends when the car is sold.`);
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
