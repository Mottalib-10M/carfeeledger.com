import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('louisiana');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const nola = K.calc('louisiana', { county: 'orleans-parish' });
const laf = K.calc('louisiana', { county: 'lafayette-parish' });
const priv = K.calc('louisiana', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021, fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('louisiana', 1);
const renewNola = K.renew('louisiana', 1, { county: 'orleans-parish' });

export default defineState({
  slug: 'louisiana',
  title: 'Louisiana Car Sales Tax 2026: Parish Rates, Plate and Title',
  description: `Louisiana car sales tax for 2026: 5% state plus parish and city tax, $68.50 title, plate at 0.1% of value a year, $436 doc fee cap. East Baton Rouge: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Louisiana car sales tax, plate and title fees',
  intro: 'In Louisiana the state rate is only half of the sales tax on a car; the other half depends on the parish and city where the car is registered.',
  resume: `A new $35,000 gasoline car registered in East Baton Rouge Parish costs ${K.usd(r.atPurchase, 2)} at purchase: ${K.usd(v('sales-tax'), 2)} of state sales tax at 5%, ${K.usd(v('local-tax'), 2)} of parish and city tax at 5.5%, the $68.50 title, the $8 handling fee, ${K.usd(v('reg'), 2)} for a two-year plate (the license tax is $10 a year plus $1 for each $1,000 of value above $10,000), the $18 inspection with emissions test charged in the Baton Rouge area and a $436 documentary fee, the 2026 legal maximum. The same car registered in New Orleans, where the local rate is 5%, comes to ${K.usd(nola.atPurchase, 2)}, and in Lafayette Parish outside city limits, at 2%, to ${K.usd(laf.atPurchase, 2)}. A trade-in is deducted before both taxes. Some offices add a local fee of up to $6. Over the following years the plate and the inspection average ${K.usd(renew.perYear, 2)} a year in East Baton Rouge and ${K.usd(renewNola.perYear, 2)} in New Orleans, where the inspection sticker ends in 2027.`,
  body: (h) => `
<h2>Two taxes, one domicile</h2>
<p>The ${h.src('la:ldr-rate', 'state sales tax rate')} has been 5% since January 1, 2025. The local part is set by the domicile where the car will be registered, which can be a parish, a city, or a school or economic development district inside them, and the OMV ${h.src('la:parish-table', 'Parish and Municipality Tax Table')} lists each one with its history. Combined local rates run from 2% in Lafayette Parish outside city limits to 6% in Catahoula Parish, and city limits matter: Baton Rouge and the rest of East Baton Rouge Parish both total 5.5%, Shreveport 4.6%. Both taxes apply to the price minus a qualifying trade-in and rebate, on new and used cars and on private sales as well.</p>
<h2>A plate priced by value, paid two years at a time</h2>
<p>Louisiana's license plate is a small tax on value: $10 a year for a car worth $10,000 or less, plus $1 for each additional $1,000, rounded at $500, and plates are sold for two years, so the minimum is $20. The value is fixed when you buy the car and does not drop at renewal. Electric cars add a road usage fee of $110 a year and hybrids, including plug-in hybrids, $60, now collected by the OMV with the plate for the same two years. An $18,000 used electric car bought privately in East Baton Rouge Parish costs ${K.usd(priv.atPurchase, 2)} at the OMV, ${K.usd(v('ev', priv), 2)} of road usage fee included.</p>
<h2>The brake tag ends in 2027, except around Baton Rouge</h2>
<p>Through 2026 every car needs a yearly safety inspection sticker at $10, or $18 with the emissions test required in Ascension, East Baton Rouge, Iberville, Livingston and West Baton Rouge parishes. Act 701 of 2026 replaces the sticker elsewhere on January 1, 2027 with an identification program sticker of no more than $6 a year; the five emissions parishes keep their test until federal approval. Compare with ${h.a('state:texas', 'Texas')}, which ended safety inspections in 2025, or with ${h.a('state:mississippi', 'Mississippi')}.</p>`,
  faqs: [
    { q: 'Which parish rate applies to a car bought in another Louisiana parish?', a: 'The rate of the domicile where the vehicle will be registered, not the location of the dealer. The OMV assesses the state 5% and the local tax of the buyer’s parish, city or district on the price minus any qualifying trade-in and rebate, whether the car comes from a dealer or a private seller.' },
    { q: 'Does the Louisiana license plate fee go down as the car gets older?', a: 'No. Under R.S. 47:463 the value used for the plate tax is fixed at the time of purchase, and the same tax applies at each renewal after that. A car bought new for $35,000 keeps paying $70 every two years until it changes hands, when the next owner’s price sets a new value.' },
    { q: 'What is the maximum dealer documentary fee in Louisiana in 2026?', a: 'It is $436 for calendar year 2026. The Louisiana Motor Vehicle Commission announced the figure in January 2026 after the Legislative Auditor verified the inflation adjustment computed by the Division of Administration under R.S. 6:969.18. The fee covers paperwork such as perfecting the lien and titling the sale.' },
  ],
  related: ['car-sales-tax-calculator', 'doc-fee-by-state', 'vehicle-inspection-cost', 'state:texas', 'state:mississippi', 'out-the-door-price-calculator'],
});
