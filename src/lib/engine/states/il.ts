import type { FeeLine, StateEngine } from '../types';
import { age, bracket, county, forTransaction, line, localRate, roundDollar, taxableBase } from '../helpers';

type Br = { upTo: number | null; amount: number };
type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean; chicagoUseRate: number };
  /** RUT-50 private party vehicle use tax: Table A (price under tableBFrom, by age) and Table B (by price). */
  rut50: { tableBFrom: number; tableA: Br[]; tableB: Br[] };
  /** RUT-6 local private party vehicle use taxes, by vehicle age. */
  rut6: { chicago: Br[]; cook: Br[] };
  title: number;
  reg: number;
  ev: number;
  emissions: { fromAge: number; years: number; fee: number };
};

/** Illinois: ROT/use tax on dealer sales (6.25% + transit-district rate + Chicago home rule use tax), RUT-50 flat tables on private sales. */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d);
  const a = age(i);
  if (i.transaction === 'purchase') {
    if (i.seller === 'dealer') {
      const base = taxableBase(i, p.tax);
      const lr = localRate(i, d);
      const ch = c?.chicago && i.localRateOverride === null ? p.tax.chicagoUseRate : 0;
      // ST-556 multiplies the taxable price by the combined rate and rounds the tax to the nearest dollar.
      const total = roundDollar(base * (p.tax.rate + lr + ch));
      const stateTax = roundDollar(base * p.tax.rate);
      const chTax = ch > 0 ? roundDollar(base * ch) : 0;
      lines.push(line({ id: 'sales-tax', label: 'State sales tax (6.25%)', kind: 'tax', amount: stateTax, when: 'once', source: 'st556', note: 'Trade-in deducted; the documentary fee is part of the taxed price; rounded to the dollar.' }));
      if (lr > 0) lines.push(line({ id: 'local-tax', label: `Transit district tax (${+(lr * 100).toFixed(3)}%)`, kind: 'tax', amount: total - stateTax - chTax, when: 'once', source: 'rut25' }));
      if (ch > 0) lines.push(line({ id: 'chicago-use', label: 'Chicago home rule use tax (1.25%)', kind: 'tax', amount: chTax, when: 'once', source: 'st556' }));
    } else {
      const tableB = i.price >= p.rut50.tableBFrom;
      const tax = tableB ? bracket(p.rut50.tableB, i.price).amount : bracket(p.rut50.tableA, a).amount;
      lines.push(line({ id: 'sales-tax', label: `Private party vehicle use tax (RUT-50, Table ${tableB ? 'B' : 'A'})`, kind: 'tax', amount: tax, when: 'once', source: 'rut50', note: tableB ? 'Flat amount by price band ($15,000 or more).' : 'Flat amount by vehicle age (price under $15,000).' }));
      if (c?.chicago) lines.push(line({ id: 'chicago-private', label: 'Chicago private party vehicle use tax', kind: 'tax', amount: bracket(p.rut6.chicago, a).amount, when: 'once', source: 'rut6' }));
      if (c?.cook) lines.push(line({ id: 'cook-private', label: 'Cook County private party vehicle use tax', kind: 'tax', amount: bracket(p.rut6.cook, a).amount, when: 'once', source: 'rut6' }));
    }
    lines.push(line({ id: 'title', label: 'Original certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'sos-fees' }));
  }
  lines.push(line({ id: 'reg', label: 'Passenger registration (1 year)', kind: 'registration', amount: p.reg, years: 1, when: 'cycle', source: 'sos-fees' }));
  if (i.fuel === 'ev') lines.push(line({ id: 'ev', label: 'Electric vehicle fee (in lieu of motor fuel tax)', kind: 'ev', amount: p.ev, years: 1, when: 'cycle', source: 'ev-plate' }));
  if (c?.emissions && i.fuel !== 'ev' && a >= p.emissions.fromAge) {
    lines.push(line({ id: 'emissions', label: 'OBD emissions test (Illinois EPA, free)', kind: 'inspection', amount: p.emissions.fee, years: p.emissions.years, when: 'cycle', source: 'epa-faq', note: 'Every two years once the car is four years old; required in the Chicago and Metro-East test areas (by ZIP code).' }));
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
