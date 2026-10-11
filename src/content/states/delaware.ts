import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('delaware');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const trade = K.calc('delaware', { tradeIn: 10000 });
const ev = K.calc('delaware', { fuel: 'ev', weightLbs: 4200 });
const hybrid = K.calc('delaware', { fuel: 'hybrid' });
const used = K.calc('delaware', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const renew = K.renew('delaware', 1);
const renewEv = K.renew('delaware', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'delaware',
  title: 'Delaware DMV Fees 2026: 5.25% Document Fee, $35 Title, $40',
  description: `Delaware DMV fees for 2026: no sales tax but a 5.25% document fee since Oct. 2025, $35 title, $40 a year to register, EV $110. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Delaware document fee and DMV fees',
  intro: 'Delaware has no sales tax, yet every car title carries a document fee that rose from 4.25% to 5.25% on October 1, 2025.',
  resume: `A new $35,000 gasoline car titled in Delaware costs ${K.usd(r.atPurchase)} in state charges: a ${K.usd(v('sales-tax'))} motor vehicle document fee, the $35 certificate of title and $40 for one year of registration. There is no county or city tax to add and no inspection during the first seven model years. The document fee follows the steps written in the law, $13.75 for the first $500 and $5.25 per extra $100 or part of $100, which lands a little under a straight 5.25%. A $10,000 trade-in cuts it to ${K.usd(v('sales-tax', trade))}. Electric and hybrid cars now pay a yearly alternative fuel fee on top of the $40: ${K.usd(v('ev', ev))} for a battery car and ${K.usd(v('ev', hybrid))} for a hybrid. Keeping a gasoline car registered costs ${K.usd(renew.perYear)} a year, and an electric one ${K.usd(renewEv.perYear)}. Delaware sets no maximum on the dealer's documentation charge.`,
  body: (h) => `
<h2>A fee on the title instead of a sales tax</h2>
<p>Delaware funds its roads with a document fee collected by the DMV when a car is titled, deposited in the Transportation Trust Fund. The General Assembly raised it in 2025, and the ${h.src('de:news-2025', 'state announcement')} gives October 1, 2025 as the start of the 5.25% rate. The fee is charged on the purchase price or the NADA book value, whichever is greater, with an $8 minimum. That second test matters on private sales: a car bought from a neighbor for well under book value is charged on the book figure. ${h.src('de:code-30', 'Title 30 of the Delaware Code')} defines the purchase price net of any trade-in, and it also credits an owner who sells the old car privately within 60 days before or after titling the new one, as if it had been traded in. For a used $18,000 car bought privately, the calculator shows ${K.usd(v('sales-tax', used))} of document fee and ${K.usd(used.atPurchase)} due at the title transfer.</p>
<h2>Registration: one flat price, then a fuel surcharge</h2>
<p>Passenger cars pay $40 per year whatever they weigh. Since October 1, 2025, a new section of the vehicle code adds a fee by fuel and gross weight: $60 for a hybrid, $85 for a plug-in hybrid and $110 for an electric or other alternative fuel car, when the gross load weight is 6,000 lb or less, and more for heavier vehicles. The alternative fuel fee applies to cars you already own, not only to new purchases. Compare the amounts with the ${h.a('ev-registration-fee-by-state', 'EV surcharge in other states')}.</p>
<h2>Free inspections at the DMV lanes</h2>
<p>Delaware inspects cars itself, in lanes run by the DMV, and charges nothing for it. Vehicles in their six newest model years renew by mail without inspection, a six-year-old car gets a one-year renewal without it, and older cars pass safety and emissions checks every other year, which brings a two-year registration. Neighboring ${h.a('state:maryland', 'Maryland')} charges far more at titling.</p>`,
  faqs: [
    { q: 'When did the Delaware document fee go up to 5.25%?', a: 'The new rate applies to title work received from October 1, 2025. Title work received before that date and vehicles sold before it, with a bill of sale to prove it, kept the old 4.25% rate, but every title processed from November 1, 2025 uses the new rate, whatever the purchase date.' },
    { q: 'Do I pay the Delaware document fee if I move in with my car?', a: 'Not if you bought the car within 90 days before registering it in Delaware and paid a sales tax, transfer tax or similar levy to another state, as the law exempts that case. Otherwise the fee applies to the fair market value when you first title the car in Delaware. Delaware residents buying from an out-of-state dealer get no credit for taxes paid there.' },
    { q: 'Does a hybrid pay the Delaware alternative fuel fee every year?', a: 'Yes. The fee is collected with each registration, in addition to the $40 base fee: $60 a year for a hybrid that cannot be plugged in, $85 for a plug-in hybrid and $110 for a battery electric car, when the gross load weight is 6,000 lb or less. Vehicles between 6,001 and 10,000 lb pay $80, $115 or $150.' },
  ],
  related: ['dmv-fees-calculator', 'ev-registration-fee-by-state', 'title-and-registration-fees', 'state:maryland', 'state:pennsylvania', 'doc-fee-by-state'],
});
