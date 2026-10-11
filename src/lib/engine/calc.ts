import type { FeeLine, StateData, StateEngine, StateResult, VehicleInput } from './types';
import { cents, line } from './helpers';

export interface CalcResult extends StateResult {
  /** Paid when the car is bought (non-deferred lines with an amount). */
  atPurchase: number;
  /** Everything due in the first 12 months, deferred lines included. */
  firstYear: number;
  /** Lines that have no exact amount (range or unpriced), listed apart and never added to totals. */
  unpriced: FeeLine[];
  /** Price + atPurchase - trade-in: the out-the-door amount. */
  outTheDoor: number;
  docFee: number;
}

/** Default dealer doc fee: the state cap when there is one, otherwise 0 (the visitor types the dealer's figure). */
export function defaultDocFee(d: StateData) {
  return d.summary.docFeeCap ?? d.summary.docFeeDefault ?? 0;
}

/**
 * Runs a state engine and adds what is common to every state: the dealer documentation fee line and the totals.
 * input.docFee < 0 means "use the default for this state".
 */
export function runCalc(input: VehicleInput, d: StateData, engine: StateEngine): CalcResult {
  const docFee = input.seller === 'dealer' && input.transaction === 'purchase' ? (input.docFee < 0 ? defaultDocFee(d) : input.docFee) : 0;
  const i: VehicleInput = { ...input, docFee };
  const r = engine(i, d);
  const lines = [...r.lines];
  if (docFee > 0) {
    lines.push(line({ id: 'doc-fee', label: d.summary.docFeeCap !== null ? `Dealer documentation fee (capped at $${d.summary.docFeeCap})` : d.summary.docFeeDefault ? `Dealer documentation fee (no cap; $${d.summary.docFeeDefault} reference)` : 'Dealer documentation fee', kind: 'dealer', amount: docFee, when: 'once', source: d.sources['doc-fee'] ? 'doc-fee' : Object.keys(d.sources)[0] }));
  }
  const priced = lines.filter((l) => l.amount !== null);
  const atPurchase = cents(priced.filter((l) => !l.deferred).reduce((s, l) => s + (l.amount as number), 0));
  const firstYear = cents(priced.reduce((s, l) => s + (l.amount as number), 0));
  const unpriced = lines.filter((l) => l.amount === null);
  const outTheDoor = i.transaction === 'purchase' ? cents(i.price + atPurchase - i.tradeIn) : atPurchase;
  return { lines, notes: r.notes, atPurchase, firstYear, unpriced, outTheDoor, docFee };
}

/** Yearly running cost in a later year: the renewal lines, each divided by its cycle length. */
export function renewalYear(input: VehicleInput, d: StateData, engine: StateEngine, ownedYears: number) {
  const i: VehicleInput = { ...input, transaction: 'renewal', condition: 'used', ownedYears, year: input.year + ownedYears, docFee: 0 };
  const r = engine(i, d);
  const priced = r.lines.filter((l) => l.amount !== null);
  return { lines: r.lines, perYear: cents(priced.reduce((s, l) => s + (l.amount as number) / (l.years ?? 1), 0)), unpriced: r.lines.filter((l) => l.amount === null) };
}
