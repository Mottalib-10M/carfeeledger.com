import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const otd = st.rank((s) => K.calc(s).outTheDoor, { pricedTax: true });
const lo = otd[0], hi = otd[otd.length - 1];
const capped = st.count((S) => S.docFeeCap !== null);
const tx = K.calc('texas');

export default definePage({
  id: 'out-the-door-price-calculator',
  group: 'buying',
  order: 20,
  slug: 'out-the-door-price-calculator',
  nav: 'Out-the-door price calculator',
  card: 'The final price of a car: price, taxes, government fees and doc fee, minus your trade-in.',
  title: 'Out-the-Door Price Calculator 2026: Every State Fee Added',
  description: `Out-the-door price calculator for 2026: price plus your state's sales tax, title, plates, registration and doc fee, minus trade-in, in all ${n} jurisdictions.`,
  h1: 'Out-the-door price calculator',
  intro: 'The out-the-door price is the only number that matters at signing: everything you owe, government fees included.',
  resume: `The out-the-door price is the agreed price of the car plus the purchase tax, the title, the plates and registration, any county fees, inspection and EV charges collected at purchase, and the dealer's documentation fee, minus the trade-in. For a $35,000 car with no trade-in, it ranges from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name}, so the same sticker can mean very different checks depending on where the car is registered. Asking for the out-the-door price in writing, before talking about monthly payments, is the simplest way to compare two dealers. This calculator builds it from the state's own fee schedule; ${capped} jurisdictions cap the documentation fee by law, and the calculator uses that cap unless you type the dealer's figure.`,
  faqs: [
    { q: 'What should be on an out-the-door quote?', a: 'The selling price, each tax with its rate, the title fee, the registration and plate fees, any county or inspection fee collected by the dealer, the documentation fee, and every add-on with its own price, minus the trade-in and any rebate. A single "fees" line hides what you can negotiate (the dealer’s own charges) behind what you cannot (the government’s).' },
    { q: 'Which parts of the out-the-door price can I negotiate?', a: 'The price of the car, the trade-in value, add-ons such as coatings or etching, and in states without a cap the documentation fee. The purchase tax, title, registration and inspection amounts are set by the state and county and should match the figures in this calculator for your county.' },
    { q: 'Why is the out-the-door price in Texas higher than the price plus 6.25%?', a: `Because the registration of a new car sold by a Texas dealer covers 24 months, the title and county fees are added, and the dealer usually charges a documentary fee. For a $35,000 car in Harris County the government and dealer charges at purchase come to ${K.usd(tx.atPurchase)}, of which ${K.usd(tx.lines.find((l) => l.id === 'sales-tax')?.amount ?? 0)} is the motor vehicle sales tax.` },
    { q: 'Does the out-the-door price include insurance or the first loan payment?', a: 'No. It is what you owe to complete the purchase and put the car on the road legally. Insurance is bought separately, and if you finance the car, the out-the-door price minus your down payment becomes the amount financed, on which interest is charged.' },
  ],
  body: (h) => `
<h2>How the final price is built</h2>
<p>Start from the price you agreed with the seller. Add the purchase tax computed on the state's base: in most states the price minus the trade-in, in some the full price. Add the one-time title fee and, if you get new plates, the plate or first-registration fee. Add the registration for the first period, which can cover one or two years, and the county or city fees collected with it. Add an inspection or emissions fee if the state collects it at registration, and the yearly EV or hybrid surcharge if it applies. Add the documentation fee. Subtract the trade-in allowance and any cash rebate applied at signing. The result is the out-the-door price.</p>
<h2>Out the door versus "due at signing"</h2>
<p>When the trade-in is worth more than the loan on it, the equity lowers the out-the-door price. When you owe more than the trade-in is worth, the negative equity is often added to the new loan: it does not change the taxes in most states but it raises the amount financed. The ${h.a('car-payment-calculator', 'car payment calculator')} shows the effect on the monthly payment.</p>
<h2>Fees that may come later</h2>
<p>In a few states part of the government bill is not paid at signing. A used car can keep the seller's registration until its expiration date, and a yearly property tax can be billed by the town months after the purchase. The calculator lists those amounts as due within the first 12 months so that the out-the-door price stays what you really pay that day, and the ${h.a('car-ownership-cost', 'ownership cost calculator')} spreads them over the years you keep the car.</p>
<h2>Compare before you visit</h2>
<p>Run the same car in two states if you live near a border: the tax follows your home address, not the dealer's, but registration and plates are paid where you register. The ${h.a('doc-fee-by-state', 'doc fee page')} lists which states cap the dealer's documentation charge.</p>`,
  tool: 'otd',
  table: 'otd',
  related: ['dmv-fees-calculator', 'car-sales-tax-calculator', 'doc-fee-by-state', 'car-payment-calculator', 'state:texas', 'state:california'],
  sources: ['ftc-car-buying', 'tx:cpa-consideration', 'tx:doc-fee', 'ca:doc-fee', 'fl:doc-fee'],
});
