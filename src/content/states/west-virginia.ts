import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('west-virginia');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const trade = K.calc('west-virginia', { tradeIn: 10000 });
const ev = K.calc('west-virginia', { fuel: 'ev', weightLbs: 4200 });
const hybrid = K.calc('west-virginia', { fuel: 'hybrid' });
const used = K.calc('west-virginia', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const renew = K.renew('west-virginia', 1);
const renewEv = K.renew('west-virginia', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'west-virginia',
  title: 'West Virginia Car Sales Tax 2026: 6% Titling Tax, DMV Fees',
  description: `West Virginia car sales tax and DMV fees for 2026: 6% titling tax, $15 title, $51.50 plate, $200 EV fee. A new $35,000 gas car pays ${K.usd(r.atPurchase, 2)} at the DMV.`,
  h1: 'West Virginia car sales tax and DMV fees',
  intro: 'West Virginia keeps the DMV bill simple and flat; the part that varies is the personal property tax your county assessor sends every year.',
  resume: `A new $35,000 gasoline car titled in West Virginia costs ${K.usd(r.atPurchase, 2)} in state taxes and DMV fees at purchase: ${K.usd(v('sales-tax'))} of motor vehicle sales tax at 6%, the $15 certificate of title and ${K.usd(v('reg'), 2)} for a year of Class A registration with a standard plate. No county or city adds to the 6%, and the title office does not tax the dealer's documentary fee. Trading in a car titled in West Virginia in your name lowers the tax: with a $10,000 trade-in it falls to ${K.usd(v('sales-tax', trade))}. Two costs stay outside the total. The safety inspection, now due every two years, costs whatever the station asks up to a legal maximum of $19. And the county assessor bills a personal property tax on the vehicle each year, which you must have paid before the plate can be renewed. After the first year the state part of the bill is ${K.usd(renew.perYear, 2)} a year for a gasoline car and ${K.usd(renewEv.perYear, 2)} for an electric one.`,
  body: (h) => `
<h2>How the 6% titling tax is figured</h2>
<p>The tax is charged when the title is issued, on the net purchase price: the price minus the value of a trade-in, as long as that trade-in is already titled in West Virginia in the buyer's name. Manufacturer rebates do not reduce the base, so a $2,000 factory rebate is still taxed. When the net price is $500 or less, the DMV charges a flat $30 instead. The ${h.src('wv:titles', 'DMV titles page')} spells out these rules, and the rate itself has been 6% since July 1, 2017, when ${h.src('wv:code-sales-tax', 'W. Va. Code 11-15-3c')} raised it from 5%.</p>
<h2>Private sales and the book value</h2>
<p>Buying from a neighbor does not avoid the tax. If the price is under half of the NADA Clean Loan value, the DMV wants a notarized bill of sale signed by both parties, or it taxes the book value. A car two model years old or newer bought from a private seller is always taxed on that book value, whatever price the two of you agreed. For an $18,000 car from 2019 the calculator shows ${K.usd(v('sales-tax', used))} of tax and ${K.usd(used.atPurchase, 2)} due at the DMV, assuming the price is accepted.</p>
<h2>Plates, alternative fuel fees and inspection</h2>
<p>The $51.50 standard plate already includes a $1 litter fee and 50 cents for insurance enforcement. A hybrid adds $100 a year, so the same new car as a hybrid costs ${K.usd(hybrid.atPurchase, 2)} at purchase, and an electric car adds $200, bringing a new 4,200 lb EV to ${K.usd(ev.atPurchase, 2)}. A two-year registration is offered at twice the yearly price. Inspections are done by stations licensed by the State Police; a car bought in the state without a valid sticker must be inspected within 10 days. To compare with a neighbor that taxes a trade-in in full, see ${h.a('state:virginia', 'Virginia')}, or estimate the yearly county bill with the ${h.a('vehicle-property-tax', 'vehicle property tax guide')}.</p>`,
  faqs: [
    { q: 'Do I pay the 6% West Virginia tax if I bring my car from another state?', a: 'No. A new resident whose vehicle is already titled in their own name in another state pays no 6% titling tax. The DMV charges the $15 title, $10 if a lien is recorded, and the $51.50 yearly registration, and the car must be titled and registered within 30 days of moving.' },
    { q: 'Why does West Virginia ask for a personal property tax receipt to renew plates?', a: 'Vehicles are taxed as personal property by the county assessor and the tax is collected by the sheriff. The DMV will not renew a registration without the receipt or an assessor affidavit: one tax year for a one-year renewal, two tax years for a two-year renewal.' },
    { q: 'How much does a West Virginia state inspection cost?', a: 'State law lets an inspection station charge up to $19 for the inspection, any headlight adjustment and the sticker, not counting parts. Charging is optional, so some stations ask less. Under the current law, a passenger car is inspected once every two years.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'vehicle-inspection-cost', 'ev-registration-fee-by-state', 'state:virginia', 'state:pennsylvania'],
});
