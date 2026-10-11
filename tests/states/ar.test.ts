import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ar.json';
import engine from '../../src/lib/engine/states/ar';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Arkansas', () => {
  it('new $35,000 car in Little Rock: 6.5%, local 2.125% on $2,500, title $10, $25 + decal + postage, $129 doc fee', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2275); // 35,000 x 6.5%
    expect(amt(r, 'local-tax')).toBe(53.13); // (1.125% Little Rock + 1% Pulaski) x 2,500 = 53.125
    expect(amt(r, 'title')).toBe(10);
    expect(amt(r, 'reg')).toBe(25); // 3,001 - 4,500 lb
    expect(amt(r, 'decal')).toBe(2.5);
    expect(amt(r, 'postage')).toBe(0.5);
    expect(r.lines.find((l) => l.id === 'ppt')?.amount).toBeNull();
    // 2275 + 53.13 + 10 + 25 + 2.5 + 0.5 + 129
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2495.13);
  });
  it('used EV from a private seller, $18,000: full 6.5% (over $10,000) and the $200 EV fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1170); // 18,000 x 6.5%
    expect(amt(r, 'local-tax')).toBe(53.13);
    expect(amt(r, 'ev')).toBe(200);
    expect(amt(r, 'reg')).toBe(25); // 4,200 lb
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(1461.13); // 1170 + 53.13 + 10 + 25 + 3 + 200
  });
  it('renewal: $25 + $2.50 + $0.50, personal property tax without amount', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'decal', 'postage', 'ppt']);
    expect(amt(r, 'reg')).toBe(25);
  });
  it('used $8,000 car with a $5,000 trade-in: 3.5% tier read before the trade-in, on $3,000', () => {
    const r = engine({ ...NEW_CAR, condition: 'used', price: 8000, tradeIn: 5000, modelYear: 2018 }, d);
    expect(amt(r, 'sales-tax')).toBe(105); // 3,000 x 3.5%
    expect(amt(r, 'local-tax')).toBe(53.13); // local rate not reduced, first $2,500
  });
  it('used car under $4,000: no state or local tax', () => {
    const r = engine({ ...NEW_CAR, condition: 'used', price: 3500, modelYear: 2010 }, d);
    expect(amt(r, 'sales-tax')).toBe(0);
    expect(ids(r)).not.toContain('local-tax');
  });
  it('weight brackets and hybrid fees', () => {
    expect(amt(engine({ ...RENEW_1, weightLbs: 2900 }, d), 'reg')).toBe(17);
    expect(amt(engine({ ...RENEW_1, weightLbs: 4600 }, d), 'reg')).toBe(30);
    expect(amt(engine({ ...RENEW_1, fuel: 'hybrid' }, d), 'ev')).toBe(50);
    expect(amt(engine({ ...RENEW_1, fuel: 'phev' }, d), 'ev')).toBe(100);
  });
});
