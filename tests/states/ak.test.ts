import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/ak.json';
import engine from '../../src/lib/engine/states/ak';
import { runCalc } from '../../src/lib/engine/calc';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;

describe('Alaska', () => {
  it('new car in Anchorage: $15 title, $100 two-year registration, $150 registration tax, no sales tax', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'title')).toBe(15);
    expect(amt(r, 'reg')).toBe(100);
    expect(r.lines.find((l) => l.id === 'reg')?.years).toBe(2);
    expect(amt(r, 'mvrt')).toBe(150); // 2026 model year in 2026: first column of the Anchorage schedule
    expect(ids(r)).not.toContain('local-tax');
    expect(runCalc({ ...NEW_CAR, docFee: -1 }, d, engine).atPurchase).toBe(265); // 15 + 100 + 150, no doc fee default
  });
  it('used EV bought privately: only the title, the registration transfers', () => {
    const r = engine(USED_EV, d);
    expect(ids(r)).toEqual(['title']);
    expect(runCalc({ ...USED_EV, docFee: -1 }, d, engine).atPurchase).toBe(15);
  });
  it('renewal (2027): $100 and the second-year Anchorage tax of $140', () => {
    const r = engine(RENEW_1, d);
    expect(amt(r, 'reg')).toBe(100);
    expect(amt(r, 'mvrt')).toBe(140);
    expect(ids(r)).not.toContain('title');
  });
  it('eighth year or older: $70 in Anchorage, $30 in the Kenai Peninsula Borough, $70 flat in Juneau', () => {
    const old = { ...RENEW_1, modelYear: 2015 };
    expect(amt(engine(old, d), 'mvrt')).toBe(70);
    expect(amt(engine({ ...old, county: 'kenai' }, d), 'mvrt')).toBe(30);
    expect(amt(engine({ ...NEW_CAR, county: 'juneau' }, d), 'mvrt')).toBe(70);
  });
  it('Fairbanks: no registration tax, local sales tax line without amount on a dealer sale', () => {
    const r = engine({ ...NEW_CAR, county: 'fairbanks' }, d);
    expect(ids(r)).not.toContain('mvrt');
    expect(r.lines.find((l) => l.id === 'local-tax')?.amount).toBeNull();
  });
});
