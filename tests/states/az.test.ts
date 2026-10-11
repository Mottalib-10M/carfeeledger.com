import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/az.json';
import engine from '../../src/lib/engine/states/az';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Arizona', () => {
  it('new $35,000 car in Phoenix: 5.6% + 0.7% county + Phoenix tiered city tax, VLT on 60% at $2.80', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1960); // 35,000 x 5.6%
    expect(amt(r, 'county-tax')).toBe(245); // 35,000 x 0.7% (Maricopa 6.30% - 5.6%)
    expect(amt(r, 'city-tax')).toBe(814.7); // 14,338 x 2.8% + 20,662 x 2.0%
    expect(amt(r, 'title')).toBe(4);
    expect(amt(r, 'vlt')).toBe(588); // 35,000 x 60% = 21,000 / 100 x $2.80
    expect(amt(r, 'reg')).toBe(8);
    expect(amt(r, 'air-quality')).toBe(1.5);
    expect(ids(r)).not.toContain('emissions'); // new car exempt until the sixth registration year
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(3621.2); // no doc fee cap, no default
  });
  it('used EV from a private seller: no tax, title, VLT at $2.89 on the declined value, no air quality fee or test', () => {
    const r = engine(USED_EV, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(amt(r, 'vlt')).toBe(128.6); // 18,000 x 60% x 0.8375^5 / 100 x $2.89 = 128.60
    expect(ids(r)).not.toContain('air-quality');
    expect(ids(r)).not.toContain('emissions');
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(140.6); // 4 + 128.60 + 8
  });
  it('renewal a year later: VLT $508.28, $8, $1.50', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'vlt')).toBe(508.28); // 35,000 x 60% x 0.8375 / 100 x $2.89
    expect(amt(r, 'reg')).toBe(8);
    expect(amt(r, 'air-quality')).toBe(1.5);
    expect(ids(r)).not.toContain('title');
  });
  it('trade-in is deducted', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1400); });
  it('Phoenix tier not reached below $14,338', () => { expect(amt(engine({ ...NEW_CAR, price: 10000 }, d), 'city-tax')).toBe(280); });
  it('Glendale "single item over" rule shown as a range', () => {
    const l = engine({ ...NEW_CAR, county: 'glendale' }, d).lines.find((x) => x.id === 'city-tax')!;
    expect(l.amount).toBeNull();
    expect(l.range).toEqual([770, 1015]); // 35,000 x 2.2% and x 2.9%
  });
  it('Tucson, used gas car of 2019: yearly emissions test $16.15', () => {
    const r = engine({ ...NEW_CAR, county: 'tucson', condition: 'used', modelYear: 2019, price: 18000 }, d);
    expect(amt(r, 'emissions')).toBe(16.15);
    expect(r.lines.find((l) => l.id === 'emissions')?.years).toBe(1);
    expect(amt(r, 'county-tax')).toBe(90); // 18,000 x 0.5%
    expect(amt(r, 'city-tax')).toBe(468); // 18,000 x 2.6%
  });
  it('VLT minimum $10', () => { expect(amt(engine({ ...NEW_CAR, price: 1000, modelYear: 2006, condition: 'used' }, d), 'vlt')).toBe(10); });
});
