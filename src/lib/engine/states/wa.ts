/**
 * Washington. Own engine because the generic one cannot express:
 * - the 8% luxury tax on the selling price PLUS the trade-in above an indexed deduction;
 * - the Sound Transit (RTA) motor vehicle excise tax on the depreciated MSRP, only for addresses in the district
 *   and not for light trucks over 6,000 lb;
 * - the EV, hybrid and transportation benefit district fees, which by statute are due only at a renewal;
 * - a used vehicle keeps its Washington tabs: the registration-side lines are due at the next tab expiration.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line, localRate, taxableBase } from '../helpers';

type Br = [number | null, number];
type P = {
  tax: { stateRate: number; mvRate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  luxury: { rate: number; deduction: number };
  title: { appDealer: number; appOther: number; filing: number; service: number; ems: number; arbitrationNew: number };
  plates: { originalPerPlate: number; reflectivityPerPlate: number; count: number };
  reg: { carLicense: number; carWeight: Br[]; truckLicense: Br[]; truckExtraWeight: number; filing: number; licenseService: number; plateTech: number; service: number };
  rta: { rate: number; schedule: number[]; truckMaxLbs: number };
  ev: { ev: number; evExtra: number; electrification: number; hybrid: number };
};
const pick = (t: Br[], x: number) => (t.find(([up]) => up === null || x <= up) ?? t[t.length - 1])[1];

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d) as (Record<string, unknown> & { name: string }) | undefined;
  const purchase = i.transaction === 'purchase';
  const usedPurchase = purchase && i.condition === 'used';
  const deferred = usedPurchase ? true : undefined;
  const dealer = i.seller === 'dealer';

  if (purchase) {
    const base = taxableBase(i, p.tax);
    const lr = localRate(i, d);
    const word = dealer ? 'sales' : 'use';
    lines.push(line({ id: 'sales-tax', label: `State retail ${word} tax (6.5%)`, kind: 'tax', amount: base * p.tax.stateRate, when: 'once', source: 'rcw-82-08-020', note: dealer ? 'The trade-in is deducted; the documentary service fee is not taxed.' : 'Use tax collected by the licensing office at the title transfer, on the price paid.' }));
    if (lr > 0) lines.push(line({ id: 'local-tax', label: `Local ${word} tax (${+(lr * 100).toFixed(2)}%${c ? `, ${c.name}` : ''})`, kind: 'tax', amount: base * lr, when: 'once', source: 'dor-rates' }));
    lines.push(line({ id: 'mv-tax', label: 'Motor vehicle sales/use tax (0.5%)', kind: 'tax', amount: base * p.tax.mvRate, when: 'once', source: 'dor-mvsut' }));
    const lux = i.price + i.tradeIn - p.luxury.deduction;
    if (lux > 0) lines.push(line({ id: 'luxury-tax', label: `Luxury motor vehicle tax (8% above $${p.luxury.deduction.toLocaleString('en-US')})`, kind: 'tax', amount: lux * p.luxury.rate, when: 'once', source: 'dor-luxury', note: 'Charged on the price plus the trade-in, minus the deduction.' }));
    const app = dealer ? p.title.appDealer : p.title.appOther;
    lines.push(line({ id: 'title', label: `Certificate of title application fee${dealer ? ' (dealer sale)' : ''}`, kind: 'title', amount: app, when: 'once', source: 'rcw-46-17-100' }));
    lines.push(line({ id: 'title-filing', label: 'Title filing fee', kind: 'title', amount: p.title.filing, when: 'once', source: 'rcw-46-17-005' }));
    lines.push(line({ id: 'title-service', label: 'Title service fee', kind: 'title', amount: p.title.service, when: 'once', source: 'rcw-46-17-040' }));
    lines.push(line({ id: 'ems', label: 'Emergency medical services fee', kind: 'title', amount: p.title.ems, when: 'once', source: 'rcw-46-17-110' }));
    if (i.condition === 'new' && dealer) lines.push(line({ id: 'arbitration', label: 'New motor vehicle arbitration fee', kind: 'other', amount: p.title.arbitrationNew, when: 'once', source: 'rcw-19-118-110' }));
    if (i.condition === 'new') lines.push(line({ id: 'plates', label: `Two original-issue plates ($${p.plates.originalPerPlate} + $${p.plates.reflectivityPerPlate} reflectivity each)`, kind: 'plate', amount: p.plates.count * (p.plates.originalPerPlate + p.plates.reflectivityPerPlate), when: 'once', source: 'rcw-46-17-200' }));
  }

  // Registration (tabs), yearly.
  const truck = i.body === 'truck';
  const regNote = usedPurchase ? 'A used car keeps its Washington tabs: due at the next tab expiration.' : undefined;
  if (truck) {
    lines.push(line({ id: 'reg', label: 'License fee by declared gross weight (light truck)', kind: 'registration', amount: pick(p.reg.truckLicense, i.weightLbs), when: 'cycle', source: 'rcw-46-17-355', deferred, note: regNote ?? 'Bracket of the weight typed, read as the declared gross weight; 2026 table raised 2% on July 1, 2026.' }));
    lines.push(line({ id: 'reg-weight', label: 'Additional weight fee (12,000 lb or less)', kind: 'registration', amount: p.reg.truckExtraWeight, when: 'cycle', source: 'rcw-46-17-355', deferred }));
  } else {
    lines.push(line({ id: 'reg', label: 'Vehicle license fee (passenger car)', kind: 'registration', amount: p.reg.carLicense, when: 'cycle', source: 'rcw-46-17-350', deferred, note: regNote }));
    lines.push(line({ id: 'reg-weight', label: 'Motor vehicle weight fee (by scale weight)', kind: 'registration', amount: pick(p.reg.carWeight, i.weightLbs), when: 'cycle', source: 'rcw-46-17-365', deferred }));
  }
  lines.push(line({ id: 'reg-filing', label: 'Registration filing fee', kind: 'registration', amount: p.reg.filing, when: 'cycle', source: 'rcw-46-17-005', deferred }));
  lines.push(line({ id: 'reg-service', label: 'Registration service fee', kind: 'registration', amount: p.reg.service, when: 'cycle', source: 'rcw-46-17-040', deferred }));
  lines.push(line({ id: 'license-service', label: 'License service fee', kind: 'registration', amount: p.reg.licenseService, when: 'cycle', source: 'rcw-46-17-025', deferred }));
  lines.push(line({ id: 'plate-tech', label: 'License plate technology fee', kind: 'registration', amount: p.reg.plateTech, when: 'cycle', source: 'rcw-46-17-015', deferred }));

  // Sound Transit RTA excise tax.
  if (c?.rta && !(truck && i.weightLbs > p.rta.truckMaxLbs)) {
    const k = Math.min(age(i), p.rta.schedule.length - 1);
    const val = i.msrp > 0 ? i.msrp : i.price;
    lines.push(line({ id: 'rta', label: `Sound Transit RTA excise tax (1.1% of ${Math.round(p.rta.schedule[k] * 100)}% of MSRP)`, kind: 'value', amount: val * p.rta.schedule[k] * p.rta.rate, when: 'cycle', source: 'dol-rta', deferred, note: `${i.msrp > 0 ? 'MSRP' : 'Price used as MSRP (type the MSRP for an exact figure)'}; year ${k + 1} of service on the state schedule.` }));
  }

  // Fees due only at a renewal (RCW 46.17.323, 46.17.324, 82.80.140): absent from a new car's first year.
  if (!purchase || usedPurchase) {
    const renewNote = usedPurchase ? 'Due at the next tab renewal.' : undefined;
    if (i.fuel === 'ev' || i.fuel === 'phev') {
      lines.push(line({ id: 'ev', label: 'Electric vehicle fees ($100 + $50)', kind: 'ev', amount: p.ev.ev + p.ev.evExtra, when: 'cycle', source: 'rcw-46-17-323', deferred, note: renewNote ?? (i.fuel === 'phev' ? 'Plug-in hybrids with 30 miles or more of electric range.' : undefined) }));
      lines.push(line({ id: 'ev-electrification', label: 'Transportation electrification fee', kind: 'ev', amount: p.ev.electrification, when: 'cycle', source: 'rcw-46-17-324', deferred }));
    } else if (i.fuel === 'hybrid') {
      lines.push(line({ id: 'ev', label: 'Hybrid vehicle transportation electrification fee', kind: 'ev', amount: p.ev.hybrid, when: 'cycle', source: 'rcw-46-17-324', deferred, note: renewNote }));
    }
    const tbd = (i.year >= 2027 && typeof c?.tbd2027 === 'number' ? c.tbd2027 : c?.tbd) as number | undefined;
    if (tbd && !(truck && i.weightLbs > 6000)) lines.push(line({ id: 'tbd', label: `Transportation benefit district fee (${c!.name})`, kind: 'local', amount: tbd, when: 'cycle', source: 'dol-tbd', deferred, note: renewNote }));
  }
  if (purchase && i.condition === 'new' && i.fuel !== 'gas') notes.push('Washington charges its electric, plug-in hybrid and hybrid fees only when the tabs are renewed, so they start in the second year.');
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
