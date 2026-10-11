import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/tn.json';
import engine from '../../src/lib/engine/states/tn';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Tennessee', () => {
  it('new $35,000 car in Shelby County: 7% + 2.25% on $1,600 + 2.75% on $1,600, $11 title, $26.50 plate', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(2450); // 35,000 x 7%
    expect(amt(r, 'local-tax')).toBe(36); // 1,600 x 2.25%
    expect(amt(r, 'single-article')).toBe(44); // 1,600 x 2.75%
    expect(amt(r, 'title')).toBe(11);
    expect(amt(r, 'reg')).toBe(26.5);
    expect(r.lines.find((l) => l.id === 'wheel-tax')?.amount).toBeNull();
    expect(ids(r)).not.toContain('doc-fee'); // no cap, default 0
    expect(r.atPurchase).toBe(2567.5); // 2,450 + 36 + 44 + 11 + 26.50
  });
  it('used EV bought privately in 2026: same tax rules, $200 electric fee', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1260); // 18,000 x 7%
    expect(amt(r, 'ev')).toBe(200);
    expect(r.atPurchase).toBe(1577.5); // 1,260 + 36 + 44 + 11 + 26.50 + 200
  });
  it('renewal in 2027: $26.50, and an EV pays $274 that year', () => {
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(26.5);
    expect(amt(engine({ ...RENEW_1, fuel: 'ev' }, d), 'ev')).toBe(274);
    expect(amt(engine({ ...RENEW_1, fuel: 'hybrid' }, d), 'ev')).toBe(100);
    expect(amt(engine({ ...RENEW_1, year: 2028, fuel: 'ev' }, d), 'ev')).toBeNull(); // indexed, not published
  });
  it('Davidson County 2.75%: local tax capped by the $1,600 base at $44', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'davidson-county' }, d), 'local-tax')).toBe(44);
  });
  it('trade-in deducted and document fee taxed', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000, docFee: 500 }, d), 'sales-tax')).toBe(1785); // (35,000 + 500 - 10,000) x 7%
  });
  it('cheap car: single article tax only on the part above $1,600', () => {
    const r = engine({ ...NEW_CAR, price: 2000 }, d);
    expect(amt(r, 'local-tax')).toBe(36);
    expect(amt(r, 'single-article')).toBe(11); // 400 x 2.75%
  });
});
