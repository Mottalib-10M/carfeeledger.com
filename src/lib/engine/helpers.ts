import type { CountyEntry, FeeLine, StateData, VehicleInput } from './types';

/** Round to cents (half away from zero), the way DMV receipts show amounts. */
export const cents = (x: number) => Math.round((x + Number.EPSILON) * 100) / 100;
/** Round up to the next whole dollar (several states round value-based fees up). */
export const ceilDollar = (x: number) => Math.ceil(cents(x) - 1e-9);
/** Round to the nearest whole dollar. */
export const roundDollar = (x: number) => Math.round(x + Number.EPSILON);

/** Age of the vehicle in the transaction year, counted the way most states do: year - modelYear (a 2026 model in 2026 = 0). */
export const age = (i: VehicleInput) => Math.max(0, i.year - i.modelYear);

/** The county entry selected by the user, or the state's default county. */
export function county(i: VehicleInput, d: StateData): CountyEntry | undefined {
  if (!d.counties?.length) return undefined;
  return d.counties.find((c) => c.id === i.county) ?? d.counties.find((c) => c.id === d.defaultCounty) ?? d.counties[0];
}

/** Local rate: the user's override if typed, else the county's localRate, else 0. */
export function localRate(i: VehicleInput, d: StateData): number {
  if (i.localRateOverride !== null && Number.isFinite(i.localRateOverride)) return i.localRateOverride;
  const c = county(i, d);
  return typeof c?.localRate === 'number' ? c.localRate : 0;
}

/**
 * Taxable price of a purchase: price (+ doc fee if taxable) - trade-in (if the state credits it).
 * Never below zero.
 */
export function taxableBase(i: VehicleInput, opts: { tradeInCredit: boolean; docFeeTaxable: boolean }): number {
  let base = i.price + (opts.docFeeTaxable ? i.docFee : 0);
  if (opts.tradeInCredit) base -= i.tradeIn;
  return Math.max(0, base);
}

/** Look up a bracket table [{ upTo, amount }] sorted ascending; the last entry may use upTo: null for "and above". */
export function bracket<T extends { upTo: number | null }>(table: T[], x: number): T {
  for (const row of table) if (row.upTo === null || x <= row.upTo) return row;
  return table[table.length - 1];
}

/** Shorthand to build a line; amount is rounded to cents. */
export function line(l: FeeLine): FeeLine {
  return { ...l, amount: l.amount === null ? null : cents(l.amount) };
}

/** Purchase mode returns every line; renewal mode keeps only the lines that recur. */
export function forTransaction(i: VehicleInput, lines: FeeLine[]): FeeLine[] {
  return i.transaction === 'renewal' ? lines.filter((l) => l.when === 'cycle') : lines;
}
