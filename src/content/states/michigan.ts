import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('michigan');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('michigan', 1);
const renew3 = K.renew('michigan', 3);
const ev = K.calc('michigan', { fuel: 'ev', weightLbs: 4200 });
const trade = K.calc('michigan', { tradeIn: 15000 });
const pricey = K.calc('michigan', { msrp: 52000 });

export default defineState({
  slug: 'michigan',
  title: 'Michigan Plate Fees and Car Sales Tax 2026: MSRP Table, EV',
  description: `Michigan plate fees and car sales tax for 2026: 6% tax, trade-in credit up to $12,000, plate fee on the MSRP, EV fee $267, $15 title. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Michigan plate fees and car sales tax',
  intro: 'Michigan prices its license plate on the sticker price of the car, and from 2026 its electric car fee jumped with the gas tax it is tied to.',
  resume: `A new $35,000 gasoline car bought from a Michigan dealer costs ${K.usd(r.atPurchase)} in taxes and fees at purchase: ${K.usd(v('sales-tax'))} of 6% sales tax on the price and the taxable $280 documentary fee, the $15 title transfer fee, a ${K.usd(v('reg'))} plate fee read from the state’s list-price table, $8 of regulatory and administration fees, and the documentary fee itself, capped at $280. The plate fee follows the MSRP, not the deal: a car listed at $52,000 starts at ${K.usd(v('reg', pricey))}. It then shrinks three times by 10%, so the same $35,000 car renews for about ${K.usd(renew.perYear)} in its second year and ${K.usd(renew3.perYear)} from its fourth year. A $15,000 trade-in lowers the tax to ${K.usd(v('sales-tax', trade))}, because only $12,000 of it counts in 2026. An electric car adds a $267 fee every year, so a new EV pays ${K.usd(ev.atPurchase)} at purchase. Michigan has no vehicle inspection.`,
  body: (h) => `
<h2>The plate fee: a list-price table with three discounts</h2>
<p>For a car of the 1984 model year or later, ${h.src('mi:mcl-801', 'section 801 of the Michigan Vehicle Code')} sets the yearly registration tax from the manufacturer’s suggested base list price: $36 up to $6,000, then a step of $6 for every $1,000, reaching $178 at $30,000 and adding $6 per $1,000 or fraction above that. The second registration costs 90% of the first, the third 90% of the second, and every later year 90% again; after that the fee no longer falls, however old the car. Until October 1, 2027, $2.25 and $5.75 are added for highway safety regulation and administration. A new plate expires on your birthday, so the first payment is usually prorated.</p>
<h2>Sales tax and a trade-in credit that is still capped</h2>
<p>The tax is 6% of the price, with the documentary fee counted as a taxable charge. The trade-in credit is limited by law: $5,000 in 2019, raised by $1,000 each January, so $12,000 in 2026 and $13,000 in 2027. Once the amount would pass $14,000 the limit disappears. A car bought from a private seller is taxed at 6% when you transfer the title, with exemptions for close family members, and the transfer should happen within 15 days to avoid a $15 late fee.</p>
<h2>Electric cars after the 2026 fuel tax change</h2>
<p>The motor fuel tax was reset on January 1, 2026, at 51 cents a gallon adjusted for inflation, and the law ties the EV fee to that rate: $5 for each cent above 19 cents a gallon, on top of a $100 base. The result is $267 a year for an electric car and $113 for a plug-in hybrid. The fee will move again whenever the fuel tax is re-indexed. Hybrids that do not plug in pay nothing extra. For a neighbor that charges a flat EV fee, see ${h.a('state:wisconsin', 'Wisconsin')}, and compare all states on the ${h.a('ev-registration-fee-by-state', 'EV fee table')}.</p>`,
  faqs: [
    { q: 'Why did my Michigan plate renewal stop going down after a few years?', a: 'The registration tax on a 1984 or newer car is reduced only three times. The second registration is 90% of the first-year tax, the third is 90% of the second, and the fourth and every later renewal stay at that level. The list price used is the one the car had when new, so the fee never falls below about 73% of the first year.' },
    { q: 'How much of a trade-in counts against Michigan sales tax in 2026?', a: 'Up to $12,000 of the agreed trade-in value is deducted from the taxable price on a dealer purchase in 2026. The limit started at $5,000 in 2019 and rises by $1,000 every January 1 until it would exceed $14,000, when the credit becomes unlimited. Leases do not qualify.' },
    { q: 'Why is the Michigan EV fee $267 in 2026?', a: 'The law adds $100 to the registration of an electric car of 8,000 lb or less, plus $5 for each cent the gasoline tax exceeds 19 cents. With the fuel tax raised on January 1, 2026, the Department of State charges $267 in total. A plug-in hybrid pays $113, and trucks and buses over 8,000 lb pay $367 and $183.' },
  ],
  related: ['dmv-fees-calculator', 'ev-registration-fee-by-state', 'car-registration-fees', 'state:wisconsin', 'state:indiana', 'license-plate-renewal'],
});
