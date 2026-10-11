import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/hi.json';
import engine from '../../src/lib/engine/states/hi';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Hawaii', () => {
  it('new 3,500 lb car from an Oahu dealer', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'get')).toBe(1649.2); // 35,000 x 4.712%
    expect(amt(r, 'plate')).toBe(5);
    expect(amt(r, 'state-reg')).toBe(46);
    expect(amt(r, 'state-weight')).toBe(61.25); // 3,500 x 1.75 cents
    expect(amt(r, 'county-reg')).toBe(20);
    expect(amt(r, 'county-weight')).toBe(245); // 3,500 x 7 cents
    expect(amt(r, 'beautification')).toBe(10);
    expect(amt(r, 'emblem')).toBe(0.5);
    expect(amt(r, 'inspection')).toBe(25.75);
    expect(r.lines.find((l) => l.id === 'inspection')?.years).toBe(2);
    // 1,649.20 + 5 + 46 + 61.25 + 20 + 245 + 10 + 0.50 + 25.75 = 2,062.70
    expect(runCalc({ ...NEW_CAR, docFee: 0 }, d, engine).atPurchase).toBe(2062.7);
  });
  it('Honolulu example of the city: 3,320 lb car costs $367 a year (inspection aside)', () => {
    const r = engine({ ...RENEW_1, weightLbs: 3320 }, d);
    const sum = r.lines.filter((l) => l.kind !== 'inspection').reduce((s, l) => s + (l.amount ?? 0), 0);
    expect(Math.round(sum * 100) / 100).toBe(367); // 46 + 20 + 58.10 + 232.40 + 10 + 0.50
  });
  it('used 2021 EV bought privately: $10 transfer now, registration at the next expiration, no RUC at purchase', () => {
    const r = runCalc(USED_EV, d, engine);
    expect(ids(r)).not.toContain('get');
    expect(ids(r)).not.toContain('ev');
    expect(amt(r, 'state-weight')).toBe(84); // 4,200 x 2 cents
    expect(amt(r, 'county-weight')).toBe(294); // 4,200 x 7 cents
    expect(r.atPurchase).toBe(10);
    // 10 + 46 + 84 + 20 + 294 + 10 + 0.50 + 25.75
    expect(r.firstYear).toBe(490.25);
  });
  it('renewal one year later: $382.75, no inspection in the second year', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('inspection');
    expect(Math.round(r.lines.reduce((s, l) => s + (l.amount ?? 0), 0) * 100) / 100).toBe(382.75);
  });
  it('electric car renewal pays the $50 road usage charge', () => {
    expect(amt(engine({ ...RENEW_1, fuel: 'ev', weightLbs: 4200 }, d), 'ev')).toBe(50);
  });
  it('other counties: county part unpriced, state part computed', () => {
    const r = engine({ ...NEW_CAR, county: 'maui-county' }, d);
    expect(r.lines.find((l) => l.id === 'county-fees')?.amount).toBeNull();
    expect(amt(r, 'state-weight')).toBe(61.25);
    expect(ids(r)).not.toContain('county-weight');
  });
  it('GET on the doc fee, trade-in not deducted; 2012 car yearly inspection', () => {
    expect(amt(engine({ ...NEW_CAR, docFee: 500, tradeIn: 10000 }, d), 'get')).toBe(1672.76); // 35,500 x 4.712%
    expect(amt(engine({ ...RENEW_1, modelYear: 2012 }, d), 'inspection')).toBe(25.75);
  });
});
