import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('oklahoma');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const trade = K.calc('oklahoma', { tradeIn: 10000 });
const usedDealer = K.calc('oklahoma', { condition: 'used', price: 18000, modelYear: 2021 });
const ev = K.calc('oklahoma', { fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('oklahoma', 1);

export default defineState({
  slug: 'oklahoma',
  title: 'Oklahoma Tag, Title and Excise Tax 2026: 3.25% + 1.25% Tax',
  description: `Oklahoma tag, title and tax for 2026: 3.25% excise ($20 on a used car's first $1,500), 1.25% sales tax, $11 title, $96 to $26 plates. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Oklahoma excise tax, tag and title fees',
  intro: 'Oklahoma charges two taxes when a car changes hands, an excise tax set by statute and a small state sales tax, and no local sales tax at all.',
  resume: `A new $35,000 gasoline car from an Oklahoma dealer costs ${K.usd(r.atPurchase)} in taxes and Service Oklahoma fees: ${K.usd(v('sales-tax'))} of motor vehicle excise tax (3.25%, rounded to the dollar), ${K.usd(v('sales-tax-125'))} of state sales tax at 1.25%, the $11 title, the $1.50 insurance verification fee and $96 for the first year of registration. Cities and counties cannot add their sales tax to a vehicle, so the total is the same in Tulsa and in Guymon. A trade-in only lowers the 1.25% part: with $10,000 traded in, the sales tax falls to ${K.usd(v('sales-tax-125', trade))} while the excise stays ${K.usd(v('sales-tax', trade))}. A used car is taxed differently, $20 on the first $1,500 of value and 3.25% above it, so an $18,000 car from 2021 bought from a dealer costs ${K.usd(usedDealer.atPurchase)}. The plate is ${K.usd(renew.perYear)} again next year and gets cheaper with age. An electric car adds a $100 fee each year, ${K.usd(ev.atPurchase)} at purchase.`,
  body: (h) => `
<h2>Excise tax: what changed on July 1, 2026</h2>
<p>The ${h.src('ok:excise', 'motor vehicle excise tax')} is due whenever ownership of a registered vehicle changes and when a car is first registered in Oklahoma. New vehicles pay 3.25% of their value. Used vehicles pay a flat $20 on the first $1,500 and 3.25% on the rest, and the result is rounded to the nearest dollar. Until June 30, 2026 the price on the bill of sale had to fall within 20% of the average retail value in Service Oklahoma's reference guide. Since July 1, 2026 the ${h.src('ok:value', 'value')} is simply the actual sales price, which helps buyers who pay less than book value. The Legislature removed the old wording that taxed the price before trade-in credits, but the new text does not grant a credit either, so our calculator keeps the excise on the full price.</p>
<h2>The 1.25% state sales tax</h2>
<p>Since 2017, vehicle sales have also carried part of the state sales tax: ${h.src('ok:sales-tax', '1.25% of the gross receipts')}, calculated on the difference between the price and the trade-in. Local sales taxes do not apply to vehicles. For a private sale, the statutes we read do not say whether the tag agent collects this 1.25%, so the calculator shows it as a range.</p>
<h2>Plates that get cheaper with age</h2>
<p>Service Oklahoma charges $96 a year for the first four years of registration, $86 for years five to eight, $66 for nine to twelve, $46 for thirteen to sixteen and $26 after that. Electric cars add $100 a year and plug-in hybrids $30, a motor fuels tax fee created in 2017. There are no safety or emissions inspections to budget for. Next door, ${h.a('state:texas', 'Texas')} taxes a car at 6.25% but registers it for about half the price.</p>`,
  faqs: [
    { q: 'How is Oklahoma excise tax calculated on a used car?', a: 'Service Oklahoma charges $20 on the first $1,500 of the vehicle value and 3.25% of the value above $1,500, rounded to the nearest dollar. Since July 1, 2026 the value is the actual sales price on the bill of sale. An $18,000 used car therefore owes $556 of excise tax.' },
    { q: 'Do cities add sales tax to a car bought in Oklahoma?', a: 'No. State law says the sale of motor vehicles is not subject to any sales or use tax levied by cities, counties or other local jurisdictions. A buyer pays only the 3.25% excise tax and the 1.25% state sales tax, whatever city the car is registered in, plus the title and plate fees.' },
    { q: 'What is the Oklahoma fee for electric and plug-in hybrid cars?', a: 'Oklahoma adds a motor fuels tax fee to every registration: $100 a year for a car propelled only by electricity and $30 for a plug-in hybrid with a battery of at least 4 kilowatt-hours that can be charged from an outside source. Ordinary hybrids that cannot plug in pay no extra fee.' },
  ],
  related: ['car-sales-tax-calculator', 'title-and-registration-fees', 'license-plate-renewal', 'state:texas', 'state:arkansas', 'dmv-fees-calculator'],
});
