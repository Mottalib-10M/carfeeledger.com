import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  reg: { base: number; baseHeavy: number; heavyFromLbs: number; texasSure: number; processing: number; newDealerYears: number };
  title: { emissionsCounty: number; other: number };
  inspection: { replacement: number; replacementNew2yr: number; emissionsState: number };
  ev: { annual: number; newTwoYear: number };
};

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const newDealer = purchase && i.condition === 'new' && i.seller === 'dealer';
  const usedPurchase = purchase && !newDealer;
  const c = county(i, d);
  const emissionsCounty = Boolean(c?.emissions);
  const yrs = newDealer ? p.reg.newDealerYears : 1;
  const deferred = usedPurchase ? true : undefined;

  const base = taxableBase(i, { tradeInCredit: p.tax.tradeInCredit, docFeeTaxable: p.tax.docFeeTaxable });
  lines.push(line({ id: 'sales-tax', label: 'Motor vehicle sales tax (6.25%)', kind: 'tax', amount: base * p.tax.rate, when: 'once', source: 'cpa-tax', note: i.tradeIn > 0 ? 'Trade-in deducted from the taxable price.' : undefined }));
  if (i.seller === 'private' && purchase) notes.push('Private sale: TxDMV says tax is due on the purchase price or the standard presumptive value, whichever is higher (a certified appraisal can replace it).');
  if (purchase) lines.push(line({ id: 'title', label: `Title application fee (${emissionsCounty ? 'emissions county' : 'non-emissions county'})`, kind: 'title', amount: emissionsCounty ? p.title.emissionsCounty : p.title.other, when: 'once', source: 'title-fee' }));

  const baseReg = (i.weightLbs >= p.reg.heavyFromLbs ? p.reg.baseHeavy : p.reg.base) + p.reg.texasSure;
  lines.push(line({ id: 'reg', label: `Registration fee (base + $1 TexasSure)${yrs > 1 ? ', 24 months' : ''}`, kind: 'registration', amount: baseReg * yrs, years: yrs, when: 'cycle', source: 'txdmv-reg', deferred }));
  lines.push(line({ id: 'local', label: `County local fees${c ? ` (${c.name})` : ''}${yrs > 1 ? ', 24 months' : ''}`, kind: 'local', amount: ((c?.localFee as number) ?? 0) * yrs, years: yrs, when: 'cycle', source: 'fee-chart', deferred }));
  lines.push(line({ id: 'processing', label: 'Processing and handling fee', kind: 'other', amount: p.reg.processing, years: yrs, when: 'cycle', source: 'regman', deferred }));
  if (newDealer) lines.push(line({ id: 'inspection-fee', label: 'Inspection program replacement fee (new vehicle, two years)', kind: 'inspection', amount: p.inspection.replacementNew2yr, years: 2, when: 'cycle', source: 'regman' }));
  else lines.push(line({ id: 'inspection-fee', label: 'Inspection program replacement fee', kind: 'inspection', amount: p.inspection.replacement, when: 'cycle', source: 'txdmv-reg', deferred }));
  if (i.fuel === 'ev') lines.push(line({ id: 'ev', label: newDealer ? 'Electric vehicle fee (two-year registration)' : 'Electric vehicle fee', kind: 'ev', amount: newDealer ? p.ev.newTwoYear : p.ev.annual, years: yrs, when: 'cycle', source: 'txdmv-reg', deferred }));
  const emissionsDue = emissionsCounty && i.fuel !== 'ev' && !newDealer && !(i.transaction === 'renewal' && age(i) < 2);
  if (emissionsDue) {
    lines.push(line({ id: 'emissions-state', label: 'Emissions inspection fee (state portion)', kind: 'inspection', amount: p.inspection.emissionsState, when: 'cycle', source: 'txdmv-reg', deferred }));
    lines.push(line({ id: 'emissions-station', label: 'Emissions test at the station', kind: 'inspection', amount: null, when: 'cycle', source: 'occc-inspection', deferred, note: 'Paid to the station; the OCCC uses $18.50 as an example.' }));
  }
  if (usedPurchase) notes.push('On a used car the current registration carries over; the renewal package is due at its expiration date.');
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
