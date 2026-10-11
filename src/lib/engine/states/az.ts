/**
 * Arizona. Own engine because the generic one cannot express:
 * - city transaction privilege tax with a "single item portion over $X" tier (Phoenix and others),
 *   and cities whose "single item over $X" rule is shown as a range;
 * - the vehicle license tax (A.R.S. 28-5801): 60% of the manufacturer's base retail price, $2.80 per $100
 *   in the first twelve months, then the value drops 16.25% a year and the rate is $2.89 per $100, minimum $10;
 * - the $1.50 air quality fee, not charged on an electrically powered vehicle;
 * - private sales: no transaction privilege or use tax.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line, taxableBase } from '../helpers';

type Tier = { over: number; rate: number; portion: boolean };
type P = {
  tax: { stateRate: number; tradeInCredit: boolean; docFeeTaxable: boolean };
  vlt: { valuePct: number; firstRate: number; laterRate: number; decline: number; min: number };
  fees: { title: number; reg: number; airQuality: number };
  emissions: { A: { amount: number; years: number }; B: { amount: number; years: number }; exemptUnderAge: number };
};
type City = { id: string; name: string; countyRate: number; cityRate: number; tier?: Tier; area?: 'A' | 'B' };

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d) as unknown as City | undefined;
  const purchase = i.transaction === 'purchase';
  const dealer = i.seller === 'dealer';

  if (purchase && dealer) {
    const base = taxableBase(i, p.tax);
    lines.push(line({ id: 'sales-tax', label: 'State transaction privilege tax (5.6%)', kind: 'tax', amount: base * p.tax.stateRate, when: 'once', source: 'ador-rates', note: 'Trade-in deducted; a separately stated, reasonable doc fee is not taxed.' }));
    if (i.localRateOverride !== null && Number.isFinite(i.localRateOverride)) {
      lines.push(line({ id: 'local-tax', label: `County and city tax (${+(i.localRateOverride * 100).toFixed(3)}%)`, kind: 'tax', amount: base * i.localRateOverride, when: 'once', source: 'ador-rates' }));
    } else if (c) {
      if (c.countyRate > 0) lines.push(line({ id: 'county-tax', label: `County excise tax (${+(c.countyRate * 100).toFixed(3)}%)`, kind: 'tax', amount: base * c.countyRate, when: 'once', source: 'ador-rates' }));
      if (c.cityRate > 0) {
        const t = c.tier;
        const label = `City tax (${c.name.replace(/ \(.*\)$/, "")}, ${+(c.cityRate * 100).toFixed(3)}%)`;
        if (!t || base <= t.over) lines.push(line({ id: 'city-tax', label, kind: 'tax', amount: base * c.cityRate, when: 'once', source: 'ador-rates' }));
        else if (t.portion) lines.push(line({ id: 'city-tax', label: `${label.slice(0, -1)}; ${+(t.rate * 100).toFixed(3)}% above $${t.over.toLocaleString('en-US')})`, kind: 'tax', amount: t.over * c.cityRate + (base - t.over) * t.rate, when: 'once', source: 'ador-rates', note: 'The single-item portion above the threshold is taxed at the lower city rate.' }));
        else lines.push(line({ id: 'city-tax', label: `${label} or ${+(t.rate * 100).toFixed(3)}% above $${t.over.toLocaleString('en-US')}`, kind: 'tax', amount: null, range: [Math.round(base * t.rate * 100) / 100, Math.round(base * c.cityRate * 100) / 100], when: 'once', source: 'ador-rates', note: 'This city lists a lower rate for a single item over the threshold; how it applies to a vehicle was not confirmed, so both amounts are shown.' }));
      }
    }
  }
  if (purchase) {
    if (!dealer) notes.push('A sale between two private individuals is a casual sale: Arizona charges no transaction privilege or use tax on it.');
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.fees.title, when: 'once', source: 'ars-28-2003' }));
  }

  // Vehicle license tax, every year.
  const k = age(i);
  const base = i.msrp > 0 ? i.msrp : i.price;
  const value = base * p.vlt.valuePct * Math.pow(1 - p.vlt.decline, k);
  const rate = k === 0 ? p.vlt.firstRate : p.vlt.laterRate;
  const vlt = Math.max(p.vlt.min, (value / 100) * rate);
  lines.push(line({ id: 'vlt', label: `Vehicle license tax ($${rate.toFixed(2)} per $100 of ${k === 0 ? '60% of MSRP' : `60% of MSRP less 16.25% a year x ${k}`})`, kind: 'value', amount: vlt, when: 'cycle', source: 'ars-28-5801', note: `${i.msrp > 0 ? 'Based on the MSRP typed' : 'Price used as the manufacturer’s base retail price (type the MSRP for an exact figure)'}; age counted from the model year.` }));
  lines.push(line({ id: 'reg', label: 'Registration fee', kind: 'registration', amount: p.fees.reg, when: 'cycle', source: 'ars-28-2003' }));
  if (i.fuel !== 'ev') lines.push(line({ id: 'air-quality', label: 'Air quality fee', kind: 'registration', amount: p.fees.airQuality, when: 'cycle', source: 'ars-49-551', note: 'Not charged on an electrically powered vehicle.' }));

  // Emissions test in the Phoenix (area A) and Tucson (area B) areas, from the sixth registration year.
  if (c?.area && i.fuel !== 'ev' && k >= p.emissions.exemptUnderAge) {
    const e = p.emissions[c.area];
    lines.push(line({ id: 'emissions', label: c.area === 'A' ? 'Emissions test, Phoenix area (every 2 years)' : 'Emissions test, Tucson area (every year)', kind: 'inspection', amount: e.amount, years: e.years, when: 'cycle', source: 'adeq-fees', note: 'OBD test fee posted by ADEQ.' }));
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
