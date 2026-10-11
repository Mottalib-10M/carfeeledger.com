import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('california');
const v = (id: string, x = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const used = K.calc('california', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019, fuel: 'gas' });
const ev = K.calc('california', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021, fuel: 'ev', weightLbs: 4200 });
const r5 = K.renew('california', 5);
const lb = K.calc('california', { county: 'city-long-beach' });
const alp = K.calc('california', { county: 'alpine-county' });

export default defineState({
  slug: 'california',
  title: 'California DMV Fee Calculator 2026: VLF, TIF, Smog, Tax',
  description: `California DMV fee calculator for 2026: registration $76, CHP $34, VLF 0.65%, TIF by value, county fees and use tax by city. New $35,000 car: ${K.usd(r.atPurchase)} due.`,
  h1: 'California DMV fee calculator',
  intro: 'California builds its registration bill on the price you paid, so the same car costs very different amounts to register new, used, or after a few years.',
  resume: `Registering a new $35,000 gasoline car in Los Angeles County costs ${K.usd(r.atPurchase)} in taxes and fees at purchase: ${K.usd(v('sales-tax'))} of sales tax at 10.25%, the $${v('reg')} registration fee, the $${v('chp')} California Highway Patrol fee, a ${K.usd(v('vlf'))} vehicle license fee (0.65% of the price class), a ${K.usd(v('tif'))} transportation improvement fee, ${K.usd(v('county'))} of county fees, the smog abatement fee and the dealer's documentation fee, capped at $85. The vehicle license fee is the line that makes California different: it replaces a property tax, it falls on a fixed schedule each year (${K.usd(v('vlf', r5 as never))} at the sixth year for this car) and it restarts at the price paid whenever the car is sold. Use tax depends on your city, from ${K.usd(v('sales-tax', alp))} in Alpine County to ${K.usd(v('sales-tax', lb))} in Long Beach on the same car, and a trade-in does not reduce it.`,
  body: (h) => `
<h2>The vehicle license fee follows the price you paid</h2>
<p>The DMV does not value your car from a guide. It takes the purchase price, places it in a $200 class (a $12,479 car is in the $12,400 to $12,599.99 class and is charged as $12,500) and applies 0.65%. Each renewal applies a lower percentage of that value: 90% the second year, 80% the third, then down to 15% in the eleventh year. When the car is sold, the schedule starts again from the new price. A used car bought for $18,000 therefore pays VLF on $18,000 at its first renewal with you, ${K.usd(v('vlf', used))}, even if its first owner was already paying a small amount. ${h.src('ca:dmv-vlf', 'The DMV manual')} explains the classes and the depreciation table.</p>
<h2>Buying used: what you pay now and what waits for the renewal</h2>
<p>A California registration belongs to the car for the current registration year. When you buy used, you pay the use tax, the $15 transfer fee and, for gasoline cars four model years old or newer, an $8 smog transfer fee; older gasoline cars need a smog certificate from the seller. The registration fee, the CHP fee, the VLF on your price, the TIF and the county fees come with the next renewal notice. For an $18,000 2019 car bought from a private seller in Los Angeles County, ${K.usd(used.atPurchase)} is due at the transfer and ${K.usd(used.firstYear - used.atPurchase)} at the renewal.</p>
<h2>Electric cars and the road improvement fee</h2>
<p>Zero-emission cars of model year 2020 or later pay a $121 road improvement fee at every renewal, but not when a new ZEV is first registered by a dealer. They never need a smog check. A used $18,000 EV from a private seller owes ${K.usd(ev.atPurchase)} at the transfer, and its first renewal with you includes the road improvement fee, ${K.usd(ev.firstYear - ev.atPurchase)} in all.</p>
<h2>Where your county shows up</h2>
<p>Two county lines appear on a California bill: the use tax rate of your city or unincorporated area, published by the ${h.src('ca:cdtfa-rates', 'CDTFA')} (rates effective October 1, 2026), and small county and district fees for programs such as freeway service patrols, auto theft prevention, fingerprint identification and air quality, listed in ${h.src('ca:dmv-county', 'DMV Appendix 1A')}. The calculator's county list includes every county and the largest cities.</p>`,
  faqs: [
    { q: 'How much is the California vehicle license fee on a new car?', a: `0.65% of the purchase price class: on a $35,000 car, ${K.usd(v('vlf'))} the first year. It then falls to 90%, 80%, 70% and so on of that value at each renewal, down to 15% in year eleven, and restarts at the new price when the car is sold.` },
    { q: 'Does California give a tax break for a trade-in?', a: 'No. The CDTFA tells dealers to report the full selling price even when a trade-in is accepted: on a $20,000 car with a $4,000 trade-in, tax is due on $20,000. The documentation fee is also taxable in California.' },
    { q: 'When does a California car need its first smog check?', a: 'Gasoline and hybrid cars are exempt for their first eight model years and pay a smog abatement fee with each renewal instead; the first biennial check comes in model year plus eight. Electric cars never need one. Station prices are not regulated, but each certificate includes an $8.25 state fee.' },
    { q: 'What is the transportation improvement fee in California?', a: 'A yearly fee collected with registration and based on the vehicle’s value: $33 under $5,000, $66 up to $24,999, $132 up to $34,999, $198 up to $59,999 and $231 from $60,000, according to the DMV fee page. It follows the depreciated value at each renewal.' },
  ],
  related: ['dmv-fees-calculator', 'smog-check-cost', 'vehicle-property-tax', 'state:texas', 'state:florida', 'car-registration-fees'],
});
