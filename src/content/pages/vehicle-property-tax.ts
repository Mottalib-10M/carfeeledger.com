import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const withTax = st.which((S) => S.annualValueTax);
const ca = K.data('california');
const dep = (ca.params as { vlf: { depreciation: number[]; rate: number } }).vlf;
const ca1 = K.calc('california').lines.find((l) => l.id === 'vlf');
const ca6 = K.renew('california', 5).lines.find((l) => l.id === 'vlf');

export default definePage({
  id: 'vehicle-property-tax',
  group: 'owning',
  order: 40,
  slug: 'vehicle-property-tax',
  nav: 'Vehicle property tax',
  card: 'States that tax a car’s value every year, how the value is set and how fast the tax falls.',
  title: 'Vehicle Property Tax 2026: States That Tax a Car Every Year',
  description: `Vehicle property tax in 2026: the ${withTax.length} jurisdictions that tax a car's value each year, with registration or by local bill, how value is set and how it depreciates.`,
  h1: 'Vehicle property tax by state',
  intro: 'In some states the car is taxed like property every year, on top of the purchase tax.',
  resume: `${withTax.length} of the ${n} jurisdictions charge a yearly tax or fee based on the value of a passenger car, either collected with the registration (California's vehicle license fee, for example) or billed separately by a county or town at its own rate. The value is usually the purchase price or the manufacturer's price, reduced each year on a fixed schedule. California applies ${K.pct(dep.rate, 2)} to the price class of the car, then ${dep.depreciation.map((x) => `${Math.round(x * 100)}%`).slice(0, 4).join(', ')} and so on down to ${Math.round(dep.depreciation[dep.depreciation.length - 1] * 100)}% over eleven years: for a $35,000 car, ${K.usd(ca1?.amount ?? 0)} the first year and ${K.usd(ca6?.amount ?? 0)} at the sixth. Where a town sets the rate, the exact amount depends on a local mill rate the state does not publish centrally; the calculator then shows the official range and says so instead of averaging.`,
  faqs: [
    { q: 'Is the yearly car tax deductible on my federal return?', a: 'The IRS allows the part of a vehicle tax that is based on value and charged yearly to be deducted as a personal property tax if you itemize, within the cap on state and local taxes. California’s vehicle license fee qualifies as a value-based tax; flat registration fees do not.' },
    { q: 'Why does my car tax restart when I buy a used car?', a: 'In some states the depreciation schedule is tied to the current owner’s purchase, not to the model year. California, for instance, sets the vehicle license fee on the price paid by the new owner and starts the 11-year schedule again at the sale, so a used car can pay more than it did for its previous owner.' },
    { q: 'Which states tax a car’s value every year?', a: `${withTax.length} of the ${n} jurisdictions covered here tax the value of a car every year, either as a fee collected with the registration or as a personal property bill sent by the county or town. The table on this page names them and shows the amount collected with registration for the reference car; each state page explains the local bill.` },
    { q: 'How is a car valued for the yearly tax?', a: 'Three methods are common: the price you paid, the manufacturer’s suggested retail price when new, or a value from a state or industry pricing guide. Each method is combined with a depreciation schedule; the state pages say which one applies and from which source.' },
  ],
  body: (h) => `
<h2>Collected with registration or billed by the town</h2>
<p>When the tax is collected with registration, the amount is on the renewal notice and the calculator includes it as a "value" line. When a county or town bills it separately, the bill arrives on another schedule, often once a year, at a rate that changes with local budgets. The calculator adds the first kind exactly and lists the second with its range.</p>
<h2>Depreciation schedules</h2>
<p>Every value-based tax falls as the car ages, but the speed differs: some schedules reach a floor after ten years, others keep a minimum tax forever. The ${h.a('license-plate-renewal', 'renewal page')} lets you set the years of ownership to see the effect on the yearly bill, and the ${h.a('car-ownership-cost', 'ownership cost calculator')} adds it over the years you keep the car.</p>
<h2>Purchase tax versus yearly tax</h2>
<p>Some states trade one for the other. Georgia replaced both its sales tax and its yearly car tax with a one-time title tax in 2013. Others charge both a purchase tax and a yearly value tax. The ${h.a('car-sales-tax-calculator', 'sales tax calculator')} covers the purchase side.</p>
<h2>Exemptions</h2>
<p>Some owners are exempt from value-based taxes; California lists exemptions for 100% disabled veterans and nonresident military personnel, among others. The calculator does not apply exemptions, which depend on documents only the agency can check.</p>`,
  tool: 'property',
  state: 'california',
  table: 'property',
  related: ['license-plate-renewal', 'car-sales-tax-calculator', 'car-ownership-cost', 'state:california', 'state:georgia', 'car-registration-fees'],
  sources: ['irs-sales-tax', 'ca:dmv-vlf', 'ga:tavt'],
});
