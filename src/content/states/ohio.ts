import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('ohio');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const tax = (x: { lines: { id: string; amount: number | null }[] }) => v('sales-tax', x) + v('local-tax', x);
const trade = K.calc('ohio', { tradeIn: 10000 });
const usedTrade = K.calc('ohio', { tradeIn: 10000, condition: 'used', modelYear: 2023 });
const butler = K.calc('ohio', { county: 'butler-county' });
const ev = K.calc('ohio', { fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('ohio', 1);

export default defineState({
  slug: 'ohio',
  title: 'Ohio Car Sales Tax 2026 by County, BMV Fees and Doc Fee Cap',
  description: `Ohio car sales tax 2026: 5.75% state plus 0.75% to 2.25% by county, $18 title, $36 plate, $8 deputy fee, EV $200. New $35,000 car in Franklin County: ${K.usd(r.atPurchase)}.`,
  h1: 'Ohio car sales tax and BMV fees',
  intro: 'In Ohio the county you live in sets the final sales tax rate on your car, and the trade-in only helps when the car is new.',
  resume: `A new $35,000 gasoline car bought from a dealer by a Franklin County resident costs ${K.usd(r.atPurchase)} in taxes and state fees: ${K.usd(tax(r))} of sales tax at 8% (the 5.75% state rate, 1.25% for the county and 1% for the central Ohio transit authority), the $18 certificate of title from the clerk of courts, the $36 passenger registration and the $8 deputy registrar fee. Local permissive taxes of $0 to $30 a year come on top, depending on your county, township and city. The county rate matters: the same car costs ${K.usd(butler.atPurchase)} in Butler County at 6.5%. A $10,000 trade-in on that new car cuts the tax to ${K.usd(tax(trade))}, but on a used car from a dealer the tax stays at ${K.usd(tax(usedTrade))}, because Ohio only credits trade-ins against new vehicles. Renewal costs about ${K.usd(renew.perYear)} a year before permissive taxes, and an electric car adds $200 a year, ${K.usd(ev.atPurchase)} at purchase for an EV at the same price.`,
  body: (h) => `
<h2>Your county sets the final rate</h2>
<p>Ohio's ${h.src('oh:rate', 'state sales tax')} is 5.75%, and each county adds its own permissive rate of 0.75% to 2.25%, sometimes with a transit levy. On October 11, 2026 the Department of Taxation's ${h.src('oh:finder', 'Finder')} returned 6.5% in Butler, Lorain, Stark and Wayne counties, 7.25% in most rural counties, 7.8% in Hamilton County and 8% in Cuyahoga and Franklin. Warren County, at 6.75% on the department's July 2023 map, is now at 7.25%. Private sales are not spared: the casual-sale exemption in the Revised Code excludes motor vehicles, so a car bought from a neighbor is taxed when it is titled. Parts of Delaware, Fairfield, Licking and Union counties pay the extra 0.5% transit levy too; type your exact rate in the calculator if you live there.</p>
<h2>Trade-ins only count on new cars</h2>
<p>The ${h.src('oh:trade-in', 'definition of price')} reduces the taxable amount by the trade-in only when a new motor vehicle dealer sells a new motor vehicle. Trade your old car in on a used one and you pay tax on the full price. The difference on a $35,000 car with a $10,000 trade-in is ${K.usd(tax(usedTrade) - tax(trade))} in Franklin County.</p>
<h2>Plates, deputy registrars and the doc fee</h2>
<p>The $36 registration is the $20 license tax plus a state fee that rose from $11 to $16 on January 1, 2026. Deputy registrars add $8 for a one-year registration. Hybrids pay $100 more a year, plug-in hybrids $150 and battery electric cars $200. Dealer documentation fees are capped at the lesser of 10% of the deal and an inflation-adjusted amount the Registrar publishes each year under ${h.src('oh:doc-fee', 'section 4517.261')}, so the old flat $250 limit no longer applies. Seven counties around Cleveland and Akron also require an E-Check every two years for gasoline cars from six years old. Across the border, ${h.a('state:pennsylvania', 'Pennsylvania')} charges 6%, plus 1% in Allegheny County and 2% in Philadelphia.</p>`,
  faqs: [
    { q: 'Why is the Ohio car sales tax higher in some counties?', a: 'Each county adds its own permissive sales tax of 0.75% to 2.25% to the 5.75% state rate, and some add a transit authority levy as well. In October 2026 the total ranged from 6.5% in Butler, Lorain, Stark and Wayne counties to 8% in Cuyahoga and Franklin, according to the Department of Taxation.' },
    { q: 'How much can an Ohio dealer charge for a documentary fee in 2026?', a: 'The documentary service charge cannot exceed the lesser of 10% of the amount the buyer pays, excluding tax, title and registration, and an amount the Registrar adjusts for inflation each September and publishes on a Department of Public Safety website. The old fixed $250 cap was replaced by this indexed amount in October 2024.' },
    { q: 'Do Ohio hybrids pay an extra registration fee?', a: 'Yes. Ohio adds $100 a year for a conventional hybrid, $150 for a plug-in hybrid and $200 for a battery electric car to each registration or renewal, on top of the $36 passenger fee, the deputy registrar fee and local permissive taxes. The fee is prorated when a car is registered for part of a year.' },
  ],
  related: ['car-sales-tax-calculator', 'doc-fee-by-state', 'out-the-door-price-calculator', 'state:pennsylvania', 'state:indiana', 'ev-registration-fee-by-state'],
});
