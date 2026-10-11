/**
 * Generic engine for states whose rules fit a declarative description in params.g (see GParams).
 * A state with a formula this cannot express gets its own file in ./states/<ab>.ts instead.
 */
import type { FeeLine, LineKind, StateEngine, VehicleInput } from './types';
import { age, bracket, county, forTransaction, line, localRate, taxableBase } from './helpers';

type Cond = { countyFlag?: string; new?: boolean; used?: boolean; dealer?: boolean; private?: boolean; fuel?: string[]; minAge?: number; maxAge?: number; maxWeight?: number; minWeight?: number; body?: string };
type Fixed = { id: string; label: string; amount: number; kind?: LineKind; source: string; if?: Cond; note?: string; years?: number };
type Br = { upTo: number | null; amount: number };
export interface GParams {
  tax: {
    label: string; rate: number; tradeInCredit: boolean; docFeeTaxable: boolean; source: string;
    /** Local rate (county) applies only to the first $X of the taxable price (FL $5,000, TN $1,600). */
    localFirst?: number;
    /** Maximum tax (state part). */
    cap?: number;
    /** Minimum tax (state part), when the state sets one. */
    minTax?: number;
    /** Rate used instead on a private sale (some states). */
    privateRate?: number;
    /** Tax charged on a used vehicle as a fixed amount plus rate on the rest (OK style): not used by default. */
    note?: string;
    localSource?: string;
    /** Used-vehicle formula of a flat amount on the first $X then a rate on the rest (Oklahoma style). */
    usedFlat?: { upTo: number; amount: number; rateAbove: number };
    /** Local rate (county) capped at this amount of tax (e.g. Alabama/Tennessee style caps on local tax). */
    localCap?: number;
  };
  /** Extra state-level purchase taxes or percentage fees on the taxable price (e.g. a second state rate, a road fund %). */
  taxExtra?: Array<{ id: string; label: string; rate: number; source: string; cap?: number; min?: number; if?: Cond; note?: string }>;
  /**
   * Value-based fees or taxes: amount = max(min, valueBase x pct x factor[k]) where k = vehicle age (depBy 'age')
   * or years of ownership (depBy 'owned'), the last factor repeating. per100 = true means pct is per $100 (or use a plain decimal).
   * round: 'ceil' rounds up to the dollar, 'dollar' to the nearest dollar. when 'once' = only at purchase.
   * Optional `max` caps the amount. Optional `base: 'msrp'` uses the MSRP when typed (else the price).
   */
  valueFees?: Array<{ id: string; label: string; kind?: LineKind; pct: number; base: 'price' | 'msrp'; factors: number[]; depBy: 'age' | 'owned'; min?: number; max?: number; round?: 'ceil' | 'dollar'; when?: 'once' | 'cycle'; years?: number; source: string; if?: Cond; note?: string }>;
  /** Once-only fees at purchase: title, new plate, initial registration... */
  once: Fixed[];
  reg: { label: string; source: string; years?: number; type: 'flat'; amount: number }
     | { label: string; source: string; years?: number; type: 'weight'; brackets: Br[]; truckBrackets?: Br[]; perLb?: { from: number; rate: number } }
     | { label: string; source: string; years?: number; type: 'age'; brackets: Br[] }
     | { label: string; source: string; years?: number; type: 'value'; pct: number; base: 'price' | 'msrp'; depreciation: number[]; min?: number };
  /** Yearly add-ons collected with registration (amount per cycle). */
  cycle: Fixed[];
  ev?: { ev?: number; phev?: number; hybrid?: number; source: string; label?: string };
  inspection?: Array<{ id: string; label: string; amount: number | null; range?: [number, number]; years: number; source: string; newExemptYears?: number; countyFlag?: string; note?: string; atPurchase?: boolean; fuelExempt?: string[] }>;
  /** County-level yearly fee read from counties[].localFee */
  countyFeeLabel?: string;
  countyFeeSource?: string;
  /** Value-based yearly tax or fee as a range when not computable. */
  ranges?: Array<{ id: string; label: string; range: [number, number] | null; kind: LineKind; source: string; note: string; when?: 'once' | 'cycle'; if?: Cond }>;
}

function ok(c: Cond | undefined, i: VehicleInput, cty?: Record<string, unknown>) {
  if (!c) return true;
  if (c.countyFlag && !(cty && cty[c.countyFlag])) return false;
  if (c.new && i.condition !== 'new') return false;
  if (c.used && i.condition !== 'used') return false;
  if (c.dealer && i.seller !== 'dealer') return false;
  if (c.private && i.seller !== 'private') return false;
  if (c.fuel && !c.fuel.includes(i.fuel)) return false;
  if (c.minAge !== undefined && age(i) < c.minAge) return false;
  if (c.maxAge !== undefined && age(i) > c.maxAge) return false;
  if (c.maxWeight !== undefined && i.weightLbs > c.maxWeight) return false;
  if (c.minWeight !== undefined && i.weightLbs < c.minWeight) return false;
  if (c.body && i.body !== c.body) return false;
  return true;
}

export function regAmount(g: GParams, i: VehicleInput): number {
  const r = g.reg;
  if (r.type === 'flat') return r.amount;
  if (r.type === 'weight') {
    let a = bracket(i.body === 'truck' && r.truckBrackets ? r.truckBrackets : r.brackets, i.weightLbs).amount;
    if (r.perLb && i.weightLbs > r.perLb.from) a += (i.weightLbs - r.perLb.from) * r.perLb.rate;
    return a;
  }
  if (r.type === 'age') return bracket(r.brackets, age(i)).amount;
  const baseVal = r.base === 'msrp' && i.msrp > 0 ? i.msrp : i.price;
  const dep = r.depreciation[Math.min(age(i), r.depreciation.length - 1)];
  return Math.max(r.min ?? 0, baseVal * r.pct * dep);
}

const generic: StateEngine = (i, d) => {
  const g = (d.params as { g: GParams }).g;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const t = g.tax;
  const base = taxableBase(i, { tradeInCredit: t.tradeInCredit, docFeeTaxable: t.docFeeTaxable });
  const stateRate = i.seller === 'private' && t.privateRate !== undefined ? t.privateRate : t.rate;
  let tax = base * stateRate;
  if (t.usedFlat && i.condition === 'used') tax = base <= t.usedFlat.upTo ? t.usedFlat.amount : t.usedFlat.amount + (base - t.usedFlat.upTo) * t.usedFlat.rateAbove;
  if (t.cap !== undefined) tax = Math.min(tax, t.cap);
  const minApplied = t.minTax !== undefined && tax < t.minTax;
  if (minApplied) tax = t.minTax as number;
  const lr = localRate(i, d);
  let localTax = lr * (t.localFirst !== undefined ? Math.min(base, t.localFirst) : base);
  if (t.localCap !== undefined) localTax = Math.min(localTax, t.localCap);
  if (purchase) {
    lines.push(line({ id: 'sales-tax', label: t.label, kind: 'tax', amount: tax, when: 'once', source: t.source, note: t.cap !== undefined && base * stateRate > t.cap ? `Capped at $${t.cap.toLocaleString('en-US')}.` : minApplied ? `Minimum tax of $${t.minTax} applies.` : t.note }));
    if (lr > 0) lines.push(line({ id: 'local-tax', label: `Local tax (${+(lr * 100).toFixed(3)}%${t.localFirst ? ` on the first $${t.localFirst.toLocaleString('en-US')}` : ''})`, kind: 'tax', amount: localTax, when: 'once', source: t.localSource ?? t.source }));
    for (const x of g.taxExtra ?? []) if (ok(x.if, i)) {
      let a = base * x.rate; if (x.cap !== undefined) a = Math.min(a, x.cap); if (x.min !== undefined) a = Math.max(a, x.min);
      lines.push(line({ id: x.id, label: x.label, kind: 'tax', amount: a, when: 'once', source: x.source, note: x.note }));
    }
    for (const f of g.once) if (ok(f.if, i)) lines.push(line({ id: f.id, label: f.label, kind: f.kind ?? 'title', amount: f.amount, when: 'once', source: f.source, note: f.note }));
  }
  const yrs = g.reg.years ?? 1;
  lines.push(line({ id: 'reg', label: g.reg.label, kind: 'registration', amount: regAmount(g, i), years: yrs, when: 'cycle', source: g.reg.source }));
  const cty = county(i, d) as Record<string, unknown> | undefined;
  for (const f of g.cycle) if (ok(f.if, i, cty)) lines.push(line({ id: f.id, label: f.label, kind: f.kind ?? 'registration', amount: f.amount, years: f.years ?? yrs, when: 'cycle', source: f.source, note: f.note }));
  for (const v of g.valueFees ?? []) {
    if (!ok(v.if, i, cty)) continue;
    if ((v.when ?? 'cycle') === 'once' && !purchase) continue;
    const val = v.base === 'msrp' && i.msrp > 0 ? i.msrp : i.price;
    const k = v.depBy === 'owned' ? i.ownedYears : age(i);
    let a = val * v.pct * v.factors[Math.min(k, v.factors.length - 1)];
    if (v.round === 'ceil') a = Math.ceil(a - 1e-9); else if (v.round === 'dollar') a = Math.round(a);
    if (v.min !== undefined) a = Math.max(a, v.min);
    if (v.max !== undefined) a = Math.min(a, v.max);
    lines.push(line({ id: v.id, label: v.label, kind: v.kind ?? 'value', amount: a, years: v.years ?? yrs, when: v.when ?? 'cycle', source: v.source, note: v.note }));
  }
  const c = county(i, d);
  if (g.countyFeeLabel && typeof c?.localFee === 'number') lines.push(line({ id: 'county-fee', label: `${g.countyFeeLabel} (${c.name})`, kind: 'local', amount: c.localFee, years: yrs, when: 'cycle', source: g.countyFeeSource ?? g.reg.source }));
  if (g.ev) {
    const a = i.fuel === 'ev' ? g.ev.ev : i.fuel === 'phev' ? g.ev.phev : i.fuel === 'hybrid' ? g.ev.hybrid : undefined;
    if (a) lines.push(line({ id: 'ev', label: g.ev.label ?? (i.fuel === 'ev' ? 'Electric vehicle fee' : i.fuel === 'phev' ? 'Plug-in hybrid fee' : 'Hybrid vehicle fee'), kind: 'ev', amount: a * yrs, years: yrs, when: 'cycle', source: g.ev.source }));
  }
  for (const s of g.inspection ?? []) {
    if (s.fuelExempt?.includes(i.fuel)) continue;
    if (s.countyFlag && !(c && c[s.countyFlag])) continue;
    if (s.newExemptYears !== undefined && age(i) < s.newExemptYears) continue;
    lines.push(line({ id: s.id, label: s.label, kind: 'inspection', amount: s.amount, range: s.range, years: s.years, when: 'cycle', source: s.source, note: s.note }));
  }
  for (const r of g.ranges ?? []) if (ok(r.if, i, cty)) lines.push(line({ id: r.id, label: r.label, kind: r.kind, amount: null, range: r.range ?? undefined, when: r.when ?? 'cycle', source: r.source, note: r.note }));
  return { lines: forTransaction(i, lines), notes };
};
export default generic;
