/** Registry: every file of `src/content/pages/` and `src/content/states/` is loaded here. */
import type { PageDef, StateDef } from './page-types';
import { STATE_LIST } from './data';
const mods = import.meta.glob<{ default: PageDef }>(['../content/pages/*.ts', '!../content/pages/_*.ts'], { eager: true });
export const PAGES: PageDef[] = Object.entries(mods).map(([file, m]) => {
  const g = m.default; const base = file.split('/').pop()!.replace(/\.ts$/, '');
  if (g.id !== base) throw new Error(`${file}: id "${g.id}" differs from the file name`);
  return g;
}).sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
export const pageById = (id: string) => PAGES.find((p) => p.id === id);
const smods = import.meta.glob<{ default: StateDef }>(['../content/states/*.ts', '!../content/states/_*.ts'], { eager: true });
export const STATE_PAGES: StateDef[] = Object.entries(smods).map(([file, m]) => {
  const g = m.default; const base = file.split('/').pop()!.replace(/\.ts$/, '');
  if (g.slug !== base) throw new Error(`${file}: slug "${g.slug}" differs from the file name`);
  if (!STATE_LIST.some((s) => s.slug === g.slug)) throw new Error(`${file}: no data file for this state`);
  return g;
}).sort((a, b) => a.slug.localeCompare(b.slug));
/** Id of a state page: "state:<slug>". */
export const stateId = (slug: string) => `state:${slug}`;
export const statePageById = (id: string) => STATE_PAGES.find((p) => stateId(p.slug) === id);
/** State pages live under the registration-fees hub page. */
export const STATE_HUB = 'car-registration-fees';
