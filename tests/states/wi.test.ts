import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/wi.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Wisconsin', () => {
  it('new $35,000 car in Milwaukee County (outside the city): 5% + 0.9%, $214.50 title, $12 plates, $85, $30 wheel tax', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1750); // 35,000 x 5%
    expect(amt(r, 'local-tax')).toBe(315); // 35,000 x 0.9%
    expect(amt(r, 'title')).toBe(214.5);
    expect(amt(r, 'plate-issuance')).toBe(12); // $6 x 2 plates
    expect(amt(r, 'reg')).toBe(85);
    expect(amt(r, 'county-fee')).toBe(30); // Milwaukee County wheel tax
    expect(ids(r)).not.toContain('emissions'); // 2026 model: first tested at 4 model years
    // 1,750 + 315 + 214.50 + 12 + 85 + 30 = 2,406.50
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2406.5);
  });
  it('used private EV (2021, $18,000): taxed like a dealer sale, $175 EV surcharge, no emissions test', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(900);
    expect(amt(r, 'local-tax')).toBe(162); // 18,000 x 0.9%
    expect(amt(r, 'ev')).toBe(175);
    expect(ids(r)).not.toContain('emissions');
    // 900 + 162 + 214.50 + 12 + 85 + 30 + 175 = 1,578.50
    expect(runCalc(USED_EV, d, engine).atPurchase).toBe(1578.5);
  });
  it('renewal: $85 + $30 wheel tax', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('title');
    expect(ids(r)).not.toContain('plate-issuance');
    expect(amt(r, 'reg')).toBe(85);
    expect(amt(r, 'county-fee')).toBe(30);
  });
  it('city of Milwaukee: 0.9% county + 2% city = 2.9%, wheel tax $30 + $41', () => {
    const r = engine({ ...NEW_CAR, county: 'city-of-milwaukee' }, d);
    expect(amt(r, 'local-tax')).toBe(1015); // 35,000 x 2.9%
    expect(amt(r, 'county-fee')).toBe(71);
  });
  it('Waukesha County: no county tax, no wheel tax; a 2019 gas car needs the emissions test', () => {
    const r = engine({ ...NEW_CAR, county: 'waukesha-county', condition: 'used', modelYear: 2019, price: 15000 }, d);
    expect(ids(r)).not.toContain('local-tax');
    expect(ids(r)).not.toContain('county-fee');
    expect(amt(r, 'emissions')).toBeNull();
  });
  it('outside the 7 counties: no emissions line', () => {
    expect(ids(engine({ ...NEW_CAR, county: 'dane-county', modelYear: 2015 }, d))).not.toContain('emissions');
  });
  it('trade-in deducted; service fee taxed', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1250);
    expect(amt(runCalc({ ...NEW_CAR, docFee: 300 }, d, engine), 'sales-tax')).toBe(1765); // 35,300 x 5%
  });
  it('hybrid and plug-in hybrid: $75', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(75);
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(75);
  });
});
