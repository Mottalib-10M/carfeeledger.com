import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('illinois');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const chi = K.calc('illinois', { county: 'city-of-chicago' });
const down = K.calc('illinois', { county: 'other' });
const priv = K.calc('illinois', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021, fuel: 'ev', weightLbs: 4200 });
const cheap = K.calc('illinois', { condition: 'used', seller: 'private', price: 9000, modelYear: 2016, county: 'other' });
const renew = K.renew('illinois', 1);
const renewEv = K.renew('illinois', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'illinois',
  title: 'Illinois Car Sales Tax 2026: Dealer Rates, RUT-50, Plates',
  description: `Illinois car sales tax for 2026: 6.25% at the dealer plus transit tax in the Chicago area, flat RUT-50 tax on private sales, $165 title. Cook County: ${K.usd(r.atPurchase)}.`,
  h1: 'Illinois car sales tax, title and plate fees',
  intro: 'Illinois taxes a car two different ways: a percentage when a dealer sells it, and a flat amount from a table when a private seller does.',
  resume: `A new $35,000 gasoline car bought from a dealer by a Cook County resident outside Chicago costs ${K.usd(r.atPurchase)} in taxes and Secretary of State fees: ${K.usd(v('sales-tax'))} of state sales tax at 6.25%, ${K.usd(v('local-tax'))} of transit district tax at 1.25% (the Cook County rate for titled vehicles since August 1, 2026), the $165 original title and the $151 yearly passenger plate. A Chicago resident adds the 1.25% Chicago home rule use tax and pays ${K.usd(chi.atPurchase)}, while a buyer downstate, with no transit tax, pays ${K.usd(down.atPurchase)}. The trade-in comes off the taxed price and the dealer's documentary fee is taxed with the car. That fee is capped by law and indexed every year, but the 2026 maximum was not published on a page we could read, so add your dealer's figure. The renewal then costs ${K.usd(renew.perYear)} a year, or ${K.usd(renewEv.perYear)} for an electric car, and the state charges no yearly tax on the car's value.`,
  body: (h) => `
<h2>Dealer sales: the rate depends on where you live</h2>
<p>The state part is 6.25% everywhere. On top of it, Illinois charges a transit district tax on titled vehicles: 1.25% in Cook County and 1% in DuPage, Kane, Lake, McHenry and Will counties since August 1, 2026, and 0.25% inside the Metro-East Transit District of Madison and St. Clair counties, according to the ${h.src('il:rut25', 'RUT-25 instructions')}. Ordinary municipal and county sales taxes do not apply to a car. The ${h.src('il:st556', 'ST-556 instructions')} add one more line for Chicago residents: a dealer anywhere in the six-county area collects the 1.25% Chicago home rule use tax. The dealer rounds the tax to the nearest dollar, deducts the full trade-in value (the old $10,000 limit ended in 2022) and includes the documentary fee in the price.</p>
<h2>Private sales: a flat tax by price or by age</h2>
<p>Buy from a neighbor instead of a dealer and the percentage disappears. Form RUT-50 charges a fixed amount: when the price is $15,000 or more it depends on the price band, $850 up to $19,999.99 and $1,600 from $30,000 to $49,999.99; below $15,000 it depends only on the car's age, from $465 for a car one year old or newer down to $100 at eleven years. An $18,000 used electric car bought privately in Cook County therefore costs ${K.usd(priv.atPurchase)} at the Secretary of State, including the $175 Cook County private party tax and the $100 electric vehicle fee, and a $9,000 car from 2016 bought outside Cook County costs ${K.usd(cheap.atPurchase)}. Gifts and sales between spouses, parents, siblings and children pay $15. Check the ${h.src('il:rut50', 'RUT-50 tables')} before agreeing on a price near a band limit.</p>
<h2>Plates, electric cars and the emissions test</h2>
<p>The standard plate costs $151 a year, and electric cars pay $100 more in place of the gasoline tax. Gasoline cars from model year 1996 need an emissions test every two years once they are four years old, but only in the Chicago and Metro-East test areas, and the Illinois EPA charges nothing for it. Chicago's city sticker and other local wheel taxes are billed separately. Across the border, ${h.a('state:indiana', 'Indiana')} adds a yearly excise tax by price class, and ${h.a('state:wisconsin', 'Wisconsin')} is another neighbor worth comparing.</p>`,
  faqs: [
    { q: 'How is tax figured on a car bought from a private seller in Illinois?', a: 'Not as a percentage. Form RUT-50 charges a flat amount: from $850 to $10,100 by price band when the price or fair market value is $15,000 or more, and from $465 down to $100 by vehicle age below that. Cook County and the City of Chicago add their own private party taxes, also set by age.' },
    { q: 'Does a Chicago resident pay more tax on a car from a suburban dealer?', a: 'Yes. A dealer located in Cook, DuPage, Kane, Lake, McHenry or Will County must collect the 1.25% Chicago home rule use tax when the buyer’s address is inside Chicago, on top of the 6.25% state tax and the 1.25% Cook County transit rate, so the combined rate is 8.75% of the taxable price.' },
    { q: 'Is the emissions test free in Illinois?', a: 'Yes. The Illinois EPA program charges nothing for the test, whether at a high-capacity station or at the newer kiosks and mobile units. It applies to most 1996 and newer gasoline cars from four years of age, every two years, and only to vehicles registered in the Chicago and Metro-East test areas.' },
  ],
  related: ['car-sales-tax-calculator', 'doc-fee-by-state', 'title-and-registration-fees', 'state:indiana', 'state:wisconsin', 'out-the-door-price-calculator'],
});
