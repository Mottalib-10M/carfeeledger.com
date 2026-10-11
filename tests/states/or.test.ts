import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/or.json';
import engine from '../../src/lib/engine/states/or';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Oregon', () => {
  it('new $35,000 gas car, Multnomah County: 0.5% privilege tax, 20-39 MPG title, four-year registration', () => {
    const r = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(r, 'sales-tax')).toBe(175); // 35,000 x 0.5%
    expect(amt(r, 'title')).toBe(106); // 20-39 MPG band
    expect(amt(r, 'plate')).toBe(26);
    expect(amt(r, 'reg')).toBe(272); // $136 per two years x 2 (four-year first registration)
    expect(amt(r, 'county-fee')).toBe(224); // Multnomah $112 x 2
    expect(amt(r, 'doc-fee')).toBe(250); // cap with integrator
    expect(ids(r)).not.toContain('inspection'); // model year within the last four years
    expect(r.atPurchase).toBe(1053); // 175 + 106 + 26 + 272 + 224 + 250
  });
  it('used EV bought privately: no tax, $192 title, registration due at the next renewal', () => {
    const r = runCalc({ ...USED_EV, docFee: -1 }, d, engine);
    expect(ids(r)).not.toContain('sales-tax');
    expect(amt(r, 'title')).toBe(192);
    expect(amt(r, 'reg')).toBe(376);
    expect(r.lines.find((l) => l.id === 'reg')?.deferred).toBe(true);
    expect(ids(r)).not.toContain('inspection'); // all-electric cars are exempt
    expect(r.atPurchase).toBe(192);
    expect(r.firstYear).toBe(680); // 192 + 376 + 112 county fee
  });
  it('renewal one year later: $136 + $112 per two years = $124 a year', () => {
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(124);
    expect(amt(engine(RENEW_1, d), 'reg')).toBe(136);
  });
  it('trade-in does not reduce the privilege tax', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(175);
  });
  it('hybrid: title and registration shown as the MPG range', () => {
    const r = engine({ ...NEW_CAR, fuel: 'hybrid' }, d);
    expect(r.lines.find((l) => l.id === 'title')?.range).toEqual([106, 116]);
    expect(r.lines.find((l) => l.id === 'reg')?.range).toEqual([272, 432]);
  });
  it('DEQ test: $25 in the Portland area for a car of 4 model years or more, $20 in Jackson County, none elsewhere', () => {
    const old = { ...RENEW_1, modelYear: 2020 };
    expect(amt(engine(old, d), 'inspection')).toBe(25);
    expect(amt(engine({ ...old, county: 'jackson-county' }, d), 'inspection')).toBe(20);
    expect(ids(engine({ ...old, county: 'other' }, d))).not.toContain('inspection');
    expect(ids(engine({ ...old, county: 'other' }, d))).not.toContain('county-fee');
  });
});
