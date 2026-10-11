import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/mi.json';
import engine, { listTax, miRound } from '../../src/lib/engine/states/mi';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const reg = (d.params as { reg: Parameters<typeof listTax>[0] }).reg;
describe('Michigan', () => {
  it('list-price schedule of MCL 257.801(1)(p)', () => {
    expect(listTax(reg, 6000)).toBe(36);
    expect(listTax(reg, 6500)).toBe(40);
    expect(listTax(reg, 30000)).toBe(178);
    expect(listTax(reg, 30001)).toBe(184); // fraction of $1,000 above $30,000
    expect(listTax(reg, 35000)).toBe(208); // 178 + 5 x 6
  });
  it('rounding rule of MCL 257.801(1)(r)', () => { expect(miRound(187.5)).toBe(187); expect(miRound(187.51)).toBe(188); });
  it('new $35,000 car: 6% on price + $280 doc fee, $15 title, $208 plate tax + $8', () => {
    const c = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(c, 'sales-tax')).toBe(2116.8); // (35,000 + 280) x 6%
    expect(amt(c, 'title')).toBe(15);
    expect(amt(c, 'reg')).toBe(208);
    expect(amt(c, 'reg-addon')).toBe(8); // $2.25 + $5.75
    expect(amt(c, 'doc-fee')).toBe(280);
    expect(c.atPurchase).toBe(2627.8); // 2,116.80 + 15 + 208 + 8 + 280
  });
  it('used 2021 EV bought privately: use tax on the price, plate tax at 72.9%, EV fee $267', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1080); // 18,000 x 6%
    expect(amt(r, 'reg')).toBe(77); // 106 x 72.9% = 77.27 -> 77
    expect(amt(r, 'ev')).toBe(267);
  });
  it('renewal one year later: 90% of the first-year tax', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'reg')).toBe(187); // 208 x 90% = 187.20 -> 187
    expect(amt(r, 'reg-addon')).toBe(8);
    expect(ids(r)).not.toContain('sales-tax');
  });
  it('trade-in credit capped at $12,000 in 2026', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 15000 }, d), 'sales-tax')).toBe(1380); }); // (35,000 - 12,000) x 6%
  it('no trade-in credit on a private sale', () => { expect(amt(engine({ ...USED_EV, tradeIn: 5000 }, d), 'sales-tax')).toBe(1080); });
  it('plug-in hybrid $113; EV fee unknown after 2026', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(113);
    expect(amt(engine({ ...RENEW_1, fuel: 'ev' }, d), 'ev')).toBeNull();
  });
  it('plate tax on the MSRP when typed', () => { expect(amt(engine({ ...NEW_CAR, msrp: 41200 }, d), 'reg')).toBe(250); }); // 178 + 12 x 6
});
describe('Michigan add-ons expiry', () => {
  it('no $8 add-on after 2027; fourth registration at 72.9%', () => {
    const r = engine({ ...RENEW_1, year: 2029 }, d);
    expect(ids(r)).not.toContain('reg-addon');
    expect(amt(r, 'reg')).toBe(152); // 208 x 0.729 = 151.63 -> 152
  });
});
