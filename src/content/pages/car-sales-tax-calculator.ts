import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const tax = st.rank((s) => st.taxOf(s));
const lo = tax[0], hi = tax[tax.length - 1];
const noTrade = st.which((S) => !S.tradeInCredit);
const local = st.count((S) => S.localRange[1] > 0);
const zero = tax.filter((t) => t.value === 0).map((t) => t.name);
const fl = K.calc('florida', { county: 'hamilton-county' });
const flLocal = fl.lines.find((l) => l.id === 'local-tax');

export default definePage({
  id: 'car-sales-tax-calculator',
  group: 'buying',
  order: 10,
  slug: 'car-sales-tax-calculator',
  nav: 'Car sales tax calculator',
  card: 'State and county tax on a car purchase, with each state’s rule on trade-ins, doc fees and caps.',
  title: 'Car Sales Tax Calculator 2026: State and County Rates',
  description: `Car sales tax calculator for 2026: the state and county rate on a car in all ${n} jurisdictions, trade-in credit or not, doc fee taxed or not, caps and first-dollar limits.`,
  h1: 'Car sales tax calculator',
  intro: 'The tax on a car is rarely just the state rate times the price: the base, the county and the trade-in all change it.',
  resume: `On a new $35,000 car bought from a dealer with no trade-in, the purchase tax runs from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name}${zero.length ? `, and ${K.listOf(zero)} charge no general tax on the purchase` : ''}. Three rules explain most of the spread besides the rate itself. First, the trade-in: most states tax only the difference between the price and the trade-in, but ${noTrade.length ? K.listOf(noTrade) : 'a few states'} tax the full price. Second, local taxes: in ${local} jurisdictions a county or city rate is added, and it follows the buyer's home address. Third, the base: some states tax the dealer's documentation fee, some cap the tax or apply the local rate only to the first few thousand dollars, as Florida does with its first $5,000. The calculator applies each of these rules from the state's own tax pages.`,
  faqs: [
    { q: 'Do I pay sales tax where I buy the car or where I live?', a: 'Where you register it. A dealer in another state may collect your home state’s tax, or you pay it at your motor vehicle office when you title the car; local add-ons follow the address on the registration. If you paid tax to another state, most states give a credit up to their own rate.' },
    { q: 'Does a trade-in always lower the tax?', a: `In most states yes, because only the price minus the trade-in allowance is taxed. ${noTrade.length ? `${K.listOf(noTrade)} ${noTrade.length > 1 ? 'are exceptions' : 'is an exception'}: there the full price is taxed even with a trade-in.` : ''} The calculator shows the trade-in rule of the state you pick under the trade-in field.` },
    { q: 'Is the tax different when I buy from a private seller?', a: 'Often. Several states tax a private sale on a book or presumptive value when it is higher than the price, and a few use a lower rate or a flat amount for older cars. The calculator taxes the price you type and adds a note when the state uses another value.' },
    { q: 'How much can a county surtax add on a car in Florida?', a: `Florida applies its county discretionary surtax only to the first $5,000 of the price. In Hamilton County, the highest rate in the state at 2%, the surtax on any car is therefore at most ${K.usd(flLocal?.amount ?? 0)}, whatever the price; the 6% state tax applies to the whole price.` },
  ],
  body: (h) => `
<h2>Why the same rate gives different taxes</h2>
<p>Two buyers in states with the same rate can pay very different amounts. The base is the first reason: a state that deducts a $10,000 trade-in taxes $25,000 on a $35,000 car, while a state that does not taxes $35,000. The dealer's documentation fee is taxable in some states and excluded in others. Rebates paid by the manufacturer are deducted in some states and taxed in others. Then come the limits: a maximum tax per vehicle, a lower rate on cheap used cars, or a local rate applied only to the first slice of the price.</p>
<h2>Sales tax, excise tax, title tax: same idea, different names</h2>
<p>Not every state calls it a sales tax. Some charge a motor vehicle excise tax collected at titling, Georgia a one-time title ad valorem tax that replaced both its sales tax and its yearly car tax, North Carolina a highway use tax, and a few states a privilege or document fee. The calculator labels each with the state's own name, because that is the word printed on the receipt.</p>
<h2>Local taxes follow your home address</h2>
<p>Where counties and cities add their own rate, the rate of your residence applies, even if the dealer is across the county line. Pick your county or city in the calculator; if your town has a rate the list does not show, open "Local tax rate override" and type it.</p>
<h2>What this page does not include</h2>
<p>The tax is only the first line of the bill. Title, plates and registration are on the ${h.a('title-and-registration-fees', 'tag and title page')}, the dealer fee caps on the ${h.a('doc-fee-by-state', 'doc fee page')}, and the whole bill as one number on the ${h.a('out-the-door-price-calculator', 'out-the-door price calculator')}. Yearly taxes on the car's value, which some states charge instead of or on top of a purchase tax, are on the ${h.a('vehicle-property-tax', 'vehicle property tax page')}.</p>`,
  tool: 'tax',
  table: 'tax',
  related: ['out-the-door-price-calculator', 'doc-fee-by-state', 'vehicle-property-tax', 'dmv-fees-calculator', 'state:georgia', 'state:florida'],
  sources: ['irs-sales-tax', 'ca:cdtfa-dealers', 'tx:cpa-tax', 'fl:fs-212054', 'ga:faq'],
});
