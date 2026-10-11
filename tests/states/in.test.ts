import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/in.json';
import engine from '../../src/lib/engine/states/in';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Indiana', () => {
  it('new car: 7% on price + taxable doc fee, $15 title, $21.35 + $15 TIIF, excise class 16 age 0 = $469', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(2468.32); // (35,000 + 261.72) x 7% = 2,468.3204
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'reg')).toBe(21.35);
    expect(amt(r, 'tiif')).toBe(15);
    expect(amt(r, 'excise')).toBe(469);
    expect(amt(r, 'doc-fee')).toBe(261.72);
    // 2,468.32 + 15 + 21.35 + 469 + 15 + 261.72 = 3,250.39
    expect(r.atPurchase).toBe(3250.39);
  });
  it('renewal one year later: excise class 16 age 1 = $407', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'excise')).toBe(407);
    expect(ids(r)).not.toContain('sales-tax');
  });
  it('used EV (2021, $18,000 used as retail price): class 12 age 5 = $114, EV fee $242', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'excise')).toBe(114);
    expect(amt(r, 'ev')).toBe(242);
    expect(amt(r, 'sales-tax')).toBe(1260); // 18,000 x 7%, private sale, no doc fee
  });
  it('MSRP typed is used for the class: $45,000 MSRP = class 17, $532 new', () => {
    expect(amt(engine({ ...NEW_CAR, msrp: 45000 }, d), 'excise')).toBe(532);
  });
  it('age 9 and more uses the last column: class 16 at age 12 = $49', () => {
    expect(amt(engine({ ...RENEW_1, modelYear: 2015 }, d), 'excise')).toBe(49);
  });
  it('hybrid $81; emissions test only in Lake and Porter after the four newest model years', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(81);
    expect(ids(engine({ ...NEW_CAR, county: 'lake-county' }, d))).not.toContain('emissions');
    expect(ids(engine({ ...RENEW_1, county: 'lake-county', modelYear: 2020 }, d))).toContain('emissions');
    expect(ids(engine({ ...RENEW_1, county: 'marion-county', modelYear: 2020 }, d))).not.toContain('emissions');
  });
  it('trade-in deducted: (35,000 - 10,000) x 7% = $1,750', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1750);
  });
});
