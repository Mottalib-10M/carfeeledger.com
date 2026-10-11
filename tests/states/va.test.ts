import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/va.json';
import engine from '../../src/lib/engine/generic';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Virginia', () => {
  it('new car in Fairfax County: 4.15%, title $15, $30.75, $2 emissions fee, HUF range', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1452.5); // 35,000 x 4.15%
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'reg')).toBe(30.75);
    expect(amt(r, 'emissions-fee')).toBe(2);
    expect(r.lines.find((l) => l.id === 'huf')?.range).toEqual([0, 135.63]);
  });
  it('used EV: HUF $135.63, no mpg-based range', () => {
    const r = engine({ ...USED_EV, county: 'other' }, d);
    expect(amt(r, 'ev')).toBe(135.63);
    expect(ids(r)).not.toContain('huf');
    expect(amt(r, 'reg')).toBe(35.75); // 4,200 lb
  });
  it('minimum tax $75', () => { expect(amt(engine({ ...NEW_CAR, price: 1000 }, d), 'sales-tax')).toBe(75); });
  it('no trade-in credit', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1452.5); });
  it('renewal outside Northern Virginia: no emissions fee', () => { expect(ids(engine({ ...RENEW_1, county: 'other' }, d))).not.toContain('emissions-fee'); });
});
