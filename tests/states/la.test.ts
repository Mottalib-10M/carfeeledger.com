import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/la.json';
import engine, { laPlate } from '../../src/lib/engine/states/la';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const p = d.params as Parameters<typeof laPlate>[0];
describe('Louisiana', () => {
  it('new car in East Baton Rouge Parish: 5% + 5.5%, $68.50 title, $8 handling, $70 plate, $18 inspection', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1750); // 35,000 x 5%
    expect(amt(r, 'local-tax')).toBe(1925); // 35,000 x 5.5%
    expect(amt(r, 'title')).toBe(68.5);
    expect(amt(r, 'handling')).toBe(8);
    expect(r.lines.find((l) => l.id === 'local-fee')?.range).toEqual([0, 6]);
    expect(amt(r, 'reg')).toBe(70); // (10 + 25) x 2 years
    expect(amt(r, 'inspection')).toBe(18); // $10 + $8 emissions parish
    // + $436 capped doc fee, not taxed
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(4275.5);
  });
  it('used EV from a private seller: tax due, $36 plate, $220 road usage fee, $10 inspection', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(900); // 18,000 x 5%
    expect(amt(r, 'local-tax')).toBe(990); // 18,000 x 5.5%
    expect(amt(r, 'reg')).toBe(36); // (10 + 8) x 2
    expect(amt(r, 'ev')).toBe(220); // 110 x 2 years
    expect(amt(r, 'inspection')).toBe(10); // no emissions test on an EV
  });
  it('renewal in 2027: same plate tax, emissions parish keeps the $18 inspection', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'inspection']);
    expect(amt(r, 'reg')).toBe(70);
    expect(amt(r, 'inspection')).toBe(18);
    const o = engine({ ...RENEW_1, county: 'orleans-parish' }, d);
    expect(amt(o, 'inspection')).toBeNull(); // sticker replaced by the identification program
    expect(o.lines.find((l) => l.id === 'inspection')?.range).toEqual([0, 6]);
  });
  it('plate tax rounding at $500 and $20 minimum', () => {
    expect(laPlate(p, 8000)).toBe(20);
    expect(laPlate(p, 10499)).toBe(20);
    expect(laPlate(p, 10500)).toBe(22);
    expect(laPlate(p, 40500)).toBe(82);
  });
  it('trade-in deducted; trucks shown as a range; hybrid fee', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1250);
    const t = engine({ ...NEW_CAR, body: 'truck', weightLbs: 5200, fuel: 'hybrid' }, d);
    expect(amt(t, 'reg')).toBeNull();
    expect(t.lines.find((l) => l.id === 'reg')?.range).toEqual([40, 112]);
    expect(amt(t, 'ev')).toBe(240); // 60 x 4 years
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev', county: 'orleans-parish' }, d), 'ev')).toBe(120);
    expect(amt(engine({ ...NEW_CAR, county: 'orleans-parish' }, d), 'inspection')).toBe(10);
  });
});
