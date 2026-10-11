import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('maryland');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('maryland', 1);
const heavy = K.calc('maryland', { weightLbs: 4200 });
const trade = K.calc('maryland', { tradeIn: 10000 });

export default defineState({
  slug: 'maryland',
  title: 'Maryland MVA Fees 2026: 6.5% Excise Titling Tax, $200 Title',
  description: `Maryland MVA fees for 2026: 6.5% excise titling tax, $200 title, two-year registration from $161, $800 cap on dealer processing. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Maryland excise titling tax and MVA fees',
  intro: 'Maryland raised almost every car fee in 2024 and 2025: the titling tax went to 6.5%, the title to $200, and registration by weight went up again in July 2025.',
  resume: `A new $35,000 gasoline car of 3,500 lb bought from a Maryland dealer costs ${K.usd(r.atPurchase)} in taxes and fees when it is titled: ${K.usd(v('sales-tax'))} of excise titling tax at 6.5%, computed on the price plus the $800 dealer processing charge, the $200 certificate of title, ${K.usd(v('reg'))} for a two-year passenger registration, ${K.usd(v('ems'))} of emergency medical system surcharge for the same two years and the processing charge itself, which the law caps at $800. The weight line matters: the same car at 4,200 lb would pay ${K.usd(v('reg', heavy))} of registration instead. Renewing costs about ${K.usd(renew.perYear, 2)} a year. In Montgomery County and the rest of the emissions area, a VEIP emissions test is due every two years; its fee was $30 through June 30, 2026 and is now adjusted for inflation, so the calculator lists it without a figure. A $10,000 trade-in brings the excise down to ${K.usd(v('sales-tax', trade))}.`,
  body: (h) => `
<h2>A titling tax, not a sales tax</h2>
<p>Maryland does not charge its sales tax on cars. The MVA collects an excise when it issues the title: under ${h.src('md:excise', 'Transportation Article §13-809')}, 6.5% of the fair market value, with a $100 minimum. For a dealer sale, the base is the agreed price including the dealer processing charge, minus the trade-in. Private sales follow other rules: a car 7 or more model years old is taxed on at least $640, and a younger car sold $500 or more below its book value is taxed on the book value unless the MVA accepts a notarized bill of sale on its own form explaining the price.</p>
<h2>Registration by shipping weight, plus the trauma surcharge</h2>
<p>Since July 1, 2025, a passenger car pays $80.50 a year up to 3,500 lb, $85.50 up to 3,700 lb and $151.50 above, and every vehicle adds a $40 yearly surcharge that funds emergency medical services and the Shock Trauma Center. Registrations are usually issued for two years, so both amounts are doubled at the counter; a one-year term with a payment schedule is also available. Electric cars and plug-in hybrids owe an extra yearly surcharge set at $125 and $100 by the 2024 budget law and indexed to inflation by the MVA since July 2025. Compare with ${h.a('state:virginia', 'Virginia')}, where registration stays near $31 but localities tax the car every year.</p>
<h2>Inspections: safety at resale, emissions every two years</h2>
<p>A used car cannot be titled without a Maryland safety inspection certificate issued by a licensed station within the previous 90 days, and the station sets the price. Emissions testing is separate: cars registered in Baltimore City and 13 counties, from Anne Arundel to Washington County, go through the Vehicle Emissions Inspection Program every two years. The ${h.a('doc-fee-by-state', 'doc fee comparison')} shows how the $800 processing cap ranks among states.</p>`,
  faqs: [
    { q: 'Is the dealer processing charge taxed in Maryland?', a: 'Yes. The law defines the total purchase price used for the 6.5% excise as the agreed price including any dealer processing charge, less the trade-in allowance. The charge itself may not exceed $800 for sales since July 1, 2024, and the contract must label it as not required by law.' },
    { q: 'What happens if I buy a used car in Maryland far below book value?', a: 'If the car is less than 7 years old and the price is $500 or more below the book value used by the MVA, the 6.5% excise is computed on the book value unless you file a notarized bill of sale on the MVA form explaining the low price. For an older car the excise is computed on at least $640.' },
    { q: 'Do Maryland electric car owners pay both years of the EV surcharge at once?', a: 'With a two-year registration, yes: the MVA collects the yearly zero-emission surcharge for both years when the registration is issued. Owners who choose a one-year term can use the MVA payment schedule, paying in two installments, six months apart. The surcharge was $125 a year for electric cars in the 2024 law and is now inflation-adjusted.' },
  ],
  related: ['dmv-fees-calculator', 'title-and-registration-fees', 'ev-registration-fee-by-state', 'state:virginia', 'state:pennsylvania', 'smog-check-cost'],
});
