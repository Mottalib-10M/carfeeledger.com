import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/co.json';
import engine, { coBase } from '../../src/lib/engine/states/co';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Colorado', () => {
  it('new $35,000 car in Denver: 2.9% + 6.25% local, SOT 2.1% of 85% of MSRP, weight fee, FASTER, small fees', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1015); // 35,000 x 2.9%
    expect(amt(r, 'local-tax')).toBe(2187.5); // 35,000 x (1.10% RTD + 5.15% Denver)
    expect(amt(r, 'title')).toBe(7.2);
    expect(amt(r, 'plates')).toBe(7.38);
    expect(amt(r, 'month-tab')).toBe(0.45);
    expect(amt(r, 'sot')).toBe(624.75); // 35,000 x 85% x 2.1%
    expect(amt(r, 'reg')).toBe(9); // $6 + 15 x $0.20 (3,500 lb)
    expect(amt(r, 'age-fee')).toBe(12);
    expect(amt(r, 'road-safety')).toBe(19.3);
    expect(amt(r, 'bridge')).toBe(18);
    expect(amt(r, 'reg-other')).toBe(10.28); // 4 + 2 + 1 + 0.70 + 0.50 + 1.50 + 0.10 + 0.48
    expect(r.lines.find((l) => l.id === 'county-fees')?.amount).toBeNull();
    expect(ids(r)).not.toContain('emissions');
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(3910.86);
  });
  it('used EV from a private seller: tax also due, SOT 0.45% in year 6, EV fee $63.05 + $26', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(522); // 18,000 x 2.9%
    expect(amt(r, 'local-tax')).toBe(1125); // 18,000 x 6.25%
    expect(amt(r, 'sot')).toBe(68.85); // 18,000 x 85% x 0.45% (2021 model in 2026: year 6)
    expect(amt(r, 'reg')).toBe(10.4); // $6 + 22 x $0.20 (4,200 lb)
    expect(amt(r, 'ev')).toBe(63.05);
    expect(amt(r, 'ev-road-usage')).toBe(26);
  });
  it('renewal in 2027: SOT 1.5%, road safety $23 from September 2027, no title or plates', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'sot')).toBe(446.25); // 35,000 x 85% x 1.5%
    expect(amt(r, 'road-safety')).toBe(23);
    expect(ids(r)).not.toContain('title');
    expect(ids(r)).not.toContain('plates');
  });
  it('weight fee above 4,500 lb and the flat $3 SOT from the tenth year', () => {
    expect(coBase((d.params as never as { reg: { base: never } }).reg.base, 5200)).toBe(16.7); // 12.50 + 7 x 0.60
    expect(amt(engine({ ...RENEW_1, modelYear: 2015 }, d), 'sot')).toBe(3);
  });
  it('emissions test every two years for an older car in Denver, not in Colorado Springs', () => {
    const old = { ...RENEW_1, modelYear: 2018 };
    expect(amt(engine(old, d), 'emissions')).toBe(35);
    expect(ids(engine({ ...old, county: 'colorado-springs' }, d))).not.toContain('emissions');
  });
  it('trade-in deducted; Colorado Springs local rate 5.30%', () => {
    const r = engine({ ...NEW_CAR, tradeIn: 10000, county: 'colorado-springs' }, d);
    expect(amt(r, 'sales-tax')).toBe(725); // 25,000 x 2.9%
    expect(amt(r, 'local-tax')).toBe(1325); // 25,000 x (1.23% + 1% + 3.07%)
  });
});
