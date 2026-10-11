import type { FeeLine, StateEngine } from '../types';
import { county, forTransaction, line } from '../helpers';

type Min = { from: number; amount: number }[];
type P = {
  tax: { rate: number; docFeeTaxable: boolean; inLieu: number; inLieuFromAge: number; inLieuBelow: number };
  title: { fee: number; tech: number; psv: number; filing: number; transferTax: number };
  plate: { double: number };
  reg: { base: number; pct: number; schedule: number[]; flatAfter: number };
  renewal: { filing: number; tech: number };
  ev: { pct: number; min: Min; later: number };
  phev: { pct: number; min: Min; later: number };
};

/** Minimum EV/PHEV surcharge for a registration period starting in `year` (July 1 changes are resolved by `amountFor`). */
function minsFor(m: Min, year: number): number[] {
  // m lists {from: YYYYMM, amount}; a calendar year may straddle two values.
  const start = year * 100 + 1, end = year * 100 + 12;
  const at = (ym: number) => { let a = m[0].amount; for (const x of m) if (x.from <= ym) a = x.amount; return a; };
  return [...new Set([at(start), at(end)])];
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const dealer = i.seller === 'dealer';
  const isNew = purchase && i.condition === 'new';
  // A used car keeps its plates and paid registration: the next registration tax is due at the renewal.
  const deferred = purchase && !isNew ? true : undefined;
  const k = Math.max(0, i.year - i.modelYear); // 0 = first year of vehicle life
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  if (purchase) {
    const base = Math.max(0, i.price + (dealer && p.tax.docFeeTaxable ? i.docFee : 0) - i.tradeIn);
    const inLieu = k >= p.tax.inLieuFromAge && i.price < p.tax.inLieuBelow;
    lines.push(line({ id: 'sales-tax', label: inLieu ? 'Motor vehicle sales tax ($10 in lieu tax, older car)' : 'Motor vehicle sales tax (6.875%)', kind: 'tax', amount: inLieu ? p.tax.inLieu : base * p.tax.rate, when: 'once', source: inLieu ? 'older-car' : 'mvst', note: inLieu ? 'Tenth year of vehicle life or older and resale value under $3,000 (the price is used for the value).' : i.tradeIn > 0 ? 'Trade-in allowance deducted from the purchase price.' : undefined }));
    lines.push(line({ id: 'title', label: 'Title fee', kind: 'title', amount: p.title.fee, when: 'once', source: 'title' }));
    lines.push(line({ id: 'title-tech', label: 'Technology surcharge (title)', kind: 'title', amount: p.title.tech, when: 'once', source: 'title' }));
    lines.push(line({ id: 'psv', label: 'Public safety vehicle fee', kind: 'title', amount: p.title.psv, when: 'once', source: 'title' }));
    lines.push(line({ id: 'filing', label: 'Filing fee (title and registration transaction)', kind: 'other', amount: p.title.filing, when: 'once', source: 'filing' }));
    if (!isNew) lines.push(line({ id: 'transfer-tax', label: 'Transfer tax', kind: 'title', amount: p.title.transferTax, when: 'once', source: 'facts' }));
    if (isNew) lines.push(line({ id: 'plates', label: 'License plates (pair)', kind: 'plate', amount: p.plate.double, when: 'once', source: 'plates' }));
  }
  const pct = k < p.reg.schedule.length ? p.reg.schedule[k] : null;
  const regTax = p.reg.base + (pct === null ? p.reg.flatAfter : msrp * p.reg.pct * pct);
  lines.push(line({ id: 'reg', label: pct === null ? 'Registration tax ($10 + $20, 11th year and after)' : `Registration tax ($10 + 1.575% of the MSRP${pct < 1 ? ` x ${Math.round(pct * 100)}%` : ''})`, kind: 'registration', amount: regTax, when: 'cycle', source: 'reg-tax', deferred, note: deferred ? 'The plates and paid registration stay with the car; this is due at the next renewal.' : undefined }));
  if (!purchase) {
    lines.push(line({ id: 'renewal-filing', label: 'Filing fee (renewal)', kind: 'other', amount: p.renewal.filing, when: 'cycle', source: 'filing' }));
    lines.push(line({ id: 'renewal-tech', label: 'Technology surcharge (renewal)', kind: 'registration', amount: p.renewal.tech, when: 'cycle', source: 'tech' }));
  }
  const c = county(i, d);
  const wheel = typeof c?.localFeeFrom2027 === 'number' && i.year >= 2027 ? c.localFeeFrom2027 : c?.localFee;
  if (c && typeof wheel === 'number' && wheel > 0) lines.push(line({ id: 'wheelage', label: `County wheelage tax (${c.name})`, kind: 'local', amount: wheel, when: 'cycle', source: 'wheelage', deferred }));
  if (i.fuel === 'ev' || i.fuel === 'phev') {
    const s = i.fuel === 'ev' ? p.ev : p.phev;
    const share = msrp * s.pct * (pct === null ? s.later : pct);
    const options = minsFor(s.min, i.year).map((m) => Math.max(m, share));
    const exact = new Set(options.map((x) => Math.round(x * 100))).size === 1;
    lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Electric vehicle surcharge' : 'Plug-in hybrid surcharge', kind: 'ev', amount: exact ? options[0] : null, range: exact ? undefined : [Math.min(...options), Math.max(...options)], when: 'cycle', source: 'reg-tax', deferred, note: exact ? `Greater of the minimum and ${s.pct * 100}% of the MSRP by year of life.` : 'The minimum falls on July 1, 2027: the amount depends on the month your registration period starts.' }));
  }
  if (purchase && i.seller === 'private') notes.push('Private sale: the plates and the registration already paid stay with the car; the buyer pays the tax and title fees now and the registration tax at the next renewal.');
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
