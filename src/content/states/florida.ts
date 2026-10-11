import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

type L = { lines: { id: string; amount: number | null }[] };
const r = K.calc('florida');
const v = (id: string, x: L = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const used = K.calc('florida', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019, county: 'orange-county' });
const heavy = K.calc('florida', { weightLbs: 4600, fuel: 'ev' });
const counties = K.data('florida').counties!;
const none = counties.filter((c) => c.localRate === 0).map((c) => c.name);
const top = counties.filter((c) => c.localRate === Math.max(...counties.map((x) => x.localRate as number))).map((c) => c.name);

export default defineState({
  slug: 'florida',
  title: 'Florida Registration Fees 2026: $225 Fee, Tax, Title, Weight',
  description: `Florida registration fees for 2026: $225 initial fee without a plate to transfer, weight-based registration, $75.75 title, 6% tax plus county surtax on the first $5,000. New car: ${K.usd(r.atPurchase)}.`,
  h1: 'Florida registration fees',
  intro: 'Florida charges little to renew a car but a lot to put a first Florida plate on it.',
  resume: `A new $35,000 gasoline car bought from a Miami-Dade dealer costs ${K.usd(r.atPurchase)} in taxes and fees at purchase, before any dealer fee: ${K.usd(v('sales-tax'))} of 6% state sales tax, ${K.usd(v('local-tax'))} of county surtax (1% on the first $5,000 only), the $75.75 title, the $225 initial registration fee charged when there is no Florida plate to transfer onto the car, and ${K.usd(v('reg'))} of registration for a car of 3,500 pounds or more, add-on fees included. After that the yearly renewal is just the weight fee, from $28.10 to $46.10 for a car. Florida has no inspection and no yearly tax on the car's value. The dealer fee is not capped: Florida only requires a printed disclosure on every document where it appears, and the fee is taxed with the car.`,
  body: (h) => `
<h2>The $225 that buyers do not expect</h2>
<p>Florida charges a one-time $225 initial registration fee whenever a car is registered without a Florida plate that can be moved onto it. A first-time Florida buyer, or a newcomer from another state, pays it; someone replacing a car they already registered in Florida can usually transfer the plate and avoid it. On a cheap used car, this fee can exceed the yearly registration several times over. The ${h.src('fl:pinellas', 'county tax collector fee schedule')} lists it at the top.</p>
<h2>A county surtax that stops at $5,000</h2>
<p>Every Florida county may levy a discretionary sales surtax, and on cars it applies only to the first $5,000 of the price, as ${h.src('fl:fs-212054', 'section 212.054')} of the Florida Statutes provides. The highest rate in 2026 is ${K.listOf(top)}'s, and ${K.listOf(none)} ${none.length > 1 ? 'levy' : 'levies'} none, according to the ${h.src('fl:dr15dss', 'Department of Revenue table for 2026')}. The surtax follows the county on your registration, not the dealer's county. On an $18,000 used car bought privately in Orange County, the state tax is ${K.usd(v('sales-tax', used))} and the surtax ${K.usd(v('local-tax', used))}.</p>
<h2>Weight, not value</h2>
<p>Florida prices registration by weight in three automobile classes, with light trucks in their own brackets. A heavy electric SUV of 4,600 pounds pays the top automobile rate, ${K.usd(v('reg', heavy))} a year, the same as any car of 3,500 pounds or more, and no EV surcharge was found in the fee schedules read for this site. Because the value does not matter, a $90,000 car and a $25,000 car of the same weight renew for the same amount.</p>`,
  faqs: [
    { q: 'Why do I have to pay $225 to register a car in Florida?', a: 'It is the initial registration fee Florida charges when no Florida license plate is transferred onto the vehicle. You avoid it by moving a plate from a car you no longer own; you pay it if this is your first Florida registration, including after moving from another state.' },
    { q: 'How much is the Florida car sales tax with the county surtax?', a: `6% of the price after the trade-in, plus the county surtax on the first $5,000 only. In Miami-Dade, a $35,000 car pays ${K.usd(v('sales-tax'))} of state tax (the dealer fee included) and ${K.usd(v('local-tax'))} of surtax. In counties without a surtax, only the 6% applies.` },
    { q: 'How much does it cost to renew a car registration in Florida?', a: 'For an automobile, $28.10 a year under 2,500 pounds, $36.10 from 2,500 to 3,499 pounds and $46.10 from 3,500 pounds, add-on fees included, as published by county tax collectors. Two-year renewals cost twice as much. Payment by card adds a processing fee.' },
    { q: 'Does Florida require a vehicle inspection?', a: 'No. Florida has no safety inspection and no emissions test for private passenger cars, so no inspection fee appears in the calculator. The yearly bill is therefore only the weight-based registration fee.' },
  ],
  related: ['dmv-fees-calculator', 'title-and-registration-fees', 'car-sales-tax-calculator', 'state:georgia', 'state:texas', 'car-registration-fees'],
});
