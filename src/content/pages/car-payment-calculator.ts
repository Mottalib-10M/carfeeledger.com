import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { loan, payment } from '../../lib/engine/loan';

const P = K.P.loan;
const ca = K.calc('california');
const L60 = loan({ price: 35000, down: 5000, tradeIn: 0, feesFinanced: ca.atPurchase, apr: P.defaultApr, months: 60 });
const L72 = loan({ price: 35000, down: 5000, tradeIn: 0, feesFinanced: ca.atPurchase, apr: P.defaultApr, months: 72 });
const noFees = payment(30000, P.defaultApr, 60);
const pct = K.pct(P.defaultApr, 0);

export default definePage({
  id: 'car-payment-calculator',
  group: 'buying',
  order: 30,
  slug: 'car-payment-calculator',
  nav: 'Car payment calculator',
  card: 'Monthly payment, interest and total cost, with the real taxes and fees of your state in the loan.',
  title: 'Car Payment Calculator 2026 With Your State Tax and Fees',
  description: 'Car payment calculator for 2026: monthly payment, total interest and amount financed, with your state’s sales tax, title and registration rolled into the loan.',
  h1: 'Car payment calculator',
  intro: 'Most payment calculators forget that the tax and the DMV fees are usually financed too.',
  resume: `A car payment depends on four numbers: the amount financed, the APR, the number of months and nothing else. The trap is the first one. If you finance a $35,000 car in Los Angeles County with $5,000 down and roll in the taxes and fees, the amount financed is ${K.usd(L60.amountFinanced)}, not $30,000, because the state and county charges at purchase come to ${K.usd(ca.atPurchase)}. At ${pct} APR over 60 months, that is ${K.usd(L60.monthly)} a month instead of the ${K.usd(noFees)} a calculator without fees would show, and ${K.usd(L60.interest)} of interest in total. Stretching the same loan to 72 months lowers the payment to ${K.usd(L72.monthly)} but raises the interest to ${K.usd(L72.interest)}. This calculator takes the taxes and fees from your state's engine and lets you pay them in cash instead.`,
  faqs: [
    { q: 'Is it better to pay the taxes and fees in cash or finance them?', a: `Paying them in cash lowers the amount financed and the interest. On the Los Angeles example, financing ${K.usd(ca.atPurchase)} of taxes and fees at ${pct} for 60 months costs roughly ${K.usd(payment(ca.atPurchase, P.defaultApr, 60) * 60 - ca.atPurchase)} of extra interest. Financing them keeps cash available, which can matter more; the calculator shows both.` },
    { q: 'How is a car loan payment calculated?', a: 'With the standard amortization formula used for installment loans: payment = amount × r ÷ (1 − (1 + r) to the power of −n), where r is the APR divided by 12 and n the number of months. Each payment covers the interest of the month on the remaining balance, and the rest reduces the balance.' },
    { q: 'Does a longer loan cost more even at the same APR?', a: `Yes, because interest runs on the balance for more months. On ${K.usd(L60.amountFinanced)} at ${pct}, going from 60 to 72 months adds ${K.usd(L72.interest - L60.interest)} of interest, and you stay longer with a balance that can exceed the car’s resale value for longer.` },
    { q: 'Where does the APR in the calculator come from?', a: `The default of ${pct} is only a starting value for the example; it is not a market rate. Type the APR printed on your lender’s offer: under the Truth in Lending rules, that disclosure must show the APR, the finance charge, the amount financed and the total of payments, which this calculator reproduces.` },
  ],
  body: (h) => `
<h2>From sticker price to amount financed</h2>
<p>The amount financed is the price of the car, plus the taxes and fees you do not pay in cash, minus the down payment and the trade-in. Dealers often present the monthly payment first; asking for the amount financed and the out-the-door price makes the numbers comparable between offers. The ${h.a('out-the-door-price-calculator', 'out-the-door price calculator')} gives the second figure for your state.</p>
<h2>What moves the payment the most</h2>
<p>The price and the down payment move it dollar for dollar. The APR matters more on long loans: one point of APR changes the total interest far more on 84 months than on 36. The term lowers the monthly amount but raises the total cost. The state matters too: the same car financed with its taxes and fees rolled in carries a different amount financed in each state, because the purchase tax alone can differ by thousands of dollars.</p>
<h2>Checking a lender's disclosure</h2>
<p>A car loan comes with a Truth in Lending disclosure showing the APR, the finance charge, the amount financed and the total of payments. Type the amount financed, APR and term into the calculator: the monthly payment should match to the cent or within a dollar of rounding. A gap usually means an add-on, a service contract or a fee was included in the amount financed.</p>
<h2>After the loan</h2>
<p>The payment is only part of what a car costs each year: registration renewals, any value-based tax, inspections and insurance continue. The ${h.a('car-ownership-cost', 'ownership cost calculator')} adds them up over the years you keep the car, using the same state engines, and the ${h.a('license-plate-renewal', 'renewal page')} shows the yearly DMV bill alone.</p>`,
  tool: 'loan',
  state: 'california',
  related: ['out-the-door-price-calculator', 'car-ownership-cost', 'dmv-fees-calculator', 'car-sales-tax-calculator', 'state:california', 'state:texas'],
  sources: ['cfpb-auto-loan', 'reg-z', 'ftc-car-buying', 'ca:cdtfa-rates'],
});
