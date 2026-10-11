import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ca.json';
import engine, { vlfClassValue } from '../../src/lib/engine/states/ca';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('California', () => {
  it('REG 360 example: $12,479 falls in class CX ($12,400-$12,599.99), VLF $81 then $73', () => {
    expect(vlfClassValue(12479, 200)).toBe(12500);
    const r = engine({ ...NEW_CAR, price: 12479 }, d);
    expect(amt(r, 'vlf')).toBe(81); // 12,500 x 0.65% = 81.25 -> $81 (REG 360, year 1)
    const r2 = engine({ ...RENEW_1, price: 12479 }, d);
    expect(amt(r2, 'vlf')).toBe(73); // 12,500 x 90% x 0.65% = 73.13 -> $73 (REG 360, year 2)
  });
  it('new $35,000 gasoline car, Los Angeles County', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(3587.5); // 35,000 x 10.25%
    expect(amt(r, 'reg')).toBe(76);
    expect(amt(r, 'chp')).toBe(34);
    expect(amt(r, 'vlf')).toBe(228); // class $35,100 x 0.65% = 228.15 -> 228
    expect(amt(r, 'tif')).toBe(198); // $35,000 in the $35,000-$59,999 bracket
    expect(amt(r, 'county')).toBe(11); // LA: theft/DUI 2 + SAFE 1 + FID 1 + air quality 7
    expect(amt(r, 'smog-abatement')).toBe(20);
    expect(amt(r, 'plate')).toBe(1);
  });
  it('used EV from a private seller: transfer fee now, registration package and RIF due within 12 months', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1845); // 18,000 x 10.25%
    expect(amt(r, 'transfer')).toBe(15);
    expect(amt(r, 'rif')).toBe(121);
    expect(r.lines.find((l) => l.id === 'rif')?.deferred).toBe(true);
    expect(amt(r, 'vlf')).toBe(118); // class 18,100 x 0.65% = 117.65 -> 118
    expect(ids(r)).not.toContain('smog-transfer'); // EVs are exempt
  });
  it('renewal one year later keeps only the yearly lines, VLF at 90%', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).not.toContain('sales-tax');
    expect(amt(r, 'vlf')).toBe(205); // 35,100 x 0.9 x 0.65% = 205.34
    expect(amt(r, 'tif')).toBe(132); // value 35,000 x 90% = 31,500: $25,000-$34,999 bracket
  });
  it('trade-in does not reduce the tax; TIF bracket edge at $5,000', () => {
    const r = engine({ ...NEW_CAR, tradeIn: 10000, county: 'alpine-county' }, d);
    expect(amt(r, 'sales-tax')).toBe(2537.5); // 35,000 x 7.25%, trade-in ignored
    expect(amt(engine({ ...NEW_CAR, price: 4999 }, d), 'tif')).toBe(33); // value $4,999: first bracket
    expect(amt(engine({ ...NEW_CAR, price: 5000 }, d), 'tif')).toBe(66); // value $5,000: $5,000-$24,999 bracket
  });
  it('used gasoline car of 3 model-years pays the $8 smog transfer fee, older needs a smog check', () => {
    const used = { ...USED_EV, fuel: 'gas' as const, modelYear: 2023 };
    expect(amt(engine(used, d), 'smog-transfer')).toBe(8);
    expect(amt(engine({ ...used, modelYear: 2020 }, d), 'smog-cert')).toBe(null);
  });
});
