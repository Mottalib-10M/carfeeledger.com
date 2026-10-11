import { describe, expect, it } from 'vitest';
import data from '../../src/data/states/vt.json';
import engine from '../../src/lib/engine/generic';
import type { StateData } from '../../src/lib/engine/types';
import { NEW_CAR, RENEW_1, USED_EV, amt, ids } from './_fixture';
const d = data as unknown as StateData;
const total = (r: { lines: { id: string; amount: number | null; kind: string }[] }, kinds: string[]) => r.lines.filter((l) => kinds.includes(l.kind)).reduce((s, l) => s + (l.amount ?? 0), 0);
describe('Vermont', () => {
  it('new gas car: 6% = $2,100, $42 title, $91 registration ($89 + $2 Clean Air)', () => {
    const r = engine(NEW_CAR, d);
    expect(amt(r, 'sales-tax')).toBe(2100);
    expect(amt(r, 'title')).toBe(42);
    expect(amt(r, 'reg')! + amt(r, 'clean-air')!).toBe(91);
    expect(r.lines.find((l) => l.id === 'inspection')?.amount).toBeNull();
  });
  it('battery electric: $89 + $89 infrastructure = $178, no Clean Air fee', () => {
    const r = engine(USED_EV, d);
    expect(amt(r, 'sales-tax')).toBe(1080); // 18,000 x 6%
    expect(ids(r)).not.toContain('clean-air');
    expect(total(r, ['registration', 'ev'])).toBe(178);
  });
  it('plug-in hybrid: $89 + $2 + $44.50 = $135.50', () => {
    expect(total(engine({ ...NEW_CAR, fuel: 'phev' }, d), ['registration', 'ev'])).toBe(135.5);
  });
  it('trade-in subtracted: (35,000 - 10,000) x 6% = $1,500', () => {
    expect(amt(engine({ ...NEW_CAR, tradeIn: 10000 }, d), 'sales-tax')).toBe(1500);
  });
  it('renewal: $91 and the yearly inspection, no tax or title', () => {
    const r = engine(RENEW_1, d);
    expect(ids(r)).toEqual(['reg', 'clean-air', 'inspection']);
  });
});
