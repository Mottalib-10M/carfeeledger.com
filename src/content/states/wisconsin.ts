import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('wisconsin');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const city = K.calc('wisconsin', { county: 'city-of-milwaukee' });
const madison = K.calc('wisconsin', { county: 'city-of-madison' });
const waukesha = K.calc('wisconsin', { county: 'waukesha-county' });
const ev = K.calc('wisconsin', { fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('wisconsin', 1);
const renewEv = K.renew('wisconsin', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'wisconsin',
  title: 'Wisconsin Title and Registration Fees 2026: Tax, Wheel Tax',
  description: `Wisconsin title and registration fees for 2026: $214.50 title, $85 plates, 5% sales tax plus county tax, wheel taxes, $175 EV fee. New $35,000 car: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Wisconsin title and registration fees',
  intro: 'In Wisconsin the address where the car sleeps decides most of the bill: the county and city taxes, the wheel tax and the emissions test.',
  resume: `A new $35,000 gasoline car kept in Milwaukee County outside the city costs ${K.usd(r.atPurchase, 2)} in taxes and DMV fees at purchase: ${K.usd(v('sales-tax'))} of state sales tax at 5%, ${K.usd(v('local-tax'))} of Milwaukee County tax at 0.9%, the $214.50 title, a $12 issuance fee for a new pair of plates, the $85 yearly registration and the county's $30 wheel tax. The same car kept inside the city of Milwaukee, which adds a 2% city tax and a $41 wheel tax, comes to ${K.usd(city.atPurchase, 2)}; in Waukesha County, which has neither a county tax nor a wheel tax, it is ${K.usd(waukesha.atPurchase, 2)}. A trade-in is subtracted before the tax. After the first year, the plates cost ${K.usd(renew.perYear)} a year in Milwaukee County, and an electric car pays ${K.usd(renewEv.perYear)} because of its $175 surcharge. Gasoline and hybrid cars in seven southeastern counties also need an emissions test every two years from their fourth model year.`,
  body: (h) => `
<h2>Sales tax follows the garage, not the dealer</h2>
<p>Wisconsin charges 5% on a car purchase, then adds the tax of the county where the car will be customarily kept, wherever you buy it. The ${h.src('wi:rates', 'Department of Revenue rate chart')} lists 70 counties at 0.5%, Milwaukee County at 0.9% since January 2024, and Waukesha and Winnebago counties at zero. The city of Milwaukee is the only city with its own sales tax, 2%, and it applies to cars kept in the city. A trade-in in the same deal comes off the price first, and private sales are taxed too, at the DMV when you title the car.</p>
<h2>Title, plates and the 2025-2026 increases</h2>
<p>The title fee went up by $50 on October 1, 2025, to $214.50, and listing a loan adds $10. Since April 13, 2026, every new plate costs $6 to issue, so a car with front and rear plates pays $12 unless you transfer plates from a car you sold. The yearly registration for a passenger car stays at $85. Electric cars pay a $175 surcharge each year and hybrids or plug-in hybrids $75, collected with the registration, which puts a new 4,200 lb EV at ${K.usd(ev.atPurchase, 2)} at purchase in Milwaukee County. The ${h.src('wi:title-fees', 'WisDOT title fee page')} has the current amounts.</p>
<h2>Wheel taxes and the emissions test</h2>
<p>Counties and municipalities can add a wheel tax of their choosing, collected by WisDOT with the registration. Fourteen counties charge one, from $15 in Langlade to $40 in Dane, and dozens of cities and villages stack their own on top: a car registered in Madison pays $40 to the city and $40 to Dane County, for ${K.usd(madison.atPurchase, 2)} at purchase. Our county list includes the county wheel taxes and the cities of Milwaukee, Madison and Green Bay; check the ${h.src('wi:wheel-tax', 'WisDOT wheel tax list')} for any other town. In Kenosha, Milwaukee, Ozaukee, Racine, Sheboygan, Washington and Waukesha counties, cars are tested from their fourth model year, then every other year before renewal. Compare the whole bill with other states in the ${h.a('dmv-fees-calculator', 'DMV fees calculator')}.</p>`,
  faqs: [
    { q: 'Is there a cap on the dealer service fee in Wisconsin?', a: 'No dollar cap. A dealer may charge a service fee for completing the inspections and forms the law requires, provided it is disclosed on the purchase contract, and WisDOT can audit it for reasonableness. The Department of Revenue treats that fee as part of the taxable price, but not a separate fee for filing the title electronically.' },
    { q: 'Do I pay Wisconsin sales tax when I buy a car from a private seller?', a: 'Yes. The occasional sale of a motor vehicle is taxable in Wisconsin unless the buyer is a close family member and the car was already registered in the state. You pay the 5% state tax and the county or Milwaukee city tax where the car will be kept when you title it.' },
    { q: 'Which Wisconsin cars are exempt from the emissions test?', a: 'Cars kept outside the seven southeastern counties are never tested. Inside them, a car is first tested when it is four model years old, so recent models skip it, and fully electric cars are not covered because the program tests gasoline, diesel, natural gas and hybrid vehicles.' },
  ],
  related: ['dmv-fees-calculator', 'car-sales-tax-calculator', 'title-and-registration-fees', 'ev-registration-fee-by-state', 'smog-check-cost', 'doc-fee-by-state'],
});
