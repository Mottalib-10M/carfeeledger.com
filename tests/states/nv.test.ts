import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/nv.json';
import engine from '../../src/lib/engine/states/nv';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Nevada', () => {
  it('new $35,000 car in Clark County: 8.375% tax, $28.25 title, $33, GST 4% + 1% of 35% of MSRP', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2931.25); // 35,000 x 8.375%
    expect(amt(r, 'title')).toBe(28.25);
    expect(amt(r, 'reg')).toBe(33);
    expect(amt(r, 'gst')).toBe(490); // 35,000 x 35% x 100% x 4%
    expect(amt(r, 'sgst')).toBe(122.5); // 12,250 x 1%
    expect(amt(r, 'plate')).toBeNull();
    expect(ids(r)).not.toContain('smog');
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(3605);
  });
  it('trade-in deducted, doc fee taxed', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000, docFee: 400 }, d), 'sales-tax')).toBe(2127.25); }); // 25,400 x 8.375%
  it('used EV from a private seller: no sales tax, GST at 55%', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(0);
    expect(amt(r, 'gst')).toBe(138.6); // 18,000 x 35% x 55% x 4%
    expect(amt(r, 'sgst')).toBe(34.65);
    expect(ids(r)).not.toContain('smog');
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(234.5); // 28.25 + 33 + 138.60 + 34.65
  });
  it('renewal one year later: 95%', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'gst')).toBe(465.5); // 12,250 x 95% x 4%
    expect(ids(r)).not.toContain('title');
  });
  it('Washoe: 8.265%, no supplemental tax; smog from age 3', () => {
    const r = engine({ ...NEW_CAR, county: 'washoe-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(2892.75);
    expect(ids(r)).not.toContain('sgst');
    expect(ids(engine({ ...RENEW_1, county: 'washoe-county', year: 2029 }, d))).toContain('smog');
  });
  it('minimum GST $16 and 15% floor', () => { expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2005, price: 2000, county: 'esmeralda-county' }, d), 'gst')).toBe(16); });
});
