import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('nebraska');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const lincoln = K.calc('nebraska', { county: 'lincoln' });
const rural = K.calc('nebraska', { county: 'none' });
const renew = K.renew('nebraska', 1);
const renew5 = K.renew('nebraska', 5);

export default defineState({
  slug: 'nebraska',
  title: 'Nebraska Car Sales Tax and Motor Vehicle Tax in 2026',
  description: `Nebraska car costs 2026: 5.5% sales tax plus up to 2% local, motor vehicle tax by MSRP and age, $15 reg fee, $150 EV fee. New $35,000 car, Omaha: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Nebraska car sales tax and motor vehicle tax',
  intro: 'Nebraska taxes a car twice: once when you buy it, with sales tax, and every year after, with a motor vehicle tax that follows its sticker price.',
  resume: `A new $35,000 gasoline car registered at an Omaha address costs ${K.usd(r.atPurchase, 2)} at the county treasurer: ${K.usd(v('sales-tax'))} of state sales tax at 5.5% and ${K.usd(v('local-tax'))} of Omaha's 1.5% local tax, a $10 title, $8.20 for two plates, the $15 registration fee with $5.50 of add-ons, a ${K.usd(v('mv-tax'))} motor vehicle tax and a $${v('mv-fee')} motor vehicle fee. The tax uses the car's MSRP, which here falls in the $34,000 to $35,999 band. In Lincoln, with a 1.75% local rate, the total is ${K.usd(lincoln.atPurchase, 2)}; at an address with no local tax it is ${K.usd(rural.atPurchase, 2)}. A city wheel tax may be added. The second year costs about ${K.usd(renew.perYear, 2)}, and by the sixth year the motor vehicle tax has fallen enough that renewal is near ${K.usd(renew5.perYear, 2)}.`,
  body: (h) => `
<h2>The motor vehicle tax follows the sticker price</h2>
<p>Nebraska replaced the old property tax on cars with a schedule tied to the MSRP. The ${h.src('ne:tax-chart', 'DMV tax table')} assigns a base tax to each $2,000 band of value when new: $100 at $10,000, $580 for a car that listed between $34,000 and $35,999, up to $1,900 from $100,000. The full base tax is due in the first year, then 90%, 80% and 70%, down to 7% in the twelfth and thirteenth years and nothing from the fourteenth. The money goes to the schools, county and city where the car is kept. A smaller motor vehicle fee of $5, $20 or $30, set by the same MSRP, is added and never disappears entirely. Because the price you paid plays no part, a used car carries the tax of its original sticker; type that MSRP into the calculator for an exact figure.</p>
<h2>Sales tax where you live</h2>
<p>The 5.5% state rate applies everywhere, and the local rate is the one of the address on the registration, not the dealer's. More than 270 cities and villages add 0.5% to 2%, and Dakota County adds 0.5% outside cities with their own tax; the ${h.src('ne:local-rates', 'Department of Revenue table')} for July 1, 2026 is built into the calculator. A trade-in comes off the price, but a dealer's document processing charge is taxed, as are service contracts. A new car also owes a $1 tire fee per new tire, spare included.</p>
<h2>Fees, plates and electric cars</h2>
<p>The registration fee is $15 for a passenger car, with $0.50, $2, $1.50 and $1.50 added for emergency medical services, the DMV, recreation roads and the county. Plates are $4.10 each and passenger cars carry two. Electric cars pay a $150 alternative fuel fee each year and plug-in hybrids $75. There is no safety or emissions inspection, only a $10 sheriff's identification check for a car arriving from another state. For a neighbor without a yearly value tax at the DMV, compare ${h.a('state:wyoming', 'Wyoming')}.</p>`,
  faqs: [
    { q: 'Why does a used car in Nebraska still carry a high motor vehicle tax?', a: 'The tax is set by the MSRP of the car when new, not the price you paid. A car that listed at $35,000 pays 60% of its $580 base tax in its fifth registration year, whether you bought it for $25,000 or $15,000. The tax keeps falling each year and reaches zero when the car turns fourteen.' },
    { q: 'Which local sales tax applies when you buy a car in another Nebraska city?', a: 'The local rate of the address where the car is registered applies, not the rate where the dealer is located. A buyer living in Lincoln pays the 1.75% Lincoln rate on top of 5.5% even when buying in Omaha, and a buyer in a town without a local tax pays only the state rate.' },
    { q: 'Is the dealer documentation fee taxable in Nebraska?', a: 'Yes. The Department of Revenue lists document processing charges among the items that must be included in the total sales price, along with dealer preparation, destination charges and service contracts. Title and lien fees a dealer pays to public officials for you are not part of the taxable price.' },
  ],
  related: ['vehicle-property-tax', 'car-sales-tax-calculator', 'ev-registration-fee-by-state', 'state:wyoming', 'state:missouri', 'doc-fee-by-state'],
});
