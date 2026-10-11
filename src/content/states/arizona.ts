import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('arizona');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const tax = v('sales-tax') + v('county-tax') + v('city-tax');
const renew = K.renew('arizona', 1);
const renew5 = K.renew('arizona', 5);
const tucson = K.calc('arizona', { county: 'tucson' });
const priv = K.calc('arizona', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });

export default defineState({
  slug: 'arizona',
  title: 'Arizona Vehicle License Tax 2026: VLT, Title and Sales Tax',
  description: `Arizona vehicle license tax and car fees for 2026: VLT on 60% of MSRP, $8 registration, $4 title, 5.6% state tax plus city. New $35,000 car in Phoenix: ${K.usd(r.atPurchase)}.`,
  h1: 'Arizona vehicle license tax and car buying fees',
  intro: 'Arizona keeps its flat MVD fees tiny and collects most of the money through a yearly tax on the car’s sticker value and a three-level sales tax at the dealer.',
  resume: `A new $35,000 gasoline car bought from a Phoenix dealer costs ${K.usd(r.atPurchase)} in taxes and government fees at purchase. The transaction privilege tax takes ${K.usd(tax)}: 5.6% for the state, 0.7% for Maricopa County and Phoenix’s 2.8% city rate, which drops to 2% on the part of the price above $14,338. The vehicle license tax adds ${K.usd(v('vlt'))}, computed on 60% of the sticker price at $2.80 per $100. The rest is small: the $8 registration, the $4 title and the $1.50 air quality fee. A trade-in lowers the taxed price, and a separately listed doc fee is not taxed, but Arizona sets no cap on it. In Tucson the same purchase comes to ${K.usd(tucson.atPurchase)}. From the second year the owner pays about ${K.usd(renew.perYear)} to renew, and the bill keeps shrinking as the license tax value falls 16.25% a year, to about ${K.usd(renew5.perYear)} in the sixth year, counting half of the two-yearly emissions test that starts then.`,
  body: (h) => `
<h2>How the vehicle license tax is figured</h2>
<p>The vehicle license tax replaces a property tax on cars. Under ${h.src('az:ars-28-5801', 'A.R.S. § 28-5801')}, the assessed value starts at 60% of the manufacturer’s base retail price, and the tax is $2.80 per $100 of that value in the first twelve months. Each later year the value drops by 16.25% and the rate becomes $2.89 per $100, with a minimum of $10. Because the base is the original sticker price, buying a used car cheaply does not reset the tax: the MVD uses the car’s original price and age. That is why the calculator asks for the MSRP when you have it.</p>
<h2>Sales tax at three levels, with city tiers</h2>
<p>Arizona has no sales tax in the usual sense but a transaction privilege tax that the dealer pays and passes on. The ${h.src('az:ador-rates', 'Department of Revenue rate table for October 2026')} combines the 5.6% state rate with county rates from 0% in Mohave County to 1.3% in Coconino County, then adds the city rate. Several cities cut their rate on expensive items: Phoenix charges 2% instead of 2.8% on the portion of a single item above $14,338, Apache Junction and Casa Grande do the same above lower thresholds. A car bought from a private seller owes no transaction privilege or use tax at all, so the buyer of an $18,000 used car pays only ${K.usd(priv.atPurchase)} at the MVD, before any emissions test.</p>
<h2>Emissions tests in Phoenix and Tucson</h2>
<p>Only the Phoenix and Tucson areas test emissions. A new car is exempt until its sixth registration year; after that, most cars around Phoenix are tested every two years and most around Tucson every year, at $16.15 for the standard OBD test. Electric cars are exempt and also skip the $1.50 air quality fee. Arizona has no separate EV registration fee in 2026, unlike its neighbor ${h.a('state:california', 'California')}, where electric cars pay a road improvement fee every year. Compare the yearly tax on value across states on our ${h.a('vehicle-property-tax', 'vehicle property tax page')}.</p>`,
  faqs: [
    { q: 'Why is my Arizona registration renewal so much higher than $8?', a: 'Because almost all of it is the vehicle license tax, not the registration fee. The $8 fee and the $1.50 air quality fee are fixed, while the license tax is based on 60% of the original sticker price, reduced 16.25% for each year since the car was first registered, at $2.89 per $100 after the first year.' },
    { q: 'Do I pay sales tax when I buy a car from a private seller in Arizona?', a: 'No. A sale by someone who is not in the business of selling cars is a casual sale, which the transaction privilege tax does not reach, and the use tax applies only to purchases from a retailer. The buyer still pays the title fee, the registration fee and the vehicle license tax at the MVD.' },
    { q: 'Do electric cars pay a special fee in Arizona?', a: 'Not in 2026: the registration fee is the same $8 as for any car, and electric cars are exempt from both the $1.50 air quality fee and the emissions test. They do pay the regular vehicle license tax, which is computed on 60% of the base retail price like any other car.' },
  ],
  related: ['vehicle-property-tax', 'dmv-fees-calculator', 'smog-check-cost', 'car-sales-tax-calculator', 'state:california', 'state:texas'],
});
