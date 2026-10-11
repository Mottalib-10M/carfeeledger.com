import type { FeeLine, StateEngine } from '../types';
import { county, forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  title: number;
  handling: number;
  localFeeMax: number;
  /** R.S. 47:463: annual license tax $10 up to $10,000 of value, + $1 per $1,000 above (rounded at $500), collected two years at a time. */
  plate: { base: number; baseValue: number; perThousand: number; years: number; truckRange: [number, number]; truckYears: number };
  /** R.S. 32:461 road usage fee per year, collected for the same period as the plate. */
  roadUsage: { ev: number; hybrid: number };
  inspection: { safety: number; imAdd: number; lvipMax: number; stickerEndsYear: number };
};

/** Two-year license tax on a passenger car of the given value. */
export function laPlate(p: P, value: number) {
  const excess = Math.max(0, value - p.plate.baseValue);
  const thousands = Math.floor(excess / 1000) + (excess % 1000 >= 500 ? 1 : 0);
  return (p.plate.base + thousands * p.plate.perThousand) * p.plate.years;
}

/** Louisiana: 5% state + parish/municipal sales tax, $68.50 title, value-based two-year plate, road usage fee, brake tag. */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d);
  if (i.transaction === 'purchase') {
    const base = taxableBase(i, p.tax);
    lines.push(line({ id: 'sales-tax', label: 'State sales tax (5%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: 'ldr-rate', note: 'Trade-in and rebate deducted; also due on a private sale.' }));
    const lr = localRate(i, d);
    if (lr > 0) lines.push(line({ id: 'local-tax', label: `Parish and municipal sales tax (${+(lr * 100).toFixed(3)}%)`, kind: 'tax', amount: base * lr, when: 'once', source: 'parish-table', note: 'Rate of the domicile where the vehicle is registered.' }));
    lines.push(line({ id: 'title', label: 'Title fee', kind: 'title', amount: p.title, when: 'once', source: 'omv-fees' }));
    lines.push(line({ id: 'handling', label: 'Handling fee', kind: 'other', amount: p.handling, when: 'once', source: 'omv-fees' }));
    lines.push(line({ id: 'local-fee', label: 'Local fee (where it applies)', kind: 'local', amount: null, range: [0, p.localFeeMax], when: 'once', source: 'omv-new', note: 'May apply; will not exceed $6.' }));
  }
  if (i.body === 'truck') {
    lines.push(line({ id: 'reg', label: 'Truck license plate (by gross vehicle weight, 4 years)', kind: 'registration', amount: null, range: p.plate.truckRange, years: p.plate.truckYears, when: 'cycle', source: 'omv-fees', note: '$40 up to 6,000 lb GVW, $112 from 6,001 to 10,000 lb; depends on the rated gross weight.' }));
  } else {
    lines.push(line({ id: 'reg', label: 'License plate tax (2 years, by value)', kind: 'registration', amount: laPlate(p, i.price), years: p.plate.years, when: 'cycle', source: 'rs-47-463', note: 'Value fixed at purchase and kept for every renewal.' }));
  }
  const ru = i.fuel === 'ev' ? p.roadUsage.ev : i.fuel === 'hybrid' || i.fuel === 'phev' ? p.roadUsage.hybrid : 0;
  const yrs = i.body === 'truck' ? p.plate.truckYears : p.plate.years;
  if (ru) lines.push(line({ id: 'ev', label: `Road usage fee (${i.fuel === 'ev' ? 'electric' : 'hybrid'}, ${yrs} years)`, kind: 'ev', amount: ru * yrs, years: yrs, when: 'cycle', source: 'rs-32-461' }));
  const im = Boolean(c?.im);
  if (i.year < p.inspection.stickerEndsYear || im) {
    const withIm = im && i.fuel !== 'ev';
    lines.push(line({ id: 'inspection', label: withIm ? 'Safety and emissions inspection (brake tag)' : 'Safety inspection (brake tag, 1 year)', kind: 'inspection', amount: p.inspection.safety + (withIm ? p.inspection.imAdd : 0), years: 1, when: 'cycle', source: withIm ? 'deq-faq' : 'act-701', note: withIm ? 'Ascension, East Baton Rouge, Iberville, Livingston and West Baton Rouge: $18 a year until the EPA approves the new state plan.' : 'A two-year sticker costs $20; the sticker ends on January 1, 2027 outside the five emissions parishes.' }));
  } else {
    lines.push(line({ id: 'inspection', label: 'Vehicle identification program sticker', kind: 'inspection', amount: null, range: [0, p.inspection.lvipMax], years: 1, when: 'cycle', source: 'act-701', note: 'Replaces the inspection sticker from 2027; not more than $6 a year.' }));
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
