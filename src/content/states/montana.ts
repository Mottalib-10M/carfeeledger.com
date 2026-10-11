import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('montana');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('montana', 1);
const ev = K.calc('montana', { fuel: 'ev', weightLbs: 4200 });
const old = K.calc('montana', { condition: 'used', seller: 'private', price: 6000, modelYear: 2014 });

export default defineState({
  slug: 'montana',
  title: 'Montana Vehicle Registration Fees 2026: No Sales Tax',
  description: `Montana registration fees in 2026: no sales tax, $217, $87 or $28 by age, county option tax up to 0.7%, EV fee $130. New $35,000 car in Billings: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Montana vehicle registration fees',
  intro: 'Montana skips the sales tax on cars and charges by age instead, with a county tax on value and an option to register an older car for good.',
  resume: `Buying a new $35,000 gasoline car and registering it in Yellowstone County, home of Billings, costs ${K.usd(r.atPurchase, 2)} in public charges, because Montana has no sales tax. The bill is the $${v('reg')} registration fee for a car four years old or less, a $12 title, $12 for new plates, the $10 Highway Patrol fee, the $9 state parks fee you may decline, a $1 brain injury donation, a ${K.usd(v('admin'), 2)} administrative fee of 3% on those state charges, and ${K.usd(v('option-tax'), 2)} of county option tax: 0.5% of a value set at 90% of the MSRP in the model year. The next year the same car costs about ${K.usd(renew.perYear, 2)} to renew. An electric car adds a $130 yearly fee, which brings the purchase to ${K.usd(ev.atPurchase, 2)}. Once a car turns eleven, its yearly fee falls to $28, or it can be registered permanently.`,
  body: (h) => `
<h2>A fee by age, not by price</h2>
<p>The core of a Montana registration is a fee in lieu of tax that depends on nothing but the model year: $217 while the car is four years old or less, $87 from five to ten years and $28 after that, set in ${h.src('mt:mca-reg', 'section 61-3-321')}. A $60,000 SUV and a $25,000 sedan of the same year pay the same base fee. The only exception is at the top: a light vehicle that listed above $150,000 adds $825 a year until it is ten years old. On top come small fixed charges: the Highway Patrol fee, the parks fee and, at purchase, the title and plates. The Motor Vehicle Division then adds 3% to the fees and donations it collects.</p>
<h2>The county option tax</h2>
<p>The value of the car shows up through the county. Montana law lets each county levy up to 0.7% of a depreciated MSRP, or a flat fee, with voter approval. The value comes from a statutory table: an automobile counts at 90% of its sticker price in its model year, 80% the following year and 49% at four years old, while pickups keep more of their value on paper. Yellowstone County charges 0.5%; elsewhere, the calculator shows the range from nothing to the legal maximum until you check with your county treasurer. Wyoming, by contrast, taxes the purchase itself; see ${h.a('state:wyoming', 'Wyoming')}.</p>
<h2>Permanent registration for older cars</h2>
<p>An owner whose light vehicle is eleven years old or more can stop renewing: the ${h.src('mt:mca-permanent', 'permanent registration')} costs $87.50 plus the patrol fee, a parks fee of $6, an insurance verification fee and five years of county option tax at once. For a $6,000 car of 2014 bought privately, the yearly route costs ${K.usd(old.atPurchase, 2)} in the first year, title and plates included. The permanent registration stays with the owner, not the car: when you sell, the buyer registers it again. Electric and plug-in hybrid cars pay a one-time fee instead of the yearly one.</p>`,
  faqs: [
    { q: 'Is there really no sales tax on a car bought in Montana?', a: 'There is no state or local sales tax on a vehicle purchase in Montana, from a dealer or from a private seller. Owners pay a registration fee in lieu of tax set by the age of the car, plus the county option tax on its depreciated MSRP where the county has adopted one.' },
    { q: 'When is permanent registration worth it in Montana?', a: 'It is open to light vehicles eleven years old or more. You pay $87.50 plus five years of county option tax and a few fixed fees once, instead of $28 and the county tax every year. Keeping the car several years makes it pay off; selling soon does not, because it ends with the sale.' },
    { q: 'How much is the Montana electric vehicle fee in 2026?', a: 'An electric car under 6,000 pounds unladen pays $130 a year on top of the usual registration, and a heavier one $190. Plug-in hybrids pay $70 or $100. A car registered permanently pays a one-time amount instead: $260 or $380 for an electric car, $140 or $200 for a plug-in hybrid.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'state:wyoming', 'car-registration-fees', 'license-plate-renewal'],
});
