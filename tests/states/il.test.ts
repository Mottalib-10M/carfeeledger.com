import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/il.json';
import engine from '../../src/lib/engine/states/il';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Illinois', () => {
  it('new car from a Cook County dealer: 6.25% + 1.25% transit, title $165, plate $151', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2188); // 35,000 x 6.25% = 2,187.50, rounded to the dollar (ST-556)
    expect(amt(r, 'local-tax')).toBe(437); // round(35,000 x 7.5%) = 2,625 - 2,188
    expect(amt(r, 'title')).toBe(165);
    expect(amt(r, 'reg')).toBe(151);
    expect(ids(r)).not.toContain('emissions'); // new car: first test at four years
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2941); // no official 2026 doc-fee figure: none added
  });
  it('used EV from a private seller in Cook County: RUT-50 Table B $850 + Cook $175, EV fee $100', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(850); // $18,000 is in the $15,000-$19,999.99 band
    expect(amt(r, 'cook-private')).toBe(175); // 2026 - 2021 = 5 years: "4 to 8 years"
    expect(ids(r)).not.toContain('chicago-private');
    expect(amt(r, 'ev')).toBe(100);
    expect(amt(r, 'reg')).toBe(151);
    expect(ids(r)).not.toContain('local-tax');
  });
  it('renewal one year later: $151 only', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg']);
    expect(amt(r, 'reg')).toBe(151);
  });
  it('Chicago resident at a dealer: + 1.25% Chicago home rule use tax', () => {
    const r = engine({ ...NEW_CAR, county: 'city-of-chicago' }, d);
    expect(amt(r, 'chicago-use')).toBe(438); // round(437.50)
    expect(amt(r, 'local-tax')).toBe(437); // round(35,000 x 8.75%) = 3,063 - 2,188 - 438
  });
  it('trade-in fully deducted, documentary fee taxed', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1563); // 25,000 x 6.25% = 1,562.50
    const r = engine({ ...NEW_CAR, docFee: 300 }, d);
    expect(amt(r, 'sales-tax')).toBe(2206); // 35,300 x 6.25% = 2,206.25
    expect(amt(r, 'local-tax')).toBe(442); // round(35,300 x 7.5%) = 2,648 - 2,206
  });
  it('private sale under $15,000: Table A by age, Chicago and Cook taxes', () => {
    const r = engine({ ...USED_EV, price: 6000, modelYear: 2012, fuel: 'gas', county: 'city-of-chicago' }, d);
    expect(amt(r, 'sales-tax')).toBe(100); // age 14: "11 or more"
    expect(amt(r, 'chicago-private')).toBe(50); // 9 to 14 years
    expect(amt(r, 'cook-private')).toBe(90); // 9 years or older
    expect(amt(engine({ ...USED_EV, price: 9000, modelYear: 2025, county: 'other' }, d), 'sales-tax')).toBe(465); // age 1
  });
  it('emissions test (free, every two years) from age four in the test areas only', () => {
    const r = engine({ ...RENEW_1, year: 2030, ownedYears: 4 }, d);
    expect(amt(r, 'emissions')).toBe(0);
    expect(ids(engine({ ...RENEW_1, year: 2030, ownedYears: 4, county: 'other' }, d))).not.toContain('emissions');
    expect(ids(engine({ ...RENEW_1, year: 2030, ownedYears: 4, fuel: 'ev' }, d))).not.toContain('emissions');
  });
});
