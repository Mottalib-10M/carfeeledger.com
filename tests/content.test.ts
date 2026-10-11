/**
 * Self-check of every state page file (src/content/states/<slug>.ts) before the build:
 * title 50-60 chars, description 150-160 chars, resume >= 120 words, 3 to 5 FAQs of 40 to 90 words,
 * body >= 250 words, known links and sources, FAQ questions unique across the site.
 * STATE=<slug>,<slug> limits it to some pages.
 */
import { describe, expect, it } from 'vitest';
import { STATE_PAGES, PAGES } from '../src/lib/pages';
import { helpers } from '../src/lib/helpers';
import { STATE_LIST } from '../src/lib/data';

const words = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const ONLY = process.env.STATE ? process.env.STATE.split(',') : null;
const allQ = [...PAGES.flatMap((p) => p.faqs.map((f) => f.q)), ...STATE_PAGES.flatMap((p) => p.faqs.map((f) => f.q))];

for (const p of STATE_PAGES) {
  if (ONLY && !ONLY.includes(p.slug)) continue;
  describe(`page ${p.slug}`, () => {
    it('title, description, resume', () => {
      expect(p.title.length, `title "${p.title}"`).toBeGreaterThanOrEqual(50);
      expect(p.title.length, `title "${p.title}"`).toBeLessThanOrEqual(60);
      expect(p.title).toContain('2026');
      expect(p.description.length, `description (${p.description.length}) "${p.description}"`).toBeGreaterThanOrEqual(150);
      expect(p.description.length, `description (${p.description.length}) "${p.description}"`).toBeLessThanOrEqual(160);
      expect(p.description).toContain('2026');
      expect(words(p.resume), 'resume words').toBeGreaterThanOrEqual(120);
      expect(p.resume).not.toMatch(/NaN|undefined|\$0\.00/);
    });
    it('body and FAQ', () => {
      const body = p.body(helpers());
      expect(words(body), 'body words').toBeGreaterThanOrEqual(250);
      expect(body).not.toMatch(/NaN|undefined/);
      expect(p.faqs.length).toBeGreaterThanOrEqual(3);
      expect(p.faqs.length).toBeLessThanOrEqual(5);
      for (const f of p.faqs) {
        const n = words(f.a);
        expect(n, `FAQ "${f.q}" has ${n} words`).toBeGreaterThanOrEqual(40);
        expect(n, `FAQ "${f.q}" has ${n} words`).toBeLessThanOrEqual(90);
        expect(allQ.filter((q) => q === f.q).length, `FAQ question used twice: ${f.q}`).toBe(1);
      }
    });
    it('related ids exist', () => {
      const ok = new Set([...PAGES.map((x) => x.id), ...STATE_LIST.map((s) => `state:${s.slug}`), 'method', 'about']);
      for (const r of p.related) expect(ok.has(r), `related ${r}`).toBe(true);
    });
  });
}
