import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/nj.json';
import engine from '../../src/lib/engine/states/nj';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
describe('New Jersey', () => {
  it('MVC table: yearly fees $46.50 / $59.00 / $71.50 / $84.00', () => {
    expect(amt(engine({ ...RENEW_1, weightLbs: 3000, modelYear: 2020 }, d), 'reg')).toBe(46.5); // 32 + 7.5 + 7
    expect(amt(engine({ ...RENEW_1, weightLbs: 3000 }, d), 'reg')).toBe(59); // + 12.5 within 2 years
    expect(amt(engine({ ...RENEW_1, weightLbs: 3600, modelYear: 2020 }, d), 'reg')).toBe(71.5);
    expect(amt(engine({ ...RENEW_1, weightLbs: 3600 }, d), 'reg')).toBe(84);
  });
  it('new car under 3,500 lb: four-year registration per the MVC calculator = $211', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'reg')).toBe(211); // 32x4 + 7.5x4 + 12.5x2 + 7x4
    expect(amt(r, 'sales-tax')).toBe(2318.75); // 35,000 x 6.625%
    expect(amt(r, 'title')).toBe(60);
  });
  it('new EV over 3,500 lb in 2026: $311 + ZEV fees 2026-2029 = 270+280+290+290', () => {
    const r = engine({ ...NEW_CAR, fuel: 'ev', weightLbs: 4200 }, d);
    expect(amt(r, 'reg')).toBe(311);
    expect(amt(r, 'ev')).toBe(1130);
  });
  it('used EV private sale: yearly ZEV fee $270, no inspection', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'ev')).toBe(270);
    expect(ids(r)).not.toContain('inspection');
  });
  it('a 2019 gasoline car is past the five-year exemption', () => {
    expect(ids(engine({ ...RENEW_1, modelYear: 2019 }, d))).toContain('inspection');
  });
});
