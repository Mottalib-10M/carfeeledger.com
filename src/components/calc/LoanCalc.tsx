/**
 * Car payment calculator with the state's real taxes and fees: the amount financed includes what the DMV
 * and the state charge at purchase when the buyer rolls them into the loan. `tco` mode adds the yearly
 * renewals and the loan interest over the years of ownership (total cost of ownership, official parts only,
 * plus the buyer's own insurance and fuel figures).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import Toggle from '../ui/Toggle';
import { Actions, MobileBar, Note, type Opt, Rows, StatePick, usd } from './parts';
import { engineOf, loadState } from '../../lib/engine/client';
import { runCalc, renewalYear } from '../../lib/engine/calc';
import { loan } from '../../lib/engine/loan';
import type { StateData, VehicleInput } from '../../lib/engine/types';
import { readParams, num as qn, str, updateURL } from '../../lib/url-state';

interface Props { states: Array<Opt & { ab: string }>; initial: StateData; mode?: 'loan' | 'tco'; year: number; methodHref: string; idPrefix: string; apr: number; months: number }

export default function LoanCalc({ states, initial, mode = 'loan', year, methodHref, idPrefix: p, apr: apr0, months: months0 }: Props) {
  const [data, setData] = useState<StateData>(initial);
  const [ab, setAb] = useState(initial.abbr.toLowerCase());
  const [price, setPrice] = useState(35000);
  const [down, setDown] = useState(5000);
  const [tradeIn, setTradeIn] = useState(0);
  const [apr, setApr] = useState(apr0 * 100);
  const [months, setMonths] = useState(String(months0));
  const [roll, setRoll] = useState('y');
  const [cond, setCond] = useState('new');
  const [keep, setKeep] = useState(String(5));
  const [insurance, setInsurance] = useState(0);
  const [fuel, setFuel] = useState(0);

  useEffect(() => {
    const u = readParams(window.location.search); if (!u.toString()) return;
    const s = str(u, 's', ab);
    if (s !== ab && states.some((x) => x.ab === s)) { setAb(s); loadState(s).then(setData); }
    setPrice(qn(u, 'p', price)); setDown(qn(u, 'dp', down)); setTradeIn(qn(u, 't', tradeIn)); setApr(qn(u, 'a', apr)); setMonths(str(u, 'm', months)); setRoll(str(u, 'f', roll)); setCond(str(u, 'n', cond)); setKeep(str(u, 'k', keep));
  }, []);
  const pick = (v: string) => { const s = states.find((x) => x.value === v); if (!s) return; setAb(s.ab); loadState(s.ab).then(setData); };

  const input: VehicleInput = { price, tradeIn, modelYear: cond === 'new' ? year : year - 4, year, weightLbs: 3500, fuel: 'gas', body: 'car', condition: cond as 'new', seller: 'dealer', county: '', localRateOverride: null, msrp: 0, docFee: -1, transaction: 'purchase', ownedYears: 0 };
  const engine = engineOf(ab);
  const fees = useMemo(() => runCalc(input, data, engine), [JSON.stringify(input), data]);
  const L = loan({ price, down, tradeIn, feesFinanced: roll === 'y' ? fees.atPurchase : 0, apr: apr / 100, months: Number(months) });
  const n = Number(keep);
  const renewals = useMemo(() => Array.from({ length: Math.max(0, n - 1) }, (_, k) => renewalYear(input, data, engine, k + 1).perYear), [JSON.stringify(input), data, n]);
  const interestInYears = (() => { const m = Number(months); const paid = Math.min(m, n * 12); let bal = L.amountFinanced, s = 0; for (let k = 0; k < paid; k++) { const i = bal * (apr / 100 / 12); s += i; bal -= L.monthly - i; } return s; })();
  const tco = fees.atPurchase + renewals.reduce((a, b) => a + b, 0) + interestInYears + (insurance + fuel) * n;

  useEffect(() => { updateURL({ s: ab, p: price, dp: down, t: tradeIn || undefined, a: apr, m: months, f: roll, n: cond, k: mode === 'tco' ? keep : undefined }); }, [ab, price, down, tradeIn, apr, months, roll, cond, keep]);

  const terms: Opt[] = [24, 36, 48, 60, 72, 84].map((x) => ({ value: String(x), label: `${x} months` }));
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start lg:gap-6">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
        <StatePick id={`${p}-state`} value={states.find((s) => s.ab === ab)?.value ?? ''} onChange={pick} states={states} label="State where you register the car" />
        <Toggle id={`${p}-cond`} label="Vehicle" value={cond} onChange={setCond} options={[{ value: 'new', label: 'New' }, { value: 'used', label: 'Used' }]} />
        <NumberField id={`${p}-price`} label="Price of the car" value={price} onChange={setPrice} unit="$" max={2_000_000} />
        <NumberField id={`${p}-down`} label="Down payment" value={down} onChange={setDown} unit="$" max={2_000_000} />
        <NumberField id={`${p}-trade`} label="Trade-in allowance" value={tradeIn} onChange={setTradeIn} unit="$" max={2_000_000} />
        <NumberField id={`${p}-apr`} label="APR" value={apr} onChange={setApr} unit="%" max={40} decimals={2} help="The annual percentage rate on your loan offer." />
        <SelectField id={`${p}-term`} label="Loan term" value={months} onChange={setMonths} options={terms} />
        <Toggle id={`${p}-roll`} label="Finance the taxes and fees" value={roll} onChange={setRoll} options={[{ value: 'y', label: 'Yes' }, { value: 'n', label: 'No, paid cash' }]} />
        {mode === 'tco' && <SelectField id={`${p}-keep`} label="Years you keep the car" value={keep} onChange={setKeep} options={[3, 4, 5, 6, 7, 8, 10].map((x) => ({ value: String(x), label: `${x} years` }))} />}
        {mode === 'tco' && <NumberField id={`${p}-ins`} label="Your insurance premium per year" value={insurance} onChange={setInsurance} unit="$" max={50000} help="From your quote; left at 0 it is not counted." />}
        {mode === 'tco' && <NumberField id={`${p}-fuel`} label="Your fuel or charging per year" value={fuel} onChange={setFuel} unit="$" max={50000} help="Miles a year ÷ mpg × price per gallon." />}
      </form>
      <div id={`${p}-result`} data-resultat aria-live="polite" className="mt-6 scroll-mt-4 rounded-xl bg-accent-50 p-4 sm:p-5 lg:sticky lg:top-4 lg:mt-0">
        <p className="text-sm font-medium text-navy-700">{mode === 'tco' ? `Cost of owning it ${n} years · ${data.name}` : `Monthly payment · ${data.name}`}</p>
        <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{mode === 'tco' ? usd(tco) : usd(L.monthly)}</p>
        <Rows rows={mode === 'tco' ? [
          ['Taxes and fees at purchase', usd(fees.atPurchase)],
          [`Registration renewals, years 2 to ${n}`, usd(renewals.reduce((a, b) => a + b, 0))],
          [`Loan interest over ${n} years`, usd(interestInYears)],
          ['Your insurance and fuel', usd((insurance + fuel) * n)],
          ['Monthly payment', usd(L.monthly)],
        ] : [
          ['Amount financed', usd(L.amountFinanced)],
          [`Taxes and fees in ${data.name}`, `${usd(fees.atPurchase)}${roll === 'y' ? ' (financed)' : ' (paid cash)'}`],
          ['Total interest', usd(L.interest)],
          ['Total of payments', usd(L.totalPaid), true],
        ]} />
        <Note methodHref={methodHref}>Taxes and fees come from the {data.name} fee schedule for this price (default county). Depreciation is not counted.</Note>
        <Actions />
      </div>
      </div>
      <MobileBar label={mode === 'tco' ? `Cost of owning it ${n} years` : 'Monthly payment'} figure={mode === 'tco' ? usd(tco) : usd(L.monthly)} target={`${p}-result`} />
    </div>
  );
}
