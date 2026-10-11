import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ga.json';
import engine from '../../src/lib/engine/generic';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Georgia', () => {
  it('new car: TAVT 7%, title $18, plate $20, no emissions test (newest model years)', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2450); // 35,000 x 7%
    expect(amt(r, 'title')).toBe(18);
    expect(amt(r, 'reg')).toBe(20);
    expect(ids(r)).not.toContain('emissions');
  });
  it('used EV private sale: AFV fee $238.59, no emissions', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1260);
    expect(amt(r, 'ev')).toBe(238.59);
    expect(ids(r)).not.toContain('emissions');
  });
  it('renewal: $20', () => { expect(ids(engine(RENEW_1, d))).toEqual(['reg']); });
  it('dealer trade-in reduces TAVT', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 5000 }, d), 'sales-tax')).toBe(2100); });
  it('2023 model renewed in Cobb needs the emissions test; outside the area it does not', () => {
    expect(ids(engine({ ...RENEW_1, modelYear: 2023, year: 2026, county: 'cobb-county' }, d))).toContain('emissions');
    expect(ids(engine({ ...RENEW_1, modelYear: 2024, year: 2026, county: 'cobb-county' }, d))).not.toContain('emissions');
    expect(ids(engine({ ...RENEW_1, modelYear: 2023, year: 2026, county: 'other' }, d))).not.toContain('emissions');
  });
});
