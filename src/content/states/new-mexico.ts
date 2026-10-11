import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('new-mexico');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const trade = K.calc('new-mexico', { tradeIn: 10000 });
const old = K.calc('new-mexico', { condition: 'used', seller: 'private', price: 9000, modelYear: 2017, county: 'other' });
const renew = K.renew('new-mexico', 1);
const renewEv = K.renew('new-mexico', 1, { fuel: 'ev', weightLbs: 4200 });
const addOns = v('tire') + v('reg-addl') + v('beautification') + v('admin');

export default defineState({
  slug: 'new-mexico',
  title: 'New Mexico MVD Fees 2026: 4% Excise Tax and New Plate Costs',
  description: `New Mexico MVD fees for 2026: 4% motor vehicle excise tax, $3 title, registration up 25% since July 1 (up to $70 a year). New $35,000 car: ${K.usd(r.atPurchase)} to title it.`,
  h1: 'New Mexico car excise tax and MVD fees',
  intro: 'New Mexico replaces the sales tax with a flat 4% excise on the price, and its registration fees just went up for the first time in 22 years.',
  resume: `Buying a new $35,000 gasoline car of 3,500 lb in New Mexico costs ${K.usd(r.atPurchase)} in state taxes and fees when you title it: ${K.usd(v('sales-tax'))} of motor vehicle excise tax at 4%, the $3 title transaction fee, ${K.usd(v('reg'))} of registration for a car over 3,000 lb in its first five years, and ${K.usd(addOns)} of small add-ons (the $1.50 tire recycling fee, the $2 additional fee, the 50-cent beautification fee and the $2 MVD administrative fee). There is no county or city tax on top. A trade-in lowers the excise: with a $10,000 trade-in it falls to ${K.usd(v('sales-tax', trade))}. The yearly renewal of the same car is ${K.usd(renew.perYear)}. Electric cars pay nothing extra in 2026, but from January 1, 2027 they owe a new $70 fee, so a 4,200 lb EV renews for about ${K.usd(renewEv.perYear)} a year. In Albuquerque and the rest of Bernalillo County, older gasoline cars also need an Air Care emissions test, priced by each station.`,
  body: (h) => `
<h2>The excise tax replaces the sales tax</h2>
<p>Instead of a sales tax with local add-ons, the ${h.src('nm:mvet', 'Taxation and Revenue Department')} collects a single 4% motor vehicle excise tax when the title is issued, whether the seller is a dealer, a neighbor or an out-of-state lot. The base is the price paid minus any trade-in allowance. A private seller cannot dodge it with a low bill of sale: if the declared price is under 80% of the N.A.D.A. average trade-in or wholesale value, the department taxes the book value instead. Wait more than 90 days to title the car and a 50% penalty is added, which turns the 4% into 6%. A genuine gift is exempt with a notarized affidavit.</p>
<h2>Registration after the July 2026 increase</h2>
<p>Lawmakers raised passenger registration fees by 25% on July 1, 2026, the first change since 2004. Under ${h.src('nm:reg-fee', 'section 66-6-2')}, the fee now depends on two things: the factory shipping weight and whether the car has had five years of registration. A car of 2,000 lb or less pays $33.75, one of 2,001 to 3,000 lb pays $48.75 and anything heavier pays $70. After five years those amounts drop to $26.25, $38.75 and $56.25. A typical used sedan bought privately for $9,000 therefore costs ${K.usd(old.atPurchase)} to title and register outside Bernalillo County. You may register for two years at twice the yearly fee, and renewing online or by phone takes 5% off the registration fee.</p>
<h2>Electric cars, from 2027</h2>
<p>New Mexico had no surcharge on electric cars until the 2026 transportation law. The new fee starts on January 1, 2027 at $70 a year for a battery electric car and $35 for a plug-in hybrid, then climbs to $80 and $40 in 2028 and $90 and $45 from 2029. Ordinary hybrids are not affected. Neighboring ${h.a('state:arizona', 'Arizona')} takes a different route, taxing the car's value every year instead.</p>`,
  faqs: [
    { q: 'Is the New Mexico car excise tax the same in every county?', a: 'Yes. Every vehicle that must be registered in New Mexico pays the same 4% motor vehicle excise tax when its title is issued, and no county or city rate is added, so a buyer pays the same in Albuquerque, Santa Fe or Las Cruces. A quarter of the money goes to the Local Governments Road Fund.' },
    { q: 'How much did New Mexico registration fees go up in 2026?', a: 'Passenger registration fees rose by 25% on July 1, 2026. A car over 3,000 lb now pays $70 a year in its first five years of registration instead of $56, and $56.25 afterwards instead of $45. Lighter cars went from $27 to $33.75 and from $39 to $48.75.' },
    { q: 'Do I need an emissions test to register a car in Albuquerque?', a: 'Yes, if the car is registered in Albuquerque-Bernalillo County and is not fully electric. New cars bought from a dealer are exempt for four years with the original owner, but a test is also required when the car changes owners. Stations set their own price, usually about $30 plus tax according to the city.' },
  ],
  related: ['dmv-fees-calculator', 'car-sales-tax-calculator', 'ev-registration-fee-by-state', 'state:arizona', 'state:texas', 'vehicle-inspection-cost'],
});
