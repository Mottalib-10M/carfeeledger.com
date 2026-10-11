import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/tx.json';
import engine from '../../src/lib/engine/states/tx';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Texas', () => {
  it('new $35,000 car in Harris County: 24 months of registration', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2187.5); // 35,000 x 6.25%
    expect(amt(r, 'title')).toBe(33); // emissions county
    expect(amt(r, 'reg')).toBe(103.5); // (50.75 + 1) x 2
    expect(amt(r, 'local')).toBe(23); // Harris $11.50 x 2
    expect(amt(r, 'inspection-fee')).toBe(16.75);
    expect(ids(r)).not.toContain('emissions-state'); // new: exempt two years
  });
  it('used EV, private seller, Travis County: EV fee $200, no emissions test', () => {
    const r = engine({ ...USED_EV, county: 'travis-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(1125); // 18,000 x 6.25%
    expect(amt(r, 'ev')).toBe(200);
    expect(ids(r)).not.toContain('emissions-state');
    expect(r.notes.join(' ')).toMatch(/presumptive/);
  });
  it('renewal at year 1 (Harris): annual package, still inside the two-year emissions exemption', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'reg')).toBe(51.75);
    expect(amt(r, 'local')).toBe(11.5);
    expect(amt(r, 'processing')).toBe(4.75);
    expect(amt(r, 'inspection-fee')).toBe(7.5);
    expect(ids(r)).not.toContain('emissions-state');
  });
  it('trade-in deducted, doc fee not taxed; Borden County has no local fee and no emissions', () => {
    const r = engine({ ...NEW_CAR, tradeIn: 10000, docFee: 225, county: 'borden-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(1562.5); // (35,000 - 10,000) x 6.25%
    expect(amt(r, 'local')).toBe(0);
    expect(amt(r, 'title')).toBe(28);
  });
  it('weight edge: 6,001 lb pays the $54 base', () => {
    expect(amt(engine({ ...RENEW_1, weightLbs: 6001 }, d), 'reg')).toBe(55); // 54 + 1
    expect(amt(engine({ ...RENEW_1, weightLbs: 6000 }, d), 'reg')).toBe(51.75);
  });
  it('older gasoline car renewed in Dallas County owes the $2.75 state emissions portion', () => {
    const r = engine({ ...RENEW_1, modelYear: 2018, county: 'dallas-county' }, d);
    expect(amt(r, 'emissions-state')).toBe(2.75);
  });
});
