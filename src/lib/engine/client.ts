/** Client-side access: engines are bundled (small), state data files load on demand (one chunk each). */
import type { StateData, StateEngine } from './types';
import generic from './generic';
const engines = import.meta.glob('./states/*.ts', { eager: true, import: 'default' }) as Record<string, StateEngine>;
const loaders = import.meta.glob('../../data/states/*.json', { import: 'default' }) as Record<string, () => Promise<StateData>>;
export const engineOf = (ab: string): StateEngine => engines[`./states/${ab}.ts`] ?? generic;
export const loadState = (ab: string): Promise<StateData> => loaders[`../../data/states/${ab}.json`]();
