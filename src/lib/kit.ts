/**
 * Writing kit: every figure a page writes comes from here (state data files, engines, params),
 * never typed by hand (RECETTE §17.4 point 7). Server side only.
 */
import { usd, num, pct, day, listOf } from './fmt';
import { P, STATE_LIST, bySlug, calcState, renewState, REF, refInput } from './data';
import * as ST from './stats';

export const KIT = {
  usd, num, pct, day, listOf, P,
  states: STATE_LIST,
  /** Full data file of a state (summary, params, sources, singular facts). */
  data: bySlug,
  /** Engine result for the reference vehicle (or overrides) in a state. */
  calc: calcState,
  /** Yearly renewal cost after n years of ownership. */
  renew: renewState,
  ref: REF,
  /** Cross-state rankings and counts. */
  st: ST,
  refInput,
  /** Rate as "6.25%" without trailing zeros. */
  rate: (x: number) => `${+(x * 100).toFixed(3)}%`,
};
export type Kit = typeof KIT;
