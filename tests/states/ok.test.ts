import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ok.json';
import engine from '../../src/lib/engine/states/ok';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Oklahoma', () => {
  it('new $35,000 car from a dealer: 3.25% excise rounded, 1.25% sales tax, $96 registration', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1138); // 35,000 x 3.25% = 1,137.50, rounded to the nearest dollar
    expect(amt(r, 'sales-tax-125')).toBe(437.5); // 35,000 x 1.25%
    expect(amt(r, 'title')).toBe(11);
    expect(amt(r, 'insurance')).toBe(1.5);
    expect(amt(r, 'reg')).toBe(96); // 1st-4th year
    expect(r.atPurchase).toBe(1684); // 1,138 + 437.50 + 11 + 1.50 + 96
  });
  it('used 2021 EV bought privately: used-vehicle excise, sales tax shown as a range', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(556); // 20 + (18,000 - 1,500) x 3.25% = 556.25 -> 556
    const st = r.lines.find((l) => l.id === 'sales-tax-125')!;
    expect(st.amount).toBeNull();
    expect(st.range).toEqual([0, 225]); // 18,000 x 1.25%
    expect(amt(r, 'reg')).toBe(86); // 6th year of registration
    expect(amt(r, 'ev')).toBe(100);
    expect(r.atPurchase).toBe(754.5); // 556 + 11 + 1.50 + 86 + 100
  });
  it('renewal in 2027: $96 only', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg']);
    expect(amt(r, 'reg')).toBe(96);
  });
  it('registration steps by year of registration', () => {
    expect(amt(engine({ ...NEW_CAR, modelYear: 2023 }, d), 'reg')).toBe(96); // 4th year
    expect(amt(engine({ ...NEW_CAR, modelYear: 2022 }, d), 'reg')).toBe(86); // 5th year
    expect(amt(engine({ ...NEW_CAR, modelYear: 2018 }, d), 'reg')).toBe(66); // 9th year
    expect(amt(engine({ ...NEW_CAR, modelYear: 2014 }, d), 'reg')).toBe(46); // 13th year
    expect(amt(engine({ ...NEW_CAR, modelYear: 2010 }, d), 'reg')).toBe(26); // 17th year
  });
  it('trade-in: excise on the full price, 1.25% on the difference', () => {
    const r = engine({ ...NEW_CAR, tradeIn: 10000 }, d);
    expect(amt(r, 'sales-tax')).toBe(1138);
    expect(amt(r, 'sales-tax-125')).toBe(312.5); // 25,000 x 1.25%
  });
  it('cheap used car: $20 on the first $1,500', () => {
    expect(amt(engine({ ...USED_EV, price: 1200 }, d), 'sales-tax')).toBe(20);
    expect(amt(engine({ ...USED_EV, price: 6000 }, d), 'sales-tax')).toBe(166); // 20 + 4,500 x 3.25% = 166.25
  });
  it('plug-in hybrid $30, ordinary hybrid nothing', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(30);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('ev');
  });
});
