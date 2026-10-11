import type { FeeLine, StateEngine, VehicleInput } from '../types';
import { forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  title: number;
  platePer: number;
  plates: number;
  tireFee: [number, number];
  reg: number;
  regAddOns: number;
  mvTax: { lowBrackets: { upTo: number; base: number }[]; stepFrom: number; stepBase: number; stepSize: number; stepAmount: number; maxBase: number; fractions: number[]; secondYearNewerModel: number };
  mvFee: { brackets: { upTo: number | null; byAge: [number, number, number] }[] };
  altFuel: { ev: number; phev: number };
  wheelTax: [number, number];
};

/** Base tax of 60-3,185 for a passenger car by value when new (MSRP). */
export function neBaseTax(p: P, msrp: number) {
  const m = p.mvTax;
  for (const b of m.lowBrackets) if (msrp <= b.upTo) return b.base;
  return Math.min(m.maxBase, m.stepBase + Math.floor((msrp - m.stepFrom) / m.stepSize) * m.stepAmount);
}
/** Registration year of the vehicle: 0 = first year (current model year, or newer). */
const regYearIndex = (i: VehicleInput) => Math.max(0, i.year - i.modelYear);

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  if (purchase) {
    const base = taxableBase(i, p.tax);
    lines.push(line({ id: 'sales-tax', label: 'State sales tax (5.5%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: 'form6', note: 'On the price minus the trade-in; a dealer documentation charge is part of the taxable price.' }));
    const lr = localRate(i, d);
    if (lr > 0) lines.push(line({ id: 'local-tax', label: `Local sales tax (${+(lr * 100).toFixed(3)}%)`, kind: 'tax', amount: base * lr, when: 'once', source: 'local-rates' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'title' }));
    lines.push(line({ id: 'plate', label: 'License plates (two plates at $4.10)', kind: 'plate', amount: p.platePer * p.plates, when: 'once', source: 'dmv-fees', note: 'Charged when new plates are issued; not when you move your current plates to the car.' }));
    if (i.condition === 'new' && i.seller === 'dealer') lines.push(line({ id: 'tire-fee', label: 'Tire fee ($1 per new tire, spare included)', kind: 'other', amount: null, range: p.tireFee, when: 'once', source: 'form6-tire' }));
  }
  lines.push(line({ id: 'reg', label: 'Registration fee (passenger)', kind: 'registration', amount: p.reg, when: 'cycle', source: 'dmv-fees' }));
  lines.push(line({ id: 'reg-addons', label: 'Fees added to every registration (EMS, DMV, recreation road, county)', kind: 'registration', amount: p.regAddOns, when: 'cycle', source: 'dmv-fees', note: '$0.50 + $2.00 + $1.50 + $1.50.' }));
  const k = regYearIndex(i);
  // A model newer than the calendar year pays the initial tax, then 95% in its second registration period.
  const newerSecond = !purchase && k === 0 && i.ownedYears >= 1;
  const fr = newerSecond ? p.mvTax.secondYearNewerModel : p.mvTax.fractions[Math.min(k, p.mvTax.fractions.length - 1)];
  const bt = neBaseTax(p, msrp);
  if (fr > 0) lines.push(line({ id: 'mv-tax', label: `Motor vehicle tax (${Math.round(fr * 100)}% of the $${bt.toLocaleString('en-US')} base tax)`, kind: 'value', amount: bt * fr, when: 'cycle', source: 'tax-chart', note: 'Base tax set by the MSRP bracket, reduced as the car ages; nothing is due from the 14th year.' }));
  const row = p.mvFee.brackets.find((b) => b.upTo === null || msrp <= b.upTo)!;
  lines.push(line({ id: 'mv-fee', label: 'Motor vehicle fee', kind: 'value', amount: row.byAge[k < 5 ? 0 : k < 10 ? 1 : 2], when: 'cycle', source: 'tax-chart' }));
  if (i.fuel === 'ev' || i.fuel === 'phev') lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Alternative fuel fee (electric)' : 'Alternative fuel fee (plug-in hybrid)', kind: 'ev', amount: i.fuel === 'ev' ? p.altFuel.ev : p.altFuel.phev, when: 'cycle', source: 'dmv-fees' }));
  lines.push(line({ id: 'wheel-tax', label: 'City wheel tax (some cities only)', kind: 'local', amount: null, range: p.wheelTax, when: 'cycle', source: 'mv-2025', note: 'Charged yearly by several cities, from $10 to $370; $0 where your city has none.' }));
  if (i.msrp <= 0 && i.condition === 'used') notes.push('The motor vehicle tax and fee use the MSRP of the car when new; type it, or the calculator uses the price you paid, which understates them for a used car.');
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
