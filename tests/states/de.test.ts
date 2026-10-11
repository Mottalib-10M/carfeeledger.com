import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/de.json';
import engine, { documentFee } from '../../src/lib/engine/states/de';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const p = { under400: 8, upTo500: 13.75, per100: 5.25 };
describe('Delaware', () => {
  it('new $35,000 car: document fee $1,825, title $35, registration $40, no inspection', () => {
    const r = engine(NEW_CAR, d);
    // 30 Del. C. § 3002(c): 13.75 + 5.25 x ceil((35,000 - 500) / 100) = 13.75 + 5.25 x 345 = 1,825.00
    expect(amt(r, 'sales-tax')).toBe(1825);
    expect(amt(r, 'title')).toBe(35);
    expect(amt(r, 'reg')).toBe(40);
    expect(ids(r)).not.toContain('ev');
    expect(ids(r)).not.toContain('inspection'); // first seven model years exempt
  });
  it('used 2021 EV bought privately: fee $933, alternative fuel fee $110', () => {
    const r = engine(USED_EV, d);
    // 13.75 + 5.25 x ceil(17,500 / 100) = 13.75 + 918.75 = 932.50, rounded to the nearest dollar = 933
    expect(amt(r, 'sales-tax')).toBe(933);
    expect(amt(r, 'ev')).toBe(110);
    expect(amt(r, 'reg')).toBe(40);
    expect(ids(r)).not.toContain('inspection'); // 2021 model in 2026 = 5 years
  });
  it('renewal: $40 only, no document fee or title', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg']);
    expect(amt(r, 'reg')).toBe(40);
  });
  it('trade-in lowers the purchase price', () => {
    // 35,000 - 10,000 = 25,000: 13.75 + 5.25 x 245 = 1,300.00
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1300);
  });
  it('statutory steps: $8 under $400, $13.75 up to $500, fraction of $100 counts as $100', () => {
    expect(documentFee(p, 350)).toBe(8);
    expect(documentFee(p, 500)).toBe(13.75);
    expect(documentFee(p, 501)).toBe(19); // 13.75 + 5.25 = 19.00
    expect(documentFee(p, 600)).toBe(19);
    expect(documentFee(p, 601)).toBe(24); // 13.75 + 10.50 = 24.25 -> 24
  });
  it('plug-in hybrid $85, hybrid $60', () => {
    expect(amt(engine({ ...NEW_CAR, fuel: 'phev' }, d), 'ev')).toBe(85);
    expect(amt(engine({ ...NEW_CAR, fuel: 'hybrid' }, d), 'ev')).toBe(60);
  });
  it('2012 car: free inspection every two years', () => {
    const r = engine({ ...RENEW_1, modelYear: 2012 }, d);
    expect(amt(r, 'inspection')).toBe(0);
    expect(r.lines.find((l) => l.id === 'inspection')?.years).toBe(2);
  });
});
