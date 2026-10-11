import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const titles = st.rank((s) => K.data(s).summary.titleFee);
const tlo = titles[0], thi = titles[titles.length - 1];
const tag = st.rank((s) => K.calc(s).lines.filter((l) => ['title', 'registration', 'plate', 'local', 'value'].includes(l.kind) && l.amount !== null).reduce((a, l) => a + (l.amount as number), 0));
const lo = tag[0], hi = tag[tag.length - 1];
const fl = K.calc('florida');
const flInit = fl.lines.find((l) => l.id === 'initial-reg');

export default definePage({
  id: 'title-and-registration-fees',
  group: 'fees',
  order: 20,
  slug: 'title-and-registration-fees',
  nav: 'Tag and title fees',
  card: 'Title, plates and first registration: the government fees beside the sales tax, by state.',
  title: 'Tag and Title Fees 2026: Title and Registration by State',
  description: `Tag and title fees for 2026 in all ${n} jurisdictions: title from ${K.usd(tlo.value, 2)} to ${K.usd(thi.value, 2)}, plates and first registration, computed for your car and county.`,
  h1: 'Tag and title fees by state',
  intro: '"Tag and title" is the dealer’s shorthand for the government fees other than the sales tax: the title, the plates and the first registration.',
  resume: `A certificate of title costs from ${K.usd(tlo.value, 2)} in ${tlo.name} to ${K.usd(thi.value, 2)} in ${thi.name}, but the title is rarely the large part of a "tag and title" line. Plates, the first registration period, county fees and, in some states, a yearly tax on the car's value collected with registration usually weigh more. For a new $35,000 car, title plus first registration comes to ${K.usd(lo.value)} in ${lo.name} and ${K.usd(hi.value)} in ${hi.name}. One-time charges can surprise newcomers: Florida adds a ${K.usd(flInit?.amount ?? 0)} initial registration fee when there is no Florida plate to move onto the car. The calculator separates each of these lines and leaves the sales tax on its own line, so that a buyer's order can be checked item by item.`,
  faqs: [
    { q: 'What exactly is included in "tag and title" on a dealer quote?', a: 'Usually the title fee, the plate or registration fee for the first period, county fees and any lien recording fee, sometimes the inspection or emissions fee collected at registration. The sales tax is often shown on a separate line. Ask for the breakdown: each item should match a state or county amount, and anything else is a dealer charge.' },
    { q: 'Do I pay a title fee when I buy a used car from a private seller?', a: 'Yes. A title transfer is required at every change of owner, with the title fee of the state where you register the car, plus the purchase tax and, depending on the state, a transfer of the existing registration or a new one. The calculator handles the private-seller case when you choose it.' },
    { q: 'Can I keep my old plates for the new car?', a: 'Most states let you transfer plates you already own to a replacement vehicle, sometimes for a small fee, which avoids new-plate charges such as Florida’s initial registration fee. The calculator assumes new plates for a purchase; the state page explains when a transfer saves money.' },
    { q: 'Why does the title fee differ inside Texas?', a: 'Texas charges $33 in counties that run the emissions program and $28 elsewhere, as county tax offices explain on their fee pages. The calculator picks the amount from the county you choose.' },
  ],
  body: (h) => `
<h2>The title: one fee, paid once per owner</h2>
<p>The certificate of title proves ownership and records any lender's lien. It is issued once per owner and transferred at each sale, so its fee is a one-time cost. Some states add a separate lien recording fee when the car is financed; the calculator mentions it in the state notes rather than adding it, because it applies only to financed cars.</p>
<h2>The tag: plates and the first registration</h2>
<p>The registration fee follows the state's formula: flat, by weight, by value, by age or by horsepower. New plates may carry their own charge, and a few states add a one-time fee for a first registration in the state. The first period can be longer than a year for new cars in some states, which makes the first "tag" line larger than later renewals. The ${h.a('car-registration-fees', 'registration fee page')} compares the formulas and the ${h.a('license-plate-renewal', 'renewal page')} shows what follows.</p>
<h2>County lines on the bill</h2>
<p>Counties collect their own fees with registration in many states: road and bridge funds, transportation projects, local wheel taxes. They are small compared with the sales tax but differ from one county to the next, which is why the calculator asks for the county.</p>
<h2>Checking the line on a buyer's order</h2>
<p>Enter the car in the calculator, keep "Dealer" selected, and compare the title, registration, plate and county lines with the order. The sales tax belongs on the ${h.a('car-sales-tax-calculator', 'tax line')}, and the dealer's own charge on the ${h.a('doc-fee-by-state', 'documentation fee line')}.</p>`,
  tool: 'title',
  table: 'title',
  related: ['car-registration-fees', 'dmv-fees-calculator', 'license-plate-renewal', 'doc-fee-by-state', 'state:florida', 'state:texas'],
  sources: ['ftc-car-buying', 'tx:title-fee', 'fl:pinellas', 'ga:fees', 'ca:dmv-fees'],
});
