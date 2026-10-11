import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/sd.json';
import engine from '../../src/lib/engine/states/sd';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('South Dakota', () => {
  it('new $35,000 car, 3,500 lb, Minnehaha County: 4% excise, $10 title, $72 license fee, $16 wheel tax', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1400); // 35,000 x 4%
    expect(amt(r, 'title')).toBe(10);
    expect(amt(r, 'reg')).toBe(72); // 2,001-4,000 lb
    expect(amt(r, 'hp-fee')).toBe(1);
    expect(amt(r, 'solid-waste')).toBe(1);
    expect(amt(r, 'tech-fee')).toBe(2);
    expect(amt(r, 'county-fee')).toBe(16); // $4 x 4 wheels, under the $60 maximum
    expect(ids(r)).not.toContain('doc-fee'); // no cap, default 0
    expect(r.atPurchase).toBe(1502); // 1,400 + 10 + 72 + 1 + 1 + 2 + 16
  });
  it('used EV bought privately, 4,200 lb: excise on the price, $108 license fee, $100 EV fee', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(720); // 18,000 x 4%
    expect(amt(r, 'reg')).toBe(108); // 4,001-6,000 lb
    expect(amt(r, 'ev')).toBe(100);
    expect(r.atPurchase).toBe(958); // 720 + 10 + 108 + 4 + 16 + 100
  });
  it('renewal one year later: $72 + $4 state fees + $16 wheel tax = $92', () => {
    expect(ids(engine(RENEW_1, d))).not.toContain('sales-tax');
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(92);
  });
  it('trade-in deducted, including on a private sale', () => {
    expect(amt(engine({ ...USED_EV, tradeIn: 5000 }, d), 'sales-tax')).toBe(520); // (18,000 - 5,000) x 4%
  });
  it('car ten years old: license fee at 70%; eleven years old and $2,500 or less: no excise tax', () => {
    expect(amt(engine({ ...RENEW_1, modelYear: 2017 }, d), 'reg')).toBe(50.4); // 72 x 70%
    expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2015, price: 2500 }, d), 'sales-tax')).toBe(0);
    expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2015, price: 2600 }, d), 'sales-tax')).toBe(104);
  });
  it('wheel tax: county maximum applies, zero in Harding County', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'beadle-county' }, d), 'county-fee')).toBe(8); // $2 x 4 = 8, max $8
    expect(amt(engine({ ...NEW_CAR, county: 'pennington-county' }, d), 'county-fee')).toBe(20);
    expect(amt(engine({ ...NEW_CAR, county: 'harding-county' }, d), 'county-fee')).toBe(0);
  });
});
