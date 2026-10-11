import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('district-of-columbia');
const v = (id: string, x: { lines: { id: string; amount: number | null; range?: [number, number] }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const rg = (id: string, x: { lines: { id: string; range?: [number, number] }[] } = r) => x.lines.find((l) => l.id === id)?.range ?? [0, 0];
const ev = K.calc('district-of-columbia', { fuel: 'ev', weightLbs: 4200 });
const light = K.calc('district-of-columbia', { weightLbs: 3200 });
const renew = K.renew('district-of-columbia', 1);
const renewEv3 = K.renew('district-of-columbia', 2, { fuel: 'ev', weightLbs: 4200 });
const [lo, hi] = rg('excise');

export default defineState({
  slug: 'district-of-columbia',
  title: 'DC Car Excise Tax and DMV Fees 2026: MPG and Weight Rates',
  description: `DC car excise tax and DMV fees for 2026: 1% to 11% of value by weight and city MPG, $30 title, registration from $70. New 4,200 lb EV at $35,000: ${K.usd(ev.atPurchase)}.`,
  h1: 'District of Columbia excise tax and DMV fees',
  intro: 'Washington, DC taxes a car once at titling with an excise that now rewards fuel economy, then charges registration by weight every year.',
  resume: `For a new $35,000 gasoline car of 3,500 lb titled in DC, the DMV charges ${K.usd(r.atPurchase)} in fixed fees: the $30 title, ${K.usd(v('reg'))} of yearly registration in the 3,500 to 4,999 lb class and the $10 new-car inspection sticker valid four years. The excise tax is the big line, and it depends on the car's city MPG: ${K.usd(lo)} at the 2.5% rate of a car rated 40 MPG or more, up to ${K.usd(hi)} at the 10% rate of a car rated 20 MPG or less, on the NADA fair market value. A trade-in does not reduce it. An electric car of 4,200 lb at the same price pays a 2% excise, ${K.usd(v('excise', ev))}, and a $40 registration for its first two years, for ${K.usd(ev.atPurchase)} in all. A lighter gasoline car of 3,200 lb drops to ${K.usd(v('reg', light))} a year of registration. Renewal of the reference car runs ${K.usd(renew.perYear)} a year, and the electric car moves to ${K.usd(renewEv3.perYear)} from its third year.`,
  body: (h) => `
<h2>How the excise table works since February 2025</h2>
<p>The Motor Excise Tax Amendment Act of 2024 replaced the old 6%, 7% and 8% weight rates with a grid. The ${h.src('dc:excise', 'DC DMV excise tax page')} multiplies the fair market value by a percentage read from two columns: unladen weight (up to 3,499 lb, 3,500 to 4,999 lb, 5,000 lb or more) and EPA city MPG rounded down (20 or less, 21 to 25, 26 to 30, 31 to 39, 40 or more). Electric cars, exempt until 2025, now have their own column at 1%, 2% or 3%, and DMV specifies that MPGe does not count as MPG. A heavy SUV rated 18 MPG pays 11%; a light hybrid rated 50 MPG pays 1.5%. Residents who received the DC earned income tax credit may keep the old weight rates if they cost less.</p>
<h2>Registration by weight, with a break for electric cars</h2>
<p>The ${h.src('dc:reg-fees', 'registration schedule')} that took effect on March 30, 2026 charges a passenger car $70 a year up to 3,499 lb, $175 from 3,500 to 4,999 lb, $300 from 5,000 to 5,999 lb and $550 from 6,000 lb. A brand-new battery electric car under 5,000 lb pays $40 for its first two years; afterwards it subtracts 1,000 lb from its shipping weight before the class is chosen, so a 4,200 lb electric car is billed as a 3,200 lb car. Hybrids get neither advantage. The same page lists a $30-a-year registration card fee among additional fees, which the calculator shows as a possible extra.</p>
<h2>Inspection fees are prepaid with the registration</h2>
<p>A brand-new passenger car receives a four-year sticker for $10 without visiting the station, and gasoline cars then pass an emissions inspection every two years for $35, both collected with the registration. Fully electric cars get a sticker that never expires. Across the line in ${h.a('state:maryland', 'Maryland')} and ${h.a('state:virginia', 'Virginia')}, the purchase tax is a flat percentage of the price, whatever the car burns.</p>`,
  faqs: [
    { q: 'Does an electric car pay excise tax in DC in 2026?', a: 'Yes. Electric vehicles lost their exemption when the new excise schedule took effect on February 17, 2025. They pay 1% of fair market value up to 3,499 lb, 2% from 3,500 to 4,999 lb and 3% from 5,000 lb, the lowest rates of each weight class, because their efficiency is not measured in MPG.' },
    { q: 'Which MPG figure does DC DMV use for the excise tax?', a: 'The EPA city rating of the vehicle, rounded down to the nearest whole number, combined with its unladen weight. A car rated 25.9 city MPG therefore falls in the 21 to 25 MPG column. The DMV system applies the rate to the fair market value from the NADA guide for the Eastern region.' },
    { q: 'How long does a new electric car keep the $40 DC registration?', a: 'For the first two years of registration, if it is a brand-new battery electric passenger car under 5,000 lb. From the third year it is billed by weight, after subtracting 1,000 lb from its shipping weight: $70 a year if the result is 3,499 lb or less, $175 above that. Gas-electric hybrids do not qualify.' },
  ],
  related: ['dmv-fees-calculator', 'car-sales-tax-calculator', 'ev-registration-fee-by-state', 'state:maryland', 'state:virginia', 'vehicle-inspection-cost'],
});
