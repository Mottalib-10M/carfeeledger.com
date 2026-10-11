/** Structural checks run on EVERY state data file: shape, sources, engine output on the three fixture cars. */
import { describe, expect, it } from 'vitest';
import { STATE_DATA, engineFor } from '../../src/lib/engine/registry';
import { runCalc } from '../../src/lib/engine/calc';
import { NEW_CAR, RENEW_1, USED_EV } from './_fixture';

const KEYS = ['abbr', 'name', 'slug', 'agency', 'verified', 'exactness', 'gaps', 'summary', 'params', 'singular', 'sources'];
const SUM = ['stateRate', 'localRange', 'taxName', 'tradeInCredit', 'titleFee', 'regMethod', 'regYears', 'docFeeCap', 'docFeeNote', 'evFee', 'phevFee', 'hybridFee', 'inspection', 'inspectionWhere', 'inspectionFee', 'annualValueTax'];
const ONLY = process.env.STATE ? process.env.STATE.split(',') : null;

for (const [ab, d] of Object.entries(STATE_DATA)) {
  if (ONLY && !ONLY.includes(ab)) continue;
  describe(`${ab} structure`, () => {
    it('has every required key and summary field', () => {
      for (const k of KEYS) expect(d, `${ab}.${k}`).toHaveProperty(k);
      for (const k of SUM) expect(d.summary, `${ab}.summary.${k}`).toHaveProperty(k);
      expect(d.abbr.toLowerCase()).toBe(ab);
      expect(d.slug).toMatch(/^[a-z-]+$/);
      expect(['exact', 'partial']).toContain(d.exactness);
      if (d.exactness === 'partial') expect(d.gaps.length).toBeGreaterThan(0);
      expect(d.singular.length).toBeGreaterThanOrEqual(5);
    });
    it('every source has a name, an https url, an access date and is used', () => {
      for (const [k, s] of Object.entries(d.sources)) {
        expect(s.name, k).toBeTruthy();
        expect(s.url, k).toMatch(/^https:\/\//);
        expect(s.accessed, k).toMatch(/^2026-\d\d-\d\d$/);
      }
      for (const f of d.singular) {
        const m = f.match(/\[([a-z0-9-]+)\]\.?\s*$/i);
        expect(m, `singular without [source]: ${f}`).toBeTruthy();
        expect(d.sources, `unknown source ${m![1]}`).toHaveProperty(m![1]);
      }
    });
    if (d.counties?.length) it('default county exists, ids unique', () => {
      const ids = d.counties!.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
      if (d.defaultCounty) expect(ids).toContain(d.defaultCounty);
      for (const c of d.counties!) if (c.localRate !== undefined) { expect(c.localRate).toBeGreaterThanOrEqual(0); expect(c.localRate).toBeLessThan(0.08); }
    });
    for (const [name, car] of [['new car', NEW_CAR], ['used EV private', USED_EV], ['renewal', RENEW_1], ['new truck 5,200 lb hybrid', { ...NEW_CAR, body: 'truck', weightLbs: 5200, fuel: 'hybrid' }], ['used 2012 car', { ...NEW_CAR, condition: 'used', modelYear: 2012, price: 6000, tradeIn: 2000 }]] as const) {
      it(`engine output is sane: ${name}`, () => {
        const r = runCalc({ ...car, docFee: -1 }, d, engineFor(ab));
        expect(r.lines.length).toBeGreaterThan(0);
        const ids = r.lines.map((l) => l.id);
        expect(new Set(ids).size, `duplicate line ids ${ids}`).toBe(ids.length);
        for (const l of r.lines) {
          expect(d.sources, `${l.id} cites unknown source ${l.source}`).toHaveProperty(l.source);
          if (l.amount !== null) { expect(Number.isFinite(l.amount), l.id).toBe(true); expect(l.amount, l.id).toBeGreaterThanOrEqual(0); }
          if (l.range) expect(l.range[0]).toBeLessThanOrEqual(l.range[1]);
        }
        expect(Number.isFinite(r.atPurchase)).toBe(true);
        if (car.transaction === 'purchase') expect(r.atPurchase).toBeLessThan(car.price * 0.25 + 3000);
      });
    }
  });
}
