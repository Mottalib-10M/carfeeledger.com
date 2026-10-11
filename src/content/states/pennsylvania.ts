import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('pennsylvania');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const pit = K.calc('pennsylvania', { county: 'allegheny-county' });
const oth = K.calc('pennsylvania', { county: 'other' });
const ev = K.calc('pennsylvania', { fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('pennsylvania', 1);

export default defineState({
  slug: 'pennsylvania',
  title: 'Pennsylvania Car Sales Tax and Tag Fees 2026: PennDOT',
  description: `Pennsylvania car sales tax 2026: 6% plus 2% in Philadelphia or 1% in Allegheny, $72 title, $48 registration, EV road charge. New car in Philadelphia: ${K.usd(r.atPurchase)}.`,
  h1: 'Pennsylvania car sales tax and PennDOT fees',
  intro: 'Pennsylvania keeps its registration cheap and flat, so the sales tax, and the county you live in, make most of the bill.',
  resume: `A new $35,000 gasoline car bought from a dealer by a Philadelphia resident costs ${K.usd(r.atPurchase)} in taxes and PennDOT fees: ${K.usd(v('sales-tax'))} of state sales tax at 6% and ${K.usd(v('local-tax'))} of Philadelphia's 2% local tax, the $72 certificate of title, the flat $48 yearly registration that includes the standard plate, and the $5 county fee for local use. In Allegheny County the local tax is 1% and the bill is ${K.usd(pit.atPurchase)}; in a county without local tax or local fee, ${K.usd(oth.atPurchase)}. The trade-in value comes off the taxed price. The yearly safety inspection is done by private stations at their own price, so it is not added. A fully electric car adds the $250 road user charge, and every year after, the renewal costs about ${K.usd(renew.perYear)} for the gasoline car before inspection.`,
  body: (h) => `
<h2>Two local taxes, and only two</h2>
<p>Pennsylvania's sales tax is 6% statewide, and only two places add to it on a car: Philadelphia (2%) and Allegheny County, which includes Pittsburgh (1%). The ${h.src('pa:rev-sut', 'Department of Revenue')} collects the tax through PennDOT when the car is titled, whether you buy from a dealer or a neighbor. On a private sale, the buyer pays it at the title transfer, and a price far below the car's value can trigger a bill on fair market value under the ${h.src('pa:rev-uv', 'understated value program')}.</p>
<h2>A flat registration, then the electric car charge</h2>
<p>Registration costs $48 a year for every passenger car, whatever its weight or value, as the ${h.src('pa:mv70s', 'PennDOT fee schedule')} shows; the title is $72, plus $36 for each lien. Since 2025 electric cars pay a road user charge with registration, $250 for one year or $500 for two in 2026, and plug-in hybrids a quarter of it ($63). For a new EV in Philadelphia the purchase bill is ${K.usd(ev.atPurchase)}. From 2027 the charge follows inflation.</p>
<h2>Counties that add $5</h2>
<p>Twenty-seven counties have adopted the optional $5 yearly fee for local use, which PennDOT collects at registration and returns to the county for roads and bridges. Nearby, ${h.a('state:new-jersey', 'New Jersey')} has no county fee but makes a new car pay four years of registration, and ${h.a('state:new-york', 'New York')} adds county use taxes to a weight-based fee.</p>
<h2>The inspection is a station price</h2>
<p>Most Pennsylvania cars need a safety inspection every year, and the sticker runs one year from the month of the test; cars garaged in the counties of the emissions program also take an emissions check. PennDOT does not set the price of either test: each licensed station posts its own, which is why the calculator lists the inspection without an amount.</p>`,
  faqs: [
    { q: 'What is the car sales tax in Philadelphia and Pittsburgh?', a: 'A car registered in Philadelphia pays 8%: the 6% Pennsylvania sales tax plus the 2% Philadelphia local tax. In Allegheny County, which includes Pittsburgh, the total is 7%. Everywhere else in Pennsylvania the rate on a car is 6%, collected by PennDOT when the car is titled.' },
    { q: 'How much does Pennsylvania charge electric cars to register?', a: 'Electric cars pay the regular $48 passenger registration plus a road user charge, $250 for a one-year registration in 2026 or $500 for two years. Plug-in hybrids pay $63. From January 1, 2027 the charge is adjusted each year with the consumer price index.' },
    { q: 'How much is a car safety inspection in Pennsylvania?', a: 'PennDOT does not set the price: certified private stations charge their own inspection fee, and where an emissions test is required it is priced separately. Most cars need a safety inspection every year, and the sticker stays valid for one year from the month of inspection.' },
  ],
  related: ['car-sales-tax-calculator', 'dmv-fees-calculator', 'ev-registration-fee-by-state', 'state:new-jersey', 'state:new-york', 'vehicle-inspection-cost'],
});
