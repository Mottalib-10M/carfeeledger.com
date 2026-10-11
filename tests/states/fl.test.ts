import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/fl.json';
import engine from '../../src/lib/engine/generic';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Florida', () => {
  it('new $35,000 car, Miami-Dade: 6% + 1% surtax on the first $5,000, $225 initial fee', () => {
    const r = engine({ ...NEW_CAR, docFee: 999 }, d);
    expect(amt(r, 'sales-tax')).toBe(2159.94); // (35,000 + 999) x 6%
    expect(amt(r, 'local-tax')).toBe(50); // 5,000 x 1%
    expect(amt(r, 'initial-reg')).toBe(225);
    expect(amt(r, 'title')).toBe(75.75);
    expect(amt(r, 'reg')).toBe(46.1); // 3,500 lb and up
  });
  it('used EV private sale, Collier (no surtax): no EV fee', () => {
    const r = engine({ ...USED_EV, county: 'collier-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(1080);
    expect(ids(r)).not.toContain('local-tax');
    expect(ids(r)).not.toContain('ev');
  });
  it('renewal: weight fee only', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg']);
  });
  it('trade-in deducted; Hamilton 2% surtax capped by the $5,000 limit', () => {
    const r = engine({ ...NEW_CAR, tradeIn: 32000, county: 'hamilton-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(180); // 3,000 x 6%
    expect(amt(r, 'local-tax')).toBe(60); // 3,000 x 2% (below 5,000)
  });
  it('weight edges', () => {
    expect(amt(engine({ ...RENEW_1, weightLbs: 2499 }, d), 'reg')).toBe(28.1);
    expect(amt(engine({ ...RENEW_1, weightLbs: 2500 }, d), 'reg')).toBe(36.1);
    expect(amt(engine({ ...RENEW_1, weightLbs: 3000, body: 'truck' }, d), 'reg')).toBe(36.1);
  });
});
