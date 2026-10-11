import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ut.json';
import engine from '../../src/lib/engine/generic';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Utah', () => {
  it('new $35,000 car in Salt Lake County: 7.45% sales tax, $6 title, 2026 registration and county fees, $150 uniform fee', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1697.5); // 35,000 x 4.85%
    expect(amt(r, 'local-tax')).toBe(910); // 35,000 x 2.60% (7.45% combined)
    expect(amt(r, 'title')).toBe(6);
    expect(amt(r, 'reg')).toBe(58.25);
    expect(amt(r, 'reg-extra')).toBe(7.5);
    expect(amt(r, 'e-pay')).toBe(3);
    expect(amt(r, 'driver-ed')).toBe(2.5);
    expect(amt(r, 'uninsured')).toBe(1);
    expect(amt(r, 'corridor')).toBe(10);
    expect(amt(r, 'apc')).toBe(3);
    expect(amt(r, 'uniform-fee')).toBe(150); // less than 3 years old
    expect(ids(r)).not.toContain('emissions'); // less than two years old
    expect(r.atPurchase).toBe(2848.75); // 2,607.50 tax + 6 + 235.25 registration lines
  });
  it('used 2021 EV bought privately: tax at the registration address, $110 uniform fee, $180 EV fee, no APC fee or test', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(873); // 18,000 x 4.85%
    expect(amt(r, 'local-tax')).toBe(468); // 18,000 x 2.60%
    expect(amt(r, 'uniform-fee')).toBe(110); // 5 years old
    expect(amt(r, 'ev')).toBe(180);
    expect(ids(r)).not.toContain('apc');
    expect(ids(r)).not.toContain('emissions');
    expect(r.atPurchase).toBe(1719.25); // 1,341 + 6 + 82.25 + 110 + 180
  });
  it('renewal one year later: $235.25 (registration lines at 2026 amounts)', () => {
    expect(ids(engine(RENEW_1, d))).not.toContain('title');
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(235.25);
  });
  it('trade-in deducted and document fee taxed', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000, docFee: 400 }, d), 'sales-tax')).toBe(1231.9); // (35,000 + 400 - 10,000) x 4.85%
  });
  it('uniform fee by age and emissions test from two years in Utah County, none in Washington County', () => {
    expect(amt(engine({ ...RENEW_1, modelYear: 2015 }, d), 'uniform-fee')).toBe(10); // 12 years old
    expect(amt(engine({ ...RENEW_1, modelYear: 2018 }, d), 'uniform-fee')).toBe(50); // 9 years old
    const old = engine({ ...RENEW_1, modelYear: 2020, county: 'provo' }, d);
    expect(ids(old)).toContain('emissions');
    expect(amt(old, 'apc')).toBe(2);
    expect(ids(engine({ ...RENEW_1, modelYear: 2020, county: 'st-george' }, d))).not.toContain('emissions');
  });
  it('hybrid and plug-in hybrid fees', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(25);
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(64);
  });
});
