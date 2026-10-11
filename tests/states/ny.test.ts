import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ny.json';
import engine from '../../src/lib/engine/states/ny';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('New York', () => {
  it('new 3,500 lb car in New York City', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(3106.25); // 35,000 x 8.875%
    expect(amt(r, 'reg')).toBe(56.5); // 3,451-3,550 lb bracket, two years
    expect(amt(r, 'use-tax')).toBe(30);
    expect(amt(r, 'mctd')).toBe(50);
    expect(amt(r, 'plate')).toBe(25);
    expect(amt(r, 'title')).toBe(50);
    expect(amt(r, 'inspection')).toBe(10); // under two model years: safety only
  });
  it('used EV in Suffolk: heavy use tax $60, EV no emissions test', () => {
    const r = engine({ ...USED_EV, county: 'suffolk-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(1575); // 18,000 x 8.75%
    expect(amt(r, 'reg')).toBe(73.5); // 4,151-4,250
    expect(amt(r, 'use-tax')).toBe(60);
    expect(amt(r, 'inspection')).toBe(10);
  });
  it('upstate Monroe renewal of a 2019 car: no MCTD, $5/yr use tax, $21 inspection', () => {
    const r = engine({ ...RENEW_1, modelYear: 2019, county: 'monroe-county', weightLbs: 3000 }, d);
    expect(ids(r)).not.toContain('mctd');
    expect(amt(r, 'use-tax')).toBe(10);
    expect(amt(r, 'inspection')).toBe(21);
    expect(amt(r, 'reg')).toBe(48.5);
  });
  it('Saratoga has no county use tax and 7% sales tax', () => {
    const r = engine({ ...NEW_CAR, county: 'saratoga-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(2450);
    expect(ids(r)).not.toContain('use-tax');
  });
  it('bracket edges and EV minimum', () => {
    expect(amt(engine({ ...RENEW_1, weightLbs: 1650 }, d), 'reg')).toBe(26);
    expect(amt(engine({ ...RENEW_1, weightLbs: 1650, fuel: 'ev' }, d), 'reg')).toBe(32.5);
    expect(amt(engine({ ...RENEW_1, weightLbs: 7000 }, d), 'reg')).toBe(140);
  });
});
