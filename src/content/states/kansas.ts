import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('kansas');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const sedg = K.calc('kansas', { county: 'sedgwick-county' });
const priv = K.calc('kansas', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021, fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('kansas', 1);
const renewEv = K.renew('kansas', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'kansas',
  title: 'Kansas Vehicle Tax and Tag Fees 2026: Sales Tax, EV $165',
  description: `Kansas vehicle tax and tag fees for 2026: 6.5% sales tax plus local, $10 title, $30 or $40 tag, $165 EV tag, county property tax. Johnson County: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Kansas vehicle sales tax, tag fees and property tax',
  intro: 'Kansas charges modest tag fees, collects sales tax even when you buy from a private seller, and adds a county property tax to every registration.',
  resume: `A new $35,000 gasoline car registered in Johnson County costs ${K.usd(r.atPurchase, 2)} in state and local charges before the property tax: ${K.usd(v('sales-tax'), 2)} of state sales tax at 6.5%, ${K.usd(v('local-tax'), 2)} of Johnson County sales tax at 1.475%, the $10 title, the 50-cent plate, the $30 registration for a car of 4,500 lb or less, the $5 service fee and the $4 modernization fee. A city or special district tax can add to the county rate, and in Sedgwick County, where the county rate is 1%, the same car costs ${K.usd(sedg.atPurchase, 2)}. The county treasurer also collects the personal property tax on the car at every registration, set by its value class and the local mill levy, and may add a facility fee of up to $5. Renewing a gasoline car then costs ${K.usd(renew.perYear, 2)} a year in fees, or ${K.usd(renewEv.perYear, 2)} for an electric one, plus that property tax. No dealer documentary fee is included: Kansas sets no cap, and the fee is taxed when charged.`,
  body: (h) => `
<h2>Sales tax applies to private sales too</h2>
<p>Kansas is one of the states that taxes a used car bought from a neighbor. According to ${h.src('ks:pub1526', 'Publication KS-1526')}, the seller collects nothing, and the buyer pays the sales tax to the county treasurer when registering the car, on the price written on the title. The treasurer uses the higher of the rate where the sale took place and the rate at the buyer's address. A trade-in is deducted from the price in both dealer and private deals, while a dealer's administrative or processing fee is taxed along with freight and options. An $18,000 used electric car bought privately in Johnson County therefore costs ${K.usd(priv.atPurchase, 2)} at the treasurer before property tax.</p>
<h2>Tag fees set by weight, or by fuel since 2026</h2>
<p>The ${h.src('ks:ksa-8-143', 'annual registration fee in K.S.A. 8-143')} is $30 for a car of 4,500 lb or less and $40 above. Cars that use electricity pay a single higher fee instead: $70 for a hybrid, $100 for a plug-in hybrid and $165 for an all-electric car, and pickups registered as trucks pay $40, $125 or $200. Every registration also carries a $5 service fee and a $4 modernization fee. The title is $10, and a used car titled in another state first needs a Highway Patrol VIN check that costs at least $20.</p>
<h2>The property tax arrives with the tag renewal</h2>
<p>Unlike ${h.a('state:missouri', 'Missouri')}, where the county bills personal property tax separately, Kansas collects it at the tag office each time you renew, prorated to your renewal month when you first register. The amount depends on the car's value class and your local levy, so ask the treasurer or use the county's estimator where one exists. ${h.a('state:nebraska', 'Nebraska')} also collects a value-based tax at registration but reads it from the original MSRP and the car's age; compare both with the ${h.a('vehicle-property-tax', 'vehicle property tax by state')}.</p>`,
  faqs: [
    { q: 'Do you pay sales tax on a car bought from a private seller in Kansas?', a: 'Yes. When the seller is not a licensed dealer, the buyer pays state and local sales tax to the county treasurer at registration, on the price written on the title or the bill of sale. The treasurer applies the higher of the rate where the sale took place and the rate at the address where the car is registered.' },
    { q: 'How much is a Kansas tag for an electric car in 2026?', a: 'The annual registration fee for an all-electric passenger car is $165 under K.S.A. 8-143, compared with $30 or $40 for a gasoline car depending on weight. A plug-in hybrid pays $100 and a regular hybrid $70. The $5 service fee, the $4 modernization fee and the county property tax are added to each of them.' },
    { q: 'Why is my Kansas tag renewal so much higher than the registration fee?', a: 'Because the county treasurer collects the personal property tax on the vehicle with each renewal. The registration itself is only $30 or $40 for most gasoline cars plus small fees, but the property tax is computed from the vehicle’s value class and the local mill levy, and for a newer car it is usually the largest part of the bill.' },
  ],
  related: ['vehicle-property-tax', 'ev-registration-fee-by-state', 'car-sales-tax-calculator', 'state:missouri', 'state:nebraska', 'license-plate-renewal'],
});
