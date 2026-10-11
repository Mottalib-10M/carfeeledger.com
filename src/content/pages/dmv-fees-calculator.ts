import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const all = st.rank((s) => st.atPurchase(s), { pricedTax: true });
const lo = all[0], hi = all[all.length - 1];
const partial = K.states.filter((s) => K.data(s.slug).exactness === 'partial').length;
const ca = K.calc('california');
const caCounty = ca.lines.find((l) => l.id === 'county');

export default definePage({
  id: 'dmv-fees-calculator',
  group: 'fees',
  order: 5,
  slug: 'dmv-fees-calculator',
  nav: 'DMV fees calculator',
  card: 'Tax, title, registration, plates, inspection and EV fee for any car in any state, line by line.',
  title: 'DMV Fees Calculator 2026: Tax, Title and Plates, Any State',
  description: `DMV fees calculator for 2026: tax, title, registration, plates, inspection and EV fees for any car in all ${n} jurisdictions, each line sourced to its state.`,
  h1: 'DMV fees calculator',
  intro: 'Type the car once and get every government charge of the state where you will register it, with the source of each line.',
  resume: `A DMV fee estimate is only as good as the state formula behind it, so this calculator runs a separate engine for each of the ${n} jurisdictions and returns every charge as its own line: purchase tax at your county's rate, title, registration, plates, county fees, value-based yearly taxes, EV or hybrid surcharge, inspection, and the dealer documentation fee where a law caps it. For a new $35,000 gasoline car from a dealer, the taxes and fees due at purchase range from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name}. When a state leaves an amount to stations or towns, the line is listed apart with its official range instead of being guessed; ${partial} jurisdictions have at least one such line. The result also gives what you will pay to renew a year later.`,
  faqs: [
    { q: 'Is a DMV fee calculator the same as what the dealer will charge me?', a: 'No. The dealer adds its own charges (documentation fee, add-ons, delivery) and collects the state fees on your behalf. This calculator shows the government part line by line, plus the documentation fee at the legal cap where there is one, so you can check the "government fees" or "tag and title" line of a buyer’s order.' },
    { q: 'Why does the calculator ask for weight and fuel?', a: 'Because many states use them. Weight sets the registration fee in a large group of states, and electric or hybrid cars pay a yearly surcharge in most states to make up for the gas tax they do not pay. Leaving them at the default gives a fair answer for an ordinary sedan, but a heavy pickup or an EV can change the bill.' },
    { q: 'What does "due within the first 12 months" mean in the result?', a: `Some charges are not paid at signing. In California, for example, a used car keeps the seller’s registration year, so the registration fee, the vehicle license fee and the county fees${caCounty ? ` (${K.usd(caCounty.amount ?? 0)} in Los Angeles County)` : ''} are due at the next expiration date. The calculator keeps them apart from what you pay at purchase but counts them in the first-year total.` },
    { q: 'Can I use it for a car I already own?', a: 'Yes: the license plate renewal page uses the same engines in renewal mode, with the years you have owned the car. Value-based states lower the fee each year, so the renewal is often cheaper than the first registration, while flat-fee states charge the same amount every year.' },
  ],
  body: (h) => `
<h2>What the calculator adds up</h2>
<p>The <strong>purchase tax</strong> comes first because it is the largest line: a percentage of the price in most states, with or without a deduction for your trade-in, sometimes with a cap or a separate county rate. Then the <strong>title</strong>, a one-time fee, and the <strong>registration package</strong>: the base fee computed with the state's own formula, the small statewide add-ons collected with it, the county or city fees, and in some states a yearly tax on the car's value. <strong>EV and hybrid surcharges</strong> follow, then the <strong>inspection</strong> where the state requires one at registration. Finally the <strong>documentation fee</strong>, which is a dealer charge and not a government fee, appears at its legal cap or at the figure you type.</p>
<h2>Three things the calculator asks about you</h2>
<p>Your <strong>county or city</strong>, because local sales taxes and county fees follow the address on the registration, not the dealer's address. <strong>New or used, dealer or private seller</strong>, because states tax private sales differently, sometimes on a book value, and because some register a new car for two years. <strong>The trade-in</strong>, because most states deduct it from the taxable price and a few, California among them, do not: on a $10,000 trade-in, that difference alone is several hundred dollars.</p>
<h2>How to check a dealer's buyer's order with it</h2>
<p>Enter the agreed price, the trade-in and the documentation fee from the order, then compare line by line. The tax line should match within a few dollars; if it does not, ask which rate and which base the dealer used. The title and registration lines should match the state amounts; a gap often means a special plate, a lien fee or a penalty. The ${h.a('out-the-door-price-calculator', 'out-the-door price calculator')} presents the same figures as one final price, and the ${h.a('car-payment-calculator', 'car payment calculator')} shows what they add to a loan.</p>
<h2>Where the figures come from</h2>
<p>Each state's data file cites the motor vehicle agency, the department of revenue or the statute for every amount, with the date it was read, and the engine is tested against the examples the state publishes. The ${h.a('method', 'method page')} explains the arithmetic, and each ${h.a('car-registration-fees', 'state page')} lists what its calculation cannot know.</p>`,
  tool: 'fees',
  table: 'otd',
  related: ['out-the-door-price-calculator', 'car-sales-tax-calculator', 'title-and-registration-fees', 'car-registration-fees', 'state:california', 'state:florida'],
  sources: ['ca:dmv-fees', 'tx:fee-chart', 'fl:dr15dss', 'ga:tavt'],
});
