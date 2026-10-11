/** Shared pieces of the calculators: card, state picker, result box, ledger rows, actions. */
import { useState, type ReactNode } from 'react';
import SelectField from '../ui/SelectField';
import { formatMoney, formatNumber } from '../../lib/format';

export const usd = (n: number, d = 0) => formatMoney(Number.isFinite(n) ? n : 0, d);
export const num = (n: number, d = 0) => formatNumber(Number.isFinite(n) ? n : 0, d);
export interface Opt { value: string; label: string }

export function Card({ children, form }: { children: ReactNode; form: ReactNode }) {
  return (
    <div className="rechner rounded-xl border border-navy-200 bg-white p-4 sm:p-6">
      <form className="grid gap-x-5 gap-y-4 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>{form}</form>
      {children}
    </div>
  );
}

export function StatePick({ id, value, onChange, states, lock, label = 'State', help }: { id: string; value: string; onChange: (v: string) => void; states: Opt[]; lock?: boolean; label?: string; help?: string }) {
  const name = states.find((s) => s.value === value)?.label ?? value;
  if (lock) return (
    <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0">
      <span className="mb-1 block text-sm font-medium text-navy-700">{label}</span>
      <p className="flex h-12 items-center rounded-lg border border-navy-200 bg-navy-50 px-4 font-semibold text-navy-900">{name}</p>
      {help && <span className="mt-1 text-xs text-navy-500">{help}</span>}
    </div>
  );
  return <SelectField id={id} label={label} value={value} onChange={onChange} options={states} help={help} />;
}

export function Result({ label, figure, sub, children }: { label: string; figure: string; sub?: ReactNode; children?: ReactNode }) {
  return (
    <div aria-live="polite" className="mt-6 rounded-xl bg-accent-50 p-4 sm:p-5">
      <p className="text-sm font-medium text-navy-700">{label}</p>
      <p className="tabular-nums mt-1 text-4xl font-bold text-navy-900">{figure}</p>
      {sub && <p className="ledger-range mt-1 text-sm">{sub}</p>}
      {children}
    </div>
  );
}

export function Rows({ rows }: { rows: Array<[string, string] | [string, string, boolean]> }) {
  return (
    <table className="mt-4 w-full text-sm"><tbody className="divide-y divide-navy-200">
      {rows.map(([l, v, strong]) => <tr key={l}><td className={`py-1.5 pr-3 ${strong ? 'font-semibold text-navy-900' : 'text-navy-700'}`}>{l}</td><td className={`tabular-nums py-1.5 text-right text-navy-900 ${strong ? 'font-semibold' : ''}`}>{v}</td></tr>)}
    </tbody></table>
  );
}

export function Note({ children, methodHref }: { children: ReactNode; methodHref?: string }) {
  return <p className="mt-3 text-xs text-navy-700">{children}{methodHref && <> <a className="underline" href={methodHref}>How this is calculated</a>.</>}</p>;
}

export function Actions() {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); };
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-sm">
      <button type="button" onClick={copy} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">{copied ? 'Link copied' : 'Copy share link'}</button>
      <button type="button" onClick={() => window.print()} className="rounded-lg border border-navy-300 bg-white px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">Print</button>
    </div>
  );
}

/** Proportional bar of a cost split (materials, labor, the rest). */
export function SplitBar({ parts }: { parts: Array<{ label: string; value: number; color: string }> }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (total <= 0) return null;
  return (
    <div className="mt-4" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)} percent`).join(', ')}>
      <div className="flex h-3 overflow-hidden rounded-full">{parts.map((p) => <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, backgroundColor: p.color }} />)}</div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">{parts.map((p) => <span key={p.label} className="flex items-center gap-1.5 text-xs text-navy-700"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} aria-hidden="true" />{p.label} {Math.round((p.value / total) * 100)}%</span>)}</div>
    </div>
  );
}
export const SPLIT_COLORS = { materials: '#334155', labor: '#B22234', other: '#94a3b8' };
