import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/al.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Alabama', () => {
  it('new car in Jefferson County: 2% state + 0.75% county, $15 title + $3, $23 plate + $1.25 issuance', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(700); // 35,000 x 2%
    expect(amt(r, 'local-tax')).toBe(262.5); // 35,000 x 0.75%
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'title-commission')).toBe(3);
    expect(amt(r, 'reg')).toBe(23);
    expect(amt(r, 'issuance')).toBe(1.25);
    expect(r.lines.find((l) => l.id === 'ad-valorem')?.amount).toBeNull();
    // 700 + 262.5 + 15 + 3 + 23 + 1.25 = 1,004.75 (no doc fee: no cap, no reference)
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(1004.75);
  });
  it('used EV, private sale: $203 Rebuild Alabama fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(360); // 18,000 x 2%
    expect(amt(r, 'local-tax')).toBe(135); // 18,000 x 0.75%
    expect(amt(r, 'ev')).toBe(203);
  });
  it('plug-in hybrid pays $103, hybrid nothing', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(103);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('ev');
  });
  it('trade-in deducted: (35,000 - 10,000) x 2% = $500', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(500);
  });
  it('City of Birmingham: 2.75% combined local = $962.50', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'city-of-birmingham' }, d), 'local-tax')).toBe(962.5);
  });
  it('renewal: $23 + $1.25, no tax, no title', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'issuance', 'ad-valorem']);
  });
});
