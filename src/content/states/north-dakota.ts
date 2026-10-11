import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('north-dakota');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('north-dakota', { fuel: 'ev', weightLbs: 4200 });
const truck = K.calc('north-dakota', { weightLbs: 5400, body: 'truck' });
const used = K.calc('north-dakota', { condition: 'used', seller: 'private', price: 12000, modelYear: 2015 });
const trade = K.calc('north-dakota', { tradeIn: 10000 });
const renew = K.renew('north-dakota', 1);

export default defineState({
  slug: 'north-dakota',
  title: 'North Dakota Car Registration Fees 2026: 5% Excise, Weight',
  description: `North Dakota registration fees for 2026: 5% excise tax, $5 title, plates from $49 to $274 by weight and age, EV road fee $120. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'North Dakota car registration fees and excise tax',
  intro: 'North Dakota keeps it simple: one 5% excise tax on the price, a $5 title, and a plate fee that depends on how heavy the car is and how long it has been on the road.',
  resume: `A new $35,000 gasoline car weighing 3,500 lb costs ${K.usd(r.atPurchase)} in state taxes and fees in North Dakota: ${K.usd(v('sales-tax'))} of motor vehicle excise tax at 5%, the $5 title and ${K.usd(v('reg'))} for a full year of registration in the 3,200 to 4,499 lb bracket. No county or city tax is added, and there is no inspection to pay for. The trade-in is credited, so a $10,000 trade-in brings the excise down to ${K.usd(v('sales-tax', trade))}. The plate fee falls as the car ages: the same car pays ${K.usd(renew.perYear)} again next year, then $81 from its 7th year of registration, $69 from its 10th and $57 from its 13th. Battery electric cars add a $120 road use fee each year and plug-in hybrids $50, so a 4,200 lb EV owes ${K.usd(ev.atPurchase)} at purchase. A car first registered after the start of the registration year pays a prorated plate fee, which can lower the first bill.`,
  body: (h) => `
<h2>Five percent, no local add-on</h2>
<p>North Dakota does not apply its sales tax to vehicles. The ${h.src('nd:excise', 'motor vehicle excise tax')} of 5% is charged on the purchase price of every vehicle bought in or outside the state for use on its roads, and no city or county rate is stacked on top. The ${h.src('nd:excise-def', 'Century Code definition of purchase price')} subtracts the trade-in allowed by the seller and leaves out manufacturer incentives that cut the amount paid. A car received as a gift is taxed on the average value of similar vehicles, as set by the Department of Transportation, so a family transfer is not automatically tax-free. A $12,000 used car from 2015 bought from a neighbor costs ${K.usd(used.atPurchase)} to title and plate.</p>
<h2>A plate fee built on weight and years</h2>
<p>Passenger plates follow a grid in section 39-04-19 with eight weight brackets and four age columns. The lightest cars, under 3,200 lb, pay $73 in their first six years and $49 from the 13th. A heavy SUV or pickup of 5,400 lb pays $142 at first, and the same buyer would owe ${K.usd(truck.atPurchase)} on a $35,000 purchase. Pickups are rated on their gross vehicle weight rating, which usually puts them a bracket or two higher than their empty weight. The ${h.src('nd:fee-schedule', 'NDDOT fee schedule')} counts years from the first registration, not the model year, so a 2025 model first plated in 2026 begins its six years at the top rate in 2026.</p>
<h2>Electric cars and the road use fee</h2>
<p>Since there is no fuel tax to collect from a battery car, North Dakota adds a $120 road use fee at each annual registration, and $50 for a plug-in hybrid. Ordinary hybrids pay the regular plate fee only. ${h.a('state:montana', 'Montana')}, by contrast, has no sales or excise tax on the purchase at all.</p>`,
  faqs: [
    { q: 'Does a trade-in lower the North Dakota excise tax?', a: 'Yes. The value the seller allows for your trade-in is deducted from the selling price before the 5% motor vehicle excise tax is applied, and manufacturer incentives that reduce the price at the time of purchase are excluded too. A $10,000 trade-in therefore saves $500 of excise tax on any vehicle.' },
    { q: 'Why does my North Dakota plate fee drop over time?', a: 'The passenger fee table in section 39-04-19 has four columns by years registered: years 1 to 6, 7 to 9, 10 to 12, and 13 and later. A 3,200 to 4,499 lb car pays $93, then $81, $69 and finally $57. NDDOT counts from the year the vehicle was first registered.' },
    { q: 'What does a North Dakota certificate of title cost?', a: 'Each application for a certificate of title costs $5, in addition to the registration fee and the 5% excise tax. A new car bought from a dealer is titled with a statement of transfer from the dealer, and the manufacturer must state the total shipping weight on the certificate of origin.' },
  ],
  related: ['car-registration-fees', 'dmv-fees-calculator', 'ev-registration-fee-by-state', 'state:montana', 'state:minnesota', 'car-sales-tax-calculator'],
});
