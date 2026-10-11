import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('arkansas');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const mid = K.calc('arkansas', { condition: 'used', seller: 'private', price: 8000, modelYear: 2017 });
const cheap = K.calc('arkansas', { condition: 'used', seller: 'private', price: 3800, modelYear: 2012 });
const renew = K.renew('arkansas', 1);
const renewEv = K.renew('arkansas', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'arkansas',
  title: 'Arkansas Car Sales Tax 2026: Used Car Rates, Tags and Title',
  description: `Arkansas car sales tax and tag fees for 2026: 6.5% new, 3.5% or none on cheaper used cars, local tax on $2,500 only, $10 title. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Arkansas car sales tax and registration fees',
  intro: 'Arkansas taxes the full price of a new car but treats cheap used cars gently, and its local sales taxes stop counting after the first $2,500.',
  resume: `A new $35,000 gasoline car bought from a Little Rock dealer costs ${K.usd(r.atPurchase)} at the revenue office and the dealer. Most of it is ${K.usd(v('sales-tax'))} of state sales tax at 6.5%. Little Rock’s 1.125% and Pulaski County’s 1% add only ${K.usd(v('local-tax'))}, because each local tax is charged on the first $2,500 of the price and no more. The certificate of title is $10, the yearly registration of a car between 3,001 and 4,500 lb is $25, plus a $2.50 decal and 50 cents of postage, and the dealer’s service and handling fee cannot exceed $129. Used cars pay less: an $8,000 car bought privately owes ${K.usd(mid.atPurchase)} in all, and one sold for $3,800 owes ${K.usd(cheap.atPurchase)}. Renewal is about ${K.usd(renew.perYear)} a year, ${K.usd(renewEv.perYear)} for an electric car, before the county personal property tax, which Arkansas requires you to pay before you renew.`,
  body: (h) => `
<h2>Three tax rates for used cars</h2>
<p>Since 2022, the state part of the tax on a used vehicle depends on its price. Under $4,000 there is no tax at all. From $4,000 to $9,999 the state rate falls to 3.5%, while city and county taxes still apply in full. At $10,000 and above, a used car pays the same 6.5% as a new one. ${h.src('ar:act-1013', 'Act 1013 of 2021')} adds a detail that matters at the dealer: the price that decides the tier is read before the trade-in is subtracted. A $12,000 car with a $4,000 trade-in therefore stays in the full-rate tier, even though the tax itself is computed on the $8,000 difference.</p>
<h2>Why local tax is so small on a car</h2>
<p>The ${h.src('ar:dfa-local-rates', 'DFA list of local tax rates for October to December 2026')} shows combined city and county rates above 5% in some towns, which sounds heavy on a car. In practice each local tax is capped at $25 for every 1% of rate, so it reaches only the first $2,500 of the price. On a $35,000 car, a 2.125% local rate costs ${K.usd(v('local-tax'))}, not the $744 a plain percentage would give. Cities that straddle two counties are listed here with the first county DFA names, so check the address if you live near a county line.</p>
<h2>Tags, electric cars and the county assessment</h2>
<p>Registration follows weight: $17 up to 3,000 lb, $25 up to 4,500 lb and $30 above, while pickups and vans rated one ton or less pay $21. Electric cars add $200 a year, plug-in hybrids $100 and ordinary hybrids $50. Arkansas has no safety or emissions inspection, but it links the tag to the county: you must show that the car was assessed this year and that last year’s personal property tax was paid. That tax depends on the county millage and the assessor’s value, so the calculator lists it without an amount. Next door, ${h.a('state:texas', 'Texas')} charges no yearly property tax on cars but a higher state rate.</p>`,
  faqs: [
    { q: 'Does Arkansas charge sales tax on a used car bought from a private seller?', a: 'Yes. The buyer pays it at the revenue office when registering the car, at the same rates as a dealer sale: nothing under $4,000, 3.5% state tax from $4,000 to $9,999 and 6.5% from $10,000, plus city and county tax on the first $2,500. Registering late adds a 10% sales tax penalty.' },
    { q: 'Can I get a sales tax credit for selling my old car myself in Arkansas?', a: 'Yes. When you sell your old vehicle yourself within 60 days before or after buying another one, DFA can credit the amount you received against the taxable price of the new purchase, as if it were a trade-in. You need a bill of sale signed by both parties showing the vehicle and the price.' },
    { q: 'What is the most an Arkansas dealer can charge as a doc fee?', a: 'Dealers call it a service and handling fee, and the Motor Vehicle Commission caps it at $129. A dealer that charges it must charge the same amount to every retail customer, disclose it in writing and post a sign in the area where sales documents are processed, and may not present it as a government fee.' },
  ],
  related: ['car-sales-tax-calculator', 'dmv-fees-calculator', 'doc-fee-by-state', 'vehicle-property-tax', 'state:texas', 'out-the-door-price-calculator'],
});
