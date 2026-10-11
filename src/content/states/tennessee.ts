import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('tennessee');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('tennessee', { fuel: 'ev', weightLbs: 4200 });
const nash = K.calc('tennessee', { county: 'davidson-county' });
const trade = K.calc('tennessee', { tradeIn: 10000 });
const renew = K.renew('tennessee', 1);
const renewEv = K.renew('tennessee', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'tennessee',
  title: 'Tennessee Car Sales Tax 2026: 7%, Local Cap, Title and Tags',
  description: `Tennessee car sales tax 2026: 7% state rate, local rate on the first $1,600, 2.75% single article tax, $26.50 tags, EV fee $200. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Tennessee car sales tax and registration fees',
  intro: 'In Tennessee almost all of the tax on a car goes to the state, because the local rate stops after the first $1,600.',
  resume: `A new $35,000 gasoline car bought in Shelby County costs ${K.usd(r.atPurchase)} in tax and state fees at the county clerk: ${K.usd(v('sales-tax'))} of state sales tax at 7% on the full price, only ${K.usd(v('local-tax'))} of local tax because the county's 2.25% applies to the first $1,600 alone, ${K.usd(v('single-article'))} of state single article tax at 2.75% on the slice from $1,600 to $3,200, the ${K.usd(v('title'))} title and the ${K.usd(v('reg'))} standard plate. In Nashville, where the local rate reaches 2.75%, the total is ${K.usd(nash.atPurchase)}: the county changes the bill by a few dollars at most. A $10,000 trade-in cuts the state tax to ${K.usd(v('sales-tax', trade))}, and a dealer's document fee is taxed. Counties add a wheel tax and clerk fees that are not in our figures. Renewal is ${K.usd(renew.perYear)} a year in state fees; an electric SUV pays ${K.usd(ev.atPurchase)} at purchase in 2026 and ${K.usd(renewEv.perYear)} at its 2027 renewal, when the electric fee rises to $274.`,
  body: (h) => `
<h2>The $1,600 rule</h2>
<p>Tennessee treats a car as a single article. The ${h.src('tn:single-article', 'Department of Revenue')} explains the three layers: the 7% state rate applies to the entire price, the local rate of your county or city applies only to the first $1,600, and an extra state tax of 2.75% applies to the part between $1,600 and $3,200. Local rates run from 2% to 2.75%, so the local share of the tax can never exceed $44, and the single article tax is $44 on any car priced above $3,200. Since February 2025, Davidson County's 0.5% transit surcharge has raised the Nashville rate to 2.75%, as the ${h.src('tn:davidson', 'Department’s rate map')} notes.</p>
<h2>What the county clerk collects</h2>
<p>Titles and plates are issued by the county clerk where you live. The clerk collects the sales tax on cars bought from private sellers, the tax on the dealer's document fee, the $11 title fee, the $26.50 standard plate and the county wheel tax, which each county sets on its own. Expect the clerk to add processing fees as well. New residents have 30 days to register a car, and a resident who buys out of state pays the difference if the other state's tax was lower.</p>
<h2>Electric and hybrid fees, no inspection</h2>
<p>An all-electric car pays $200 on top of the plate for renewals through 2026, then $274 in 2027; hybrids and plug-in hybrids pay $100. Both fees follow inflation from 2028. Emissions testing ended in 2022 in Hamilton, Rutherford, Sumner, Williamson, Wilson and Davidson counties, and there is no safety inspection. Compare with ${h.a('state:georgia', 'Georgia')}, which replaced its sales tax on cars with a one-time title tax, or with ${h.a('state:mississippi', 'Mississippi')}.</p>`,
  faqs: [
    { q: 'Why is the local sales tax on a Tennessee car so small?', a: 'Because Tennessee applies the local option rate only to the first $1,600 of the price of a single article such as a car. At the highest local rate of 2.75%, that is $44. The 7% state rate, by contrast, applies to the whole price, and a 2.75% state single article tax covers the slice between $1,600 and $3,200.' },
    { q: 'How much is the electric car fee in Tennessee in 2027?', a: 'For registration renewals from January 1, 2027 through December 31, 2027, an all-electric car pays $274 on top of the $26.50 standard plate, up from $200. From 2028 the amount is adjusted every year for inflation. Hybrids and plug-in hybrids pay $100 through 2027, also indexed afterward.' },
    { q: 'Does Tennessee still require an emissions test to renew tags?', a: 'No. Testing ended on January 14, 2022 in Hamilton, Rutherford, Sumner, Williamson and Wilson counties after the EPA approved a change to the state air quality plan, and Davidson County ended its own program on February 4, 2022. No county requires a test today, and there is no safety inspection.' },
  ],
  related: ['car-sales-tax-calculator', 'dmv-fees-calculator', 'ev-registration-fee-by-state', 'state:georgia', 'state:mississippi', 'out-the-door-price-calculator'],
});
