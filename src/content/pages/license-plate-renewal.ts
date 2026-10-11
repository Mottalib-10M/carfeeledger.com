import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const ren = st.rank((s) => st.renewOf(s), { priced: st.REG_KINDS });
const lo = ren[0], hi = ren[ren.length - 1];
const evRen = st.rank((s) => st.renewOf(s, { fuel: 'ev', weightLbs: 4200 }), { priced: st.REG_KINDS });
const ca1 = K.renew('california', 1), ca5 = K.renew('california', 5);

export default definePage({
  id: 'license-plate-renewal',
  group: 'owning',
  order: 10,
  slug: 'license-plate-renewal',
  nav: 'License plate renewal cost',
  card: 'What renewing your registration costs each year, and how it changes as the car ages.',
  title: 'License Plate Renewal Cost 2026: Yearly Fee in Every State',
  description: `License plate renewal cost for 2026: the yearly registration bill in all ${n} jurisdictions, from ${K.usd(lo.value)} to ${K.usd(hi.value)} for the same gasoline car, plus EV surcharges.`,
  h1: 'License plate renewal cost',
  intro: 'The renewal notice is the bill you see every year: registration, county fees, value-based taxes and any EV surcharge.',
  resume: `For a 2026 gasoline car of 3,500 pounds bought for $35,000, the yearly renewal one year later costs from ${K.usd(lo.value)} in ${lo.name} to ${K.usd(hi.value)} in ${hi.name}. Electric cars pay more almost everywhere because of the surcharges states created to replace the gas tax: the same comparison for a 4,200-pound EV runs from ${K.usd(evRen[0].value)} to ${K.usd(evRen[evRen.length - 1].value)}. The renewal also changes with time in states that charge by value or age. In California the yearly bill for this car is ${K.usd(ca1.perYear)} at the first renewal and ${K.usd(ca5.perYear)} after five years, because the vehicle license fee follows a depreciation schedule. Choose the years you have owned the car in the calculator to see your next notice; two-year registrations are converted to a yearly amount.`,
  faqs: [
    { q: 'Why did my renewal go up when nothing changed?', a: 'Common reasons: a fee indexed each year (Georgia’s EV fee is adjusted every July, for example), a new county fee, the end of an exemption from inspection for a new car, or a late penalty from the previous year. The breakdown in the calculator shows the current amount of each line for your state.' },
    { q: 'Is it cheaper to renew online?', a: 'The government fees are the same, but some agencies charge a card processing fee or a mail fee, and Texas gives a $1 discount for online renewal according to its DMV. The calculator does not add payment fees, which depend on how you pay.' },
    { q: 'How much does a renewal cost for an old car?', a: 'In flat-fee and weight-based states, the same as for a new car. In value-based states, much less: the fee follows a schedule that falls each year and often reaches a floor after ten to fifteen years. Set an older model year and several years of ownership in the calculator to see it.' },
    { q: 'Do electric cars pay more to renew?', a: `In most states, yes: a yearly EV fee is added to the regular registration. For the reference EV, the yearly renewal runs from ${K.usd(evRen[0].value)} in ${evRen[0].name} to ${K.usd(evRen[evRen.length - 1].value)} in ${evRen[evRen.length - 1].name}. The EV fee page lists each state’s surcharge and its 2026 amount.` },
  ],
  body: (h) => `
<h2>What a renewal notice contains</h2>
<p>A renewal repeats the registration lines of the first bill, without the one-time charges: no purchase tax, no title, no first-plate fee. What remains is the base registration fee, the statewide add-ons, the county fees, the yearly tax on value in the states that collect one with registration, the EV or hybrid surcharge, and in some states an inspection fee collected by the motor vehicle agency. The calculator in renewal mode returns exactly those lines.</p>
<h2>One year or two</h2>
<p>Some states renew every two years by default and others offer the choice. The amount paid then covers both years; the calculator divides it by the length of the period so that every state is compared per year. When a state indexes a fee each year, the figure used is the one in force for 2026 registrations.</p>
<h2>Value-based renewals fall each year</h2>
<p>States that charge on value apply a percentage that shrinks with each year of the car's life, sometimes counted from the purchase by the current owner rather than from the model year. A used car bought recently can therefore pay more than an identical car kept by its first owner. The ${h.a('vehicle-property-tax', 'vehicle property tax page')} explains the schedules, and the ${h.a('car-ownership-cost', 'ownership cost calculator')} adds the renewals over several years.</p>
<h2>Late renewals</h2>
<p>Penalties for late renewal are set by each state and grow with the delay; they are not included here. The state pages link to the agency that publishes them, starting with the ${h.a('state:california', 'California page')}, whose penalty schedule combines a percentage of the vehicle license fee with fixed late fees.</p>`,
  tool: 'renewal',
  table: 'renewal',
  related: ['car-registration-fees', 'ev-registration-fee-by-state', 'vehicle-property-tax', 'car-ownership-cost', 'state:california', 'state:georgia'],
  sources: ['ca:dmv-vlf', 'tx:txdmv-reg', 'ga:afv', 'fl:pinellas'],
});
