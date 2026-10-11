import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/sc.json';
import engine from '../../src/lib/engine/generic';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('South Carolina', () => {
  it('new $35,000 car: IMF capped at $500, $15 title, $40 biennial registration, $225 closing fee reference', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(500); // 35,000 x 5% = 1,750, capped at 500
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'reg')).toBe(40);
    expect(amt(r, 'doc-fee')).toBe(225);
    expect(r.lines.find((l) => l.id === 'property-tax')?.amount).toBeNull();
    expect(r.atPurchase).toBe(780); // 500 + 15 + 40 + 225
  });
  it('used EV bought privately: IMF $500, $120 biennial road use fee', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(500); // 18,000 x 5% = 900, capped
    expect(amt(r, 'ev')).toBe(120); // $60 a year x 2-year cycle
    expect(r.atPurchase).toBe(675); // 500 + 15 + 40 + 120
  });
  it('below the cap: 5% of the price minus the trade-in', () => {
    expect(amt(engine({ ...NEW_CAR, price: 9000, tradeIn: 2000 }, d), 'sales-tax')).toBe(350); // (9,000 - 2,000) x 5%
  });
  it('hybrid pays a $60 biennial road use fee', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(60);
  });
  it('renewal: $40 every two years = $20 a year, no inspection', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'property-tax']);
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(20);
  });
});
