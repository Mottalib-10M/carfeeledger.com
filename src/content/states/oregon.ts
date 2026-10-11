import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('oregon');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('oregon', { fuel: 'ev', weightLbs: 4200 });
const used = K.calc('oregon', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });
const other = K.calc('oregon', { county: 'other' });
const renew = K.renew('oregon', 1);
const renewEv = K.renew('oregon', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'oregon',
  title: 'Oregon Car Registration Fees 2026: MPG Bands, No Sales Tax',
  description: `Oregon car registration fees 2026: no sales tax, 0.5% privilege tax on new cars, title from $101 to $192 by MPG, county fees. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Oregon car registration fees and title costs',
  intro: 'Oregon skips the sales tax and prices its title and plates by how much fuel your car burns.',
  resume: `A new $35,000 gasoline car bought from a Multnomah County dealer costs ${K.usd(r.atPurchase)} in state charges and the dealer fee: ${K.usd(v('sales-tax'))} of vehicle privilege tax at 0.5% (the dealer owes it and usually bills it), the ${K.usd(v('title'))} title for a car rated 20 to 39 MPG, ${K.usd(v('plate'))} for new plates, ${K.usd(v('reg'))} of registration covering four years, because a brand-new car is registered for four years at double the two-year fee, ${K.usd(v('county-fee'))} of Multnomah County fees for the same four years and a ${K.usd(r.docFee)} document fee, the legal maximum for a dealer using an integrator. Outside the three Portland-area counties that charge a county fee, the same purchase comes to ${K.usd(other.atPurchase)}. After that, keeping the car registered in Multnomah County costs about ${K.usd(renew.perYear)} a year. An electric SUV pays a higher title and a $376 two-year registration, so ${K.usd(ev.atPurchase)} at purchase and about ${K.usd(renewEv.perYear)} a year to renew.`,
  body: (h) => `
<h2>Why your car's MPG rating sets the price</h2>
<p>DMV reads the combined MPG rating tied to the VIN and places the car in one of four bands. The ${h.src('or:fees', 'DMV fee chart')} charges $101 for a title and $126 for two years of plates under 20 MPG, $106 and $136 between 20 and 39 MPG, $116 and $216 at 40 MPG or more, and $192 and $376 for an all-electric car. An electric car enrolled in OReGO, the per-mile road usage charge, pays $86 instead. Our calculator does not ask the rating, so it uses the 20 to 39 MPG band for a gasoline car and shows a range for hybrids, which can fall on either side of 40 MPG.</p>
<h2>The privilege tax replaces a sales tax, but only on new cars</h2>
<p>Oregon has no general sales tax. Since 2018 a dealer selling a new car, or any car with 7,500 miles or less never registered in the state, owes a privilege tax of half a percent of the retail price, according to the ${h.src('or:privilege', 'Department of Revenue')}. Most dealers pass it on as a separate line. A trade-in does not lower it and the document fee is not added to it. A used car bought from a neighbor owes nothing beyond the title transfer: with an $18,000 2019 sedan the bill at the DMV counter is ${K.usd(used.atPurchase)}, since current Oregon plates and registration stay on the car until they expire.</p>
<h2>County fees and DEQ tests around Portland and Medford</h2>
<p>Multnomah County adds $112 to each two-year registration, Washington and Clackamas $60, and no other county charges one. Gasoline and hybrid cars kept inside the Portland or Medford testing boundary pass a DEQ emissions test every two years once they are more than four model years old: $25 in the Portland area, $20 around Medford, paid only after a pass. For a state where tax is charged on every sale, compare with ${h.a('state:washington', 'Washington')} or ${h.a('state:california', 'California')}.</p>`,
  faqs: [
    { q: 'Who pays the Oregon vehicle privilege tax, the dealer or the buyer?', a: 'The law places the 0.5% tax on the Oregon dealer for the privilege of selling new vehicles at retail, but allows the dealer to collect it from the buyer, and most do so as a separate line on the purchase documents. The buyer is not treated as the taxpayer. A new car bought from an out-of-state dealer owes the same 0.5% as a use tax.' },
    { q: 'Why does a new car in Oregon pay registration for four years?', a: 'A new passenger car registered with its manufacturer’s certificate of origin receives a four-year registration instead of the usual two years. DMV charges double the two-year registration fee and double any county fee at that first registration, so the car does not come back for renewal until its fourth year.' },
    { q: 'How much is the DEQ emissions test in Portland?', a: 'The Portland-area testing fee at a DEQ Clean Air Station or a DEQ Too location is $25, and it is due only after the car passes and receives its certificate of compliance. In the Medford area the fee is $20. Cars of the last four model years and all-electric cars are exempt from testing.' },
  ],
  related: ['dmv-fees-calculator', 'title-and-registration-fees', 'ev-registration-fee-by-state', 'state:washington', 'state:california', 'doc-fee-by-state'],
});
