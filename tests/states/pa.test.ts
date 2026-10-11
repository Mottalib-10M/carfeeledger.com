import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/pa.json';
import engine from '../../src/lib/engine/generic';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Pennsylvania', () => {
  it('new car in Philadelphia: 6% + 2%, $72 title, $48 plate, $5 county fee', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2100); // 35,000 x 6%
    expect(amt(r, 'local-tax')).toBe(700); // 35,000 x 2%
    expect(amt(r, 'title')).toBe(72);
    expect(amt(r, 'reg')).toBe(48);
    expect(amt(r, 'county-fee')).toBe(5);
  });
  it('used EV private sale, other county: road user charge $250, no local tax', () => {
    const r = engine({ ...USED_EV, county: 'other' }, d);
    expect(amt(r, 'sales-tax')).toBe(1080);
    expect(amt(r, 'ev')).toBe(250);
    expect(ids(r)).not.toContain('local-tax');
  });
  it('PHEV pays $63', () => { expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(63); });
  it('renewal keeps plate, county fee and the inspection line', () => {
    expect(ids(engine(RENEW_1, d))).toEqual(['reg', 'county-fee', 'safety']);
  });
  it('Allegheny 1% and trade-in deducted', () => {
    const r = engine({ ...NEW_CAR, county: 'allegheny-county', tradeIn: 5000 }, d);
    expect(amt(r, 'sales-tax')).toBe(1800); // 30,000 x 6%
    expect(amt(r, 'local-tax')).toBe(300);
  });
});
