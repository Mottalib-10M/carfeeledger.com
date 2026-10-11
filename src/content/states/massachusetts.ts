import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('massachusetts');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('massachusetts', 1);
const trade = K.calc('massachusetts', { tradeIn: 10000 });
const early = K.calc('massachusetts', { modelYear: 2027 });
const old = K.calc('massachusetts', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });

export default defineState({
  slug: 'massachusetts',
  title: 'Massachusetts Car Sales Tax and RMV Fees 2026: Excise, Title',
  description: `Massachusetts car sales tax and RMV fees in 2026: 6.25% tax, $75 title, $60 for two years of registration, $35 inspection. New $35,000 car: ${K.usd(r.atPurchase, 2)} upfront.`,
  h1: 'Massachusetts car sales tax and RMV fees',
  intro: 'Massachusetts keeps its RMV fees modest and flat; the bill that grows with the car’s value is the excise your city or town mails each year.',
  resume: `Registering a new $35,000 gasoline car bought from a Massachusetts dealer costs ${K.usd(r.atPurchase, 2)} at the RMV and the inspection station: ${K.usd(v('sales-tax'), 2)} of sales tax at 6.25%, the $75 certificate of title, $60 for a passenger registration that lasts two years and the $35 inspection due within 7 days. A few weeks later your city or town bills the motor vehicle excise, ${K.usd(v('excise'), 2)} for a full calendar year on that car, since the tax is $25 per $1,000 of a valuation fixed at 90% of the list price in the model year. Counting that bill, the first year comes to ${K.usd(r.firstYear, 2)}. The next year the valuation drops to 60%, and the yearly cost, with half of the two-year registration and the inspection, is about ${K.usd(renew.perYear)}. Trading in a $10,000 car at the dealer lowers the sales tax to ${K.usd(v('sales-tax', trade), 2)}. Electric and hybrid cars pay no extra registration fee.`,
  body: (h) => `
<h2>The excise: a fixed schedule on the list price</h2>
<p>Massachusetts does not assess cars as personal property. Instead, ${h.src('ma:c60a', 'chapter 60A of the General Laws')} levies an excise of $25 per $1,000 on a valuation that is a set share of the manufacturer’s list price: 50% in the year before the model year, 90% in the model year, then 60%, 40%, 25% and 10% from the fifth year on. The rate is the same in Boston and in the smallest town; only the collector changes. A car registered after January pays only for the months left in the calendar year, and the excise is never below $5. Buying a 2027 model in 2026 puts the car on the 50% line, which the calculator values at ${K.usd(v('excise', early), 2)}. An older car costs little: a 2019 model valued on an $18,000 price comes to ${K.usd(v('excise', old), 2)}.</p>
<h2>Sales tax rules that change with the seller</h2>
<p>The 6.25% applies to every car registered in the state, but its base depends on who sells. From a Massachusetts dealer, the trade-in allowance is deducted, and the Department of Revenue counts the document and title preparation fees as part of the taxable price. Between private parties, there is no trade-in credit and the tax is due on the price or the average trade-in value of the car, whichever is greater, so an artificially low bill of sale does not help. Close relatives (parent, spouse, child, brother or sister) can transfer a car without the tax.</p>
<h2>Inspection and renewal</h2>
<p>Every car takes a yearly safety and emissions inspection at a licensed station for $35, and a newly bought car must pass within 7 days of registration. The registration itself is renewed every two years for $60. Electric cars pay no surcharge. For a state that charges its excise on a similar list-price formula but in mills, see the ${h.a('state:maine', 'Maine page')}, and for the property tax approach used elsewhere, read the ${h.a('vehicle-property-tax', 'vehicle property tax guide')}.</p>`,
  faqs: [
    { q: 'When does the Massachusetts excise bill arrive after buying a car?', a: 'The excise is billed by your city or town, not collected by the RMV, so it arrives separately after the registration. For a car first registered after January the bill covers only the months left in the calendar year, then a full year each January. The amount follows the state schedule, so it does not depend on the town.' },
    { q: 'Is a private car sale in Massachusetts taxed on the price we agree?', a: 'Only if that price is at least the car’s average trade-in value. On a sale between private parties the RMV collects the 6.25% use tax on the price paid or the average trade-in value from the pricing guide, whichever is greater, and no trade-in credit is allowed. Transfers between close family members are exempt.' },
    { q: 'How often is a Massachusetts registration renewed and what does it cost?', a: `A standard passenger plate is renewed every two years for $60. The yearly inspection, $35, is separate and paid at the station. The city or town excise is also separate, billed each calendar year: ${K.usd(v('excise', renew), 2)} in the second year for the $35,000 car used as our example.` },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'car-sales-tax-calculator', 'state:maine', 'state:new-york', 'vehicle-inspection-cost'],
});
