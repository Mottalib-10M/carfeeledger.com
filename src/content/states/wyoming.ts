import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('wyoming');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const teton = K.calc('wyoming', { county: 'teton-county' });
const park = K.calc('wyoming', { county: 'park-county' });
const ev = K.calc('wyoming', { fuel: 'ev', weightLbs: 4200 });
const y2 = K.renew('wyoming', 1);
const y5 = K.renew('wyoming', 5);
const used = K.calc('wyoming', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019, msrp: 32000 });

export default defineState({
  slug: 'wyoming',
  title: 'Wyoming Vehicle Registration Fees 2026: County Fee and Tax',
  description: `Wyoming vehicle registration fees for 2026: county fee of 3% of 60% to 15% of MSRP, $30 state fee, $15 title, 4% to 7% sales tax. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Wyoming vehicle registration fees',
  intro: 'Wyoming has no inspections and a low sales tax, but its registration is priced on the car’s original sticker, so plates on a new car cost hundreds of dollars.',
  resume: `A new $35,000 gasoline car registered in Laramie County costs ${K.usd(r.atPurchase)} in taxes and fees at purchase: ${K.usd(v('sales-tax'))} of state sales tax at 4% and ${K.usd(v('local-tax'))} of Laramie County tax at 1%, both collected by the county treasurer rather than the dealer, the $15 title, the $30 state registration fee and a county registration fee of ${K.usd(v('county-fee'))}. That county fee is 3% of 60% of the factory price, which is the manufacturer's suggested retail price of the model and trim, not what you paid. It falls each year: the second year costs ${K.usd(y2.perYear)} in all, and from the sixth year of service the share is 15%, or ${K.usd(y5.perYear)} a year for this car. Sales tax depends on where you live, from 4% in Park and Sublette counties to 7% in Teton County, where the same purchase totals ${K.usd(teton.atPurchase)}. Electric cars pay a $100 yearly decal and plug-in hybrids $50 since July 1, 2026.`,
  body: (h) => `
<h2>A registration priced on the original sticker</h2>
<p>Under ${h.src('wy:title31', 'W.S. 31-3-101')}, the county registration fee is 3% of a share of the factory price: 60% in the first year of service, then 50%, 40%, 30%, 20% and 15% from the sixth year on, with a $5 minimum. The factory price is the MSRP of the make, model and trim when new, taken from a national price guide, so a used car bought cheaply still pays on its original sticker. A current-year model counts as first year of service whatever the purchase date. Type the MSRP in the calculator: for a 2019 car that stickered at $32,000 and sells privately for $18,000, the county fee is ${K.usd(v('county-fee', used), 2)}, and the purchase comes to ${K.usd(used.atPurchase, 2)}.</p>
<h2>Sales tax paid at the courthouse</h2>
<p>Dealers do not collect the tax on a car sold to a Wyoming resident. The county treasurer collects it before the first registration, at the rate of the county where the owner lives, from the ${h.src('wy:rates', 'Department of Revenue rate chart')}: the 4% state rate plus county option taxes of up to 3%. A buyer in Park County pays ${K.usd(park.atPurchase)} for the reference car. A trade-in already titled in your name comes off the price, and documentary fees, freight and prep charges are part of the taxed price. Pay within 65 days of the purchase, or a 10% penalty applies, never less than $25.</p>
<h2>Electric cars and what Wyoming does not charge</h2>
<p>A 2026 law cut the yearly electric vehicle decal from $200 to $100 and set $50 for plug-in hybrids, and the same act created a per-kilowatt-hour tax on the electricity used to propel electric vehicles. A new 4,200 lb EV in Laramie County pays ${K.usd(ev.atPurchase)} at purchase. Passenger cars need no safety or emissions inspection; only a car coming from another state, or a rebuilt one, needs a $10 VIN inspection before its first Wyoming title. Other states with a value-based yearly charge are compared in the ${h.a('vehicle-property-tax', 'vehicle property tax guide')}.</p>`,
  faqs: [
    { q: 'What is the factory price used for Wyoming plates?', a: 'It is the manufacturer’s suggested retail price of the make, model and trim level when new, without federal excise tax or the freight from the factory, read from a national price guide. It is not the blue book value or the price you paid, and it never resets when the car is sold.' },
    { q: 'Who collects the sales tax on a car bought in Wyoming?', a: 'The county treasurer of the county where you live, before the first registration, at that county’s rate. A dealer does not collect it. A buyer has 65 days from the purchase date; after that the Department of Revenue adds a 10% penalty with a $25 minimum and 1% interest a month.' },
    { q: 'Why does the Wyoming registration fee drop every year?', a: 'The county fee uses a falling share of the factory price: 60% in the first year of service, 50% in the second, then 40%, 30% and 20%, and 15% from the sixth year onward. Multiplied by 3%, a $35,000 sticker costs $630 the first year and $157.50 once the car is six years old.' },
  ],
  related: ['dmv-fees-calculator', 'car-registration-fees', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'car-sales-tax-calculator', 'state:washington'],
});
