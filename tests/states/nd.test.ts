import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/nd.json';
import engine from '../../src/lib/engine/states/nd';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('North Dakota', () => {
  it('new $35,000 car, 3,500 lb: 5% excise, $5 title, $93 registration', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1750); // 35,000 x 5% (NDCC 57-40.3-02)
    expect(amt(r, 'title')).toBe(5); // NDCC 39-05-05
    expect(amt(r, 'reg')).toBe(93); // 3,200-4,499 lb, 1st-6th year (39-04-19, MVD-2 2026)
    expect(r.atPurchase).toBe(1848);
  });
  it('used 2021 EV, 4,200 lb, private: 6th year of registration, $120 road use fee', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(900); // 18,000 x 5%
    expect(amt(r, 'reg')).toBe(93); // 2021 = "Year First Registered 2021 and Newer" column in 2026
    expect(amt(r, 'ev')).toBe(120);
    expect(r.atPurchase).toBe(1118); // 900 + 5 + 93 + 120
  });
  it('renewal in 2027: registration only', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg']);
    expect(amt(r, 'reg')).toBe(93);
  });
  it('age columns and weight brackets', () => {
    expect(amt(engine({ ...NEW_CAR, modelYear: 2018 }, d), 'reg')).toBe(81); // 9th year
    expect(amt(engine({ ...NEW_CAR, modelYear: 2015 }, d), 'reg')).toBe(69); // 12th year
    expect(amt(engine({ ...NEW_CAR, modelYear: 2012 }, d), 'reg')).toBe(57); // 15th year
    expect(amt(engine({ ...NEW_CAR, weightLbs: 3000 }, d), 'reg')).toBe(73);
    expect(amt(engine({ ...NEW_CAR, weightLbs: 5200 }, d), 'reg')).toBe(142);
  });
  it('trade-in credit and plug-in hybrid fee', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1250);
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(50);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('ev');
  });
});
