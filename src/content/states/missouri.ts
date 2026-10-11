import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('missouri');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const kc = K.calc('missouri', { county: 'kansas-city-jackson' });
const stl = K.calc('missouri', { county: 'city-of-st-louis' });
const ev = K.calc('missouri', { fuel: 'ev', weightLbs: 4200 });
const renewEv = K.renew('missouri', 1, { fuel: 'ev', weightLbs: 4200 });
const trade = K.calc('missouri', { tradeIn: 10000 });

export default defineState({
  slug: 'missouri',
  title: 'Missouri Car Sales Tax 2026: 4.225% + Local, Plates, Title',
  description: `Missouri car sales tax for 2026: 4.225% state plus local rate, $8.50 title, plates by horsepower, EV decal $150. New $35,000 car, St. Louis County: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Missouri car sales tax, title and plate fees',
  intro: 'Missouri buyers pay the sales tax themselves at the license office, at a rate set by the address where they live.',
  resume: `A new $35,000 gasoline car bought from a dealer by a resident of unincorporated St. Louis County costs ${K.usd(r.atPurchase, 2)} in taxes and fees: ${K.usd(v('sales-tax'), 2)} of state sales tax at 4.225%, ${K.usd(v('local-tax'), 2)} of local sales tax at the county's 3.513% motor vehicle rate, the $8.50 title with its $9 processing fee, the $9 registration processing fee and a ${K.usd(r.docFee, 2)} dealer administrative fee, the 2026 legal maximum. The plate fee itself is not in that total because it depends on the taxable horsepower printed on the title, from $18.25 to $51.25 a year. Address matters: the same car costs ${K.usd(kc.atPurchase, 2)} for a Kansas City resident in Jackson County and ${K.usd(stl.atPurchase, 2)} in the City of St. Louis. A $10,000 trade-in lowers the state tax to ${K.usd(v('sales-tax', trade), 2)}. An electric car pays the lowest plate rate but buys a $150 special fuel decal every year, for ${K.usd(ev.atPurchase, 2)} at purchase and ${K.usd(renewEv.perYear, 2)} a year afterwards, before the county personal property tax.`,
  body: (h) => `
<h2>The local rate comes from your home address</h2>
<p>Missouri dealers do not collect sales tax on the cars they sell. You pay it when you apply for the title, within 30 days of the purchase, and the local part follows the address on your application rather than the dealer's location. The ${h.src('mo:localsales', 'Department of Revenue motor vehicle rate chart')} lists hundreds of cities and districts, from no local tax at all to 6.5%. Rates are revised every quarter, so check the chart for the month you title the car or type the rate in the calculator. The trade-in allowance and any documented rebate come off the price first, and if they exceed it, no tax is owed. Late titling costs $25 after 30 days and another $25 for each further month, up to $200.</p>
<h2>Plates priced by horsepower, not weight</h2>
<p>Passenger plates in Missouri are priced by taxable horsepower, a figure based on the engine that appears on your title: $21.25 a year from 12 to 23 horsepower, rising in steps to $51.25 at 72 and above, each with a $9 processing fee or $18 for two years. Electric cars pay the bottom rate of $18.25, then the ${h.src('mo:fuel-decals', 'special fuel decal')}: $150 a year for a battery electric car and $75 for a plug-in hybrid in 2026, plus $9, in place of the fuel tax they do not pay. Regular hybrids need no decal. Before buying plates you also need last year's paid personal property tax receipt from your county.</p>
<h2>Inspections are lighter than they used to be</h2>
<p>A car is exempt from the every-other-year safety inspection for ten years after its model year unless it passes 150,000 miles; older cars need one before registration, at up to $12. Residents of the City of St. Louis and St. Louis, St. Charles and Jefferson counties also need an emissions test after a car's first four model years, at up to $24. Dealers may charge an administrative fee of up to $620.79 in 2026. To see how a horsepower-based plate compares with weight-based ones, open the ${h.a('car-registration-fees', 'registration fee comparison')}, or check the ${h.a('doc-fee-by-state', 'doc fee caps by state')}.</p>`,
  faqs: [
    { q: 'Where is car sales tax paid when buying from a Missouri dealer?', a: 'At a Missouri license office when you apply for the title, not at the dealership. You have 30 days from the purchase date; after that a $25 title penalty applies and grows by $25 every 30 days up to $200. The state 4.225% and the local rate for your home address are paid together at that time.' },
    { q: 'What is taxable horsepower on a Missouri title?', a: 'It is a rating based on the engine, used only to price passenger plates, and it is printed on the title or the application for title. Plates cost $18.25 a year under 12 horsepower and for electric vehicles, $21.25 from 12 to 23, and up to $51.25 at 72 and above, plus a $9 processing fee.' },
    { q: 'Is there a cap on the dealer administrative fee in Missouri?', a: 'Yes. State law ties the maximum fee to the Consumer Price Index, and the Department of Revenue set it at $620.79 for 2026, effective February 1. The dealer must charge the same fee to every retail customer and show it as a separate item on the buyer’s order with a notice that it is not an official fee.' },
    { q: 'Which Missouri counties require an emissions test for a car?', a: 'Only vehicles registered in the City of St. Louis and in St. Louis, St. Charles and Jefferson counties. Gasoline cars from model year 1996 on are tested every other year, matching the model year’s parity, after their first four model years. Fully electric cars are exempt, and the station may charge up to $24.' },
  ],
  related: ['car-sales-tax-calculator', 'car-registration-fees', 'doc-fee-by-state', 'vehicle-property-tax', 'out-the-door-price-calculator', 'vehicle-inspection-cost'],
});
