import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/dc.json';
import engine from '../../src/lib/engine/states/dc';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const line = (r: { lines: { id: string }[] }, id: string) => r.lines.find((l) => l.id === id) as { amount: number | null; range?: number[]; years?: number } | undefined;
describe('District of Columbia', () => {
  it('new 3,500 lb gas car: excise shown as the 2.5%-10% range, $30 title, $175 Class II, $10 new sticker', () => {
    const r = engine(NEW_CAR, d);
    expect(line(r, 'excise')?.amount).toBeNull();
    expect(line(r, 'excise')?.range).toEqual([875, 3500]); // 35,000 x 2.5% (40+ MPG) to 35,000 x 10% (20 MPG or less)
    expect(amt(r, 'title')).toBe(30);
    expect(amt(r, 'reg')).toBe(175); // 3,500-4,999 lb from March 30, 2026
    expect(amt(r, 'inspection')).toBe(10);
    expect(line(r, 'inspection')?.years).toBe(4);
    expect(line(r, 'reg-card')?.range).toEqual([0, 30]);
    expect(runCalc({ ...NEW_CAR, docFee: 0 }, d, engine).atPurchase).toBe(215); // 30 + 175 + 10
  });
  it('used 2021 EV, 4,200 lb: 2% excise, weight minus 1,000 lb = Class I $70, no inspection fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'excise')).toBe(360); // 18,000 x 2%
    expect(amt(r, 'reg')).toBe(70); // 4,200 - 1,000 = 3,200 lb
    expect(ids(r)).not.toContain('inspection');
    expect(runCalc(USED_EV, d, engine).atPurchase).toBe(460);
  });
  it('renewal one year later: $175, no excise, title or inspection', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'reg-card']);
    expect(amt(r, 'reg')).toBe(175);
  });
  it('brand-new electric car under 5,000 lb: $40 for two registration years, then by weight', () => {
    const ev = { ...NEW_CAR, fuel: 'ev' as const, weightLbs: 4200 };
    expect(amt(engine(ev, d), 'reg')).toBe(40);
    expect(amt(engine(ev, d), 'excise')).toBe(700); // 35,000 x 2%
    expect(amt(engine({ ...RENEW_1, fuel: 'ev', weightLbs: 4200 }, d), 'reg')).toBe(40); // second year
    expect(amt(engine({ ...RENEW_1, fuel: 'ev', weightLbs: 4200, ownedYears: 2, year: 2028 }, d), 'reg')).toBe(70);
  });
  it('weight classes: 3,000 lb $70 and 1% to 9%; 5,200 lb $300 and 3.5% to 11%', () => {
    const light = engine({ ...NEW_CAR, weightLbs: 3000 }, d);
    expect(amt(light, 'reg')).toBe(70);
    expect(line(light, 'excise')?.range).toEqual([525, 3150]);
    const heavy = engine({ ...NEW_CAR, weightLbs: 5200, fuel: 'hybrid' }, d);
    expect(amt(heavy, 'reg')).toBe(300);
    expect(line(heavy, 'excise')?.range).toEqual([1225, 3850]);
  });
  it('no trade-in credit; 2012 car renewal: $35 inspection every two years', () => {
    expect(line(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'excise')?.range).toEqual([875, 3500]);
    const r = engine({ ...RENEW_1, modelYear: 2012 }, d);
    expect(amt(r, 'inspection')).toBe(35);
    expect(line(r, 'inspection')?.years).toBe(2);
  });
});
