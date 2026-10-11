import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('south-carolina');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('south-carolina', { fuel: 'ev', weightLbs: 4200 });
const cheap = K.calc('south-carolina', { condition: 'used', seller: 'private', price: 6000, modelYear: 2014 });
const renew = K.renew('south-carolina', 1);
const renewEv = K.renew('south-carolina', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'south-carolina',
  title: 'South Carolina Car Sales Tax 2026: $500 Cap, Title, Plates',
  description: `South Carolina car sales tax 2026: a 5% infrastructure fee capped at $500, $15 title, $40 for two years of plates, EV fee $120. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'South Carolina car sales tax and DMV fees',
  intro: 'South Carolina caps what you pay to title a car at $500, then sends the bigger bill every year from the county.',
  resume: `A new $35,000 gasoline car bought from a South Carolina dealer costs ${K.usd(r.atPurchase)} at purchase: the infrastructure maintenance fee of 5% stops at its ${K.usd(v('sales-tax'))} maximum, the title is ${K.usd(v('title'))}, two years of registration cost ${K.usd(v('reg'))} and the dealer closing fee is shown at ${K.usd(r.docFee)}, the amount South Carolina treats as approved without review. Any car priced above $10,000 reaches the same $500, so the state charge does not grow with the price. What does grow is the county property tax: each county taxes the car every year on a value set by its auditor, at the local millage, and SCDMV will not issue or renew the plates until that bill is paid. It is not in our total because no statewide table exists. An electric SUV adds a $120 road use fee every two years, for ${K.usd(ev.atPurchase)} at purchase. Renewing costs ${K.usd(renew.perYear)} a year in state fees for a gasoline car and ${K.usd(renewEv.perYear)} for an electric one, before the county tax.`,
  body: (h) => `
<h2>A 5% fee that stops at $500</h2>
<p>South Carolina does not apply its sales tax to cars. Instead, ${h.src('sc:imf', 'section 56-3-627 of the Code')} charges an infrastructure maintenance fee of 5% of the price when a car is first titled or registered in the state, capped at $500. The trade-in comes off before the 5% is computed, so it only changes the bill on cars under $10,000 net. A private sale is charged on the fair market value with the same cap: an older $6,000 car bought from a neighbor costs ${K.usd(cheap.atPurchase)} to title and register. A newcomer whose car was already registered in another state pays a flat $250, and members of the military on active duty pay nothing.</p>
<h2>Plates for two years, and a fee for electric drive</h2>
<p>Registration runs for two years: $40 for most owners, $38 at age 64 and $36 at 65 or older. Electric cars pay a $120 road use fee with each biennial registration and hybrids or plug-in hybrids pay $60, because they buy less fuel and so pay less gas tax. The title, or its transfer, costs $15. South Carolina has no safety or emissions inspection for private cars.</p>
<h2>The yearly county tax</h2>
<p>The largest recurring cost is local. The county auditor values the car, applies the millage of the county, school district and city, and mails a bill before each registration year; paying it is a condition of the renewal under the ${h.src('sc:property', 'property tax provisions of the Code')}. Rates differ widely between counties, so ask your county treasurer. To compare a state that has no yearly tax on the car, see ${h.a('state:georgia', 'Georgia')}, or estimate your own bill with the ${h.a('dmv-fees-calculator', 'DMV fees calculator')}.</p>`,
  faqs: [
    { q: 'Is the South Carolina infrastructure maintenance fee charged on a private sale?', a: 'Yes. When you buy from someone other than a dealer and first register the car in your name, the fee is 5% of the fair market value, still capped at $500. Transfers between close relatives, to an heir and a few other cases are excluded. SCDMV may use the bill of sale or a used-car value guide to set the value.' },
    { q: 'What do hybrid owners pay extra to register in South Carolina?', a: 'A hybrid or plug-in hybrid pays a road use fee of $60 for each two-year registration on top of the $40 registration fee, while a fully electric car pays $120. The fee is collected when the car is titled or registered, and the money goes to the Infrastructure Maintenance Trust Fund for roads.' },
    { q: 'Do I have to pay county property tax before getting South Carolina plates?', a: 'Yes. Under state law the registration cannot be issued until the county property tax on the car for that year is paid. A car bought from a dealer gets its first registration through the dealer, and the county then sends the tax notice; at every later renewal the receipt or electronic proof of payment is required.' },
  ],
  related: ['car-sales-tax-calculator', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'state:georgia', 'doc-fee-by-state', 'dmv-fees-calculator'],
});
