import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/mo.json';
import engine from '../../src/lib/engine/generic';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const rng = (r: { lines: { id: string; range?: number[] }[] }, id: string) => r.lines.find((l) => l.id === id)?.range;
describe('Missouri', () => {
  it('new car, unincorporated St. Louis County: 4.225% + 3.513%, $8.50 + $9 title, $9 processing, HP fee as range, $620.79 admin fee', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1478.75); // 35,000 x 4.225%
    expect(amt(r, 'local-tax')).toBe(1229.55); // 35,000 x 3.513%
    expect(amt(r, 'title')).toBe(8.5);
    expect(amt(r, 'title-processing')).toBe(9);
    expect(amt(r, 'reg')).toBe(9);
    expect(rng(r, 'reg-hp')).toEqual([18.25, 51.25]);
    expect(amt(r, 'doc-fee')).toBe(620.79);
    expect(ids(r)).not.toContain('safety'); // under 11 model years
    expect(ids(r)).not.toContain('emissions'); // first four model years
    // 1,478.75 + 1,229.55 + 8.5 + 9 + 9 + 620.79 = 3,355.59
    expect(r.atPurchase).toBe(3355.59);
  });
  it('used EV, private sale: $18.25 EV registration, $150 decal + $9, no emissions test', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(760.5); // 18,000 x 4.225%
    expect(amt(r, 'local-tax')).toBe(632.34); // 18,000 x 3.513% = 632.34
    expect(amt(r, 'reg-ev')).toBe(18.25);
    expect(amt(r, 'fuel-decal')).toBe(150);
    expect(amt(r, 'fuel-decal-processing')).toBe(9);
    expect(ids(r)).not.toContain('reg-hp');
    expect(ids(r)).not.toContain('emissions');
  });
  it('plug-in hybrid decal $75; ordinary hybrid none', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'fuel-decal-phev')).toBe(75);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('fuel-decal-processing');
  });
  it('trade-in deducted: (35,000 - 10,000) x 4.225% = $1,056.25', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1056.25);
  });
  it('City of St. Louis 5.454%: $1,908.90; Kansas City 4.75%: $1,662.50', () => {
    expect(amt(engine({ ...NEW_CAR, county: 'city-of-st-louis' }, d), 'local-tax')).toBe(1908.9);
    expect(amt(engine({ ...NEW_CAR, county: 'kansas-city-jackson' }, d), 'local-tax')).toBe(1662.5);
  });
  it('2014 car: safety inspection (up to $12) statewide, emissions (up to $24) only in the St. Louis area', () => {
    const old = { ...NEW_CAR, condition: 'used' as const, modelYear: 2014, price: 8000 };
    const stl = engine(old, d);
    expect(rng(stl, 'safety')).toEqual([0, 12]);
    expect(rng(stl, 'emissions')).toEqual([0, 24]);
    const kc = engine({ ...old, county: 'kansas-city-jackson' }, d);
    expect(ids(kc)).toContain('safety');
    expect(ids(kc)).not.toContain('emissions');
  });
  it('renewal: $9 processing + HP range, no tax', () => {
    expect(ids(engine(RENEW_1, d))).toEqual(['reg', 'reg-hp', 'property-tax']);
  });
});
