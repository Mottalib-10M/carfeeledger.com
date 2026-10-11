import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/nh.json';
import engine from '../../src/lib/engine/states/nh';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('New Hampshire', () => {
  it('new $35,000 car in Manchester: no sales tax, 18 mills permit, $48 state fee, $35 title, $8 plates, city fees', () => {
    const r = engine(NEW_CAR, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(amt(r, 'permit')).toBe(630); // 35,000 x 18 / 1,000
    expect(amt(r, 'reg')).toBe(48); // 3,500 lb: 3,001-5,000 band
    expect(amt(r, 'title')).toBe(35);
    expect(amt(r, 'plate')).toBe(8);
    expect(ids(r)).not.toContain('data');
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(738); // 630 + 48 + 35 + 8 + 2 title app + 15 city fees
  });
  it('renewal one year later: 15 mills, renewal data fee', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'permit')).toBe(525);
    expect(amt(r, 'data')).toBe(1);
    expect(ids(r)).not.toContain('title-app');
  });
  it('used 2021 EV: 3 mills from the fifth preceding year, $100 surcharge', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'permit')).toBe(54); // 18,000 x 3 / 1,000
    expect(amt(r, 'ev')).toBe(100);
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(262);
  });
  it('weight bands 2026', () => {
    expect(amt(engine({ ...NEW_CAR, weightLbs: 2900 }, d), 'reg')).toBe(42);
    expect(amt(engine({ ...NEW_CAR, weightLbs: 5200 }, d), 'reg')).toBe(66);
  });
  it('other town: local fees unpriced; PHEV $50', () => {
    const r = engine({ ...NEW_CAR, county: 'other', fuel: 'phev' }, d);
    expect(amt(r, 'town-fees')).toBeNull();
    expect(amt(r, 'ev')).toBe(50);
  });
});
