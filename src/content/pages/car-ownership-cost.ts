import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';
import { loan } from '../../lib/engine/loan';

const st = K.st;
const n = st.N();
const five = (slug: string) => st.atPurchase(slug) + [1, 2, 3, 4].reduce((s, y) => s + K.renew(slug, y).perYear, 0);
const r = st.rank(five, { pricedTax: true });
const lo = r[0], hi = r[r.length - 1];
const pct = K.pct(K.P.loan.defaultApr, 0);
const L = loan({ price: 35000, down: 5000, tradeIn: 0, feesFinanced: st.atPurchase('texas'), apr: K.P.loan.defaultApr, months: 60 });

export default definePage({
  id: 'car-ownership-cost',
  group: 'owning',
  order: 50,
  slug: 'car-ownership-cost',
  nav: 'Car ownership cost',
  card: 'Taxes, fees, renewals and loan interest over the years you keep the car, in your state.',
  title: 'Car Ownership Cost 2026: Taxes, Renewals and Loan by State',
  description: `Car ownership cost calculator for 2026: purchase taxes, yearly renewals and loan interest over 3 to 10 years in any of the ${n} jurisdictions, plus insurance.`,
  h1: 'Car ownership cost calculator',
  intro: 'What a car costs you is the price plus everything the state, the lender and the insurer collect while you keep it.',
  resume: `Over five years, the government part alone (the taxes and fees at purchase plus four yearly renewals) costs from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name} for the same $35,000 gasoline car. Financing adds interest: on a five-year loan at ${pct} APR with $5,000 down and the Texas taxes and fees rolled in, the interest comes to ${K.usd(L.interest)}. Insurance and fuel depend on you, your car and your driving, so the calculator asks for your own figures instead of using an average. It does not count depreciation, maintenance or repairs, which no official schedule sets. What it does count, it takes from the same state engines as the rest of the site: purchase tax, title, registration, value-based taxes as they decline, EV surcharges and inspections, year by year.`,
  faqs: [
    { q: 'Which state is cheapest to own a car in?', a: `For the government fees alone over five years on a $35,000 gasoline car, ${lo.name} comes out lowest and ${hi.name} highest in the data of this site. The ranking changes with the car: value-based states weigh more on expensive new cars, weight-based states on heavy trucks, and EV surcharges on electric cars.` },
    { q: 'Why is insurance not filled in automatically?', a: 'Because no official source gives the premium a given driver will pay. Averages published by regulators describe past premiums across all drivers, and your rate depends on your record, your car, your coverage and your ZIP code. Type the figure from your quote to include it.' },
    { q: 'Does keeping a car longer lower the yearly cost?', a: 'The purchase tax and title are paid once, so they weigh less per year the longer you keep the car, and value-based taxes fall with age. Flat registration and EV fees stay the same. Loan interest stops when the loan is repaid, which is why the calculator shows the cost over the years you choose.' },
    { q: 'Is depreciation included?', a: 'No. Depreciation is a real cost but it depends on the model, the mileage and the market, and no official schedule gives it. The calculator sticks to amounts set by law or chosen by you, so add your own estimate of the resale value at the end of the period.' },
  ],
  body: (h) => `
<h2>What the calculator adds</h2>
<p>Year one carries the purchase: tax, title, plates, first registration and the dealer's documentation fee. Each following year adds the renewal of the registration, recomputed by the state's engine as the car ages, so that value-based taxes fall and fixed fees stay put. Loan interest is added month by month for the years you keep the car. Your insurance and fuel are added as you type them.</p>
<h2>Where states differ over time</h2>
<p>A state with a high purchase tax and low renewals looks expensive at the start and cheap later; a state with a value tax every year looks the other way. Comparing the first bill alone, as most fee tables do, can therefore point to the wrong state. The ${h.a('license-plate-renewal', 'renewal page')} isolates the yearly part and the ${h.a('dmv-fees-calculator', 'DMV fees calculator')} the purchase part.</p>
<h2>Financing choices</h2>
<p>Rolling taxes and fees into the loan raises the interest; paying them in cash raises the cash needed at signing. The ${h.a('car-payment-calculator', 'car payment calculator')} shows the monthly payment for each choice.</p>
<h2>What is left out</h2>
<p>Depreciation, maintenance, repairs, tires, parking, tolls and fines are not counted, because none of them is set by a public schedule. The result is therefore a floor for the cost of owning the car, built only from figures that can be checked.</p>`,
  tool: 'tco',
  state: 'texas',
  related: ['car-payment-calculator', 'license-plate-renewal', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'state:texas', 'state:california'],
  sources: ['cfpb-auto-loan', 'irs-sales-tax', 'tx:txdmv-reg', 'ca:dmv-vlf'],
});
