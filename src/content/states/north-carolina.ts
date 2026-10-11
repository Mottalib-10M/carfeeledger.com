import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('north-carolina');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('north-carolina', { fuel: 'ev', weightLbs: 4200 });
const trade = K.calc('north-carolina', { tradeIn: 10000 });
const meck = K.calc('north-carolina', { county: 'mecklenburg-county', condition: 'used', seller: 'private', price: 14000, modelYear: 2018 });
const renew = K.renew('north-carolina', 1);
const renewEv = K.renew('north-carolina', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'north-carolina',
  title: 'North Carolina Highway Use Tax 2026: Title, Tag, Tax Costs',
  description: `North Carolina car costs for 2026: 3% highway use tax, $66.75 title, $46.25 plate, EV fee $214.50, property tax billed with the tag. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'North Carolina highway use tax, title and tag fees',
  intro: 'North Carolina swaps the sales tax for a 3% highway use tax, then sends your county property tax on the car with every tag renewal.',
  resume: `A new $35,000 gasoline car bought from a dealer in Wake County costs ${K.usd(r.atPurchase)} at the license plate agency: ${K.usd(v('sales-tax'))} of highway use tax at 3%, the $66.75 certificate of title, ${K.usd(v('reg'))} for the private passenger plate and ${K.usd(v('county-fee'))} of Wake County and regional transit registration taxes. Two more costs come within the year. The county property tax on the car is billed by NCDMV with the registration, at a rate and value set locally, and can be deferred 60 days on a new purchase. The safety inspection, ${K.usd(v('inspection'))} for a new car, is due before the first renewal because the dealer already inspected it. A trade-in counts: with $10,000 traded in, the tax drops to ${K.usd(v('sales-tax', trade))}. Renewing the same car runs about ${K.usd(renew.perYear)} a year before property tax. An electric SUV of 4,200 lb pays ${K.usd(ev.atPurchase)} at purchase because of the $214.50 yearly EV fee, and about ${K.usd(renewEv.perYear)} a year afterwards.`,
  body: (h) => `
<h2>Highway use tax: 3% at every title transfer</h2>
<p>North Carolina collects no sales tax on vehicles. Each time a title changes hands, NCDMV charges the ${h.src('nc:hut', 'highway use tax')} instead, at 3%. On a dealer sale the base is the purchase price plus any administrative document fee and accessories delivered with the car, less the trade-in credit, so the dealer's paperwork charge is taxed too. There is no ceiling for an ordinary buyer; the only cap a family is likely to meet is the $250 maximum for a newcomer who has owned the car for more than 90 days before moving in. The money goes to the Highway Trust Fund and the General Fund.</p>
<h2>Tag and tax together</h2>
<p>The plate itself is cheap: $46.25 a year for a private passenger car, plus $17 in Wake, Durham and Orange counties for the county and regional transit taxes, according to the ${h.src('nc:fees', 'NCDMV fee table')}. The larger bill is the property tax. Under ${h.src('nc:tag-tax', 'Tag & Tax Together')}, your county's tax on the car is added to each renewal notice and must be paid with it, at a rate and valuation your county sets. Since October 1, 2026 the registration is fully electronic, with no sticker and no printed card unless you pay $5 for one.</p>
<h2>Inspections in 19 counties</h2>
<p>Every car pays for an annual safety inspection, $13.60 at a licensed station. In 19 counties, including Wake, Mecklenburg, Guilford, Forsyth and Durham, gasoline cars also take an OBD emissions test at the same visit, bringing the fee to $30; recent cars and those 20 years old or more skip it. A $14,000 used car from 2018 bought privately in Mecklenburg County therefore owes ${K.usd(meck.atPurchase)} before it can be plated. For a state that charges a percentage tax but no yearly local tax on the car, compare ${h.a('state:virginia', 'Virginia')}.</p>`,
  faqs: [
    { q: 'Is the dealer documentation fee taxed in North Carolina?', a: 'Yes. NCDMV computes the 3% highway use tax on the purchase price plus any administrative document fee and the accessories attached at delivery, less the trade-in credit. A $699 dealer fee therefore adds about $21 of tax. North Carolina sets no maximum on that dealer fee, so compare it before you sign.' },
    { q: 'Can I delay paying the vehicle property tax after buying a car in North Carolina?', a: 'Yes. When you title and register a newly purchased car, you can defer the county property tax for 60 days by taking a limited registration plate. Every other tax and fee is due at the counter, and the property tax must be paid before the limited plate expires, with no grace period.' },
    { q: 'How much is the North Carolina EV registration fee in 2026?', a: 'An electric car pays $214.50 a year on top of the $46.25 passenger registration, and a plug-in hybrid pays $107.25, according to the NCDMV fee table. Ordinary hybrids pay nothing extra. Electric cars still need the annual safety inspection, which costs $13.60 at a licensed station.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'vehicle-inspection-cost', 'doc-fee-by-state', 'state:virginia', 'state:georgia'],
});
