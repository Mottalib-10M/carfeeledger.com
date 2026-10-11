import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('colorado');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const regPart = ['reg', 'age-fee', 'road-safety', 'bridge', 'reg-other', 'plates', 'month-tab', 'title'].reduce((s, id) => s + v(id), 0);
const springs = K.calc('colorado', { county: 'colorado-springs' });
const renew = K.renew('colorado', 1);
const renew5 = K.renew('colorado', 5);
const renewEv = K.renew('colorado', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'colorado',
  title: 'Colorado Car Registration Cost 2026: Ownership Tax and Fees',
  description: `Colorado car registration cost for 2026: specific ownership tax on 85% of MSRP, 2.9% state sales tax plus local, FASTER fees. New $35,000 car in Denver: ${K.usd(r.atPurchase)}.`,
  h1: 'Colorado car registration cost and ownership tax',
  intro: 'Colorado’s first registration bill is large because it carries a yearly ownership tax on the sticker price, and Denver adds one of the highest local sales taxes in the state.',
  resume: `A new $35,000 gasoline car registered in Denver costs about ${K.usd(r.atPurchase)} at purchase, before any county or regional fee. Sales tax is the biggest part: ${K.usd(v('sales-tax'))} for the state at 2.9% and ${K.usd(v('local-tax'))} for the RTD and the city, 9.15% in all on the price after the trade-in. The specific ownership tax adds ${K.usd(v('sot'))}, which is 2.1% of 85% of the MSRP in the first year of service. The rest is ${K.usd(regPart)} of title, plates and registration fees: the weight-based base fee, the $12 age fee, the two FASTER surcharges and a string of small fees from $4 for the county clerk to 48 cents for the year tab. In Colorado Springs the same purchase comes to ${K.usd(springs.atPurchase)}. The yearly bill falls with the ownership tax: about ${K.usd(renew.perYear)} in the second year and ${K.usd(renew5.perYear)} in the sixth, while an electric SUV renews for about ${K.usd(renewEv.perYear)} in its second year.`,
  body: (h) => `
<h2>The ownership tax follows the sticker, not the market</h2>
<p>Colorado taxes vehicles each year through the specific ownership tax, collected with the registration. Under ${h.src('co:crs-42-3-107', 'C.R.S. 42-3-107')}, the taxable value is 85% of the manufacturer’s suggested retail price and never changes; only the rate falls with the year of service, from 2.1% in the first year to 1.5%, 1.2% and 0.9%, then 0.45% from the fifth to the ninth year. From the tenth year the tax is a flat $3. Buying a used car cheaply does not lower it, because the county uses the original MSRP, so a five-year-old $50,000 SUV still pays on its sticker price.</p>
<h2>Local sales tax decides most of the purchase bill</h2>
<p>The state rate is 2.9%, but cities, counties and districts add their own. The ${h.src('co:denver-tax', 'Denver motor vehicle office')} lists 1.10% for the RTD and 5.15% for the city, so a Denver buyer pays 9.15% of the net price; in ${h.src('co:elpaso-tax', 'El Paso County')} a Colorado Springs buyer pays 8.20%. The tax is due when the car is titled, including after a private sale, and a dealer trade-in is deducted first. Our calculator lists these two places; for another address, type your combined local rate.</p>
<h2>Electric cars and emissions tests</h2>
<p>Electric and plug-in hybrid owners pay a $63.05 electric vehicle fee plus a road usage fee that the law raises every July: $26 for a battery electric car and $13 for a plug-in hybrid in 2026-27, then $36 and $16. In the Front Range program area, gasoline and hybrid cars more than seven model years old need a $35 emissions test every two years, and the seller provides the test when such a car is sold. The same yearly tax on value exists in ${h.a('state:arizona', 'Arizona')}, where it is called the vehicle license tax; compare both on our ${h.a('vehicle-property-tax', 'vehicle property tax page')}.</p>`,
  faqs: [
    { q: 'Why did my Colorado registration cost so much the first year?', a: `Because the first-year specific ownership tax is the highest: 2.1% of 85% of the original MSRP, ${K.usd(v('sot'))} on a $35,000 car. It drops to 1.5% in the second year and keeps falling with each year of service, down to a flat $3 from the tenth year, while the weight-based fees stay roughly the same.` },
    { q: 'Do I pay Colorado sales tax on a car bought from a private seller?', a: 'Yes. Sales tax is due once when you title the vehicle, whether you bought it from a dealer or a private person, at the state rate plus the local rates of the place where you live. A trade-in accepted by a dealer is deducted from the taxed price; a private sale has no trade-in.' },
    { q: 'Who pays the emissions test when a used car is sold in Denver?', a: 'The seller. In the emissions program area, a gasoline or hybrid vehicle more than seven model years old needs a passing test when its ownership changes, and the seller is responsible for getting it. After that, the new owner tests the car every two years when the renewal notice asks for it.' },
  ],
  related: ['vehicle-property-tax', 'dmv-fees-calculator', 'car-registration-fees', 'ev-registration-fee-by-state', 'state:arizona', 'state:texas'],
});
