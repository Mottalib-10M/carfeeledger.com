import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('maine');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('maine', 1);
const sixth = K.calc('maine', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021 });
const msrp = K.calc('maine', { msrp: 40000 });
const trade = K.calc('maine', { tradeIn: 10000 });

export default defineState({
  slug: 'maine',
  title: 'Maine Car Excise Tax and BMV Fees 2026: Mill Rates, Title',
  description: `Maine car excise tax and BMV fees for 2026: 5.5% sales tax, excise of 24 mills on the MSRP, $33 title, $35 registration. New $35,000 car at a dealer: ${K.usd(r.atPurchase)}.`,
  h1: 'Maine car excise tax and registration fees',
  intro: 'In Maine the town office sends the biggest yearly car bill, an excise set by statute on the model’s list price, and the state adds a flat $35 registration.',
  resume: `A new $35,000 gasoline car bought from a Maine dealer costs ${K.usd(r.atPurchase)} in taxes and public fees when you register it: ${K.usd(v('sales-tax'))} of sales tax at 5.5%, the $33 certificate of title, the $35 one-year registration and ${K.usd(v('excise'))} of municipal excise tax, which is 24 mills per dollar of the list price in the model’s first year. The excise is paid to your city or town before the Bureau of Motor Vehicles issues the plate, and it keeps coming back: the second year it drops to 17.5 mills, so the renewal of the same car is about ${K.usd(renew.perYear)} including the yearly inspection. The calculator uses the price when you leave the MSRP blank; with a $40,000 sticker price the first excise rises to ${K.usd(v('excise', msrp))}, because the town ignores dealer discounts. A $10,000 trade-in brings the sales tax down to ${K.usd(v('sales-tax', trade))}. Maine adds no surcharge for electric or hybrid cars.`,
  body: (h) => `
<h2>How the town excise is figured</h2>
<p>The excise is the reason Maine car owners visit the town office every year. Under ${h.src('me:excise', '36 M.R.S. §1482')}, the tax is a number of mills, thousandths of a dollar, applied to the maker’s list price of the model: 24 mills in the first year of the model, 17.5 in the second, 13.5 in the third, 10 in the fourth, 6.5 in the fifth and 4 mills from the sixth year onward, never less than $5. Two consequences follow. The price you negotiated does not matter, which is why the collector asks for the MSRP sticker of a new car. And an old car becomes cheap to keep: a 2021 model bought privately for $18,000 is already at the 4-mill rate, which the calculator puts at ${K.usd(v('excise', sixth))} when it uses that price.</p>
<h2>Sales tax on a car, dealer or private</h2>
<p>Maine applies its ordinary 5.5% sales and use tax to vehicles. A car traded toward another car is subtracted first, so only the difference is taxed. The dealer’s documentation fee is not: Maine Revenue Services counts processing and documentation fees as part of the taxable sale price, and no Maine law caps them, so read that line before signing. A sale between two private parties is taxed too; the buyer pays the 5.5% when registering, on the price declared.</p>
<h2>Inspection, Cumberland County and the yearly budget</h2>
<p>Every registered car needs a safety inspection once a year. Stations may charge at most $12.50, or $18.50 for the enhanced inspection with an onboard diagnostics check that Cumberland County requires for 1996 and newer models. A car bought from a dealer must already carry a sticker issued within 60 days of the sale, so you usually pay the first inspection a year later. For a state with a comparable town-and-state split but different rates, see the ${h.a('state:new-hampshire', 'New Hampshire page')}, or compare yearly costs across states with the ${h.a('car-ownership-cost', 'car ownership cost calculator')}.</p>`,
  faqs: [
    { q: 'Why is the Maine excise tax on my new car higher than I expected?', a: `Because it is not based on what you paid. The excise uses the manufacturer’s list price of the model, 24 mills per dollar in the first year, so a car listed at $40,000 owes ${K.usd(v('excise', msrp))} even if the dealer sold it for less. The rate falls each model year until it reaches 4 mills in the sixth year.` },
    { q: 'Do I pay the Maine excise tax to the state or to my town?', a: 'To your town or city. The municipal excise collector takes the payment before the registration is issued, and the money stays with the municipality. The state Bureau of Motor Vehicles then collects the $35 registration fee, often at the same town office counter, and the $33 title fee for a newly bought car.' },
    { q: 'How much can a Maine inspection station charge in 2026?', a: 'The law sets a ceiling, not a price. A standard yearly safety inspection costs at most $12.50. In Cumberland County the enhanced inspection, which adds the gas cap and onboard diagnostics checks, may cost up to $18.50 for a 1996 or newer car. The fee is owed whether the car passes or fails.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'vehicle-inspection-cost', 'state:new-hampshire', 'state:vermont', 'doc-fee-by-state'],
});
