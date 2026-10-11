import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

type L = { lines: { id: string; amount: number | null }[] };
const r = K.calc('georgia');
const v = (id: string, x: L = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const trade = K.calc('georgia', { tradeIn: 10000 });
const ev = K.calc('georgia', { fuel: 'ev', weightLbs: 4200 });
const renewEv = K.renew('georgia', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'georgia',
  title: 'Georgia TAVT and Tag Fees 2026: 7% Title Tax, $20 Plate, EV',
  description: `Georgia car fees 2026: a one-time 7% title ad valorem tax instead of sales tax, $18 title, $20 yearly plate, $238.59 EV fee. A new $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Georgia car tax and tag fees',
  intro: 'Georgia pays for roads and local services with one large tax at titling and very small fees afterwards.',
  resume: `A new $35,000 gasoline car costs ${K.usd(r.atPurchase)} in taxes and fees at purchase in Georgia: ${K.usd(v('sales-tax'))} of title ad valorem tax (TAVT) at 7%, the $18 title application fee and the $20 yearly plate fee. There is no sales tax on top and no yearly tax on the car's value afterwards: the TAVT, in force since March 1, 2013, replaced both. That is why a Georgia renewal is among the cheapest in the country, $20 a year for a gasoline car, while the purchase is not. Fully electric cars add an alternative fuel fee of $238.59 a year for registrations from July 2026, indexed each July. A dealer trade-in lowers the TAVT; on a used car the tax uses the state's assessment value rather than the price, and buyers inside the 13-county Atlanta test area need a yearly emissions test once the car is three model years old.`,
  body: (h) => `
<h2>A one-time tax on the value, not on the price</h2>
<p>The TAVT is 7.0% of the "fair market value", a term the ${h.src('ga:faq', 'Department of Revenue FAQ')} defines precisely. For a new car it is the selling price or the value in the state's assessment manual, whichever is higher, minus a dealer trade-in and rebates. For a used car it is the manual's value, an average of wholesale and retail values, not the price you agreed. Two consequences: a bargain price on a used car does not lower the tax, and a private trade-in, unlike a dealer trade-in, gives no reduction. On a new $35,000 car with a $10,000 dealer trade-in, the TAVT falls from ${K.usd(v('sales-tax'))} to ${K.usd(v('sales-tax', trade))}.</p>
<h2>Reduced rates for newcomers and families</h2>
<p>New residents who bring a car already titled in their name pay TAVT at 3% instead of 7%. A car passed to a family member whose TAVT was already paid can be re-titled at 0.5% of its value. Military veterans and first responders can qualify for exemptions with specific forms. The calculator applies the 7% purchase rate; the ${h.src('ga:tavt', 'TAVT page')} details the other cases.</p>
<h2>An EV pays more every year than its plate</h2>
<p>For an electric car the yearly renewal is ${K.usd(renewEv.perYear)}: the $20 plate plus the alternative fuel fee, which the department recalculates each July from fuel economy and inflation. Ordinary hybrids pay nothing extra, and a plug-in hybrid pays only if its owner chooses an alternative fuel plate. At purchase, a new EV owes ${K.usd(ev.atPurchase)}.</p>
<h2>Emissions tests around Atlanta</h2>
<p>Cherokee, Clayton, Cobb, Coweta, DeKalb, Douglas, Fayette, Forsyth, Fulton, Gwinnett, Henry, Paulding and Rockdale counties require a yearly emissions test before the renewal, which falls on the owner's birthday. In 2026 the three newest model years (2024 and later) and cars of 2001 or older are exempt, and sellers in these counties must provide a passing test when they sell a used car, according to ${h.src('ga:caf', 'Georgia’s Clean Air Force')}.</p>`,
  faqs: [
    { q: 'How is the Georgia TAVT calculated on a used car?', a: 'At 7% of the value listed in the state motor vehicle assessment manual, which averages wholesale and retail values, whatever price you paid. A dealer trade-in reduces that value; a trade between private individuals does not. Check the DOR TAVT estimator before you buy.' },
    { q: 'Do I pay sales tax and TAVT on a car in Georgia?', a: 'No, only the TAVT. Since March 1, 2013 it replaces the sales tax on cars and the annual ad valorem tax that owners used to pay each year at renewal. Cars bought before that date can still be under the old annual tax.' },
    { q: 'How much is the yearly tag renewal in Georgia?', a: 'Twenty dollars for a passenger car or light pickup under the TAVT system, plus the alternative fuel fee for a fully electric car ($238.59 for registrations starting between July 1, 2026 and June 30, 2027) and, inside the 13 Atlanta-area counties, the emissions test paid to the station.' },
    { q: 'How much TAVT does a new resident pay in Georgia?', a: 'Three percent of the fair market value instead of seven, provided the vehicle was already titled in the new resident’s name, according to the Department of Revenue. The $18 title and the $20 plate fee are added on top, and the tax is paid once, when the car is first titled in Georgia.' },
  ],
  related: ['car-sales-tax-calculator', 'vehicle-inspection-cost', 'ev-registration-fee-by-state', 'state:florida', 'state:texas', 'car-registration-fees'],
});
