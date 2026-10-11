import type { VehicleInput } from '../../src/lib/engine/types';
/** Case (b) of the brief: new gasoline car from a dealer, $35,000, 3,500 lb, model year 2026. */
export const NEW_CAR: VehicleInput = {
  price: 35000, tradeIn: 0, modelYear: 2026, year: 2026, weightLbs: 3500, fuel: 'gas', body: 'car',
  condition: 'new', seller: 'dealer', county: '', localRateOverride: null, msrp: 0, docFee: 0, transaction: 'purchase', ownedYears: 0,
};
/** Case (c): used EV from a private seller, $18,000, 4,200 lb, model year 2021. */
export const USED_EV: VehicleInput = { ...NEW_CAR, price: 18000, weightLbs: 4200, modelYear: 2021, fuel: 'ev', condition: 'used', seller: 'private' };
/** Case (d): renewal of NEW_CAR one year later. */
export const RENEW_1: VehicleInput = { ...NEW_CAR, transaction: 'renewal', condition: 'used', year: 2027, ownedYears: 1 };
export const amt = (r: { lines: { id: string; amount: number | null }[] }, id: string) => r.lines.find((l) => l.id === id)?.amount;
export const ids = (r: { lines: { id: string }[] }) => r.lines.map((l) => l.id);
