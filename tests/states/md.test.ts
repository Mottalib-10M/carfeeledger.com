import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/md.json';
import engine from '../../src/lib/engine/generic';
import { runCalc, renewalYear } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Maryland', () => {
  it('new car in Montgomery County: 6.5% excise on price + $800 processing charge, $200 title, $161 two-year registration, $80 EMS surcharge', () => {
    const c = runCalc({ ...NEW_CAR, docFee: -1 }, d, engine);
    expect(amt(c, 'sales-tax')).toBe(2327); // (35,000 + 800) x 6.5%
    expect(amt(c, 'title')).toBe(200);
    expect(amt(c, 'reg')).toBe(161); // $80.50 x 2 (3,500 lb or less)
    expect(amt(c, 'ems')).toBe(80); // $40 x 2
    expect(amt(c, 'doc-fee')).toBe(800);
    expect(c.lines.find((l) => l.id === 'veip')?.amount).toBeNull();
    expect(c.atPurchase).toBe(3568); // 2,327 + 200 + 161 + 80 + 800
  });
  it('used 2021 EV of 4,200 lb bought privately: excise on the price, $303 registration, EV surcharge unpriced, safety inspection unpriced', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1170); // 18,000 x 6.5%
    expect(amt(r, 'reg')).toBe(303); // $151.50 x 2 (over 3,700 lb)
    expect(r.lines.find((l) => l.id === 'ev')?.amount).toBeNull();
    expect(ids(r)).toContain('safety');
    expect(ids(r)).not.toContain('veip'); // electric: no emissions test
  });
  it('renewal: registration + EMS surcharge, $120.50 a year', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'ems', 'veip']);
    expect(renewalYear(NEW_CAR, d, engine, 1).perYear).toBe(120.5); // (161 + 80) / 2
  });
  it('minimum excise $100', () => { expect(amt(engine({ ...NEW_CAR, price: 1000 }, d), 'sales-tax')).toBe(100); });
  it('trade-in credit', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1625); }); // 25,000 x 6.5%
  it('3,600 lb: middle weight class', () => { expect(amt(engine({ ...NEW_CAR, weightLbs: 3600 }, d), 'reg')).toBe(171); }); // $85.50 x 2
  it('no VEIP outside the emissions area', () => { expect(ids(engine({ ...RENEW_1, county: 'garrett-county' }, d))).not.toContain('veip'); });
});
