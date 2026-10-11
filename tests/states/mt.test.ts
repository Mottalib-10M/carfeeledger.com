import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/mt.json';
import engine from '../../src/lib/engine/states/mt';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Montana', () => {
  it('new $35,000 car in Yellowstone County: age fee $217, add-ons, 3% admin, 0.5% option tax on 90% of MSRP', () => {
    const r = engine(NEW_CAR, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(amt(r, 'reg')).toBe(217);
    expect(amt(r, 'title')).toBe(12);
    expect(amt(r, 'plate')).toBe(12);
    expect(amt(r, 'admin')).toBe(7.83); // 3% x (12 + 12 + 217 + 10 + 9 + 1 = 261)
    expect(amt(r, 'option-tax')).toBe(157.5); // 35,000 x 90% x 0.5%
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(426.33); // 261 + 7.83 + 157.50
  });
  it('used 2021 EV (4,200 lb, private): $87 fee, $130 EV fee, option tax on 41%', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'reg')).toBe(87);
    expect(amt(r, 'ev')).toBe(130);
    expect(amt(r, 'admin')).toBe(7.83); // 3% x (12 + 12 + 87 + 10 + 9 + 1 + 130 = 261)
    expect(amt(r, 'option-tax')).toBe(36.9); // 18,000 x 41% x 0.5%
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(305.73);
  });
  it('renewal one year later: 80% value, no title or plates', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'option-tax')).toBe(140); // 35,000 x 80% x 0.5%
    expect(amt(r, 'admin')).toBe(7.11); // 3% x 237
    expect(ids(r)).not.toContain('title');
  });
  it('other county: option tax as a range up to 0.7%', () => {
    const l = engine({ ...NEW_CAR, county: 'other' }, d).lines.find((x) => x.id === 'option-tax')!;
    expect(l.amount).toBeNull();
    expect(l.range).toEqual([0, 220.5]); // 31,500 x 0.7%
  });
  it('luxury fee above $150,000 MSRP', () => { expect(amt(engine({ ...NEW_CAR, msrp: 160000, price: 160000 }, d), 'luxury')).toBe(825); });
  it('11-year-old car: $28 and a permanent registration note; $500 minimum value', () => {
    const r = engine({ ...NEW_CAR, condition: 'used', modelYear: 2015, price: 3000 }, d);
    expect(amt(r, 'reg')).toBe(28);
    expect(amt(r, 'option-tax')).toBe(2.5); // max(500, 3,000 x 12%) x 0.5%
    expect(r.notes.join(' ')).toMatch(/permanently/);
  });
  it('class 2 EV (6,000 lb or more) pays $190', () => { expect(amt(engine({ ...USED_EV, weightLbs: 6100 }, d), 'ev')).toBe(190); });
});
