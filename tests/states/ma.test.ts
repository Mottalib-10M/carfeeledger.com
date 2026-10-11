import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ma.json';
import engine from '../../src/lib/engine/states/ma';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Massachusetts', () => {
  it('new car: 6.25% tax, $75 title, $60 two-year registration, $35 inspection, excise at 90% deferred', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2187.5); // 35,000 x 6.25%
    expect(amt(r, 'title')).toBe(75);
    expect(amt(r, 'reg')).toBe(60);
    expect(amt(r, 'inspection')).toBe(35);
    expect(amt(r, 'excise')).toBe(787.5); // 35,000 x 90% x $25/1,000
    expect(r.lines.find((l) => l.id === 'excise')?.deferred).toBe(true);
    const c = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(c.atPurchase).toBe(2357.5); // 2,187.50 + 75 + 60 + 35
    expect(c.firstYear).toBe(3145); // + 787.50 excise billed by the town
  });
  it('used 2021 EV bought privately: use tax on the price, excise at 10% (fifth year and after)', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1125); // 18,000 x 6.25%
    expect(amt(r, 'excise')).toBe(45); // 18,000 x 10% x 25/1,000
    expect(ids(r)).not.toContain('ev');
  });
  it('renewal one year later: excise at 60%, registration, inspection', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'excise')).toBe(525); // 35,000 x 60% x 25/1,000
    expect(amt(r, 'reg')).toBe(60);
    expect(amt(r, 'inspection')).toBe(35);
    expect(ids(r)).not.toContain('title');
  });
  it('trade-in credited on a dealer sale only', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1562.5); // 25,000 x 6.25%
    expect(amt(engine({ ...USED_EV, tradeIn: 10000 }, d), 'sales-tax')).toBe(1125);
  });
  it('doc fee taxed on a dealer sale', () => { expect(amt(engine({ ...NEW_CAR, docFee: 400 }, d), 'sales-tax')).toBe(2212.5); }); // 35,400 x 6.25%
  it('excise on the MSRP, 50% in the year before the model year', () => {
    expect(amt(engine({ ...NEW_CAR, msrp: 40000 }, d), 'excise')).toBe(900); // 40,000 x 90% x 25/1,000
    expect(amt(engine({ ...NEW_CAR, modelYear: 2027 }, d), 'excise')).toBe(437.5); // 35,000 x 50% x 25/1,000
  });
  it('excise minimum $5', () => { expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2012, price: 1000 }, d), 'excise')).toBe(5); }); // 2.50 -> 5
});
