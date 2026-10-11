import { route, type Locale } from './routes';
import { PAGES, pageById, statePageById, stateId, STATE_PAGES } from '../lib/pages';
import { STATE_LIST } from '../lib/data';
import type { Group } from '../lib/page-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<string, string> = { home: 'Car fees by state', method: 'How the fees are calculated', about: 'About', widget: 'Embed the calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' };
export const GROUPS: Array<{ id: Group; label: string }> = [
  { id: 'fees', label: 'DMV fees' },
  { id: 'buying', label: 'Buying a car' },
  { id: 'owning', label: 'Owning a car' },
];
const nameOf = (slug: string) => STATE_LIST.find((s) => s.slug === slug)?.name ?? slug;
export const label = (id: string, _lang?: Locale) => {
  if (CORE[id]) return CORE[id];
  const p = pageById(id); if (p) return p.nav;
  const s = statePageById(id); if (s) return `${nameOf(s.slug)} car fees`;
  return id;
};
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id) });
export const inGroup = (g: Group, lang: Locale): NavLink[] => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: g.label, links: inGroup(g.id, lang) })).filter((c) => c.links.length);
}
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.map((g) => ({ label: g.label, links: inGroup(g.id, lang) })).filter((c) => c.links.length),
  { label: 'This site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
/** The ten most populous states in the footer row; every state page is two clicks away through the hub. */
const TOP = ['california', 'texas', 'florida', 'new-york', 'pennsylvania', 'illinois', 'ohio', 'georgia', 'north-carolina', 'michigan'];
export const popularLinks = (lang: Locale): NavLink[] => TOP.filter((s) => STATE_PAGES.some((p) => p.slug === s)).map((s) => ({ href: route(stateId(s), lang), label: nameOf(s) }));
