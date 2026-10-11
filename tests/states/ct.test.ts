import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ct.json';
import engine from '../../src/lib/engine/states/ct';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const total = (r: { lines: { amount: number | null }[] }) => Math.round(r.lines.reduce((s, l) => s + (l.amount ?? 0), 0) * 100) / 100;
describe('Connecticut', () => {
  it('new $35,000 car: 6.35%, three-year registration and one-time fees', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2222.5); // 35,000 x 6.35%
    expect(amt(r, 'title')).toBe(25);
    expect(amt(r, 'plate')).toBe(5);
    expect(amt(r, 'admin')).toBe(10);
    expect(amt(r, 'ghg-new')).toBe(15);
    expect(amt(r, 'emissions-exempt')).toBe(40);
    expect(amt(r, 'reg')).toBe(120);
    expect(amt(r, 'clean-air')).toBe(15);
    expect(amt(r, 'parks')).toBe(24);
    expect(ids(r)).not.toContain('ghg'); // $7.50 only for vehicles other than new
    expect(ids(r)).not.toContain('inspection'); // first four model years exempt
    expect(r.lines.find((l) => l.id === 'property-tax')?.amount).toBeNull();
    // 2,222.50 + 25 + 5 + 10 + 15 + 40 + 120 + 15 + 24 = 2,476.50
    expect(total(r)).toBe(2476.5);
  });
  it('used 2021 EV bought privately: 6.35% on the price, no Clean Air Act fee, no emissions fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1143); // 18,000 x 6.35%
    expect(amt(r, 'ghg')).toBe(7.5);
    expect(ids(r)).not.toContain('clean-air');
    expect(ids(r)).not.toContain('emissions-exempt');
    expect(ids(r)).not.toContain('inspection');
    // 1,143 + 25 + 5 + 10 + 120 + 24 + 7.50 = 1,334.50
    expect(total(r)).toBe(1334.5);
  });
  it('renewal: $120 + $15 + $24 + $7.50 for three years', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(ids(r)).not.toContain('title');
    expect(total(r)).toBe(166.5);
    expect(r.lines.find((l) => l.id === 'reg')?.years).toBe(3);
  });
  it('7.75% on the whole price above $50,000, threshold tested before the trade-in', () => {
    // 52,000 > 50,000 -> (52,000 - 10,000) x 7.75% = 3,255
    expect(amt(engine({ ...NEW_CAR, price: 52000, tradeIn: 10000 }, d), 'sales-tax')).toBe(3255);
    // exactly 50,000 stays at 6.35%: 3,175
    expect(amt(engine({ ...NEW_CAR, price: 50000 }, d), 'sales-tax')).toBe(3175);
  });
  it('trade-in credited on a dealer sale only', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 5000 }, d), 'sales-tax')).toBe(1905); // 30,000 x 6.35%
    expect(amt(engine({ ...USED_EV, tradeIn: 5000 }, d), 'sales-tax')).toBe(1143);
  });
  it('2012 gas car: $20 emissions test every two years', () => {
    const r = engine({ ...RENEW_1, modelYear: 2012 }, d);
    expect(amt(r, 'inspection')).toBe(20);
    expect(r.lines.find((l) => l.id === 'inspection')?.years).toBe(2);
  });
});
