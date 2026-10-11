import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const n = st.N();
const caps = st.summaries().filter((x) => x.S.docFeeCap !== null).sort((a, b) => (a.S.docFeeCap ?? 0) - (b.S.docFeeCap ?? 0));
const nocap = n - caps.length;

export default definePage({
  id: 'doc-fee-by-state',
  group: 'buying',
  order: 40,
  slug: 'doc-fee-by-state',
  nav: 'Doc fee by state',
  card: 'The legal cap on dealer documentation fees in each state, or the absence of one, with the source.',
  title: 'Doc Fee by State 2026: Dealer Fee Caps and Disclosure Rules',
  description: `Doc fee by state for 2026: ${caps.length} of ${n} jurisdictions cap the dealer documentation fee by law${caps.length ? `, from ${K.usd(caps[0].S.docFeeCap ?? 0)} to ${K.usd(caps[caps.length - 1].S.docFeeCap ?? 0)}` : ''}; elsewhere each dealer sets its own amount.`,
  h1: 'Dealer doc fees by state',
  intro: 'The documentation fee is the dealer’s charge for paperwork, not a government fee, and only some states limit it.',
  resume: `A documentation fee (also called a doc, processing, dealer or predelivery service fee) pays the dealer for preparing the sale and title paperwork. It is a dealer charge, not a government fee, even when it sits next to the tax and registration on the buyer's order. In 2026, ${caps.length} of the ${n} jurisdictions set a legal maximum${caps.length ? `, from ${K.usd(caps[0].S.docFeeCap ?? 0)} in ${caps[0].name} to ${K.usd(caps[caps.length - 1].S.docFeeCap ?? 0)} in ${caps[caps.length - 1].name}` : ''}, and ${nocap} do not, though most require the fee to be disclosed or included in advertised prices. Texas does not cap it but presumes $225 reasonable and asks dealers who charge more to justify their costs to its regulator. Whether the fee is taxed also varies: California and Florida tax it, Texas excludes it. The calculator uses the cap where there is one and lets you type the dealer's figure everywhere.`,
  faqs: [
    { q: 'Is the doc fee a government fee?', a: 'No. It is kept by the dealer. California requires dealers not to present it as a governmental fee, and Florida requires a printed statement on every document that the charge represents costs and profit to the dealer. Government fees are the tax, title, registration, plates and inspection.' },
    { q: 'Can I negotiate the doc fee?', a: 'In states without a cap, the amount is the dealer’s decision, so it is part of the deal like any price; many dealers prefer to adjust the car price rather than the fee because they charge the same fee to every buyer. Where a cap exists, a fee above it is not allowed.' },
    { q: 'Is sales tax charged on the doc fee?', a: 'It depends on the state. California’s tax department lists documentation fees among the taxable charges a dealer must report, and Florida taxes services that are part of the sale. Texas excludes a separately stated documentary fee from the taxable price. The calculator applies the rule of the state you choose.' },
    { q: 'What doc fee does the calculator use by default?', a: 'The legal cap when the state has one, Texas’s $225 reference amount, and zero elsewhere, because an average dealer fee is not an official figure. Type the amount on your buyer’s order to include it in the out-the-door price and in the tax where the state taxes it.' },
  ],
  body: (h) => `
<h2>Capped, presumed or free</h2>
<p>States fall into three groups. A first group sets a fixed maximum in a statute or regulation, sometimes indexed each year or different for dealers who register cars electronically, as in California ($85 for dealers enrolled with the DMV's electronic program, $70 for the others). A second group sets no maximum but a reasonableness test or a reference amount, like Texas. A third group sets no amount at all and regulates only how the fee is shown: in Georgia the Attorney General requires it to be included in any advertised price, and in Florida a disclosure statement must be printed next to it.</p>
<h2>Where it fits in the price</h2>
<p>The documentation fee is part of the out-the-door price and, if you finance it, of the amount financed. The ${h.a('out-the-door-price-calculator', 'out-the-door price calculator')} adds it to the government fees, and the ${h.a('car-sales-tax-calculator', 'sales tax calculator')} taxes it where the state does.</p>
<h2>Other dealer charges</h2>
<p>Add-ons such as paint protection, window etching, nitrogen tires or service contracts are separate products, not fees. They can usually be refused, and their price should appear on its own line. Federal advice on reading a buyer's order is on the Federal Trade Commission's car buying pages, cited at the bottom of this page.</p>
<h2>Check your state</h2>
<p>Each ${h.a('car-registration-fees', 'state page')} gives the documentation fee rule with the statute or official page it comes from, and the table below summarizes all ${n} jurisdictions.</p>`,
  tool: 'docfee',
  state: 'california',
  table: 'docfee',
  related: ['out-the-door-price-calculator', 'car-sales-tax-calculator', 'dmv-fees-calculator', 'state:california', 'state:texas', 'state:florida'],
  sources: ['ftc-car-buying', 'ca:doc-fee', 'tx:doc-fee', 'fl:doc-fee', 'ga:doc-fee'],
});
