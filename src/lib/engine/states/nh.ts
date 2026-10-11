import type { FeeLine, StateEngine, VehicleInput } from '../types';
import { county, forTransaction, line } from '../helpers';

type P = {
  title: number;
  plates: number;
  permit: { mills: number[]; min: number };
  stateReg: { upTo: number | null; amount: number }[];
  ev: { ev: number; phev: number };
};

/** Model-year step of RSA 261:153: 0 = current model year (or newer), 5 = fifth preceding year and older. */
const step = (i: VehicleInput) => Math.max(0, i.year - i.modelYear);
export function nhPermit(p: P, i: VehicleInput) {
  const msrp = i.msrp > 0 ? i.msrp : i.price;
  const mills = p.permit.mills[Math.min(step(i), p.permit.mills.length - 1)];
  return { mills, amount: Math.max(p.permit.min, (msrp * mills) / 1000) };
}

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const c = county(i, d) as (Record<string, unknown> & { name: string; fees?: { id: string; label: string; amount: number; when: 'once' | 'cycle' | 'renewal' }[] }) | undefined;
  if (purchase) {
    lines.push(line({ id: 'title', label: 'Certificate of title (state fee from January 1, 2026)', kind: 'title', amount: p.title, when: 'once', source: 'hb2-2026' }));
    lines.push(line({ id: 'plate', label: 'Standard passenger plates (set of two)', kind: 'plate', amount: p.plates, when: 'once', source: 'jackson', note: 'Not charged when you transfer your current plates.' }));
  }
  const pm = nhPermit(p, i);
  lines.push(line({ id: 'permit', label: `Municipal permit fee (${pm.mills} mills per dollar of list price)`, kind: 'value', amount: pm.amount, when: 'cycle', source: 'manchester', note: 'Paid to your city or town; based on the original list price and the model year, prorated when the first registration is shorter or longer than 12 months.' }));
  const st = p.stateReg.find((b) => b.upTo === null || i.weightLbs <= b.upTo)!;
  lines.push(line({ id: 'reg', label: 'State registration fee (by weight, 2026 schedule)', kind: 'registration', amount: st.amount, when: 'cycle', source: 'hb2-2026' }));
  if (i.fuel === 'ev' || i.fuel === 'phev') lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Battery electric vehicle surcharge' : 'Plug-in hybrid surcharge', kind: 'ev', amount: i.fuel === 'ev' ? p.ev.ev : p.ev.phev, when: 'cycle', source: 'manchester' }));
  if (c?.fees) {
    for (const f of c.fees) {
      if (f.when === 'once' && !purchase) continue;
      if (f.when === 'renewal' && purchase) continue;
      lines.push(line({ id: f.id, label: `${f.label} (${c.name})`, kind: 'local', amount: f.amount, when: f.when === 'once' ? 'once' : 'cycle', source: 'manchester' }));
    }
  } else {
    lines.push(line({ id: 'town-fees', label: 'Town clerk and local registration fees', kind: 'local', amount: null, when: 'cycle', source: 'manchester', note: 'Each city or town adds its own small fees (clerk, municipal agent, transportation fund); ask your town clerk.' }));
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
