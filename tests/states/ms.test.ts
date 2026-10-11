import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ms.json';
import engine from '../../src/lib/engine/states/ms';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Mississippi', () => {
  it('new $35,000 car from a dealer: 5% tax, $9 title, $15 privilege tax, $14 first registration', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1750); // 35,000 x 5%
    expect(amt(r, 'title')).toBe(9);
    expect(amt(r, 'privilege')).toBe(15);
    expect(amt(r, 'reg')).toBe(14); // 5 tag + 4 trauma + 5 additional
    expect(amt(r, 'ad-valorem')).toBeNull();
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(1788); // 1,750 + 9 + 15 + 14
  });
  it('trade-in is deducted', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1250); }); // 25,000 x 5%
  it('used EV from a private seller (5 years old): tax on the DOR value, EV tax unpriced', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBeNull();
    expect(amt(r, 'ev')).toBeNull();
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(38); // 9 + 15 + 14
  });
  it('private sale of a car 10 years old or more is exempt', () => {
    expect(amt(engine({ ...USED_EV, fuel: 'gas', modelYear: 2016 }, d), 'sales-tax')).toBe(0);
  });
  it('renewal: $15 privilege tax + $12.75 decals, no title, no tax', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'privilege')).toBe(15);
    expect(amt(r, 'reg')).toBe(12.75); // 3.75 + 4 + 5
    expect(ids(r)).not.toContain('title');
    expect(ids(r)).not.toContain('sales-tax');
  });
  it('gas car pays no EV or hybrid tax', () => { expect(ids(engine(NEW_CAR, d))).not.toContain('ev'); });
});
