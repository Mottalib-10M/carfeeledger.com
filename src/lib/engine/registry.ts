/** Eager registry for the build and the tests (never imported by client islands: they lazy-load one state). */
import type { StateData, StateEngine } from './types';
import generic from './generic';

const dataMods = import.meta.glob('../../data/states/*.json', { eager: true, import: 'default' }) as Record<string, StateData>;
const engineMods = import.meta.glob('./states/*.ts', { eager: true, import: 'default' }) as Record<string, StateEngine>;

const key = (p: string) => p.split('/').pop()!.replace(/\.(json|ts)$/, '');
export const STATE_DATA: Record<string, StateData> = Object.fromEntries(Object.entries(dataMods).map(([p, d]) => [key(p), d]));
export const STATE_ENGINES: Record<string, StateEngine> = Object.fromEntries(Object.entries(engineMods).map(([p, e]) => [key(p), e]));
/** Engine of a state: its own file, else the generic engine driven by params.g. */
export const engineFor = (ab: string): StateEngine => STATE_ENGINES[ab] ?? generic;
export const STATE_CODES = Object.keys(STATE_DATA).sort((a, b) => STATE_DATA[a].name.localeCompare(STATE_DATA[b].name));
