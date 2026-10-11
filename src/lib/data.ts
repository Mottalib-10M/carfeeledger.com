/**
 * Server-side access to the state data files (src/data/states/<ab>.json) and the site parameters.
 * Calculators never import this file: they receive the state file they need as a prop.
 */
import P from '../data/params-2026.json';
import { STATE_DATA, STATE_CODES, engineFor } from './engine/registry';
import { runCalc, renewalYear } from './engine/calc';
import type { StateData, VehicleInput } from './engine/types';

export { P, STATE_DATA, STATE_CODES, engineFor };
export interface StateRef { ab: string; slug: string; name: string; abbr: string }
export const STATE_LIST: StateRef[] = STATE_CODES.map((ab) => ({ ab, slug: STATE_DATA[ab].slug, name: STATE_DATA[ab].name, abbr: STATE_DATA[ab].abbr }));
export const bySlug = (slug: string): StateData => {
  const d = Object.values(STATE_DATA).find((x) => x.slug === slug);
  if (!d) throw new Error(`Unknown state ${slug}`);
  return d;
};
export const abOf = (slug: string) => bySlug(slug).abbr.toLowerCase();

/** The reference vehicle of every comparison on the site (params-2026.json > reference). */
export const REF: VehicleInput = { ...(P.reference.vehicle as unknown as VehicleInput) };
export const refInput = (over: Partial<VehicleInput> = {}): VehicleInput => ({ ...REF, ...over });

/** Full calculation for one state (default county, reference vehicle unless overridden). */
export function calcState(slug: string, over: Partial<VehicleInput> = {}) {
  const d = bySlug(slug); const ab = d.abbr.toLowerCase();
  return runCalc(refInput(over), d, engineFor(ab));
}
export function renewState(slug: string, years: number, over: Partial<VehicleInput> = {}) {
  const d = bySlug(slug); const ab = d.abbr.toLowerCase();
  return renewalYear(refInput(over), d, engineFor(ab), years);
}
