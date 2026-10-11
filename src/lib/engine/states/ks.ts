import type { FeeLine, StateEngine } from '../types';
import { county, forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  title: number;
  plate: number;
  /** K.S.A. 8-143: the fee replaces the weight fee for hybrids, plug-in hybrids and electric vehicles. */
  reg: { car: { lightUpTo: number; light: number; heavy: number; hybrid: number; phev: number; ev: number }; truck: { gas: number; hybrid: number; ev: number } };
  serviceFee: number;
  modernization: number;
  countyFeeMax: number;
};

export function ksReg(p: P, fuel: string, body: string, lbs: number) {
  if (body === 'truck') return fuel === 'ev' ? p.reg.truck.ev : fuel === 'hybrid' || fuel === 'phev' ? p.reg.truck.hybrid : p.reg.truck.gas;
  const c = p.reg.car;
  if (fuel === 'ev') return c.ev;
  if (fuel === 'phev') return c.phev;
  if (fuel === 'hybrid') return c.hybrid;
  return lbs <= c.lightUpTo ? c.light : c.heavy;
}

/** Kansas: 6.5% state + local sales tax (dealer and private sales), $10 title, flat registration by weight or fuel, county property tax. */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  if (i.transaction === 'purchase') {
    const base = taxableBase(i, p.tax);
    lines.push(line({ id: 'sales-tax', label: 'State sales tax (6.5%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: 'pub1526', note: i.seller === 'private' ? 'Private sale: paid to the county treasurer at registration.' : 'Trade-in deducted; administrative fees are taxed.' }));
    const lr = localRate(i, d);
    if (lr > 0) lines.push(line({ id: 'local-tax', label: `Local sales tax (${+(lr * 100).toFixed(3)}%)`, kind: 'tax', amount: base * lr, when: 'once', source: (county(i, d)?.rateSource as string | undefined) ?? 'pub1526', note: 'County rate; a city or district sales tax may add to it.' }));
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'ksa-8-135' }));
    lines.push(line({ id: 'plate', label: 'License plate fee', kind: 'plate', amount: p.plate, when: 'once', source: 'sedgwick-fees' }));
  }
  const fuelLabel = i.fuel === 'ev' ? 'all-electric' : i.fuel === 'phev' ? 'plug-in hybrid' : i.fuel === 'hybrid' ? 'hybrid' : i.body === 'truck' ? 'truck, 12,000 lb or less' : i.weightLbs <= p.reg.car.lightUpTo ? '4,500 lb or less' : 'over 4,500 lb';
  lines.push(line({ id: 'reg', label: `Annual registration (${fuelLabel})`, kind: 'registration', amount: ksReg(p, i.fuel, i.body, i.weightLbs), years: 1, when: 'cycle', source: 'ksa-8-143' }));
  lines.push(line({ id: 'service-fee', label: 'County treasurer service fee', kind: 'registration', amount: p.serviceFee, years: 1, when: 'cycle', source: 'ksa-8-145d' }));
  lines.push(line({ id: 'modernization', label: 'Division of Vehicles modernization fee', kind: 'other', amount: p.modernization, years: 1, when: 'cycle', source: 'ksa-8-145' }));
  lines.push(line({ id: 'county-fee', label: 'County registration facility fee (optional, set by the treasurer)', kind: 'local', amount: null, range: [0, p.countyFeeMax], years: 1, when: 'cycle', source: 'ksa-8-145d', note: 'Up to $5 in a county with several tag offices, $2.50 with one.' }));
  lines.push(line({ id: 'property-tax', label: 'County personal property tax on the vehicle', kind: 'value', amount: null, when: 'cycle', source: 'titlenew', note: 'Paid with each registration; set by the vehicle value class and the local mill levy.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
