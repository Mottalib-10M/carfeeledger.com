import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/nm.json';
import engine from '../../src/lib/engine/states/nm';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('New Mexico', () => {
  it('new $35,000 car, 3,500 lb, Bernalillo County', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1400); // 35,000 x 4% (NMSA 7-14-4)
    expect(amt(r, 'title')).toBe(3); // NMSA 66-6-19
    expect(amt(r, 'reg')).toBe(70); // over 3,000 lb, first five years (66-6-2 C, 2026 amendment)
    expect(amt(r, 'tire')).toBe(1.5);
    expect(amt(r, 'reg-addl')).toBe(2);
    expect(amt(r, 'beautification')).toBe(0.5);
    expect(amt(r, 'admin')).toBe(2);
    expect(ids(r)).not.toContain('air-care'); // new car exempt for 4 years
    expect(r.docFee).toBe(0); // no cap: nothing assumed
    expect(r.atPurchase).toBe(1479); // 1,400 + 3 + 70 + 1.50 + 2 + 0.50 + 2
  });
  it('used 2021 EV, 4,200 lb, private sale in 2026: reduced fee after five years, no EV fee before 2027', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(720); // 18,000 x 4%
    expect(amt(r, 'reg')).toBe(56.25); // over 3,000 lb after five years
    expect(ids(r)).not.toContain('ev');
    expect(ids(r)).not.toContain('air-care'); // fully electric cars are not tested
    expect(r.atPurchase).toBe(785.25); // 720 + 3 + 56.25 + 1.50 + 2 + 0.50 + 2
  });
  it('renewal one year later (2027): $70 + $6 of add-ons, no title, no tax', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(ids(r)).not.toContain('title');
    expect(amt(r, 'reg')).toBe(70);
    expect(r.lines.reduce((s, l) => s + (l.amount ?? 0), 0)).toBe(76);
  });
  it('EV and plug-in hybrid fee schedule from 2027', () => {
    expect(amt(engine({ ...RENEW_1, fuel: 'ev' }, d), 'ev')).toBe(70);
    expect(amt(engine({ ...RENEW_1, fuel: 'phev' }, d), 'ev')).toBe(35);
    expect(amt(engine({ ...RENEW_1, fuel: 'ev', year: 2028 }, d), 'ev')).toBe(80);
    expect(amt(engine({ ...RENEW_1, fuel: 'phev', year: 2030 }, d), 'ev')).toBe(45);
    expect(ids(engine({ ...RENEW_1, fuel: 'hybrid' }, d))).not.toContain('ev');
  });
  it('weight brackets', () => {
    expect(amt(engine({ ...NEW_CAR, weightLbs: 1900 }, d), 'reg')).toBe(33.75);
    expect(amt(engine({ ...NEW_CAR, weightLbs: 2600 }, d), 'reg')).toBe(48.75);
    expect(amt(engine({ ...NEW_CAR, weightLbs: 2600, modelYear: 2018 }, d), 'reg')).toBe(38.75);
    expect(amt(engine({ ...NEW_CAR, weightLbs: 1900, modelYear: 2018 }, d), 'reg')).toBe(26.25);
  });
  it('trade-in is deducted', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1000); });
  it('Air Care test for an older gas car in Bernalillo County only', () => {
    const old = { ...NEW_CAR, condition: 'used' as const, seller: 'private' as const, modelYear: 2018, price: 12000 };
    const r = engine(old, d);
    expect(r.lines.find((l) => l.id === 'air-care')?.amount).toBeNull();
    expect(ids(engine({ ...old, county: 'other' }, d))).not.toContain('air-care');
  });
});
