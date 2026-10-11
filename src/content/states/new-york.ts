import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('new-york');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const used = K.calc('new-york', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const alb = K.calc('new-york', { county: 'albany-county' });
const renew = K.renew('new-york', 1);
const heavy = K.calc('new-york', { weightLbs: 5000, body: 'truck' });

export default defineState({
  slug: 'new-york',
  title: 'New York DMV Fees 2026: Registration, Sales Tax, MCTD',
  description: `New York DMV fees for 2026: weight-based two-year registration, county use tax, $50 MCTD fee, 4% state plus local sales tax, yearly inspection. New car in NYC: ${K.usd(r.atPurchase)}.`,
  h1: 'New York DMV fees and car sales tax',
  intro: 'In New York the address on the registration decides almost everything: the sales tax rate, the county use tax, the commuter district fee and the emissions test price.',
  resume: `A new $35,000 gasoline car registered in New York City costs ${K.usd(r.atPurchase)} in taxes and DMV fees at purchase: ${K.usd(v('sales-tax'))} of sales tax at 8.875% (4% for the state and 4.875% for the city), the $50 title certificate, $25 for the plates, ${K.usd(v('reg'))} for a two-year registration of a 3,500 lb car, the $30 city vehicle use tax, the $50 Metropolitan Commuter Transportation District fee and up to $10 for the safety inspection. The same car registered in Albany County costs ${K.usd(alb.atPurchase)}, because the local sales tax is lower and there is no commuter district fee. Registration then renews every two years, about ${K.usd(renew.perYear)} a year in the city with the inspection. A used car bought privately for $18,000 owes ${K.usd(used.atPurchase)}: the seller collects nothing, and the buyer pays the sales tax to the DMV when registering.`,
  body: (h) => `
<h2>A fee by the hundred pounds</h2>
<p>New York sets the registration fee of a passenger car by weight, in 100-pound steps, from $26 for the lightest cars to $140 for those of 6,951 lb or more, for two years. The ${h.src('ny:fees', 'DMV fee schedule')} makes the difference visible: a 5,000 lb SUV registered as a light truck pays ${K.usd(v('reg', heavy))} for two years against ${K.usd(v('reg'))} for the 3,500 lb sedan, and its county use tax doubles in most counties once it passes 3,500 lb.</p>
<h2>Sales tax follows your address, not the dealer's</h2>
<p>A car is taxed at the rate of the place where it will be registered, which is why a Long Island resident who buys in Manhattan pays the Suffolk or Nassau rate. ${h.src('ny:pub718', 'Publication 718')} lists the rates, from 7% in three upstate counties to 8.875% in New York City. A trade-in the dealer takes reduces the taxable price, but a manufacturer's rebate does not: the ${h.src('ny:tb-trade', 'Tax Department bulletin')} treats the rebate as part of what you pay.</p>
<h2>An inspection every year</h2>
<p>Every registered car is inspected every 12 months and when it changes hands. The state caps the price: $10 for the safety part, plus $27 for the on-board emissions test in the metropolitan area or $11 elsewhere. New cars skip the emissions test for their first two model years and electric cars never take it, but both still pay the safety inspection. Across the river, ${h.a('state:new-jersey', 'New Jersey')} inspects only every two years and exempts new cars for five.</p>`,
  faqs: [
    { q: 'How much is the MCTD fee on a New York registration?', a: 'The Metropolitan Commuter Transportation District fee is $50 per two-year registration, charged when the car is registered in one of the twelve counties of the district: the five boroughs of New York City, Dutchess, Nassau, Orange, Putnam, Rockland, Suffolk and Westchester. It funds public transportation in the region.' },
    { q: 'What sales tax rate applies to a car in New York City?', a: 'New York City applies 8.875% on a vehicle: 4% for the state and 4.875% for the city and the commuter district. The rate depends on where you will register the car, not on where the dealer is, so a buyer from another county pays the rate of that county.' },
    { q: 'How often does a car need inspection in New York State?', a: 'Every 12 months, and also when ownership changes. The maximum fee is $10 for safety alone, plus $27 for the emissions test in the New York metropolitan area or $11 in the rest of the state. Cars in their first two model years, older than 25 years or fully electric skip the emissions part.' },
  ],
  related: ['dmv-fees-calculator', 'car-sales-tax-calculator', 'vehicle-inspection-cost', 'state:new-jersey', 'state:pennsylvania', 'license-plate-renewal'],
});
