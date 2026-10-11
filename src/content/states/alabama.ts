import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('alabama');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('alabama', { fuel: 'ev', weightLbs: 4200 });
const mobile = K.calc('alabama', { county: 'city-of-mobile' });
const bham = K.calc('alabama', { county: 'city-of-birmingham' });
const trade = K.calc('alabama', { tradeIn: 10000 });
const renew = K.renew('alabama', 1);
const renewEv = K.renew('alabama', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'alabama',
  title: 'Alabama Car Sales Tax 2026: 2% State Rate, Tag and Title',
  description: `Alabama car sales tax and tag fees for 2026: 2% state automotive rate plus local rates, $15 title, $23 plate, EV fee $203. New $35,000 car: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Alabama car sales tax, title and tag fees',
  intro: 'Alabama taxes vehicles at a reduced automotive rate, so the bill at the tag office is driven by your city and county more than by the state.',
  resume: `Buying a new $35,000 gasoline car from a dealer in Jefferson County, outside any city with its own rate, costs ${K.usd(r.atPurchase, 2)} in state and local charges at purchase: ${K.usd(v('sales-tax'), 2)} of state automotive sales tax at 2%, ${K.usd(v('local-tax'), 2)} of county tax at 0.75%, the $15 title application fee with the $3 that the licensing official adds, and the $23 standard plate with its $1.25 issuance fee. Inside Birmingham the local share rises to 2.75% and the total to ${K.usd(bham.atPurchase, 2)}; in the City of Mobile it reaches ${K.usd(mobile.atPurchase, 2)}. A $10,000 trade-in cuts the state tax to ${K.usd(v('sales-tax', trade), 2)}, because Alabama taxes only the difference. Two charges stay outside these totals: the yearly ad valorem tax, figured on 15% of the car's market value times your local millage, and any local fee your county adds. Renewing the plate the next year costs ${K.usd(renew.perYear, 2)} before that property tax, and ${K.usd(renewEv.perYear, 2)} for a battery electric car.`,
  body: (h) => `
<h2>Why the rate is 2%, not 4%</h2>
<p>Alabama's general sales tax is 4%, but the state levies only 2% on automotive vehicles, a split shown on the ${h.src('al:state-rates', 'Department of Revenue rate page')}. Counties and cities follow the same logic and usually charge vehicles less than they charge on groceries or furniture. Jefferson County takes 0.75%, Madison County 0.75% outside Huntsville, Baldwin County 1.25%. Cities then stack their own automotive rate on top: Birmingham adds 2%, Mobile 2.25% over a 0.5% county share. Our county list covers the largest places; for any other town, type the combined rate published in the ALDOR local rate file.</p>
<h2>What the tag office collects</h2>
<p>Titles and plates are handled by the county license plate issuing official, not by a state DMV. The ${h.src('al:title-import', 'ALDOR guidance')} prices a title at $15 plus $3 for the licensing official, and a standard passenger plate at $23 plus a $1.25 issuance fee. Some counties add their own small fees, which the state does not list, so expect a few dollars of variation from one courthouse to the next. The ad valorem tax must be paid before the tag is issued or renewed, and a car you sold earns a prorated credit voucher for the months you already paid.</p>
<h2>Electric cars and the Rebuild Alabama Act</h2>
<p>Since 2023, a battery electric car pays $203 a year on top of the $23 plate and a plug-in hybrid $103, amounts that rise by $3 every fourth year. A conventional hybrid pays nothing extra. With that fee, a new electric SUV registered in Jefferson County comes to ${K.usd(ev.atPurchase, 2)} at purchase. Alabama has no safety or emissions inspection, so no station fee is added to either car. If you are comparing with a neighbor, ${h.a('state:georgia', 'Georgia')} replaced its sales tax on cars with a one-time title tax, while ${h.a('state:florida', 'Florida')} applies its local surtax only to the first $5,000 of the price.</p>`,
  faqs: [
    { q: 'How is the Alabama ad valorem tax on a car calculated?', a: 'The county tag office multiplies the market value from the Department of Revenue by the 15% assessment ratio that applies to private passenger vehicles, then by the local millage rate. The tax is collected forward, with each yearly tag renewal, and it must be paid before the registration is issued. It follows the vehicle, not the owner.' },
    { q: 'Can a trade-in wipe out the Alabama vehicle sales tax?', a: 'It can reduce it to zero but not below. The administrative rule on trade-ins removes the agreed value of the vehicle taken in trade from the taxed price, so the 2% state rate and the local rate apply only to the difference. On a trade-up, the allowance cannot exceed the price of the vehicle the dealer sells.' },
    { q: 'How much more does an electric car cost to register in Alabama?', a: 'A battery electric car pays an additional $203 a year and a plug-in hybrid $103 under the Rebuild Alabama Act, collected with the $23 standard plate. The Department of Revenue raised both fees by $3 on July 1, 2023, and the law adds another $3 every fourth year. Gasoline hybrids pay no extra fee.' },
  ],
  related: ['car-sales-tax-calculator', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'state:georgia', 'state:florida', 'title-and-registration-fees'],
});
