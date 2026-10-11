import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('connecticut');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const lux = K.calc('connecticut', { price: 52000 });
const luxTrade = K.calc('connecticut', { price: 52000, tradeIn: 10000 });
const ev = K.calc('connecticut', { fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('connecticut', 1);
const renewOld = K.renew('connecticut', 1, { modelYear: 2018 });
const govFees = r.atPurchase - v('sales-tax');

export default defineState({
  slug: 'connecticut',
  title: 'Connecticut Car Sales Tax 2026: 6.35%, 7.75% Over $50,000',
  description: `Connecticut car sales tax and DMV fees in 2026: 6.35%, or 7.75% above $50,000, $25 title, $120 for three years of registration. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Connecticut car sales tax and DMV fees',
  intro: 'Connecticut adds a luxury rate to its car sales tax, bundles three years of registration into one payment, and leaves the yearly car tax to each town.',
  resume: `Buying a new $35,000 gasoline car from a Connecticut dealer costs ${K.usd(r.atPurchase, 2)} in state tax and DMV fees: ${K.usd(v('sales-tax'), 2)} of sales and use tax at 6.35%, a $25 title, a $5 plate, the $10 administrative fee, the $15 greenhouse gas fee charged on new vehicles, a one-time $40 emissions exemption fee, then ${K.usd(v('reg'))} of registration for three years with the $15 Clean Air Act fee and the $24 Passport to the Parks fee. The government part outside the tax is ${K.usd(govFees)}. Renewing every three years averages ${K.usd(renew.perYear, 2)} a year while the car is new, and ${K.usd(renewOld.perYear, 2)} once the $20 emissions test is due every second year. The dealer's conveyance fee comes on top and has no legal cap. The one bill the calculator cannot price is the property tax your town sends every year on the car's value.`,
  body: (h) => `
<h2>The $50,000 line and how the trade-in fits</h2>
<p>Connecticut taxes most car purchases at 6.35%, but ${h.src('ct:cgs-12-408', 'Section 12-408 of the General Statutes')} applies 7.75% to the entire price of a vehicle sold for more than $50,000. It is a cliff, not a bracket: a $52,000 car pays ${K.usd(v('sales-tax', lux))}, not 6.35% on the first $50,000. The Department of Revenue Services looks at the price before the trade-in to decide which rate applies, then taxes the price minus the trade-in, so the same $52,000 car with a $10,000 trade-in still pays 7.75%, or ${K.usd(v('sales-tax', luxTrade))}. A trade-in is credited only when the seller is a licensed dealer. From a private seller, DMV collects the tax on the NADA average trade-in value or the bill of sale, whichever is higher.</p>
<h2>Three years of registration, several small fees</h2>
<p>A passenger registration costs $120 and runs three years. Around it come three statutory add-ons: the federal Clean Air Act fee ($15 for three years, not charged on electric cars), the Passport to the Parks fee, raised to $24 on July 1, 2025 and paid into the state's Passport to the Parks account, and a greenhouse gas reduction fee, $15 once for a new car and $7.50 per term for any other vehicle. New and nearly new cars also pay $40 once instead of an emissions test during their first four model years. An electric car skips the Clean Air Act fee, the exemption fee and the test, which is why a new EV costs ${K.usd(ev.atPurchase, 2)} instead of ${K.usd(r.atPurchase, 2)} at the same price. See the ${h.a('ev-registration-fee-by-state', 'EV fee table')} for states that charge electric cars more, not less.</p>
<h2>The town car tax arrives later</h2>
<p>Each October 1, assessors list the cars garaged in their town and bill the owners: 70% of the car's value times the local motor vehicle mill rate, which state law caps at 32.46 mills, about 2.27% of the full value. Each town or district sets its own rate at or below that cap, and the law allows zero. The bill comes from the town tax collector, so budget it next to the DMV fees. Across the border, ${h.a('state:new-york', 'New York')} has no yearly tax on a car's value.</p>`,
  faqs: [
    { q: 'Does a trade-in keep a Connecticut car purchase under the 7.75% rate?', a: 'No. The Department of Revenue Services decides the rate on the sales price before the trade-in. A car priced above $50,000 is taxed at 7.75% even if the trade-in brings the amount you finance below $50,000; the trade-in then lowers the taxed amount, not the rate. Vehicles over 12,500 lb gross weight and some commercial vehicles are excluded from the higher rate.' },
    { q: 'Why does Connecticut charge $40 for an emissions test I do not take?', a: 'State law charges a one-time $40 emissions exemption fee when a new car, or one four model years old or newer that was never registered in Connecticut, is first registered. In exchange the car skips the emissions test until its fourth model year. Fully electric cars are outside the emissions program and do not pay the fee.' },
    { q: 'How is the Connecticut car property tax calculated?', a: 'Your town assesses the car at 70% of its value on October 1 and multiplies that assessment by its motor vehicle mill rate, which cannot exceed 32.46 mills. A car valued at $30,000 is assessed at $21,000, so the tax is at most about $682 a year. The bill comes from the town tax collector, not from DMV.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'car-sales-tax-calculator', 'state:new-york', 'state:rhode-island', 'smog-check-cost'],
});
