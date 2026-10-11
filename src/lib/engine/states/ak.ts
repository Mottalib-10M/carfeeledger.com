/**
 * Alaska. Own engine because:
 * - the municipal motor vehicle registration tax (MVRT, AS 28.10.431) follows each municipality's own
 *   schedule by vehicle age, read per location from the DMV chart;
 * - on a sale of a vehicle already registered in Alaska the registration (and the MVRT already paid)
 *   transfers to the buyer, so only the title is due at the transfer;
 * - there is no state sales tax; some cities and boroughs levy a sales tax with their own caps, shown without amount.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line } from '../helpers';

type P = { reg: number; regYears: number; title: number };
type Loc = { id: string; name: string; mvrt?: number[]; salesTax?: boolean };

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const c = county(i, d) as unknown as Loc | undefined;
  const purchase = i.transaction === 'purchase';
  const transfer = purchase && i.condition === 'used';
  if (purchase) {
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'as-28-10-441' }));
    if (c?.salesTax && i.seller === 'dealer') lines.push(line({ id: 'local-tax', label: `Local sales tax, if your city or borough levies one (${c.name})`, kind: 'tax', amount: null, when: 'once', source: 'as-28-10-431', note: 'Alaska has no state sales tax; each city or borough sets its own rate, exemptions and any limit per sale.' }));
  }
  if (transfer) {
    notes.push('The current Alaska registration, and the registration tax already paid, pass to the buyer; the next biennial registration is due when it expires.');
  } else {
    lines.push(line({ id: 'reg', label: 'Biennial registration (passenger vehicle)', kind: 'registration', amount: p.reg, years: p.regYears, when: 'cycle', source: 'as-28-10-421' }));
    if (c?.mvrt?.length) {
      const k = Math.min(age(i), c.mvrt.length - 1);
      lines.push(line({ id: 'mvrt', label: `Motor vehicle registration tax (${c.name}, two years)`, kind: 'local', amount: c.mvrt[k], years: p.regYears, when: 'cycle', source: 'dmv-chart', note: c.mvrt.length === 1 ? 'Same amount at every age.' : `${k + 1 >= c.mvrt.length ? `${c.mvrt.length}th year or older` : `Year ${k + 1} of age`} on the municipal schedule.` }));
    }
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
