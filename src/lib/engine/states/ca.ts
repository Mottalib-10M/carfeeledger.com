import type { FeeLine, StateEngine } from '../types';
import { age, bracket, county, forTransaction, line, localRate, taxableBase } from '../helpers';

type P = {
  tax: { stateRate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  reg: { base: number; chp: number };
  vlf: { rate: number; classWidth: number; depreciation: number[] };
  tif: { brackets: { upTo: number | null; amount: number }[] };
  rif: { amount: number; minModelYear: number };
  smog: { abatement: number; abatementMaxAge: number; abatementRange78: [number, number]; exemptRenewalAge: number; transferFee: number; transferMaxAge: number; certificate: number };
  transfer: { fee: number };
  plate: { reflectorized: number };
};

/** VLF class value: the $200 bracket of the purchase price, taken at its midpoint (REG 360: $12,479 -> class CX, $12,500). */
export function vlfClassValue(price: number, width: number) {
  return Math.floor(price / width) * width + width / 2;
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const usedPurchase = purchase && i.condition === 'used';
  const a = age(i);
  const k = Math.min(Math.max(0, i.ownedYears), p.vlf.depreciation.length - 1);

  // Sales or use tax on the full price (no trade-in credit), doc fee included.
  const rate = p.tax.stateRate + localRate(i, d);
  const base = taxableBase(i, { tradeInCredit: p.tax.tradeInCredit, docFeeTaxable: p.tax.docFeeTaxable });
  lines.push(line({ id: 'sales-tax', label: `Sales/use tax (${(rate * 100).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')}%)`, kind: 'tax', amount: base * rate, when: 'once', source: 'cdtfa-rates', note: i.tradeIn > 0 ? 'California does not deduct the trade-in from the taxable price.' : undefined }));

  if (usedPurchase) {
    lines.push(line({ id: 'transfer', label: 'Transfer fee', kind: 'title', amount: p.transfer.fee, when: 'once', source: 'dmv-fees' }));
    if (i.fuel !== 'ev') {
      if (a <= p.smog.transferMaxAge) lines.push(line({ id: 'smog-transfer', label: 'Smog transfer fee', kind: 'inspection', amount: p.smog.transferFee, when: 'once', source: 'dmv-fees', note: 'Four model years and newer: no smog check at change of ownership, a transfer fee instead.' }));
      else lines.push(line({ id: 'smog-cert', label: 'Smog check at change of ownership', kind: 'inspection', amount: null, when: 'once', source: 'bar-faq', note: `Station price set freely; it includes the $${p.smog.certificate.toFixed(2)} state certificate fee.` }));
    }
  } else if (purchase) {
    lines.push(line({ id: 'plate', label: 'Reflectorized plate fee', kind: 'plate', amount: p.plate.reflectorized, when: 'once', source: 'dmv-fees' }));
  }

  // Yearly registration package. On a used car it is due at the next expiration date of the carried-over registration.
  const deferred = usedPurchase ? true : undefined;
  const cls = vlfClassValue(i.price, p.vlf.classWidth);
  const dep = p.vlf.depreciation[k];
  const vlf = Math.round(cls * p.vlf.rate * dep + 1e-9);
  const marketValue = i.price * dep;
  lines.push(line({ id: 'reg', label: 'Registration fee (includes $3 alternative fuel/technology fee)', kind: 'registration', amount: p.reg.base, when: 'cycle', source: 'dmv-fees', deferred }));
  lines.push(line({ id: 'chp', label: 'California Highway Patrol fee', kind: 'registration', amount: p.reg.chp, when: 'cycle', source: 'dmv-fees', deferred }));
  const c = county(i, d);
  const cf = (c?.countyFee as [number, number] | undefined) ?? [0, 0];
  lines.push(line({ id: 'county', label: `County and district fees${c ? ` (${c.name})` : ''}`, kind: 'local', amount: cf[0] === cf[1] ? cf[0] : null, range: cf[0] === cf[1] ? undefined : cf, when: 'cycle', source: 'dmv-county', deferred }));
  lines.push(line({ id: 'vlf', label: `Vehicle license fee (0.65% of $${cls.toLocaleString('en-US')}${dep < 1 ? ` x ${Math.round(dep * 100)}%` : ''})`, kind: 'value', amount: vlf, when: 'cycle', source: 'dmv-vlf', deferred, note: k === 0 ? 'Based on the price you pay, even for a used car: the schedule restarts at each change of owner.' : `Year ${k + 1} of the 11-year VLF schedule.` }));
  lines.push(line({ id: 'tif', label: 'Transportation improvement fee', kind: 'registration', amount: bracket(p.tif.brackets, marketValue).amount, when: 'cycle', source: 'dmv-fees', deferred }));

  if (i.fuel === 'ev' && i.modelYear >= p.rif.minModelYear) {
    const newFromDealer = purchase && i.condition === 'new' && i.seller === 'dealer';
    if (!newFromDealer) lines.push(line({ id: 'rif', label: 'Road improvement fee (zero-emission vehicle)', kind: 'ev', amount: p.rif.amount, when: 'cycle', source: 'dmv-fees', deferred, note: 'Not charged at the first registration of a new ZEV bought from a dealer; due at every renewal.' }));
    else notes.push(`The $${p.rif.amount} road improvement fee starts at the first renewal of this zero-emission vehicle.`);
  }

  if (i.fuel !== 'ev') {
    if (a < p.smog.exemptRenewalAge) {
      if (a <= p.smog.abatementMaxAge) lines.push(line({ id: 'smog-abatement', label: 'Smog abatement fee (no smog check for the first eight model years)', kind: 'inspection', amount: p.smog.abatement, when: 'cycle', source: 'dmv-fees', deferred }));
      else lines.push(line({ id: 'smog-abatement', label: 'Smog abatement fee (seventh and eighth model-years)', kind: 'inspection', amount: null, range: p.smog.abatementRange78, when: 'cycle', source: 'hsc-44060', deferred, note: 'The DMV fee table lists $20; Health and Safety Code 44060 sets $25 for these model-years.' }));
    } else if (i.transaction === 'renewal') {
      lines.push(line({ id: 'smog-check', label: 'Biennial smog check', kind: 'inspection', amount: null, when: 'cycle', years: 2, source: 'bar-faq', note: `Station price set freely, including the $${p.smog.certificate.toFixed(2)} certificate fee.` }));
    }
  }

  if (i.seller === 'private') notes.push('Use tax on a private-party sale is paid to the DMV when the title is transferred, at the rate of your home address.');
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
