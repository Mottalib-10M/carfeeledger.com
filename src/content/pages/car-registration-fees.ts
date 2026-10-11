import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const reg = st.rank(st.regBill, { priced: st.REG_KINDS });
const lo = reg[0], hi = reg[reg.length - 1];
const med = st.median(reg.map((r) => r.value));
const n = st.N();
const byMethod = (m: string) => st.count((S) => S.regMethod === m);
const twoYear = st.which((S) => S.regYears > 1);

export default definePage({
  id: 'car-registration-fees',
  group: 'fees',
  order: 10,
  slug: 'car-registration-fees',
  nav: 'Car registration fees by state',
  card: 'The registration formula of every state, the first bill and the yearly renewal for the same car.',
  title: 'Car Registration Fees by State 2026: All 50 States and DC',
  description: `Car registration fees by state in 2026: the formula each state uses, from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name} for the same car, with county and plate fees included.`,
  h1: 'Car registration fees by state',
  intro: 'Registration is the one fee every car owner pays every year or two, and no two states compute it the same way.',
  resume: `For the same new $35,000 gasoline car of 3,500 pounds, the first registration bill (registration fee, plates, county fees, value-based taxes collected with registration and any EV surcharge, without the purchase tax or the title) runs from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name}, with a middle value of ${K.usd(med)} across the ${n} jurisdictions. The gap comes from the formula more than from the rate: ${byMethod('flat')} states charge a flat fee, ${byMethod('weight')} price it by weight, ${byMethod('value')} by the car's value, ${byMethod('age')} by its age and ${byMethod('mixed') + byMethod('horsepower')} combine several of these or use horsepower. For this car the most expensive bill is ${K.num(hi.value / Math.max(lo.value, 1), 0)} times the cheapest, and the ratio shrinks as the car ages wherever the fee follows value, which is why a single "average registration fee" says little. Pick a state in the calculator above to see each line of its bill and the source it comes from.`,
  faqs: [
    { q: 'Why is my registration so much higher than my friend’s in another state?', a: `Because the base differs. A flat-fee state charges the same amount for every car, while a value-based state charges a percentage of what the car is worth, so a new car there can owe several hundred dollars a year. Across the ${n} jurisdictions, the first bill for the same $35,000 car goes from ${K.usd(lo.value)} to ${K.usd(hi.value)}.` },
    { q: 'Does registration get cheaper as the car gets older?', a: 'Only in states that charge by value or by age. There the fee falls each year on a published schedule, sometimes for ten years or more. In flat-fee and weight-based states the yearly fee stays the same however old the car is; only an EV or hybrid surcharge or a county fee change moves it.' },
    { q: 'Do I pay registration again when I buy a used car?', a: 'It depends on the state. Several states let the existing registration year continue and charge only a transfer and title fee at purchase, with the full registration due at the next expiration date. Others start a new registration period on the day of purchase. The calculator shows the lines due later under "Due within the first 12 months".' },
    { q: 'Which states register cars for two years at a time?', a: twoYear.length ? `In the data files of this site, ${K.listOf(twoYear)} register an ordinary car for more than one year by default; the amount paid then covers the whole period. Some other states offer a longer period as an option, which the calculator does not assume.` : 'Some states offer two-year registrations as an option; the calculator uses each state’s default period and shows its length next to the fee.' },
  ],
  body: (h) => `
<h2>Five ways states set the fee</h2>
<p>A <strong>flat fee</strong> is the simplest: one amount for any passenger car, sometimes with a separate amount for light trucks. A <strong>weight</strong> schedule charges by pounds, either in brackets or per hundred pounds, which favors small cars and makes a heavy electric SUV cost more. A <strong>value</strong> schedule applies a rate to the price or the manufacturer's suggested retail price and lowers it each year; it often replaces a local property tax on the car. An <strong>age</strong> schedule uses fixed amounts that step down with the model year. A few states use <strong>horsepower</strong> or combine methods, for example a flat fee plus a value-based tax collected by the county.</p>
<p>On top of the base fee, most states add small fixed charges collected with registration: a highway patrol or road fee, a plate or reflectorization fee, an insurance verification fee, county road and bridge fees. They are listed line by line in the calculator because they explain why two cars with the same base fee rarely pay the same total.</p>
<h2>First bill or renewal?</h2>
<p>The first registration often costs more than the following ones. Some states charge a one-time fee for new plates or a first registration in the state; value-based fees are highest when the car is new; and a new car can be registered for a longer first period. The table at the bottom of this page uses the first bill. The ${h.a('license-plate-renewal', 'license plate renewal page')} shows the yearly cost afterwards, and the ${h.a('ev-registration-fee-by-state', 'EV registration fee page')} isolates the surcharges on electric and hybrid cars.</p>
<h2>What is not in a registration fee</h2>
<p>The purchase tax (sales, excise or title tax) is paid once when the car is bought and is shown on the ${h.a('car-sales-tax-calculator', 'car sales tax calculator')}. The title fee is also a one-time charge, covered with plates on the ${h.a('title-and-registration-fees', 'tag and title page')}. Inspections are paid to a station in most states and appear on the ${h.a('vehicle-inspection-cost', 'inspection cost page')}. Yearly property taxes billed separately by a town, as in some New England and Southern states, are on the ${h.a('vehicle-property-tax', 'vehicle property tax page')}.</p>
<h2>Reading the table</h2>
<p>Each row is computed by that state's own engine from its data file, for the same car, with the state's default county. Click a state name for the full breakdown, the sources and the questions that are specific to it.</p>`,
  tool: 'registration',
  table: 'registration',
  related: ['license-plate-renewal', 'title-and-registration-fees', 'ev-registration-fee-by-state', 'dmv-fees-calculator', 'state:california', 'state:texas'],
  sources: ['ca:dmv-fees', 'tx:txdmv-reg', 'fl:pinellas', 'ga:fees'],
});
