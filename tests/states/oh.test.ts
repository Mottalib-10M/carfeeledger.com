import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/oh.json';
import engine from '../../src/lib/engine/states/oh';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Ohio', () => {
  it('new $35,000 car in Franklin County (8% with COTA)', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(2012.5); // 35,000 x 5.75%
    expect(amt(r, 'local-tax')).toBe(787.5); // 35,000 x 2.25% (1.25% county + 1.00% transit)
    expect(amt(r, 'title')).toBe(18);
    expect(amt(r, 'reg')).toBe(36); // $20 license tax + $16 (R.C. 4503.10(C)(1), 2026)
    expect(amt(r, 'dr-fee')).toBe(8);
    expect(r.lines.find((l) => l.id === 'permissive')?.range).toEqual([0, 30]);
    expect(r.docFee).toBe(0); // CPI-adjusted cap not read: no default
    expect(r.atPurchase).toBe(2862); // 2,800 + 18 + 36 + 8
  });
  it('used 2021 EV, private sale: taxed (no casual-sale exemption for cars), $200 EV fee', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1035); // 18,000 x 5.75%
    expect(amt(r, 'local-tax')).toBe(405); // 18,000 x 2.25%
    expect(amt(r, 'ev')).toBe(200);
    expect(r.atPurchase).toBe(1702); // 1,440 + 18 + 36 + 8 + 200
  });
  it('renewal in 2027: $36 + $8 DR fee + permissive range', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('title');
    expect(r.lines.reduce((s, l) => s + (l.amount ?? 0), 0)).toBe(44);
  });
  it('trade-in only on a new car from a dealer', () => {
    const n = engine({ ...NEW_CAR, tradeIn: 10000 }, d);
    expect(amt(n, 'sales-tax')).toBe(1437.5); // 25,000 x 5.75%
    expect(amt(n, 'local-tax')).toBe(562.5);
    const u = engine({ ...NEW_CAR, condition: 'used', modelYear: 2023, tradeIn: 10000 }, d);
    expect(amt(u, 'sales-tax')).toBe(2012.5); // full price
  });
  it('county rates', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'butler-county' }, d), 'local-tax')).toBe(262.5); // 0.75%
    expect(amt(engine({ ...NEW_CAR, county: 'cuyahoga-county' }, d), 'local-tax')).toBe(787.5); // 8.00% total
    expect(amt(engine({ ...NEW_CAR, county: 'warren-county' }, d), 'local-tax')).toBe(525); // 7.25% total since Oct. 2026
  });
  it('E-Check: 7 counties, gas from 6 years, hybrids from 7, not EVs', () => {
    const used = { ...NEW_CAR, condition: 'used' as const, county: 'cuyahoga-county', price: 12000 };
    expect(ids(engine({ ...used, modelYear: 2019 }, d))).toContain('e-check');
    expect(ids(engine({ ...used, modelYear: 2021 }, d))).not.toContain('e-check');
    expect(ids(engine({ ...used, modelYear: 2019, fuel: 'hybrid' }, d))).toContain('e-check');
    expect(ids(engine({ ...used, modelYear: 2020, fuel: 'hybrid' }, d))).not.toContain('e-check');
    expect(ids(engine({ ...used, modelYear: 2015, fuel: 'ev' }, d))).not.toContain('e-check');
    expect(ids(engine({ ...used, modelYear: 2015, county: 'franklin-county' }, d))).not.toContain('e-check');
  });
  it('hybrid and plug-in fees', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(100);
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(150);
  });
});
