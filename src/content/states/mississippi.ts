import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('mississippi');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const trade = K.calc('mississippi', { tradeIn: 10000 });
const renew = K.renew('mississippi', 1);

export default defineState({
  slug: 'mississippi',
  title: 'Mississippi Car Tag and Sales Tax 2026: 5%, Ad Valorem',
  description: `Mississippi car tag costs 2026: 5% sales tax after trade-in, $9 title, $15 privilege tax, $14 tag fee, local ad valorem. New $35,000 car: ${K.usd(r.atPurchase)} + ad valorem.`,
  h1: 'Mississippi car tag fees and sales tax',
  intro: 'In Mississippi you buy your car tag at the county tax collector, and what you pay there depends on the state, your county and the car itself.',
  resume: `A new $35,000 gasoline car from a Mississippi dealer costs ${K.usd(r.atPurchase)} in state charges at the tax collector's window, before the local ad valorem tax: ${K.usd(v('sales-tax'))} of sales tax at the 5% rate reserved for cars and light trucks, a $9 title, the $${v('privilege')} highway privilege tax and a ${K.usd(v('reg'), 2)} registration fee for a first tag. The trade-in comes off the taxed price, so trading a $10,000 car cuts the tax to ${K.usd(v('sales-tax', trade))}. The figure the calculator cannot give is the ad valorem tax: your county and city apply their millage to 30% of the car's sticker price, reduced for age, and a state credit trims the bill. Each later year the fixed state part is ${K.usd(renew.perYear, 2)}, plus that ad valorem tax and, for an electric or hybrid car, an inflation-indexed road tax.`,
  body: (h) => `
<h2>Why the tag costs more than the fees</h2>
<p>The state part of a Mississippi tag is small and fixed: a $15 privilege tax and a registration fee of $14 the first time or $12.75 at renewal, which bundles a tag charge, a trauma care fund fee and an extra registration fee. The large part is the ad valorem tax that your tax collector computes for the local governments. The ${h.src('ms:ad-valorem', 'Department of Revenue')} sets the assessed value at 30% of the manufacturer's suggested retail price, lowered over ten years, with a $100 floor for passenger vehicles. That assessment is multiplied by the combined millage of your county, city and school district, so two neighbors in different towns can pay very different amounts for the same car. A legislative tag credit, funded by sales tax collected on vehicles, then takes a percentage off.</p>
<h2>Dealer purchase or private sale</h2>
<p>From a dealer, the 5% applies to the price after discounts and the trade-in allowance, but manufacturer rebates are not subtracted. From a private seller, the rule changes completely: the tax collector charges 5% of a value the state assigns to that model, not the price on your bill of sale, and a car ten years old or more owes no sales tax at all. Bring the title and register within 30 business days; the late penalty adds $250 on top of the usual charges. To compare with a neighbor where the tax is mostly a state matter, see ${h.a('state:alabama', 'Alabama')}.</p>
<h2>Electric and hybrid cars</h2>
<p>Electric cars pay an extra yearly tax that the law set at $150, and hybrids one set at $75. Both are raised every July 1 by the previous year's inflation rate, so the amount on your notice is higher than the original figure; the tax collector has the current number. There is no inspection to budget for: Mississippi no longer requires a periodic safety or emissions test for private cars.</p>`,
  faqs: [
    { q: 'How is the ad valorem tax on a Mississippi car tag calculated?', a: 'The assessed value is 30% of the car’s original sticker price, reduced for depreciation over ten years, with a $100 minimum for passenger vehicles. Your tax collector multiplies it by the millage of your county, city and school district, then subtracts the legislative tag credit set each year by the Department of Revenue.' },
    { q: 'Do you pay sales tax on a used car bought from a private seller in Mississippi?', a: 'Yes, if the car is less than ten years old. The tax collector charges 5% of a value the Department of Revenue assigns to that model, not the price you agreed. Cars ten years old or more, bought from a private person, are exempt from this casual sale tax.' },
    { q: 'What does the $14 Mississippi registration fee pay for?', a: 'It combines three charges set in the law: $5 for the license tag and two decals, $4 for the Mississippi Trauma Care Systems Fund and a $5 additional registration fee. At renewal only decals are issued, so the first charge is $3.75 and the total falls to $12.75.' },
  ],
  related: ['vehicle-property-tax', 'car-sales-tax-calculator', 'state:alabama', 'ev-registration-fee-by-state', 'title-and-registration-fees', 'out-the-door-price-calculator'],
});
