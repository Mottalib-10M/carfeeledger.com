import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ri.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Rhode Island', () => {
  it('new car: 7% = $2,450, $53.50 title, $8 plate, $40 DOT surcharge + $3.50, weight fee as range, no inspection', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(2450);
    expect(amt(r, 'title')).toBe(53.5);
    expect(amt(r, 'plate')).toBe(8);
    expect(amt(r, 'reg')).toBe(40);
    expect(amt(r, 'tech-surcharge')).toBe(3.5);
    expect(r.lines.find((l) => l.id === 'reg-weight')?.range).toEqual([60, 112]); // ($30 to $56) x 2 years
    expect(ids(r)).not.toContain('inspection'); // new: exempt 2 years
    // 2,450 + 53.5 + 8 + 40 + 3.5 = 2,555
    expect(r.atPurchase).toBe(2555);
  });
  it('used EV, private sale: $200 x 2 years = $400, safety inspection without a price', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1260); // 18,000 x 7%
    expect(amt(r, 'ev')).toBe(400);
    expect(ids(r)).toContain('inspection-ev');
    expect(ids(r)).not.toContain('inspection');
  });
  it('plug-in hybrid $100 a year, hybrid $50 a year (two-year term)', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(200);
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(100);
  });
  it('used gas car 2019: $55 two-year inspection', () => {
    expect(amt(engine({ ...NEW_CAR, condition: 'used', modelYear: 2019 }, d), 'inspection')).toBe(55);
  });
  it('trade-in deducted: (35,000 - 10,000) x 7% = $1,750', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1750);
  });
  it('renewal (2027, age 1): surcharge + tech fee + weight range, still inspection-exempt', () => {
    expect(ids(engine(RENEW_1, d))).toEqual(['reg', 'tech-surcharge', 'reg-weight']);
  });
});
