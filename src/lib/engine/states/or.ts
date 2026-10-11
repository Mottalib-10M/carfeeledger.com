/**
 * Oregon: no sales tax. A 0.5% vehicle privilege tax on new vehicles sold by Oregon dealers (ORS 320.405),
 * title and two-year registration fees set by the car's combined MPG band (0-19, 20-39, 40+, all-electric),
 * a four-year first registration for a new car (registration and county fees doubled), county registration
 * fees in Multnomah, Washington and Clackamas, and DEQ emissions tests in the Portland and Medford areas.
 * The form does not ask the MPG rating: a gasoline car is computed in the 20-39 MPG band (stated in the note),
 * a hybrid or plug-in hybrid gets the official range between the 20-39 and 40+ bands.
 */
import type { FeeLine, StateEngine } from '../types';
import { age, county, forTransaction, line } from '../helpers';

type Band = { title: number; reg: number };
type P = {
  privilege: { rate: number };
  bands: { lt20: Band; mid: Band; gte40: Band; ev: Band };
  plate: number;
  newTermMultiplier: number;
  inspection: { newExemptYears: number; years: number; fees: Record<string, number> };
};

const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  const isNew = purchase && i.condition === 'new';
  const mult = isNew ? p.newTermMultiplier : 1;
  const years = 2 * mult;
  // On a used purchase the Oregon plates and registration stay with the car: registration is due at the next renewal.
  const deferred = purchase && !isNew ? true : undefined;
  const c = county(i, d) as Record<string, unknown> | undefined;
  const b = p.bands;
  const hy = i.fuel === 'hybrid' || i.fuel === 'phev';
  const band = i.fuel === 'ev' ? b.ev : b.mid;

  if (purchase) {
    if (isNew && i.seller === 'dealer') {
      lines.push(line({ id: 'sales-tax', label: 'Vehicle privilege tax (0.5%, new car from an Oregon dealer)', kind: 'tax', amount: i.price * p.privilege.rate, when: 'once', source: 'privilege', note: 'On the retail price; a trade-in and the document fee are not deducted or added. Oregon has no sales tax.' }));
    } else {
      notes.push('Oregon has no sales tax: a used car (more than 7,500 miles or already registered in Oregon) or a private sale owes no privilege tax.');
    }
    if (hy) lines.push(line({ id: 'title', label: 'Certificate of title (by combined MPG rating)', kind: 'title', amount: null, range: [b.mid.title, b.gte40.title], when: 'once', source: 'fees', note: `$${b.mid.title} at 20-39 MPG, $${b.gte40.title} at 40 MPG or more.` }));
    else lines.push(line({ id: 'title', label: i.fuel === 'ev' ? 'Certificate of title (all-electric)' : 'Certificate of title (20-39 MPG)', kind: 'title', amount: band.title, when: 'once', source: 'fees', note: i.fuel === 'ev' ? undefined : `$${b.lt20.title} below 20 MPG, $${b.gte40.title} at 40 MPG or more.` }));
    if (isNew) lines.push(line({ id: 'plate', label: 'New license plates', kind: 'plate', amount: p.plate, when: 'once', source: 'fees' }));
  }

  const regLabel = `Registration (${years} years${isNew ? ', first registration of a new car' : ''})`;
  if (hy) lines.push(line({ id: 'reg', label: `${regLabel}, by MPG rating`, kind: 'registration', amount: null, range: [b.mid.reg * mult, b.gte40.reg * mult], years, when: 'cycle', deferred, source: 'fees', note: `$${b.mid.reg} per two years at 20-39 MPG, $${b.gte40.reg} at 40 MPG or more.` }));
  else lines.push(line({ id: 'reg', label: i.fuel === 'ev' ? `${regLabel}, all-electric` : `${regLabel}, 20-39 MPG`, kind: 'registration', amount: band.reg * mult, years, when: 'cycle', deferred, source: 'fees', note: i.fuel === 'ev' ? '$86 per two years if enrolled in OReGO, the per-mile road usage charge program.' : `$${b.lt20.reg} per two years below 20 MPG, $${b.gte40.reg} at 40 MPG or more.` }));

  if (typeof c?.localFee === 'number' && (c.localFee as number) > 0) lines.push(line({ id: 'county-fee', label: `County registration fee (${c.name as string}, ${years} years)`, kind: 'local', amount: (c.localFee as number) * mult, years, when: 'cycle', deferred, source: 'fees' }));

  const deq = c?.deq as string | undefined;
  if (deq && i.fuel !== 'ev' && age(i) >= p.inspection.newExemptYears) {
    lines.push(line({ id: 'inspection', label: `DEQ emissions test (${deq === 'portland' ? 'Portland' : 'Medford'} area, every two years)`, kind: 'inspection', amount: p.inspection.fees[deq], years: p.inspection.years, when: 'cycle', deferred, source: 'deq-fees', note: 'Only inside the DEQ testing boundary; paid after a passing test.' }));
  }
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
