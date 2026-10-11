import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('vermont');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('vermont', { fuel: 'ev', weightLbs: 4200 });
const phev = K.calc('vermont', { fuel: 'phev' });
const trade = K.calc('vermont', { tradeIn: 10000 });
const renew = K.renew('vermont', 1);
const renewEv = K.renew('vermont', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'vermont',
  title: 'Vermont Car Registration Fees 2026: Purchase Tax and Title',
  description: `Vermont car registration fees for 2026: $91 a year for a gas car, $178 for an EV, 6% purchase and use tax, $42 title. New $35,000 car: ${K.usd(r.atPurchase, 2)} at the DMV.`,
  h1: 'Vermont car registration fees and purchase and use tax',
  intro: 'Vermont keeps one flat registration price for every car and one 6% tax, but it checks the price you paid against a book value.',
  resume: `Registering a new $35,000 gasoline car bought from a Vermont dealer costs ${K.usd(r.atPurchase, 2)} at the DMV: ${K.usd(v('sales-tax'), 2)} of purchase and use tax at 6%, the $42 certificate of title and $91 for a one-year registration, which includes the $2 Clean Air Fund fee. A $10,000 trade-in lowers the tax to ${K.usd(v('sales-tax', trade), 2)}. The registration does not depend on weight or value, so the next year costs the same ${K.usd(renew.perYear, 2)}. Fuel type is what changes it: a plug-in hybrid pays $135.50 a year and a battery electric car $178, because of the EV infrastructure fee, so a new electric SUV comes to ${K.usd(ev.atPurchase, 2)} at purchase and ${K.usd(renewEv.perYear, 2)} a year after that. Every car also needs a yearly safety inspection, with an emissions check up to 16 model years, at a price each station posts. A lien on the title adds $14, and any dealer documentation fee is extra.`,
  body: (h) => `
<h2>Price or book value, whichever is higher</h2>
<p>The 6% is not always charged on the bill of sale. The ${h.src('vt:tax', 'DMV purchase and use tax page')} applies it to the purchase price or the J.D. Power clean trade-in value, whichever is greater, then subtracts the value of a trade-in. On a dealer sale the two are usually close. On a private sale at a friendly price, the tax can be due on a higher figure than you paid. If the car is worth less than the book says, because of damage or high mileage, a Vermont dealer can fill out an appraisal form, and DMV does not accept values found on websites. Cars and light trucks have no maximum tax; only heavy trucks and trailers are capped.</p>
<h2>Why electric cars pay more to register</h2>
<p>Road maintenance in Vermont is funded largely by gas and diesel taxes, which battery electric owners never pay and plug-in hybrid owners pay far less of. The ${h.src('vt:ev-fee', 'EV infrastructure fee')} is $89 a year for a battery electric car and $44.50 for a plug-in hybrid, added to the $89 base registration; the money goes to charging stations until a mileage-based fee is designed. Electric cars skip the $2 Clean Air Fund fee, which is why a gas car and an EV differ by $87, not $89. A new plug-in hybrid comes to ${K.usd(phev.atPurchase, 2)} at purchase. Two-year registrations cost $167 for a gas car and $341 for an electric one.</p>
<h2>Inspection within 15 days</h2>
<p>A car new to Vermont must pass inspection within 15 days of being registered, then once a year. The check covers safety items and, for vehicles 16 model years old or newer, the on-board emissions system. Stations set and post their own price, so our calculator lists the inspection without an amount. For a comparison with a neighbor that also inspects every year and charges more to title a car, look at ${h.a('state:new-york', 'New York')}, or use the ${h.a('vehicle-inspection-cost', 'inspection cost table')} for every state.</p>`,
  faqs: [
    { q: 'What if the J.D. Power value is higher than what I paid for a car in Vermont?', a: 'The purchase and use tax is due on the higher of the two figures, so a low private-sale price does not lower the tax below 6% of the J.D. Power clean trade-in value. If the car is in poor condition, a Vermont dealer can complete the Dealer Appraisal form and DMV will use that value; online price research is not accepted.' },
    { q: 'How much is a two-year registration for an electric car in Vermont?', a: 'A two-year registration for a battery electric car costs $341: the $163 base for two years plus $178 of EV infrastructure fees. A plug-in hybrid pays $256 for two years and a gasoline car $167. The one-year prices are $178, $135.50 and $91, and the $2 yearly Clean Air Fund fee applies only to cars that burn fuel.' },
    { q: 'How soon must a newly registered car be inspected in Vermont?', a: 'Within 15 days of the registration date, whether the car is new or used, and then once every year. Vehicles 16 model years old or newer also get an on-board diagnostic emissions check. Each inspection station sets its own fee and must post it, so prices vary from one garage to another.' },
  ],
  related: ['car-registration-fees', 'ev-registration-fee-by-state', 'vehicle-inspection-cost', 'car-sales-tax-calculator', 'state:new-york', 'title-and-registration-fees'],
});
