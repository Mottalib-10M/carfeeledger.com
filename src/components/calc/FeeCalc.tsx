/**
 * The site's calculator: one state's real fee schedule applied to the vehicle typed in. Every line of the
 * breakdown names its source (the state's data file). `mode` only changes which total is put forward and
 * which fields show (tax only, tag and title, renewal...). First render = build defaults (RECETTE §17.5);
 * the share link is read after mount and written only after an interaction (§18.1).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Actions, Note, type Opt, StatePick, usd } from './parts';
import { engineOf, loadState } from '../../lib/engine/client';
import { runCalc, renewalYear, type CalcResult } from '../../lib/engine/calc';
import type { FeeLine, Fuel, LineKind, StateData, VehicleInput } from '../../lib/engine/types';
import { readParams, num as qn, str, updateURL } from '../../lib/url-state';

export type Mode = 'fees' | 'tax' | 'otd' | 'title' | 'renewal' | 'inspection' | 'ev' | 'docfee' | 'property' | 'registration';
interface Props {
  states: Array<Opt & { ab: string }>;
  initial: StateData;
  lock?: boolean;
  mode?: Mode;
  defaults?: Partial<VehicleInput>;
  year: number;
  methodHref: string;
  idPrefix: string;
}

const FOCUS: Record<Mode, { label: string; kinds?: LineKind[]; total: 'atPurchase' | 'outTheDoor' | 'renewal' | 'kinds' }> = {
  fees: { label: 'Taxes and fees due when you buy', total: 'atPurchase' },
  otd: { label: 'Out-the-door price', total: 'outTheDoor' },
  tax: { label: 'Sales tax on this purchase', total: 'kinds', kinds: ['tax'] },
  title: { label: 'Tag, title and registration', total: 'kinds', kinds: ['title', 'registration', 'plate', 'local', 'value', 'ev'] },
  registration: { label: 'Registration bill, first period', total: 'kinds', kinds: ['registration', 'plate', 'local', 'value', 'ev'] },
  renewal: { label: 'Renewal bill', total: 'renewal' },
  inspection: { label: 'Inspection fees', total: 'kinds', kinds: ['inspection'] },
  ev: { label: 'EV or hybrid surcharge', total: 'kinds', kinds: ['ev'] },
  docfee: { label: 'Taxes and fees due when you buy', total: 'atPurchase' },
  property: { label: 'Value-based tax with registration', total: 'kinds', kinds: ['value'] },
};
const FUELS: Opt[] = [{ value: 'gas', label: 'Gasoline or diesel' }, { value: 'hybrid', label: 'Hybrid (not plug-in)' }, { value: 'phev', label: 'Plug-in hybrid' }, { value: 'ev', label: 'Fully electric' }];
const sum = (ls: FeeLine[]) => ls.reduce((s, l) => s + (l.amount ?? 0), 0);

export default function FeeCalc({ states, initial, lock = false, mode = 'fees', defaults = {}, year, methodHref, idPrefix: p }: Props) {
  const [data, setData] = useState<StateData>(initial);
  const [ab, setAb] = useState(initial.abbr.toLowerCase());
  const [county, setCounty] = useState(initial.defaultCounty ?? '');
  const [price, setPrice] = useState(defaults.price ?? 35000);
  const [tradeIn, setTradeIn] = useState(defaults.tradeIn ?? 0);
  const [modelYear, setModelYear] = useState(String(defaults.modelYear ?? year));
  const [weight, setWeight] = useState(defaults.weightLbs ?? 3500);
  const [fuel, setFuel] = useState<Fuel>(defaults.fuel ?? 'gas');
  const [body, setBody] = useState(defaults.body ?? 'car');
  const [condition, setCondition] = useState(defaults.condition ?? 'new');
  const [seller, setSeller] = useState(defaults.seller ?? 'dealer');
  const [docFee, setDocFee] = useState(-1);
  const [owned, setOwned] = useState(String(mode === 'renewal' ? 1 : 0));
  const [msrp, setMsrp] = useState(0);
  const [localPct, setLocalPct] = useState(0);
  const [localOn, setLocalOn] = useState(false);

  useEffect(() => {
    const u = readParams(window.location.search);
    if (!u.toString()) return;
    const s = str(u, 's', ab);
    if (!lock && s !== ab && states.some((x) => x.ab === s)) { setAb(s); loadState(s).then((d) => { setData(d); setCounty(str(u, 'c', d.defaultCounty ?? '')); }); }
    else setCounty(str(u, 'c', county));
    setPrice(qn(u, 'p', price)); setTradeIn(qn(u, 't', tradeIn)); setModelYear(str(u, 'y', modelYear)); setWeight(qn(u, 'w', weight));
    setFuel(str(u, 'f', fuel) as Fuel); setBody(str(u, 'b', body) as 'car'); setCondition(str(u, 'n', condition) as 'new'); setSeller(str(u, 'r', seller) as 'dealer');
    setDocFee(qn(u, 'd', docFee)); setOwned(str(u, 'o', owned));
  }, []);

  const pickState = (next: string) => {
    const s = states.find((x) => x.value === next); if (!s) return;
    setAb(s.ab);
    loadState(s.ab).then((d) => { setData(d); setCounty(d.defaultCounty ?? ''); setDocFee(-1); setLocalOn(false); });
  };

  const isRenewal = mode === 'renewal';
  const input: VehicleInput = {
    price, tradeIn: isRenewal ? 0 : tradeIn, modelYear: Number(modelYear), year: year + (isRenewal ? Number(owned) : 0), weightLbs: weight, fuel, body: body as 'car',
    condition: isRenewal ? 'used' : (condition as 'new'), seller: seller as 'dealer', county, localRateOverride: localOn ? localPct / 100 : null,
    msrp, docFee, transaction: isRenewal ? 'renewal' : 'purchase', ownedYears: isRenewal ? Number(owned) : 0,
  };
  const engine = engineOf(ab);
  const r: CalcResult = useMemo(() => runCalc(input, data, engine), [JSON.stringify(input), data]);
  const next = useMemo(() => (isRenewal ? null : renewalYear(input, data, engine, 1)), [JSON.stringify(input), data]);

  useEffect(() => { updateURL({ s: lock ? undefined : ab, c: county || undefined, p: price, t: tradeIn || undefined, y: modelYear, w: weight, f: fuel, b: body, n: condition, r: seller, d: docFee >= 0 ? docFee : undefined, o: isRenewal ? owned : undefined }); }, [ab, county, price, tradeIn, modelYear, weight, fuel, body, condition, seller, docFee, owned]);

  const focus = FOCUS[mode];
  const focusLines = focus.kinds ? r.lines.filter((l) => focus.kinds!.includes(l.kind)) : r.lines;
  const figure = focus.total === 'atPurchase' ? r.atPurchase : focus.total === 'outTheDoor' ? r.outTheDoor : focus.total === 'renewal' ? r.firstYear : sum(focusLines);
  const stateName = data.name;
  const years: Opt[] = Array.from({ length: 27 }, (_, k) => year + 1 - k).map((y) => ({ value: String(y), label: String(y) }));
  const counties: Opt[] = (data.counties ?? []).map((c) => ({ value: c.id, label: c.name }));
  const now = r.lines.filter((l) => l.amount !== null && !l.deferred);
  const later = r.lines.filter((l) => l.amount !== null && l.deferred);
  const capNote = data.summary.docFeeCap !== null ? `capped at ${usd(data.summary.docFeeCap)} in ${stateName}` : data.summary.docFeeDefault ? `no cap; ${usd(data.summary.docFeeDefault)} is the official reference` : `no cap in ${stateName}: type the dealer's figure`;
  const effDoc = r.docFee;

  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <StatePick id={`${p}-state`} value={states.find((s) => s.ab === ab)?.value ?? ''} onChange={pickState} states={states} lock={lock} label="State where the car is registered" />
        {counties.length > 0
          ? <SelectField id={`${p}-county`} label="County or city of residence" value={county} onChange={setCounty} options={counties} help="Local tax and county fees follow your home address." />
          : <div className="hidden sm:block" aria-hidden="true" />}
        {!isRenewal && <Toggle id={`${p}-cond`} label="Vehicle" value={condition} onChange={setCondition as (v: string) => void} options={[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }]} />}
        {!isRenewal && <Toggle id={`${p}-seller`} label="Bought from" value={seller} onChange={setSeller as (v: string) => void} options={[{ value: 'dealer', label: 'Dealer' }, { value: 'private', label: 'Private seller' }]} />}
        <NumberField id={`${p}-price`} label={isRenewal ? 'Price you paid' : 'Price before tax and fees'} value={price} onChange={setPrice} unit="$" max={2_000_000} help={isRenewal ? 'Value-based fees start from it in several states.' : 'The agreed price of the car, before trade-in.'} />
        {!isRenewal ? <NumberField id={`${p}-trade`} label="Trade-in allowance" value={tradeIn} onChange={setTradeIn} unit="$" max={2_000_000} help={data.summary.tradeInCredit ? `${stateName} deducts it from the taxable price.` : `${stateName} taxes the full price anyway.`} />
          : <SelectField id={`${p}-owned`} label="Years you have owned it" value={owned} onChange={setOwned} options={Array.from({ length: 12 }, (_, k) => ({ value: String(k + 1), label: k === 0 ? 'First renewal (1 year)' : `${k + 1} years` }))} />}
        <SelectField id={`${p}-year`} label="Model year" value={modelYear} onChange={setModelYear} options={years} />
        <SelectField id={`${p}-fuel`} label="Fuel" value={fuel} onChange={(v) => setFuel(v as Fuel)} options={FUELS} />
        <NumberField id={`${p}-weight`} label="Curb weight" value={weight} onChange={setWeight} unit="lb" max={30000} help="On the door-jamb sticker or the window sticker; weight sets the fee in many states." />
        <SelectField id={`${p}-body`} label="Registered as" value={body} onChange={(v) => setBody(v as 'car')} options={[{ value: 'car', label: 'Passenger car or SUV' }, { value: 'truck', label: 'Pickup or light truck' }]} />
        {!isRenewal && seller === 'dealer' && <NumberField id={`${p}-doc`} label="Dealer documentation fee" value={docFee < 0 ? effDoc : docFee} onChange={setDocFee} unit="$" max={10000} help={capNote} />}
        {!isRenewal && <NumberField id={`${p}-msrp`} label="Sticker price (MSRP), if different" value={msrp} onChange={setMsrp} unit="$" max={2_000_000} help="Used only where the state taxes or registers on MSRP." />}
        <details className="sm:col-span-2 text-sm text-navy-700">
          <summary className="cursor-pointer font-medium">Local tax rate override</summary>
          <div className="mt-3 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <Toggle id={`${p}-loc-on`} label="Use my own local rate" value={localOn ? 'y' : 'n'} onChange={(v) => setLocalOn(v === 'y')} options={[{ value: 'n', label: 'No' }, { value: 'y', label: 'Yes' }]} />
            <NumberField id={`${p}-loc`} label="Local rate on top of the state rate" value={localPct} onChange={setLocalPct} unit="%" max={10} decimals={3} help={`${stateName} local range: ${(data.summary.localRange[0] * 100).toFixed(2)}% to ${(data.summary.localRange[1] * 100).toFixed(2)}%.`} />
          </div>
        </details>
      </form>

      <div aria-live="polite" className="mt-6 rounded-xl bg-accent-50 p-4 sm:p-5">
        <p className="text-sm font-medium text-navy-700">{focus.label} · {stateName}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{usd(figure)}</p>
        {!isRenewal && <p className="mt-1 text-sm text-navy-700">Due at purchase {usd(r.atPurchase)} · out the door {usd(r.outTheDoor)}{later.length > 0 && <> · first 12 months {usd(r.firstYear)}</>}</p>}
        {next && <p className="mt-1 text-sm text-navy-700">Then about {usd(next.perYear)} a year to renew{next.unpriced.length > 0 ? ', plus the items without a fixed price' : ''}.</p>}
        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">Fee breakdown</caption>
          <tbody className="divide-y divide-navy-200">
            {now.map((l) => <tr key={l.id}><td className="py-1.5 pr-3 text-navy-700">{l.label}{l.years && l.years > 1 ? ` (${l.years} years)` : ''}{l.note && <span className="block text-xs text-navy-600">{l.note}</span>}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{usd(l.amount as number, 2)}</td></tr>)}
            {later.length > 0 && <tr><td colSpan={2} className="pt-3 text-xs font-semibold uppercase tracking-wide text-navy-600">Due within the first 12 months</td></tr>}
            {later.map((l) => <tr key={l.id}><td className="py-1.5 pr-3 text-navy-700">{l.label}{l.note && <span className="block text-xs text-navy-600">{l.note}</span>}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{usd(l.amount as number, 2)}</td></tr>)}
            {r.unpriced.length > 0 && <tr><td colSpan={2} className="pt-3 text-xs font-semibold uppercase tracking-wide text-navy-600">Not added: no single official amount</td></tr>}
            {r.unpriced.map((l) => <tr key={l.id}><td className="py-1.5 pr-3 text-navy-700">{l.label}{l.note && <span className="block text-xs text-navy-600">{l.note}</span>}</td><td className="tabular-nums py-1.5 text-right text-navy-900">{l.range ? `${usd(l.range[0])} to ${usd(l.range[1])}` : 'varies'}</td></tr>)}
          </tbody>
        </table>
        {r.notes.map((n) => <p key={n} className="mt-2 text-xs text-navy-700">{n}</p>)}
        <Note methodHref={methodHref}>{data.agency.short} and {data.taxAgency?.name ?? 'state'} schedules read on {data.verified}. {data.exactness === 'partial' ? 'Some lines have no single official amount and are listed apart.' : 'Every line has an official amount.'}</Note>
        <Actions />
      </div>
    </div>
  );
}
