/**
 * Contract shared by the 51 state engines (src/lib/engine/states/<ab>.ts).
 *
 * A state engine is a pure function: compute(input, data) -> StateResult.
 * Every amount it returns comes from the state's data file (src/data/states/<ab>.json),
 * which carries the official source of each figure. Nothing is hard-coded in an engine
 * except the arithmetic of the formula the statute or fee schedule describes.
 */

export type Fuel = 'gas' | 'hybrid' | 'phev' | 'ev';
/** car = passenger car / SUV registered as a passenger vehicle; truck = pickup or SUV registered as a light truck. */
export type Body = 'car' | 'truck';

export interface VehicleInput {
  /** Agreed selling price before tax, fees and trade-in (USD). */
  price: number;
  /** Trade-in allowance (USD). 0 = no trade-in. */
  tradeIn: number;
  /** Model year of the vehicle, e.g. 2026. */
  modelYear: number;
  /** Year the transaction happens (purchase year, or the renewal year in renewal mode). */
  year: number;
  /** Curb (empty / unladen) weight in pounds. */
  weightLbs: number;
  fuel: Fuel;
  body: Body;
  condition: 'new' | 'used';
  seller: 'dealer' | 'private';
  /** County (or tax jurisdiction) id from data.counties; '' = data.defaultCounty. */
  county: string;
  /** Local sales/use tax rate typed by the user (decimal, 0.0125 = 1.25%). null = use the county's rate. */
  localRateOverride: number | null;
  /** Manufacturer's suggested retail price when the state taxes on MSRP; 0 = unknown (engine uses price). */
  msrp: number;
  /** Dealer documentation fee already resolved by the wrapper (0 on a private sale). Engines use it only to decide whether it is taxable. */
  docFee: number;
  /** purchase = buying and registering for the first time in the state; renewal = an ordinary yearly renewal. */
  transaction: 'purchase' | 'renewal';
  /** Years since this owner bought the vehicle: 0 at purchase, 1 at the first yearly renewal, etc. (value-based fees that depreciate from the purchase year use it). */
  ownedYears: number;
}

export type LineKind =
  | 'tax' // sales, use, excise, privilege or title ad valorem tax on the purchase
  | 'title' // certificate of title fee, lien recording
  | 'registration' // base registration / license fee
  | 'plate' // plate issue fee, reflectorization, plate replacement
  | 'local' // county or city registration fees, wheel taxes, district fees
  | 'value' // value-based annual tax or fee collected with registration (CA VLF, AZ VLT, CO SOT, MA excise...)
  | 'ev' // EV / hybrid / PHEV road-use surcharge
  | 'inspection' // safety or emissions inspection fee (paid to a station or the state)
  | 'dealer' // dealer documentation fee (added by the wrapper, never by a state engine)
  | 'other';

export interface FeeLine {
  /** Stable id, unique within a result: e.g. 'sales-tax', 'title', 'reg-base', 'vlf'. */
  id: string;
  /** Short English label shown in the breakdown: 'Vehicle license fee (0.65% of value)'. */
  label: string;
  kind: LineKind;
  /** Exact amount in USD (cents kept). null = the state does not publish enough to compute it: give `range`. */
  amount: number | null;
  /** Official minimum and maximum when `amount` is null (or when the amount depends on a choice the form does not ask). */
  range?: [number, number];
  /**
   * true = not paid when the car is bought but within the first 12 months (e.g. California used car: the
   * registration fees are due at the next expiration date; a periodic inspection due later in the year).
   */
  deferred?: boolean;
  /**
   * once  = paid only when the vehicle is bought / first registered (sales tax, title, new-plate fee).
   * cycle = paid at purchase AND again at every renewal (registration, VLF, EV fee, periodic inspection).
   */
  when: 'once' | 'cycle';
  /** Length of the registration or inspection cycle the amount covers, in years (1 = yearly, 2 = biennial). Default 1. */
  years?: number;
  /** One-line plain-English explanation of the rule actually applied ("$1,500 cap reached", "first $5,000 only"). */
  note?: string;
  /** Key in data.sources that proves the figure. Required. */
  source: string;
}

export interface StateResult {
  lines: FeeLine[];
  /** Caveats specific to the input (e.g. "private sale: tax is charged on the state's book value, not the price"). */
  notes: string[];
}

export interface CountyEntry {
  id: string;
  name: string;
  /** Local sales/use tax rate on a vehicle purchase in that jurisdiction (decimal), added to the state rate. */
  localRate?: number;
  /** Any other per-county figure the state engine needs (e.g. county registration fee, emissions area flag). */
  [k: string]: unknown;
}

export interface SourceRef {
  name: string;
  url: string;
  /** ISO date the page or PDF was read. */
  accessed: string;
  /** Short verbatim excerpt (<= 300 chars) that proves the figures taken from it. */
  quote?: string;
}

export interface StateSummary {
  /** State-level rate applied to a vehicle purchase (decimal). For a flat-fee or no-tax state, 0. */
  stateRate: number;
  /** Range of local rates added on a vehicle purchase [min, max] (decimal). [0, 0] if none. */
  localRange: [number, number];
  /** Short name of the purchase tax ('sales and use tax', 'motor vehicle excise tax', 'TAVT', 'highway use tax'...). */
  taxName: string;
  /** true if the trade-in value is deducted from the taxable price on a dealer purchase. */
  tradeInCredit: boolean;
  /** Basic certificate of title fee (USD), lien excluded. */
  titleFee: number;
  /** How the base registration fee is set. */
  regMethod: 'flat' | 'weight' | 'value' | 'age' | 'horsepower' | 'mixed';
  /** Registration cycle offered by default, in years. */
  regYears: number;
  /** Legal cap on the dealer documentation fee (USD), null if no cap. */
  docFeeCap: number | null;
  /** Official reference figure when there is no cap but a regulator publishes one (e.g. Texas: $225 presumed reasonable). */
  docFeeDefault?: number;
  /** Year-specific note on the doc-fee rule ("indexed yearly", "must be posted", ...). */
  docFeeNote: string;
  /** Yearly EV surcharge (USD) or null if none. */
  evFee: number | null;
  /** Yearly PHEV surcharge or null. */
  phevFee: number | null;
  /** Yearly hybrid (non plug-in) surcharge or null. */
  hybridFee: number | null;
  /** 'none' | 'safety' | 'emissions' | 'both' — for an ordinary private passenger car. */
  inspection: 'none' | 'safety' | 'emissions' | 'both';
  /** Who must inspect, one sentence ("emissions in 7 Atlanta-area counties; no safety inspection"). */
  inspectionWhere: string;
  /** Official fee or [min, max] fee range for that inspection, null if none or not regulated. */
  inspectionFee: number | [number, number] | null;
  /** true if an annual property / ad valorem / excise tax on the vehicle's value applies (with registration or billed by the county). */
  annualValueTax: boolean;
}

export interface StateData {
  abbr: string;
  name: string;
  slug: string;
  agency: { name: string; short: string; url: string };
  taxAgency?: { name: string; url: string };
  /** ISO date the whole file was last checked against the sources. */
  verified: string;
  /** 'exact' = every line for an ordinary passenger car is computable; 'partial' = some line is only a range (see gaps). */
  exactness: 'exact' | 'partial';
  /** What the state does not publish precisely enough to compute, and how the engine handles it. */
  gaps: string[];
  summary: StateSummary;
  /** All numbers the engine reads. Free shape per state; document each block with a `_src` key naming its source. */
  params: Record<string, unknown>;
  counties?: CountyEntry[];
  defaultCounty?: string;
  /** Distinctive, sourced facts for the page writer: one sentence each, with the source key in brackets. */
  singular: string[];
  sources: Record<string, SourceRef>;
}

export type StateEngine = (input: VehicleInput, data: StateData) => StateResult;
