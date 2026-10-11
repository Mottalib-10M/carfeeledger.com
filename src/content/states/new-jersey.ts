import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('new-jersey');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('new-jersey', { fuel: 'ev', weightLbs: 4200 });
const used = K.calc('new-jersey', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const renew = K.renew('new-jersey', 1);
const renewEv = K.renew('new-jersey', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'new-jersey',
  title: 'New Jersey Car Registration Fees 2026: MVC, Tax, ZEV Fee',
  description: `New Jersey car registration fees for 2026: 6.625% sales tax, $60 title, four years of registration up front on a new car, ZEV fee. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'New Jersey car registration fees',
  intro: 'New Jersey charges one statewide tax rate and a short MVC fee list, but a new car pays four years of registration on day one.',
  resume: `A new $35,000 gasoline car bought from a New Jersey dealer costs ${K.usd(r.atPurchase)} in taxes and Motor Vehicle Commission fees at purchase: ${K.usd(v('sales-tax'))} of sales tax at 6.625%, the same rate in every town, the $60 certificate of title, and ${K.usd(v('reg'))} of registration. That last figure surprises buyers: the MVC requires a new car to be registered for four years at once, so the bill covers the base fee for a car of 3,500 lb or less, the two small yearly charges its own calculator adds, and the surcharge for cars within two model years. From the fifth year the car renews every year, about ${K.usd(renew.perYear)} a year on average. A used car bought privately for $18,000 pays ${K.usd(used.atPurchase)}, and a new electric car ${K.usd(ev.atPurchase)}, because it adds four years of the zero emission vehicle fee and pays the full sales tax since July 2025.`,
  body: (h) => `
<h2>Four years of registration in one bill</h2>
<p>Most states let a buyer pick a one or two-year registration. New Jersey does not: a brand-new car leaves the dealer with a four-year registration, and the ${h.src('nj:calc-js', 'MVC fee calculator')} multiplies the yearly components by four. The fee itself is simple: a base of $32 under 3,500 lb or $57 over, the $7.50 and $7 charges, and $12.50 more a year while the car is within two model years. A heavier SUV of 4,200 lb therefore pays ${K.usd(v('reg', ev))} for its first registration instead of ${K.usd(v('reg'))}.</p>
<h2>Electric cars now pay twice</h2>
<p>New Jersey used to be one of the cheapest places to buy an electric car: no sales tax and no extra fee. Both changed. The ${h.src('nj:zev-tax', 'Division of Taxation')} ended the sales tax exemption, and since July 1, 2025 a new EV pays the full 6.625%. The zero emission vehicle fee started at $250 in 2024 and rises by $10 every July, $270 for registrations from July 2026, and a new EV pays it for each of the four registration years: ${K.usd(v('ev', ev))} on top of the price for the reference SUV. After that, an EV renews for about ${K.usd(renewEv.perYear)} a year against ${K.usd(renew.perYear)} for the gasoline car.</p>
<h2>Inspections: free, but not for everyone</h2>
<p>State inspection facilities test gasoline and hybrid cars every two years at no charge, and private inspection facilities may charge for the same test. A new car is exempt for its first five years and an all-electric car is never inspected, so the reference car owes nothing until 2031. Compare with ${h.a('state:new-york', 'New York')}, where every car is inspected each year for a fee, or ${h.a('state:pennsylvania', 'Pennsylvania')}, where stations set their own safety inspection price.</p>`,
  faqs: [
    { q: 'Why is the New Jersey registration fee so high on a new car?', a: `Because the MVC registers a new car for four years at once. The amount is four times the yearly base fee and charges, plus the surcharge for cars within two model years: ${K.usd(v('reg'))} for a car of 3,500 lb or less. The car then renews yearly from its fifth year.` },
    { q: 'Do electric cars pay sales tax in New Jersey in 2026?', a: 'Yes. The zero emission vehicle exemption ended and, since July 1, 2025, electric cars pay the full 6.625% sales tax like any other car. They also pay a yearly zero emission vehicle fee of $270 for registrations from July 2026, four years of it up front when the car is new.' },
    { q: 'How much does a New Jersey title cost with a car loan?', a: 'A New Jersey certificate of title costs $60, or $85 when a lien is recorded because the car is financed. The dealer usually handles the title and the first registration and passes the fees to you on the buyer’s order, separately from the documentation fee it charges for its own paperwork.' },
    { q: 'When does a new car need its first inspection in New Jersey?', a: 'A new car is exempt from inspection for five years, then it is inspected every two years. Tests at state facilities are free; private inspection facilities licensed by the MVC charge their own price. All-electric cars never need an inspection, plug-in hybrids and hybrids do.' },
  ],
  related: ['dmv-fees-calculator', 'ev-registration-fee-by-state', 'vehicle-inspection-cost', 'state:new-york', 'state:pennsylvania', 'car-sales-tax-calculator'],
});
