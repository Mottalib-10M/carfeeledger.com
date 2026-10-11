/** Title 50-60 and description 150-160 characters on every calculator and guide page (RECETTE §11). */
import { describe, expect, it } from 'vitest';
import { PAGES } from '../src/lib/pages';
import { HOME } from '../src/content/home';
describe('page snippets', () => {
  for (const p of [...PAGES, { id: 'home', title: HOME.title, description: HOME.description }]) it(p.id, () => {
    expect(p.title.length, p.title).toBeGreaterThanOrEqual(50); expect(p.title.length, p.title).toBeLessThanOrEqual(60);
    expect(p.description.length, `${p.description.length} ${p.description}`).toBeGreaterThanOrEqual(150);
    expect(p.description.length, `${p.description.length} ${p.description}`).toBeLessThanOrEqual(160);
  });
});
