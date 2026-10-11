import type { FAQ, Helpers } from '../lib/page-types';
import { KIT as K } from '../lib/kit';

const st = K.st;
const n = st.N();
const bills = st.rank((s) => st.atPurchase(s), { pricedTax: true });
const lo = bills[0];
const hi = bills[bills.length - 1];
const med = st.median(bills.map((b) => b.value));
const regs = st.rank((s) => st.regBill(s), { priced: st.REG_KINDS });
const noTax = st.which((S) => S.stateRate === 0);
const evStates = st.count((S) => S.evFee !== null);
const valueTax = st.count((S) => S.annualValueTax);
const caps = st.count((S) => S.docFeeCap !== null);
const topRate = st.summaries().map((x) => ({ name: x.name, r: x.S.stateRate + x.S.localRange[1] })).sort((a, b) => b.r - a.r)[0];

export const HOME = {
  title: 'Car Registration Fees by State 2026: Tax, Title, DMV Fees',
  description: `Car registration fees by state for 2026: sales tax by county, title, plates, value taxes, EV fees and inspection, computed from each DMV schedule in ${n} jurisdictions.`,
  h1: 'What your car costs at the DMV, state by state',
  intro: 'Pick the state and county, describe the car, and the calculator applies that state’s own formula: weight, value, age, county rates and the fees only it charges.',
  promiseTitle: 'Why this calculator and not the DMV’s',
  promise: `A state DMV calculator covers one state and, most of the time, the registration alone. This one computes in a single pass the whole bill of buying and keeping a car (county sales tax, title, registration, value-based tax, EV surcharge, inspection and the capped dealer fee) in ${n} jurisdictions, and every line names the official 2026 schedule it comes from.`,
  resume: `The same new $35,000 gasoline car, 3,500 lb, bought from a dealer, costs between ${K.usd(lo.value)} in ${lo.name} and ${K.usd(hi.value)} in ${hi.name} in taxes and government fees at purchase, with a median of ${K.usd(med)} across the ${n} jurisdictions. Most of the gap is the purchase tax${noTax.length ? `: ${K.listOf(noTax)} ${noTax.length > 1 ? 'charge' : 'charges'} no state sales tax on cars, while the` : ', and the'} highest combined state and local rate reaches ${K.rate(topRate.r)} in ${topRate.name}. Registration itself ranges from ${K.usd(regs[0].value)} in ${regs[0].name} to ${K.usd(regs[regs.length - 1].value)} in ${regs[regs.length - 1].name} for that car, because states price it by weight, by value, by age or at a flat rate. ${valueTax} jurisdictions also tax the car’s value every year, ${evStates} add a yearly fee for electric cars, and ${caps} cap what a dealer may charge for paperwork. Where a state does not publish enough to compute a line exactly, such as county property tax or a station’s inspection price, the result shows the official range and says so instead of guessing.`,
  tableTitle: `One car, ${n} bills`,
  tableIntro: (h: Helpers) => `<p>The table runs the reference car through each state’s engine. Click a state to see every line with its source, or change the car in the calculator above. The ${h.a('method', 'method page')} explains what is and is not included.</p>`,
  sections: (h: Helpers) => [
    { title: 'Three things that move the bill', html: `<p><strong>Where you register, not where you buy.</strong> Sales tax and county fees follow the address on the registration, so a dealer across the state line usually collects your home state’s tax, or none, and you pay it at the DMV. <strong>How the state prices registration.</strong> A heavy SUV costs more in weight states like ${h.a('state:new-york', 'New York')}, an expensive car more in value states like ${h.a('state:california', 'California')}, and nothing changes in flat-fee states like ${h.a('state:pennsylvania', 'Pennsylvania')}. <strong>The yearly tax on value.</strong> In some states it is collected with registration, in others billed by the county; either way it can exceed every other fee after the first year. The ${h.a('vehicle-property-tax', 'vehicle property tax page')} lists them.</p>` },
    { title: 'Purchase, then every year after', html: `<p>Sales tax, title and new plates are paid once. Registration, value taxes, the EV fee and periodic inspections come back each cycle, and some states register a new car for two or four years at once. The ${h.a('car-ownership-cost', 'ownership cost page')} adds the renewals of the following years and the ${h.a('car-payment-calculator', 'car payment calculator')} finances the out-the-door price.</p>` },
  ],
  faqs: [
    { q: 'Which state has the cheapest car registration in 2026?', a: `For the reference car, ${regs[0].name} has the lowest registration bill (${K.usd(regs[0].value)} including plate, local and value-based fees) and ${lo.name} the lowest total at purchase once the purchase tax is added. Rankings change with the car: weight, price and age move each state differently.` },
    { q: 'Which states charge no sales tax when you buy a car?', a: `${noTax.length ? `${K.listOf(noTax)} ${noTax.length > 1 ? 'have' : 'has'} no state sales tax on a car purchase` : 'No state is free of every purchase tax'}. That does not make the purchase free: several of these states charge a titling or privilege fee, local governments may add their own tax, and the yearly registration can be high. The state pages give each line with its source.` },
    { q: 'Why do some lines show a range instead of an amount?', a: 'Because the state does not publish one figure for everyone. County property tax depends on a local rate and a local valuation, many inspection stations set their own price, and some fees depend on fuel economy. Rather than guess, the calculator shows the official minimum and maximum and leaves the line out of the total.' },
    { q: 'What car is used to rank the states?', a: 'A new gasoline passenger car with a $35,000 selling price and a 3,500 lb curb weight, bought from a dealer without a trade-in and registered in the most populous county. The same car runs through every state engine, so the differences come from the rules, not from the car.' },
    { q: 'Are dealer doc fees government fees?', a: `No. The documentation fee is kept by the dealer. ${caps} jurisdictions cap it by law and the calculator applies that cap by default; elsewhere it uses no amount unless you type the dealer’s figure from the buyer’s order. It belongs on the quote as a separate line.` },
    { q: 'How current are the fees in this calculator?', a: 'Every state file was read on the official DMV, revenue department or statute pages for the 2026 schedules, and each line in the result links to its source with the date it was read. Fees indexed every July, such as several EV fees, use the amount in force from July 2026.' },
  ] as FAQ[],
  sources: ['ftc-car-buying', 'irs-sales-tax', 'cfpb-auto-loan'],
};
