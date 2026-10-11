/**
 * One page = ONE content file (CONTRIBUTING-PAGES.md):
 *  - a calculator or guide page: `src/content/pages/<id>.ts` (PageDef), with its calculator (`tool`);
 *  - a state page: `src/content/states/<slug>.ts` (StateDef). The figures, tables and the calculator of a
 *    state page come from `src/data/states/<ab>.json` and its engine; the file holds only the prose.
 */
import type { Kit } from './kit';
export interface FAQ { q: string; a: string }
export interface Helpers extends Kit {
  /** Internal link by page id ("car-sales-tax-calculator", "state:texas", "method"…). Unknown id fails the tests. */
  a: (id: string, text: string) => string;
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link to a site source (params-2026.json key) or a state source ("tx:cpa-tax"). */
  src: (key: string, text?: string) => string;
  ext: (url: string, text: string) => string;
  box: (title: string, html: string) => string;
  mini: (kind: string, arg?: unknown) => string;
}
export type Group = 'fees' | 'buying' | 'owning';
export type ToolKind = 'fees' | 'tax' | 'otd' | 'title' | 'renewal' | 'inspection' | 'ev' | 'docfee' | 'property' | 'registration' | 'loan' | 'tco';
export interface PageDef {
  id: string; group: Group; order: number;
  /** URL segment, lowercase and dashes, no year. */
  slug: string; nav: string; card: string;
  /** 50 to 60 characters, key term first, 2026 included (RECETTE §11). */
  title: string;
  /** 150 to 160 characters, 2026 included. */
  description: string;
  h1: string; intro: string;
  /** ONE paragraph of 120 words or more: the direct answer with the figures (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  body: (h: Helpers) => string;
  tool: ToolKind;
  /** Default state of the calculator (slug). */
  state?: string;
  /** Show the 51-row comparison table of this page (generated). */
  table?: 'registration' | 'tax' | 'inspection' | 'ev' | 'docfee' | 'property' | 'title' | 'renewal' | 'otd';
  related: string[];
  /** Keys of params-2026.json > sources, or "<ab>:<key>" for a state source. */
  sources: string[];
}
export const definePage = (p: PageDef): PageDef => p;
export interface StateDef {
  /** = file name = state slug. */
  slug: string;
  /** 50 to 60 characters, 2026 included. */
  title: string;
  /** 150 to 160 characters, 2026 included, at least one figure computed by the engine. */
  description: string;
  h1: string;
  intro: string;
  /** ONE paragraph of 120 words or more. */
  resume: string;
  /** Prose written for this state only (the generated breakdown and tables are added by the component). */
  body: (h: Helpers) => string;
  faqs: FAQ[];
  related: string[];
}
export const defineState = (s: StateDef): StateDef => s;
