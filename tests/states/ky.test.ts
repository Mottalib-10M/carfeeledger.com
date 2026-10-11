import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ky.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Kentucky', () => {
  it('new car: 6% usage tax, $9 title, $11.50 + $6 + $3 registration, property tax unpriced', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2100); // 35,000 x 6%
    expect(amt(r, 'title')).toBe(9);
    expect(amt(r, 'reg')).toBe(11.5);
    expect(amt(r, 'clerk-fee')).toBe(6);
    expect(amt(r, 'avis-fee')).toBe(3);
    expect(amt(r, 'property-tax')).toBeNull();
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2129.5); // 2,100 + 9 + 11.50 + 6 + 3
  });
  it('used EV from a private seller: 6% of the price, ownership fee $126', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1080); // 18,000 x 6%
    expect(amt(r, 'ev')).toBe(126);
    expect(amt(engine({ ...USED_EV, fuel: 'phev' }, d), 'ev')).toBe(126); // plug-in charging capability
    expect(ids(engine({ ...USED_EV, fuel: 'hybrid' }, d))).not.toContain('ev');
  });
  it('renewal: $20.50 of registration fees plus the property tax bill', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'clerk-fee', 'avis-fee', 'property-tax']);
  });
  it('trade-in deducted (new cars since July 2014), documentary fee left out', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1500); // 25,000 x 6%
    expect(amt(engine({ ...NEW_CAR, docFee: 500 }, d), 'sales-tax')).toBe(2100);
  });
});
