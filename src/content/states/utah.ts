import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('utah');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('utah', { fuel: 'ev', weightLbs: 4200 });
const stg = K.calc('utah', { county: 'st-george' });
const used = K.calc('utah', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const renew = K.renew('utah', 1);
const renewEv = K.renew('utah', 1, { fuel: 'ev', weightLbs: 4200 });
const renew12 = K.renew('utah', 12);
const regLines = v('reg') + v('reg-extra') + v('e-pay') + v('driver-ed') + v('uninsured');

export default defineState({
  slug: 'utah',
  title: 'Utah DMV Fees 2026: Sales Tax, Age-Based Fee, Registration',
  description: `Utah DMV fees 2026: local sales tax of 6.35% to 7.95%, $58.25 indexed registration, $150 age-based fee on a new car, EV fee $180. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Utah DMV fees, sales tax and the age-based fee',
  intro: 'Utah swaps the yearly property tax on cars for a flat fee that shrinks as the car gets older.',
  resume: `A new $35,000 gasoline car bought from a dealer in Salt Lake County costs ${K.usd(r.atPurchase)} in tax and DMV charges: ${K.usd(v('sales-tax') + v('local-tax'))} of sales tax at the 7.45% combined rate, the ${K.usd(v('title'))} title, ${K.usd(regLines)} of state registration charges (the $58.25 fee after 2026 indexing, the $7.50 add-on, the electronic payment, driver education and uninsured motorist fees), $10 for corridor preservation and $3 for air pollution control in the county, and the ${K.usd(v('uniform-fee'))} uniform fee charged instead of property tax on a car under three years old. Bought in St. George, where the rate is lower, the total is ${K.usd(stg.atPurchase)}. The yearly renewal runs about ${K.usd(renew.perYear)} at 2026 rates and falls as the uniform fee steps down, to ${K.usd(renew12.perYear)} once the car is twelve. An electric SUV pays the $180 alternative fuel fee on top: ${K.usd(ev.atPurchase)} at purchase and about ${K.usd(renewEv.perYear)} a year after. A dealer's document fee is taxed with the car.`,
  body: (h) => `
<h2>Which sales tax rate applies</h2>
<p>Utah's state share is 4.85% and cities and counties add their own layers, for a combined rate of 6.35% to 7.95% on a car in the places listed by the ${h.src('ut:rates', 'Tax Commission rate chart')}. Cars are exempt from the resort community tax, so in Salt Lake City and Park City a car pays less than the full combined rate. When you buy from a dealer, the dealer's location sets the rate; when you buy from a private seller, the rate is the one where you register the car. A trade-in reduces the taxed price, but in a private sale only another vehicle counts. An $18,000 2019 sedan bought from a neighbor in Salt Lake County costs ${K.usd(used.atPurchase)} to title, register and tax.</p>
<h2>The age-based fee instead of a property tax</h2>
<p>Every car pays a uniform fee each year with its registration: $150 under three years, $110 from three to five, $80 from six to eight, $50 from nine to eleven and $10 at twelve and older. It replaces a county property tax, so the amount is the same in every county and does not depend on what you paid. The registration fee itself is indexed: the ${h.src('ut:briefing', 'Legislature’s 2026 briefing')} gives $58.25 for a passenger car where the statute still reads $44.</p>
<h2>County fees, emissions and electric cars</h2>
<p>Eleven counties, from Salt Lake and Utah to Washington and Iron, add a $10 corridor preservation fee. Salt Lake, Davis, Utah, Weber and Cache counties add an air pollution control fee of $2 or $3 and require an emissions test, every two years until the car is six and every year after, with cars under two exempt. Electric cars pay a $180 flat fee in 2026 or 1.25 cents a mile through the state's road usage charge, up to the same amount; hybrids pay $25 and plug-in hybrids $64. For a state that taxes the car's value every year, look at ${h.a('state:arizona', 'Arizona')}; ${h.a('state:nevada', 'Nevada')} ties its yearly tax to the original sticker price.</p>`,
  faqs: [
    { q: 'What is the Utah uniform age-based fee on a car?', a: 'It is a yearly fee charged with the registration in place of a local property tax on passenger cars, light trucks and vans. It depends only on the vehicle’s age: $150 when it is less than three years old, then $110, $80, $50, and $10 once it reaches twelve years. It is the same in every county.' },
    { q: 'Can an electric car owner in Utah avoid the $180 fee?', a: 'Not entirely, but the owner can enroll in the state’s Road Usage Charge program instead of paying the flat fee. Enrolled drivers pay 1.25 cents per mile in 2026, deducted from a prepaid account, and the total never exceeds the $180 flat fee for the registration year. Low-mileage drivers pay less.' },
    { q: 'Which sales tax rate applies when I buy a car from a Utah dealer?', a: 'The rate of the locality where the dealer sold the car, including the state 4.85% and the local layers, but not the resort community tax, which never applies to vehicles. For a private sale, the Tax Commission uses the rate where the buyer registers the car. Combined rates on a car run from 6.35% to 7.95% in the places our calculator lists.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'smog-check-cost', 'state:arizona', 'state:nevada', 'car-sales-tax-calculator'],
});
