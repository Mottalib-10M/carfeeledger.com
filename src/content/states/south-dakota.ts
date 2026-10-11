import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('south-dakota');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('south-dakota', { fuel: 'ev', weightLbs: 4200 });
const trade = K.calc('south-dakota', { tradeIn: 10000 });
const penn = K.calc('south-dakota', { county: 'pennington-county' });
const renew = K.renew('south-dakota', 1);
const renewEv = K.renew('south-dakota', 1, { fuel: 'ev', weightLbs: 4200 });
const old = K.renew('south-dakota', 10);

export default defineState({
  slug: 'south-dakota',
  title: 'South Dakota Vehicle Excise Tax 2026: 4%, Plates, Wheel Tax',
  description: `South Dakota vehicle excise tax 2026: 4% net of trade-in, $10 title, plates by weight from $36, county wheel tax, EV fee $100. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'South Dakota vehicle excise tax and registration fees',
  intro: 'South Dakota charges one flat 4% tax on every vehicle sale, and sets the plates by weight rather than value.',
  resume: `A new $35,000 gasoline car of 3,500 lb titled in Minnehaha County costs ${K.usd(r.atPurchase)} at the county treasurer: ${K.usd(v('sales-tax'))} of motor vehicle excise tax at 4%, the ${K.usd(v('title'))} title, a ${K.usd(v('reg'))} license fee for a car between 2,001 and 4,000 lb, ${K.usd(v('hp-fee') + v('solid-waste') + v('tech-fee'))} of small state fees and ${K.usd(v('county-fee'))} of county wheel tax. There is no city or county sales tax on top of the 4%, and no yearly tax on the car's value. A $10,000 trade-in lowers the excise tax to ${K.usd(v('sales-tax', trade))}, and the same deduction applies when you buy from a private seller. In Pennington County, where the wheel tax is $5 a wheel, the purchase comes to ${K.usd(penn.atPurchase)}. Renewing costs ${K.usd(renew.perYear)} a year in Minnehaha County, and the license fee drops by 30% once the car turns ten, to ${K.usd(old.perYear)} a year in all. An electric SUV of 4,200 lb pays ${K.usd(ev.atPurchase)} at purchase and ${K.usd(renewEv.perYear)} a year after, with the $100 electric fee.`,
  body: (h) => `
<h2>One 4% tax, collected by the county</h2>
<p>A car bought in South Dakota is not subject to the sales tax. It pays the ${h.src('sd:excise', 'motor vehicle excise tax')} of 4% of the purchase price when you title it at the county treasurer, within 45 days of the purchase. Dealers do not collect it. The law deducts the trade-in on a new car, on a used car from a dealer and on a private sale, as long as a vehicle is taken in trade. A car eleven or more model years old sold for $2,500 or less before trade-in is exempt. Late titles pay interest from the purchase date and, after 60 days, a penalty of 10% of the tax or $10, whichever is greater.</p>
<h2>Plates priced by weight and age</h2>
<p>The yearly license fee depends on the manufacturer's shipping weight: $36 up to 2,000 lb, $72 up to 4,000 lb, $108 up to 6,000 lb and $144 above. Once the car is ten years old on January 1, it pays 70% of that. Renewal month follows the first letter of your last name, from January for A and B to November for T through Z, so the first registration is prorated to that month; our calculator shows the full twelve months. Each registration adds $1 for the highway patrol, $1 for solid waste and a $2 technology fee, and plates sent by mail cost $12 more.</p>
<h2>Wheel tax and the electric car fee</h2>
<p>Counties may levy up to $5 per wheel with a $60 cap per vehicle. The ${h.src('sd:wheel', 'Department of Revenue wheel tax table')} lists $4 a wheel in Minnehaha, $5 in Pennington and Lincoln, $2 with an $8 cap in Beadle and Codington, and nothing in Harding, Hyde, Jones, McPherson and Oglala Lakota. Electric cars pay $100 a year more, hybrids nothing. South Dakota has no inspection. Neighboring ${h.a('state:nebraska', 'Nebraska')} and ${h.a('state:montana', 'Montana')} handle car taxes very differently.</p>`,
  faqs: [
    { q: 'Do South Dakota dealers collect the 4% excise tax?', a: 'No. Dealers are not required to collect or pay the motor vehicle excise tax on the vehicles they sell. The buyer pays it to the county treasurer when applying for the title and plates, within 45 days of the purchase. Late applications pay interest from the purchase date and, after 60 days, a penalty.' },
    { q: 'Is an old cheap car exempt from the South Dakota excise tax?', a: 'Yes, when two conditions are met: the car is eleven or more model years old and it is sold for $2,500 or less before any trade-in. Such a sale owes no 4% excise tax. Gifts between spouses, parents and children or siblings, and inherited vehicles, are also exempt; the title fee and plates are still due.' },
    { q: 'How is the license fee lowered for an older car in South Dakota?', a: 'A noncommercial car that is ten years old or more on January 1, by its model year, pays 70% of the normal license fee. For a car of 2,001 to 4,000 lb that means $50.40 instead of $72 a year. The small state fees and the county wheel tax are not reduced.' },
  ],
  related: ['dmv-fees-calculator', 'car-sales-tax-calculator', 'car-registration-fees', 'state:nebraska', 'state:montana', 'ev-registration-fee-by-state'],
});
