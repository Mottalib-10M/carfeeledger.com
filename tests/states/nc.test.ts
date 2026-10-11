import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/nc.json';
import engine from '../../src/lib/engine/states/nc';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('North Carolina', () => {
  it('new $35,000 car from a Wake County dealer', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(1050); // 35,000 x 3% highway use tax
    expect(amt(r, 'title')).toBe(66.75);
    expect(amt(r, 'reg')).toBe(46.25);
    expect(amt(r, 'county-fee')).toBe(17); // Wake $7 county + $10 regional transit
    const insp = r.lines.find((l) => l.id === 'inspection')!;
    expect(insp.amount).toBe(13.6); // under 3 years: safety only
    expect(insp.deferred).toBe(true); // inspected by the dealer before the sale
    expect(r.lines.find((l) => l.id === 'property-tax')?.amount).toBeNull();
    expect(r.atPurchase).toBe(1180); // 1,050 + 66.75 + 46.25 + 17
    expect(r.firstYear).toBe(1193.6);
  });
  it('used 2021 EV bought privately in Wake County', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(540); // 18,000 x 3%
    expect(amt(r, 'ev')).toBe(214.5);
    expect(amt(r, 'inspection')).toBe(13.6); // EV: safety only, due before registering
    expect(r.atPurchase).toBe(898.1); // 540 + 66.75 + 46.25 + 17 + 214.50 + 13.60
  });
  it('renewal in 2027: registration, Wake taxes, safety inspection', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('title');
    expect(r.lines.reduce((s, l) => s + (l.amount ?? 0), 0)).toBeCloseTo(76.85, 2); // 46.25 + 17 + 13.60
  });
  it('emissions counties and ages', () => {
    const older = { ...NEW_CAR, condition: 'used' as const, modelYear: 2019, price: 15000 };
    expect(amt(engine(older, d), 'inspection')).toBe(30); // Wake, 7 years old
    expect(amt(engine({ ...older, county: 'mecklenburg-county' }, d), 'inspection')).toBe(30);
    expect(amt(engine({ ...older, county: 'orange-county' }, d), 'inspection')).toBe(13.6); // not an emissions county
    expect(amt(engine({ ...older, modelYear: 2005 }, d), 'inspection')).toBe(13.6); // 21 years old
    expect(ids(engine({ ...older, county: 'mecklenburg-county' }, d))).not.toContain('county-fee');
    expect(amt(engine({ ...older, county: 'randolph-county' }, d), 'county-fee')).toBe(2);
  });
  it('trade-in deducted, doc fee taxed', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(750);
    expect(amt(engine({ ...NEW_CAR, docFee: 699 }, d), 'sales-tax')).toBe(1070.97); // (35,000 + 699) x 3%
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(107.25);
  });
});
