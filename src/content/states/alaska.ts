import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('alaska');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const kodiak = K.calc('alaska', { county: 'kodiak' });
const fairbanks = K.calc('alaska', { county: 'fairbanks' });
const renew = K.renew('alaska', 1);
const usedPriv = K.calc('alaska', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });

export default defineState({
  slug: 'alaska',
  title: 'Alaska DMV Fees 2026: Registration, Title and Local MVRT',
  description: `Alaska DMV fees for 2026: no state sales tax, $15 title, $100 for two years of registration plus a local MVRT up to $300. New car in Anchorage pays ${K.usd(r.atPurchase)}.`,
  h1: 'Alaska DMV fees and vehicle registration tax',
  intro: 'Alaska charges no state sales tax on a car, so what you pay depends mostly on where you live and how old the vehicle is.',
  resume: `Registering a new car in Anchorage costs ${K.usd(r.atPurchase)} in state and municipal charges: the $15 certificate of title, ${K.usd(v('reg'))} of state registration covering two years, and ${K.usd(v('mvrt'))} of motor vehicle registration tax for the Municipality of Anchorage, also for two years. There is no state sales tax and Anchorage levies none, so a $35,000 car and a $15,000 car pay the same government fees. Location changes the picture: in the Kodiak Island Borough the same new car costs ${K.usd(kodiak.atPurchase)}, while in Fairbanks, where no registration tax applies, it costs ${K.usd(fairbanks.atPurchase)} before any local sales tax. A used car bought from another Alaskan keeps its current registration, so the buyer pays only ${K.usd(usedPriv.atPurchase)} for the title at the transfer. Spread over the two-year cycle, renewing costs about ${K.usd(renew.perYear)} a year in Anchorage, falling as the car ages.`,
  body: (h) => `
<h2>A tax set by each municipality</h2>
<p>The motor vehicle registration tax is a local tax that the DMV collects for the cities and boroughs that choose it under ${h.src('ak:as-28-10-431', 'AS 28.10.431')}, and it replaces any local property or use tax on the vehicle. Each municipality sets its own schedule by age. The ${h.src('ak:dmv-chart', 'DMV chart for 2026')} shows $150 for a new car in Anchorage and the Mat-Su Borough, down to $70 from the eighth year; $140 down to $30 in the Kenai Peninsula Borough; a flat $70 in Juneau; and the highest amounts in Kodiak, from $300 for a new vehicle. A car counts as one year old during its model year and ages every January 1.</p>
<h2>Buying used: the registration comes with the car</h2>
<p>When a vehicle already registered in Alaska is sold, its registration moves to the new owner, and the registration tax is not charged again until the next renewal. The buyer only pays the $15 title, plus $15 more to record a lien when the purchase is financed. The catch is that an expired registration also transfers: if the seller let it lapse, the fees are calculated from the expiration date, so check the sticker before agreeing on a price.</p>
<h2>Local sales taxes and the rest of the bill</h2>
<p>Alaska has no statewide sales tax, but many cities and boroughs outside Anchorage levy one, with their own rates, exemptions and sometimes a limit per sale, collected by the dealer. Electric cars pay no extra state fee and no emissions or safety inspection is required. Renewing in person rather than online or by mail adds $10 to the registration. For a state where yearly car taxes are much heavier, see ${h.a('state:washington', 'Washington')}, or estimate any state with the ${h.a('dmv-fees-calculator', 'DMV fees calculator')}.</p>`,
  faqs: [
    { q: 'Do I pay sales tax on a car in Anchorage?', a: 'No. Alaska has no state sales tax and the Municipality of Anchorage does not levy one either. An Anchorage buyer pays the $15 title, the $100 two-year registration and the municipal motor vehicle registration tax, which is $150 for a new passenger car and decreases with the age of the vehicle.' },
    { q: 'Why is Alaska registration charged for two years at once?', a: 'State law sets the registration fee of a non-commercial passenger vehicle, pickup or van as a biennial fee of $100, and the municipal registration tax is also a two-year amount. A shorter first period can be issued, in which case the state fee is prorated, but the registration tax is not.' },
    { q: 'Does an electric car pay an extra registration fee in Alaska?', a: 'Not in 2026. The registration fee schedule in state law has no separate amount for electric or hybrid vehicles, so an electric car pays the same $100 every two years as a gasoline car, plus the local registration tax where one applies, based on the vehicle’s age.' },
  ],
  related: ['dmv-fees-calculator', 'car-registration-fees', 'title-and-registration-fees', 'ev-registration-fee-by-state', 'state:washington', 'license-plate-renewal'],
});
