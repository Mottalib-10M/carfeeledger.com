import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/me.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Maine', () => {
  it('new car in Cumberland County: 5.5% tax, $33 title, $35 registration, 24-mill excise, no inspection at purchase', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1925); // 35,000 x 5.5%
    expect(amt(r, 'title')).toBe(33); // 29-A §603
    expect(amt(r, 'reg')).toBe(35); // 29-A §501
    expect(amt(r, 'excise')).toBe(840); // 35,000 x 24 mills (MSRP unknown: price used)
    expect(ids(r)).not.toContain('inspection-enhanced'); // dealer car comes inspected
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2833); // 1,925 + 33 + 35 + 840
  });
  it('used 2021 EV bought privately: 5.5% use tax, 4-mill excise (6th year), enhanced inspection max $18.50', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(990); // 18,000 x 5.5%
    expect(amt(r, 'excise')).toBe(72); // 18,000 x 4 mills
    expect(amt(r, 'inspection-enhanced')).toBe(18.5);
    expect(ids(r)).not.toContain('ev'); // no EV surcharge in Maine
  });
  it('renewal one year later: 17.5 mills, $35, inspection', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'excise')).toBe(612.5); // 35,000 x 17.5 mills
    expect(amt(r, 'reg')).toBe(35);
    expect(amt(r, 'inspection-enhanced')).toBe(18.5);
    expect(ids(r)).not.toContain('sales-tax');
  });
  it('excise follows the MSRP, not the price', () => { expect(amt(engine({ ...NEW_CAR, msrp: 40000 }, d), 'excise')).toBe(960); });
  it('excise minimum $5', () => { expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2010, price: 1000 }, d), 'excise')).toBe(5); }); // 1,000 x 4 mills = 4 -> 5
  it('trade-in credit', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1375); }); // 25,000 x 5.5%
  it('doc fee is taxed', () => { expect(amt(engine({ ...NEW_CAR, docFee: 500 }, d), 'sales-tax')).toBe(1952.5); }); // 35,500 x 5.5%
  it('outside Cumberland County: standard inspection max $12.50', () => {
    const r = engine({ ...RENEW_1, county: 'penobscot-county' }, d);
    expect(amt(r, 'inspection')).toBe(12.5);
    expect(ids(r)).not.toContain('inspection-enhanced');
  });
});
