/** Cross-state figures for the prose (server side): always computed from the engines, never typed. */
import { STATE_LIST, STATE_DATA, calcState, renewState } from './data';
import type { FeeLine, StateSummary } from './engine/types';
const sumK = (ls: FeeLine[], ks: string[]) => ls.filter((l) => ks.includes(l.kind) && l.amount !== null).reduce((s, l) => s + (l.amount as number), 0);
export const REG_KINDS = ['registration', 'plate', 'local', 'value', 'ev'];
export interface Row { name: string; slug: string; abbr: string; value: number }
export function rank(f: (slug: string) => number): Row[] {
  return STATE_LIST.map((s) => ({ name: s.name, slug: s.slug, abbr: s.abbr, value: f(s.slug) })).sort((a, b) => a.value - b.value);
}
export const regBill = (slug: string) => sumK(calcState(slug).lines, REG_KINDS);
export const taxOf = (slug: string, over = {}) => sumK(calcState(slug, over).lines, ['tax']);
export const renewOf = (slug: string, over = {}) => renewState(slug, 1, over).perYear;
export const atPurchase = (slug: string, over = {}) => calcState(slug, over).atPurchase;
export const summaries = () => STATE_LIST.map((s) => ({ ...s, S: STATE_DATA[s.ab].summary as StateSummary }));
export const count = (pred: (S: StateSummary) => boolean) => summaries().filter((x) => pred(x.S)).length;
export const which = (pred: (S: StateSummary) => boolean) => summaries().filter((x) => pred(x.S)).map((x) => x.name);
export const N = () => STATE_LIST.length;
export const median = (xs: number[]) => { const a = [...xs].sort((x, y) => x - y); const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
