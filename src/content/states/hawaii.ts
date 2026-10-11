import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('hawaii');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const used = K.calc('hawaii', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const heavy = K.calc('hawaii', { weightLbs: 4800 });
const renew = K.renew('hawaii', 2);
const renewEv = K.renew('hawaii', 2, { fuel: 'ev', weightLbs: 4200 });
const regNew = ['state-reg', 'state-weight', 'county-reg', 'county-weight', 'beautification', 'emblem'].reduce((s, id) => s + v(id), 0);

export default defineState({
  slug: 'hawaii',
  title: 'Hawaii Car Registration Fees 2026: Weight Tax by County',
  description: `Hawaii car registration fees for 2026: state weight tax 1.75 to 2.25 cents a pound, Oahu city tax 7 cents, $46 state fee, EV fee $50. New car on Oahu: ${K.usd(r.atPurchase)}.`,
  h1: 'Hawaii car registration fees and weight tax',
  intro: 'In Hawaii the price of keeping a car on the road is set by the scale: both the state and the county tax every pound, every year.',
  resume: `A new $35,000 car weighing 3,500 lb, bought from a dealer on Oahu, comes to ${K.usd(r.atPurchase)} in tax and government fees. The largest part is ${K.usd(v('get'))} of general excise tax, which the dealer may pass on up to 4.712% of the price. The first year of registration adds ${K.usd(regNew, 2)}: the $46 state fee, ${K.usd(v('state-weight'), 2)} of state weight tax, the $20 city fee, ${K.usd(v('county-weight'))} of city weight tax, the $10 beautification fee and a 50-cent emblem. A $5 plate and the $25.75 safety inspection, whose first certificate covers two years, complete the bill. Each later year costs about ${K.usd(renew.perYear, 2)} with the yearly inspection. A heavier car pays more: at 4,800 lb the two weight taxes reach ${K.usd(v('state-weight', heavy) + v('county-weight', heavy))}. Electric cars owe nothing extra at purchase, then up to $50 a year of road usage charge, about ${K.usd(renewEv.perYear, 2)} a year in all for a 4,200 lb EV.`,
  body: (h) => `
<h2>No sales tax, but the excise tax shows up on the invoice</h2>
<p>Hawaii does not charge buyers a sales tax. The dealer owes the general excise tax on its gross income and the law lets it pass the tax on visibly. The ${h.src('hi:get', 'Department of Taxation')} sets the maximum pass-on rate at 4.712% in all four counties, a figure that already includes the 0.5% county surcharge Maui adopted last, in 2024. A private sale between two residents carries no excise tax at all: the buyer of an $18,000 used car pays the ${K.usd(v('transfer', used))} transfer fee and, at the next expiration date, the ${K.usd(used.firstYear - used.atPurchase, 2)} of registration and inspection that come with the car.</p>
<h2>Two weight taxes, one bill</h2>
<p>The state weight tax in ${h.src('hi:hrs-249-33', 'HRS § 249-33')} is 1.75 cents a pound up to 4,000 lb, 2 cents up to 7,000 lb and 2.25 cents up to 10,000 lb. Each county adds its own registration fee and weight tax, collected on the same notice by the county finance director. On Oahu the city charges 7 cents a pound, four times the state's first rate, which is why the City and County of Honolulu shows a 3,320 lb car costing $367 a year, $232.40 of it city weight tax. For Hawaii, Maui and Kauai counties, the calculator lists the county share without an amount until we can read it on their official pages.</p>
<h2>Safety checks and the electric road charge</h2>
<p>Every car needs a safety inspection each year at a permitted station; the fee rose to $25.75 on July 1, 2025. The odometer is read and recorded at that visit, which feeds the road usage charge on electric cars: $8 per 1,000 miles, capped at $50, or a flat $50, and the per-mile option becomes mandatory on July 1, 2028. Compare with ${h.a('state:california', 'California')}, where the yearly fee follows the car's value.</p>`,
  faqs: [
    { q: 'Why is car registration so expensive on Oahu?', a: 'Because the City and County of Honolulu taxes cars by weight at 7 cents a pound, on top of the state weight tax of 1.75 to 2.25 cents. A 3,320 lb car pays $232.40 of city weight tax a year, out of a $367 registration. About 70% of what Oahu drivers pay at registration goes to the city.' },
    { q: 'Do I pay Hawaii registration again when I buy a used car?', a: 'Not right away. Registration stays with the vehicle, so the buyer pays the $10 transfer fee on Oahu within 30 days of the sale, or $60 with the late penalty, and the yearly fees at the next expiration. If the current registration has expired or expires within 45 days, the renewal is collected with the transfer.' },
    { q: 'How does the Hawaii road usage charge work for a new electric car?', a: 'A newly bought electric car owes no road usage charge at purchase. At the first renewal it pays the flat $50, because a new car skips the safety check in its first year and no mileage can be measured. For EVs bought on or after July 1, 2025, that $50 is credited toward the charge at the second renewal, as the law provides.' },
  ],
  related: ['car-registration-fees', 'dmv-fees-calculator', 'ev-registration-fee-by-state', 'vehicle-inspection-cost', 'state:california', 'state:washington'],
});
