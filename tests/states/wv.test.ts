import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/wv.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('West Virginia', () => {
  it('new $35,000 car: 6% tax, $15 title, $51.50 plate, inspection $0-$19 range, property tax unpriced', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2100); // 35,000 x 6%
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'reg')).toBe(51.5);
    const insp = r.lines.find((l) => l.id === 'inspection')!;
    expect(insp.amount).toBeNull();
    expect(insp.range).toEqual([0, 19]);
    expect(insp.years).toBe(2);
    expect(amt(r, 'ppt')).toBeNull();
    // 2,100 + 15 + 51.50 = 2,166.50 (no doc fee by default: no published cap)
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2166.5);
  });
  it('used private EV (2021, $18,000): 6% on the price, +$200 alternative fuel fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1080); // 18,000 x 6%
    expect(amt(r, 'ev')).toBe(200);
    // 1,080 + 15 + 51.50 + 200 = 1,346.50
    expect(runCalc(USED_EV, d, engine).atPurchase).toBe(1346.5);
  });
  it('renewal: $51.50 only priced line, no tax or title', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(ids(r)).not.toContain('title');
    expect(amt(r, 'reg')).toBe(51.5);
  });
  it('trade-in titled in WV is deducted: (35,000 - 10,000) x 6% = 1,500', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1500);
  });
  it('net price of $500 or less: flat $30', () => {
    expect(amt(engine({ ...NEW_CAR, price: 400 }, d), 'sales-tax')).toBe(30);
  });
  it('hybrid and plug-in hybrid: +$100 a year', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(100);
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(100);
    expect(ids(engine(NEW_CAR, d))).not.toContain('ev');
  });
  it('doc fee is not taxed', () => {
    expect(amt(runCalc({ ...NEW_CAR, docFee: 500 }, d, engine), 'sales-tax')).toBe(2100);
  });
});
