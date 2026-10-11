import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('new-hampshire');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('new-hampshire', 1);
const renew5 = K.renew('new-hampshire', 5);
const ev = K.calc('new-hampshire', { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'new-hampshire',
  title: 'New Hampshire Car Registration Cost 2026: Permit, State Fee',
  description: `New Hampshire car registration in 2026: no sales tax, town permit of 18 to 3 mills of list price, state fee $42 to $66, $35 title. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'New Hampshire car registration cost',
  intro: 'New Hampshire has no sales tax, so the cost of a car shows up at the town clerk, through a permit fee that shrinks as the car ages.',
  resume: `A new $35,000 gasoline car registered in Manchester costs ${K.usd(r.atPurchase)} in public charges, with no sales tax. Most of it is the municipal permit fee: ${K.usd(v('permit'))}, or 18 mills per dollar of the list price for a current model year car, paid to the city. The state adds $${v('reg')} for a car of 3,001 to 5,000 lb under the fee schedule in force since January 1, 2026, a $35 title and $8 for two plates, and Manchester adds $17 of its own small fees. The permit falls every year, to 15 mills, then 12, 9 and 6, and settles at 3 mills from the fifth year, so the same car costs about ${K.usd(renew.perYear)} to renew the next year and about ${K.usd(renew5.perYear)} in year six. A battery electric car pays a $100 yearly surcharge, which puts it at ${K.usd(ev.atPurchase)} when new.`,
  body: (h) => `
<h2>The permit fee, town by town</h2>
<p>Registering a car in New Hampshire starts at your city or town office, which collects the permit fee before the state part can be done. The fee is set by law on the maker's list price and the model year, not on what you paid: $18 per $1,000 for the current model year, then $15, $12, $9, $6 and $3, as the ${h.src('nh:manchester', 'Manchester tax collector')} lists it. A first registration is prorated to your renewal month, so the first bill can be a little higher or lower than a full year. Towns also add small fees of their own, such as a clerk fee, a municipal agent fee or a transportation improvement fee; in Manchester they total $15 a year, plus $2 for the title application.</p>
<h2>The state fees went up in 2026</h2>
<p>The 2026-2027 state budget raised several DMV charges on January 1, 2026: the title went from $25 to $35, and the weight-based state registration fee from $31.20 to $42 for vehicles up to 3,000 lb, from $43.20 to $48 between 3,001 and 5,000 lb and from $55.20 to $66 up to 8,000 lb. Battery electric cars pay a $100 surcharge and plug-in hybrids $50, at every annual registration. Next door, ${h.a('state:vermont', 'Vermont')} charges a purchase tax that New Hampshire does not.</p>
<h2>Inspections are on hold</h2>
<p>The same budget repealed the yearly safety and emissions inspection for most passenger cars. A federal court case followed, and since February 2026 the ${h.src('nh:inspection', 'Division of Motor Vehicles')} says the program is suspended: stations no longer issue stickers and no annual inspection is required for now. Owners remain responsible for keeping their cars safe, and the rule could change if the courts decide otherwise.</p>`,
  faqs: [
    { q: 'Why does New Hampshire charge a permit fee instead of sales tax?', a: 'The state has no general sales tax. Cities and towns collect a permit fee at each registration, computed on the car’s list price and model year, and it funds local roads and services. It is highest for a current model year car, at 18 mills per dollar, and falls to 3 mills from the fifth year.' },
    { q: 'How much did the New Hampshire title fee change in 2026?', a: 'Under the state budget, the title fee rose from $25 to $35 for transactions on or after January 1, 2026. Duplicate titles and title transfers also cost $35. Recording a security interest stayed at $20, and towns may add a small title application fee of their own.' },
    { q: 'Do you still need a car inspection in New Hampshire in 2026?', a: 'Not for now. The Legislature repealed the yearly inspection for most passenger vehicles, and since February 2026 the state says the program is suspended while a federal lawsuit continues. Stations no longer issue state stickers, but owners must still keep their cars safe to drive.' },
  ],
  related: ['car-registration-fees', 'vehicle-inspection-cost', 'ev-registration-fee-by-state', 'state:vermont', 'title-and-registration-fees', 'dmv-fees-calculator'],
});
