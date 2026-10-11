import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ia.json';
import engine from '../../src/lib/engine/states/ia';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Iowa', () => {
  it('new car: fee for new registration $10 + 5%, title $30, registration 1% + 40¢/cwt', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1760); // 10 + 35,000 x 5%
    expect(amt(r, 'title')).toBe(30);
    expect(amt(r, 'reg')).toBe(364); // 35,000 x 1% + 35 x 0.40
    // with the $180 capped documentary fee, included in the price: 10 + 35,180 x 5% = 1,769; + 30 + 364 + 180
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2343);
  });
  it('used EV from a private seller: 5% of the price, EV fee $130, registration needs the list price', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(910); // 10 + 18,000 x 5%
    expect(amt(r, 'ev')).toBe(130);
    expect(amt(r, 'reg')).toBeNull(); // the price paid is not the list price
    expect(amt(engine({ ...USED_EV, msrp: 40000 }, d), 'reg')).toBe(416.8); // 400 + 42 x 0.40
  });
  it('renewal of the car bought new: same $364', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg']);
    expect(amt(r, 'reg')).toBe(364);
  });
  it('trade-in deducted, also between private parties', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1260); // 10 + 25,000 x 5%
    expect(amt(engine({ ...USED_EV, tradeIn: 5000 }, d), 'sales-tax')).toBe(660); // 10 + 13,000 x 5%
  });
  it('age reductions: 75% after 7 model years, 50% after 9, $50 minimum, flat $50 from 12', () => {
    const old = { ...RENEW_1, msrp: 30000, year: 2026, modelYear: 2017 }; // 9 model years
    expect(amt(engine(old, d), 'reg')).toBe(239); // 300 x 75% + 14
    expect(amt(engine({ ...old, modelYear: 2016 }, d), 'reg')).toBe(164); // 300 x 50% + 14
    expect(amt(engine({ ...old, msrp: 3000 }, d), 'reg')).toBe(50); // 22.50 + 14 < $50 minimum
    expect(amt(engine({ ...old, modelYear: 2014, msrp: 0 }, d), 'reg')).toBe(50); // 12 model years: flat
  });
  it('weight counted per 100 lb or fraction; PHEV fee $65', () => {
    expect(amt(engine({ ...NEW_CAR, weightLbs: 3501 }, d), 'reg')).toBe(364.4); // 36 x 0.40
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(65);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('ev');
  });
});
