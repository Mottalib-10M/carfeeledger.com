import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/id.json';
import engine from '../../src/lib/engine/states/id';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const total = (r: { lines: { amount: number | null }[] }) => Math.round(r.lines.reduce((s, l) => s + (l.amount ?? 0), 0) * 100) / 100;
describe('Idaho', () => {
  it('new $35,000 car in Ada County', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2100); // 35,000 x 6%
    expect(amt(r, 'title')).toBe(14);
    expect(amt(r, 'title-admin')).toBe(7); // Ada: $21 total title fee
    expect(amt(r, 'plate')).toBe(7.5);
    expect(amt(r, 'reg')).toBe(69); // 0 to 2 years old
    expect(amt(r, 'ems')).toBe(1.25);
    expect(amt(r, 'isp')).toBe(3);
    expect(amt(r, 'county-fee')).toBe(9.5);
    expect(amt(r, 'achd')).toBe(40);
    // 2,100 + 14 + 7 + 7.50 + 69 + 1.25 + 3 + 9.50 + 40 = 2,251.25
    expect(total(r)).toBe(2251.25);
  });
  it('used 2021 EV bought privately in Ada County', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1080); // 18,000 x 6%
    expect(amt(r, 'reg')).toBe(57); // 5 years old
    expect(amt(r, 'achd-3-7')).toBe(36);
    expect(amt(r, 'ev')).toBe(140);
    // 1,080 + 14 + 7 + 7.50 + 57 + 1.25 + 3 + 9.50 + 36 + 140 = 1,355.25
    expect(total(r)).toBe(1355.25);
  });
  it('renewal one year later: $69 + $1.25 + $3 + $9.50 + $40', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('title-admin');
    expect(ids(r)).not.toContain('sales-tax');
    expect(total(r)).toBe(122.75);
  });
  it('documentation fee taxed, trade-in credited on a dealer sale only', () => {
    expect(amt(engine({ ...NEW_CAR, docFee: 400 }, d), 'sales-tax')).toBe(2124); // 35,400 x 6%
    expect(amt(engine({ ...NEW_CAR, tradeIn: 5000 }, d), 'sales-tax')).toBe(1800); // 30,000 x 6%
    expect(amt(engine({ ...USED_EV, tradeIn: 5000 }, d), 'sales-tax')).toBe(1080);
  });
  it('county fees: Kootenai $14 registration admin and $10 title admin, no highway district fee', () => {
    const r = engine({ ...NEW_CAR, county: 'kootenai-county' }, d);
    expect(amt(r, 'county-fee')).toBe(14);
    expect(amt(r, 'title-admin')).toBe(10);
    expect(ids(r)).not.toContain('achd');
  });
  it('age bands: 7-year-old car $45 with $36 ACHD, 8-year-old $45 with $24', () => {
    expect(amt(engine({ ...RENEW_1, modelYear: 2020 }, d), 'reg')).toBe(45); // 2027 - 2020 = 7
    expect(amt(engine({ ...RENEW_1, modelYear: 2020 }, d), 'achd-3-7')).toBe(36);
    expect(amt(engine({ ...RENEW_1, modelYear: 2019 }, d), 'achd-8')).toBe(24);
    expect(amt(engine({ ...RENEW_1, modelYear: 2024 }, d), 'reg')).toBe(57); // 3 years old
  });
  it('plug-in hybrid $75, hybrid nothing extra, no inspection', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(75);
    expect(ids(engine({ ...NEW_CAR, fuel: 'hybrid' }, d))).not.toContain('ev');
    expect(ids(engine({ ...NEW_CAR, modelYear: 2010 }, d))).not.toContain('inspection');
  });
});
