import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/mn.json';
import engine from '../../src/lib/engine/states/mn';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Minnesota', () => {
  it('new $35,000 car in Hennepin County', () => {
    const c = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(c, 'sales-tax')).toBe(2430.31); // (35,000 + 350 doc fee) x 6.875% = 2,430.3125
    expect(amt(c, 'title')).toBe(8.25);
    expect(amt(c, 'title-tech')).toBe(2.25);
    expect(amt(c, 'psv')).toBe(3.5);
    expect(amt(c, 'filing')).toBe(12);
    expect(amt(c, 'plates')).toBe(15.5);
    expect(amt(c, 'reg')).toBe(561.25); // 10 + 1.575% x 35,000
    expect(amt(c, 'wheelage')).toBe(20); // Hennepin
    expect(amt(c, 'doc-fee')).toBe(350);
    expect(ids(c)).not.toContain('transfer-tax');
    expect(c.atPurchase).toBe(3403.06); // 2,430.31 + 8.25 + 2.25 + 3.50 + 12 + 15.50 + 561.25 + 20 + 350
  });
  it('used 2021 EV bought privately: 6.875% on the price, $10 transfer tax, registration and EV surcharge at the next renewal', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1237.5); // 18,000 x 6.875%
    expect(amt(r, 'transfer-tax')).toBe(10);
    expect(ids(r)).not.toContain('plates');
    expect(amt(r, 'reg')).toBe(180.1); // 10 + 1.575% x 18,000 x 60% (sixth year)
    expect(amt(r, 'ev')).toBe(150); // 0.5% x 18,000 x 60% = 54 < $150 minimum
    expect(r.lines.find((l) => l.id === 'reg')?.deferred).toBe(true);
  });
  it('renewal one year later: 95% of the MSRP, $8 filing, $2.25 technology surcharge, wheelage', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'reg')).toBe(533.69); // 10 + 1.575% x 35,000 x 95% = 533.6875
    expect(amt(r, 'renewal-filing')).toBe(8);
    expect(amt(r, 'renewal-tech')).toBe(2.25);
    expect(amt(r, 'wheelage')).toBe(20);
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(563.94);
  });
  it('new EV: 0.5% of the MSRP when above the $150 minimum', () => { expect(amt(engine({ ...NEW_CAR, fuel: 'ev' }, d), 'ev')).toBe(175); }); // 35,000 x 0.5%
  it('plug-in hybrid: $75 minimum in 2026', () => { expect(amt(engine({ ...NEW_CAR, fuel: 'phev', price: 25000 }, d), 'ev')).toBe(75); }); // 62.50 < 75
  it('EV renewal in 2027 with a low MSRP: range $100 to $150 (minimum changes July 1, 2027)', () => {
    const r = engine({ ...RENEW_1, fuel: 'ev', price: 20000 }, d);
    expect(amt(r, 'ev')).toBeNull();
    expect(r.lines.find((l) => l.id === 'ev')?.range).toEqual([100, 150]);
  });
  it('trade-in deducted', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1718.75); }); // 25,000 x 6.875%
  it('older car under $3,000: $10 in lieu tax; 11th year: $30 registration', () => {
    const r = engine({ ...USED_EV, fuel: 'gas', modelYear: 2015, price: 2500 }, d);
    expect(amt(r, 'sales-tax')).toBe(10);
    expect(amt(r, 'reg')).toBe(30); // 10 + 20
  });
  it('Dakota County wheelage $10 in 2026, $20 from 2027', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'dakota-county' }, d), 'wheelage')).toBe(10);
    expect(amt(engine({ ...RENEW_1, county: 'dakota-county' }, d), 'wheelage')).toBe(20);
    expect(ids(engine({ ...NEW_CAR, county: 'anoka-county' }, d))).not.toContain('wheelage');
  });
});
