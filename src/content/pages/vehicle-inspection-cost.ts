import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const none = st.count((S) => S.inspection === 'none');
const safety = st.which((S) => S.inspection === 'safety' || S.inspection === 'both');
const emis = st.count((S) => S.inspection === 'emissions' || S.inspection === 'both');
const priced = st.count((S) => S.inspectionFee !== null);

export default definePage({
  id: 'vehicle-inspection-cost',
  group: 'owning',
  order: 20,
  slug: 'vehicle-inspection-cost',
  nav: 'Vehicle inspection cost',
  card: 'Which states require a safety or emissions inspection, who is exempt and what the official fee is.',
  title: 'Vehicle Inspection Cost 2026: Safety and Emissions by State',
  description: `Vehicle inspection cost for 2026: which of the ${n} jurisdictions require a safety or emissions test, new-car exemptions, counties covered and the official fee or fee cap.`,
  h1: 'Vehicle inspection cost by state',
  intro: 'Whether you need an inspection at all depends on the state, sometimes on the county, and on the age and fuel of the car.',
  resume: `In 2026, ${none} of the ${n} jurisdictions require no periodic inspection for an ordinary private car, ${emis} require an emissions test in all or part of the state, and ${safety.length} keep a safety inspection${safety.length ? ` (${K.listOf(safety)})` : ''}. Texas ended safety inspections for non-commercial vehicles on January 1, 2025 and now collects a $7.50 replacement fee with registration instead, while 17 Texas counties still test emissions. New cars are usually exempt for their first years: three model years in metro Atlanta, eight in California before the first smog check. Prices are often set by the stations rather than by the state; where a state sets a fee or a cap, the calculator adds it (${priced} jurisdictions), and where it does not, the line is shown without an amount instead of an invented average.`,
  faqs: [
    { q: 'Do electric cars need an emissions test?', a: 'Not in the programs read for this site: fully electric cars have no tailpipe, California’s smog program lists electric vehicles among its exemptions, and Georgia’s program covers gasoline cars and light trucks. Safety inspections, where they exist, usually still apply to EVs. Hybrids are generally tested like gasoline cars.' },
    { q: 'Why does my state charge an inspection fee if I never get inspected?', a: 'Some states collect the state’s share of the inspection program at registration. Texas, for example, kept a $7.50 inspection program replacement fee after it stopped requiring safety inspections for ordinary cars, and charges $16.75 at once for the first two years of a new car.' },
    { q: 'Do I need an inspection when I buy a used car?', a: 'In several states, yes: California requires a smog certificate at change of ownership for gasoline cars older than four model years, and in metro Atlanta the seller must provide a passing emissions test at the time of sale. Other states only check at renewal. The calculator adds the requirement when you choose a used car.' },
    { q: 'How often is a car inspected?', a: 'Every year in most programs, every two years in some (California’s smog check is biennial after the first eight model years). The calculator shows the period next to the inspection line and spreads a two-year test over two years when it computes a yearly cost.' },
  ],
  body: (h) => `
<h2>Safety, emissions or nothing</h2>
<p>Safety inspections check brakes, lights, tires and steering; emissions tests read the onboard diagnostics or measure the exhaust. Federal clean air rules push states with polluted metro areas to test emissions, which is why programs often cover a few counties around a large city rather than the whole state. Safety inspections are a state choice, and several states have dropped them in recent years.</p>
<h2>Who sets the price</h2>
<p>Three models exist. Some states set a single fee charged by every station. Others set a maximum and let stations charge less. Many leave the price to the market and only fix the state's share, often a certificate fee: California's stations must charge an $8.25 certificate fee, but the price of the smog check itself is free. The table below shows the official amount where one exists.</p>
<h2>Exemptions that matter</h2>
<p>New cars are exempt for their first model years in most programs, very old cars in some (Georgia exempts cars 25 model years or older), and electric cars from every emissions test. Counties outside the program area are exempt from emissions tests altogether, so the county field of the calculator matters here too.</p>
<h2>Related pages</h2>
<p>The ${h.a('smog-check-cost', 'smog check page')} focuses on emissions programs, California's in particular. The yearly cost of keeping a car registered, inspection included, is on the ${h.a('license-plate-renewal', 'renewal page')}, and the full bill at purchase on the ${h.a('dmv-fees-calculator', 'DMV fees calculator')}.</p>`,
  tool: 'inspection',
  state: 'texas',
  table: 'inspection',
  related: ['smog-check-cost', 'license-plate-renewal', 'dmv-fees-calculator', 'state:texas', 'state:georgia', 'state:california'],
  sources: ['tx:txdmv-reg', 'tx:occc-inspection', 'ca:bar-faq', 'ga:caf'],
});
