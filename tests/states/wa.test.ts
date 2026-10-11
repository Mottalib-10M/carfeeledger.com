import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/wa.json';
import engine from '../../src/lib/engine/states/wa';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Washington', () => {
  it('new $35,000 car in Seattle: 6.5% + 4.05% + 0.5%, title, plates, tabs, RTA', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2275); // 35,000 x 6.5%
    expect(amt(r, 'local-tax')).toBe(1417.5); // 35,000 x 4.05% (DOR Q4 2026, Seattle 1726)
    expect(amt(r, 'mv-tax')).toBe(175); // 35,000 x 0.5% (since Jan. 1, 2026)
    expect(amt(r, 'title')).toBe(40); // dealer sale, RCW 46.17.100 from Oct. 1, 2026
    expect(amt(r, 'title-filing')).toBe(6.5);
    expect(amt(r, 'title-service')).toBe(18);
    expect(amt(r, 'ems')).toBe(6.5);
    expect(amt(r, 'arbitration')).toBe(3);
    expect(amt(r, 'plates')).toBe(104); // 2 x ($50 + $2)
    expect(amt(r, 'reg')).toBe(30);
    expect(amt(r, 'reg-weight')).toBe(35); // 3,500 lb -> 4,000 lb bracket
    expect(amt(r, 'reg-filing')).toBe(6);
    expect(amt(r, 'reg-service')).toBe(11);
    expect(amt(r, 'license-service')).toBe(0.75);
    expect(amt(r, 'plate-tech')).toBe(0.25);
    expect(amt(r, 'rta')).toBe(385); // 35,000 x 100% x 1.1%
    expect(ids(r)).not.toContain('tbd'); // district fee only at renewal
    expect(ids(r)).not.toContain('luxury-tax');
    // 2275 + 1417.5 + 175 + 74 (title items + arbitration) + 104 + 83 (tabs) + 385 + 200 doc fee
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(4713.5);
  });
  it('used EV from a private seller: use tax and title now, tabs, RTA, EV and Seattle fees at the next renewal', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1170); // 18,000 x 6.5%
    expect(amt(r, 'local-tax')).toBe(729); // 18,000 x 4.05%
    expect(amt(r, 'mv-tax')).toBe(90);
    expect(amt(r, 'title')).toBe(15);
    expect(ids(r)).not.toContain('plates');
    expect(ids(r)).not.toContain('arbitration');
    expect(amt(r, 'reg-weight')).toBe(65); // 4,200 lb -> 6,000 lb bracket
    expect(amt(r, 'rta')).toBe(128.7); // 2021 model in 2026: year 6 of service, 65%; 18,000 x 65% x 1.1%
    expect(amt(r, 'ev')).toBe(150);
    expect(amt(r, 'ev-electrification')).toBe(75);
    expect(amt(r, 'tbd')).toBe(50);
    expect(r.lines.filter((l) => l.deferred).map((l) => l.id)).toContain('rta');
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(2035); // 1170 + 729 + 90 + 15 + 6.5 + 18 + 6.5
  });
  it('renewal a year later in Seattle: tabs $83, RTA at 95%, $50 district fee', () => {
    const r = engine(RENEW_1, d);
    expect(r.lines.filter((l) => l.kind === 'registration').reduce((s, l) => s + (l.amount ?? 0), 0)).toBeCloseTo(83, 2);
    expect(amt(r, 'rta')).toBe(365.75); // 35,000 x 95% x 1.1%
    expect(amt(r, 'tbd')).toBe(50);
  });
  it('trade-in lowers the sales tax', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1625); });
  it('luxury tax: 8% of price plus trade-in above $102,000', () => {
    expect(amt(engine({ ...NEW_CAR, price: 120000, tradeIn: 10000 }, d), 'luxury-tax')).toBe(2240); // (120,000 + 10,000 - 102,000) x 8%
  });
  it('outside Sound Transit (Spokane): no RTA, $20 district fee at renewal', () => {
    expect(ids(engine({ ...NEW_CAR, county: 'spokane-city-spokane-county' }, d))).not.toContain('rta');
    expect(amt(engine({ ...RENEW_1, county: 'spokane-city-spokane-county' }, d), 'tbd')).toBe(20);
  });
  it('hybrid pays $75 at renewal only; EV fees absent at a new purchase', () => {
    expect(ids(engine({ ...NEW_CAR, fuel: 'ev' }, d))).not.toContain('ev');
    expect(amt(engine({ ...RENEW_1, fuel: 'hybrid' }, d), 'ev')).toBe(75);
  });
  it('light truck: declared gross weight fee with the July 2026 2% increase, $10 weight fee, no RTA above 6,000 lb', () => {
    const t = engine({ ...NEW_CAR, body: 'truck', weightLbs: 5200 }, d);
    expect(amt(t, 'reg')).toBe(81.6); // $80 x 1.02
    expect(amt(t, 'reg-weight')).toBe(10);
    expect(ids(engine({ ...NEW_CAR, body: 'truck', weightLbs: 6500 }, d))).not.toContain('rta');
  });
  it('Mountlake Terrace district fee rises to $40 in 2027', () => {
    expect(amt(engine({ ...RENEW_1, county: 'mountlake-terrace-snohomish-county' }, d), 'tbd')).toBe(40);
  });
});
