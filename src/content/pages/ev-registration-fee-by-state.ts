import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const ev = st.summaries().filter((x) => x.S.evFee !== null && !x.S.evFeeLabel).sort((a, b) => (a.S.evFee ?? 0) - (b.S.evFee ?? 0));
const phev = st.count((S) => S.phevFee !== null);
const hyb = st.count((S) => S.hybridFee !== null);
const none = st.which((S) => S.evFee === null);
const lo = ev[0], hi = ev[ev.length - 1];
const evN = st.count((S) => S.evFee !== null);
const tx = K.calc('texas', { fuel: 'ev', weightLbs: 4200 });
const txEv = tx.lines.find((l) => l.id === 'ev');

export default definePage({
  id: 'ev-registration-fee-by-state',
  group: 'owning',
  order: 30,
  slug: 'ev-registration-fee-by-state',
  nav: 'EV registration fee by state',
  card: 'The yearly surcharge on electric, plug-in hybrid and hybrid cars in each state, and what it adds to registration.',
  title: 'EV Registration Fee by State 2026: Electric and Hybrid',
  description: `EV registration fee by state for 2026: ${evN} of ${n} jurisdictions charge a yearly surcharge on electric cars${lo ? `, from ${K.usd(lo.S.evFee ?? 0, 2)} to ${K.usd(hi.S.evFee ?? 0, 2)}` : ''}, plus plug-in hybrid and hybrid fees.`,
  h1: 'EV registration fees by state',
  intro: 'Electric cars pay no gas tax, so most states now charge them a yearly fee at registration instead.',
  resume: `${evN} of the ${n} jurisdictions charge a yearly surcharge on fully electric passenger cars in 2026${lo ? `, from ${K.usd(lo.S.evFee ?? 0, 2)} in ${lo.name} to ${K.usd(hi.S.evFee ?? 0, 2)} in ${hi.name}` : ''}; ${phev} also charge plug-in hybrids and ${hyb} charge ordinary hybrids. The fee is added to the normal registration and paid at every renewal, and several states index it each year, Georgia every July. Some states adjust the first payment to the length of the first registration: Texas charges ${K.usd(txEv?.amount ?? 0)} when a new EV gets its first two-year registration, then $200 a year. California exempts the first registration of a new zero-emission car bought from a dealer and charges its road improvement fee from the first renewal. ${none.length ? `${K.listOf(none)} ${none.length > 1 ? 'have' : 'has'} no EV surcharge in the data read for this site.` : ''}`,
  faqs: [
    { q: 'Why do electric cars pay an extra registration fee?', a: 'Roads are largely funded by fuel taxes, which electric cars do not pay. States add a yearly fee at registration to recover part of that revenue. The amounts are usually set to approximate what an average gasoline car pays in state fuel tax, and some states adjust them each year for inflation or fuel economy.' },
    { q: 'Do plug-in hybrids pay the EV fee?', a: `In some states, at a lower rate; in others not at all. In Georgia a plug-in hybrid pays the alternative fuel fee only if the owner chooses an alternative fuel plate. Across the data files, ${phev} jurisdictions charge plug-in hybrids a fee of their own.` },
    { q: 'Is the EV fee charged when I first register a new electric car?', a: 'Usually yes, with the first registration. California is an exception for new zero-emission cars bought from a dealer: the road improvement fee starts at the first renewal. Texas charges two years at once when a new EV gets a two-year first registration.' },
    { q: 'Does an EV pay more for weight-based registration?', a: 'Often, because batteries make electric cars heavier than comparable gasoline models, and weight-based states charge by the pound or by bracket. The calculator uses the curb weight you enter, so a 4,500-pound EV is priced correctly in Florida, New York or other weight states.' },
  ],
  body: (h) => `
<h2>Three kinds of surcharge</h2>
<p>Most states use a flat yearly amount for electric cars, sometimes with a smaller amount for plug-in hybrids and a smaller one still for hybrids. A few tie the amount to an index so that it grows each year. Some states call it a road usage charge, an alternative fuel fee or a highway use fee, but it works the same way: an extra line on every registration and renewal notice.</p>
<h2>What it adds over the years</h2>
<p>A yearly fee of a few hundred dollars adds up over the life of a car, and it continues after the car is paid off. The ${h.a('car-ownership-cost', 'ownership cost calculator')} counts it each year with the regular renewal, and the ${h.a('license-plate-renewal', 'renewal page')} compares the yearly bill of an EV and a gasoline car state by state.</p>
<h2>Buying an EV from a private seller</h2>
<p>The surcharge follows the car, not the owner: a used EV pays it at the next renewal like a new one. In states where the seller's registration continues after the sale, the fee falls due at that date, which the calculator shows as due within the first 12 months.</p>
<h2>Other fees an EV still pays</h2>
<p>An EV pays the same purchase tax, title and base registration as any car, and the same safety inspection where one exists; it is exempt from emissions tests. The ${h.a('dmv-fees-calculator', 'DMV fees calculator')} adds everything for a given state, and the ${h.a('state:texas', 'Texas page')} shows how a two-year first registration doubles the first EV payment.</p>`,
  tool: 'ev',
  state: 'texas',
  table: 'ev',
  related: ['license-plate-renewal', 'car-registration-fees', 'car-ownership-cost', 'state:texas', 'state:georgia', 'state:california'],
  sources: ['tx:txdmv-reg', 'ga:afv', 'ca:dmv-fees'],
});
