import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ne.json';
import engine, { neBaseTax } from '../../src/lib/engine/states/ne';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const p = d.params as never;
describe('Nebraska', () => {
  it('base tax table of 60-3,185', () => {
    expect(neBaseTax(p, 3000)).toBe(25);
    expect(neBaseTax(p, 9000)).toBe(60);
    expect(neBaseTax(p, 10000)).toBe(100);
    expect(neBaseTax(p, 35000)).toBe(580); // $34,000-$35,999
    expect(neBaseTax(p, 99999)).toBe(1860);
    expect(neBaseTax(p, 250000)).toBe(1900);
  });
  it('new $35,000 car in Omaha: 5.5% + 1.5%, title, plates, $20.50 registration, $580 MV tax, $20 MV fee', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(1925); // 35,000 x 5.5%
    expect(amt(r, 'local-tax')).toBe(525); // 35,000 x 1.5%
    expect(amt(r, 'title')).toBe(10);
    expect(amt(r, 'plate')).toBe(8.2); // 2 x 4.10
    expect(amt(r, 'reg')).toBe(15);
    expect(amt(r, 'reg-addons')).toBe(5.5);
    expect(amt(r, 'mv-tax')).toBe(580);
    expect(amt(r, 'mv-fee')).toBe(20);
    expect(r.lines.find((l) => l.id === 'tire-fee')?.range).toEqual([4, 5]);
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(3088.7);
  });
  it('dealer doc fee is taxable', () => { expect(amt(engine({ ...NEW_CAR, docFee: 300 }, d), 'sales-tax')).toBe(1941.5); }); // 35,300 x 5.5%
  it('trade-in is deducted', () => { expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1375); });
  it('used 2021 EV bought privately for $18,000 (price used as MSRP): 51% of $260, $5 fee, $150 alternative fuel fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(990);
    expect(amt(r, 'mv-tax')).toBe(132.6); // 260 x 51% (sixth year)
    expect(amt(r, 'mv-fee')).toBe(5);
    expect(amt(r, 'ev')).toBe(150);
    expect(ids(r)).not.toContain('tire-fee');
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(1586.3);
  });
  it('renewal one year later: 90% of the base tax', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'mv-tax')).toBe(522);
    expect(amt(r, 'mv-fee')).toBe(20);
    expect(ids(r)).not.toContain('sales-tax');
  });
  it('14 years old: no motor vehicle tax, $7 fee at 35%', () => {
    const r = engine({ ...RENEW_1, modelYear: 2013 }, d);
    expect(ids(r)).not.toContain('mv-tax');
    expect(amt(r, 'mv-fee')).toBe(7);
  });
  it('model newer than the year: 95% at the first renewal', () => { expect(amt(engine({ ...RENEW_1, modelYear: 2027 }, d), 'mv-tax')).toBe(551); });
  it('rural address: no local tax', () => { expect(ids(engine({ ...NEW_CAR, county: 'none' }, d))).not.toContain('local-tax'); });
});
