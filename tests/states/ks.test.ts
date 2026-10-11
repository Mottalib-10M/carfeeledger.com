import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ks.json';
import engine from '../../src/lib/engine/states/ks';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('Kansas', () => {
  it('new car in Johnson County: 6.5% + 1.475%, $10 title, 50¢ plate, $30 + $5 + $4', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2275); // 35,000 x 6.5%
    expect(amt(r, 'local-tax')).toBe(516.25); // 35,000 x 1.475%
    expect(amt(r, 'title')).toBe(10);
    expect(amt(r, 'plate')).toBe(0.5);
    expect(amt(r, 'reg')).toBe(30); // 3,500 lb: 4,500 lb or less
    expect(amt(r, 'service-fee')).toBe(5);
    expect(amt(r, 'modernization')).toBe(4);
    expect(r.lines.find((l) => l.id === 'county-fee')?.range).toEqual([0, 5]);
    expect(amt(r, 'property-tax')).toBeNull();
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(2840.75); // no cap: no default doc fee
  });
  it('used EV from a private seller: sales tax still due, EV registration $165', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1170); // 18,000 x 6.5%
    expect(amt(r, 'local-tax')).toBe(265.5); // 18,000 x 1.475%
    expect(amt(r, 'reg')).toBe(165);
  });
  it('renewal: registration, service and modernization fees, county fee range, property tax', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'service-fee', 'modernization', 'county-fee', 'property-tax']);
    expect(amt(r, 'reg')).toBe(30);
  });
  it('weight and fuel rules of K.S.A. 8-143', () => {
    expect(amt(engine({ ...NEW_CAR, weightLbs: 4600 }, d), 'reg')).toBe(40);
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'reg')).toBe(70);
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'reg')).toBe(100);
    expect(amt(engine({ ...NEW_CAR, body: 'truck', weightLbs: 5200, fuel: 'hybrid' }, d), 'reg')).toBe(125);
    expect(amt(engine({ ...NEW_CAR, body: 'truck', weightLbs: 5200 }, d), 'reg')).toBe(40);
  });
  it('trade-in deducted, administrative (doc) fee taxed, Sedgwick and other counties', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1625); // 25,000 x 6.5%
    expect(amt(engine({ ...NEW_CAR, docFee: 400 }, d), 'sales-tax')).toBe(2301); // 35,400 x 6.5%
    expect(amt(engine({ ...NEW_CAR, county: 'sedgwick-county' }, d), 'local-tax')).toBe(350); // 1%
    expect(ids(engine({ ...NEW_CAR, county: 'other' }, d))).not.toContain('local-tax');
    expect(amt(engine({ ...NEW_CAR, county: 'other', localRateOverride: 0.0275 }, d), 'local-tax')).toBe(962.5);
  });
});
