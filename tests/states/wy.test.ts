import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/wy.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Wyoming', () => {
  it('new $35,000 car in Laramie County: 4% + 1%, $15 title, $30 state fee, county fee 3% of 60%', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1400); // 35,000 x 4%
    expect(amt(r, 'local-tax')).toBe(350); // 35,000 x 1%
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'reg')).toBe(30);
    expect(amt(r, 'county-fee')).toBe(630); // 35,000 x 60% x 3%
    expect(ids(r)).not.toContain('inspection');
    // 1,400 + 350 + 15 + 30 + 630 = 2,425
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2425);
  });
  it('county fee uses the MSRP when typed: 40,000 x 60% x 3% = 720', () => {
    expect(amt(engine({ ...NEW_CAR, msrp: 40000 }, d), 'county-fee')).toBe(720);
  });
  it('used private EV (2021, $18,000): sixth year of service = 15%, $100 decal', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(720);
    expect(amt(r, 'local-tax')).toBe(180);
    expect(amt(r, 'county-fee')).toBe(81); // 18,000 x 15% x 3%
    expect(amt(r, 'ev')).toBe(100);
    expect(amt(engine({ ...USED_EV, msrp: 45000 }, d), 'county-fee')).toBe(202.5); // 45,000 x 15% x 3%
    // 720 + 180 + 15 + 30 + 81 + 100 = 1,126
    expect(runCalc(USED_EV, d, engine).atPurchase).toBe(1126);
  });
  it('renewal one year later: second year of service = 50% -> 525 + 30', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(amt(r, 'county-fee')).toBe(525); // 35,000 x 50% x 3%
    expect(amt(r, 'reg')).toBe(30);
  });
  it('county rates: Teton 3% local, Park none', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'teton-county' }, d), 'local-tax')).toBe(1050);
    expect(ids(engine({ ...NEW_CAR, county: 'park-county' }, d))).not.toContain('local-tax');
  });
  it('$5 minimum county fee', () => {
    expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2000, price: 1000, msrp: 1000 }, d), 'county-fee')).toBe(5); // 1,000 x 15% x 3% = 4.50 -> 5
  });
  it('plug-in hybrid $50, hybrid nothing; trade-in and doc fee', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(50);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('ev');
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1000);
    expect(amt(runCalc({ ...NEW_CAR, docFee: 400 }, d, engine), 'sales-tax')).toBe(1416); // 35,400 x 4%
  });
});
