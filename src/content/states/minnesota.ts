import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('minnesota');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const renew = K.renew('minnesota', 1);
const renew9 = K.renew('minnesota', 9);
const ev = K.calc('minnesota', { fuel: 'ev', weightLbs: 4200 });
const used = K.calc('minnesota', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });

export default defineState({
  slug: 'minnesota',
  title: 'Minnesota Car Tax and Tabs 2026: 6.875% MVST, MSRP Tabs',
  description: `Minnesota car tax and tabs in 2026: 6.875% motor vehicle sales tax, registration tax of $10 + 1.575% of MSRP, EV surcharge from $150. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Minnesota car sales tax and registration tax',
  intro: 'Minnesota’s yearly tabs are a tax on the car’s original sticker price, so they start high on a new car and shrink every year for a decade.',
  resume: `A new $35,000 gasoline car bought from a dealer in Hennepin County costs ${K.usd(r.atPurchase)} in taxes and fees when it is titled: ${K.usd(v('sales-tax'))} of motor vehicle sales tax at 6.875% on the price and the $350 documentary fee, ${K.usd(v('reg'), 2)} of registration tax ($10 plus 1.575% of the MSRP in the first year of the car’s life), ${K.usd(v('title') + v('title-tech') + v('psv') + v('filing'), 2)} of title, technology, public safety and filing fees, ${K.usd(v('plates'), 2)} for the pair of plates, Hennepin’s $20 wheelage tax and the documentary fee itself, capped at $350. Renewing the tabs the following year costs about ${K.usd(renew.perYear)}, since the tax is figured on 95% of the MSRP and an $8 filing fee and a $2.25 technology surcharge are added. The tax keeps falling with age, to ${K.usd(renew9.perYear)} in the car’s tenth year. An electric car pays a surcharge of 0.5% of the MSRP, at least $150, so a new $35,000 EV costs ${K.usd(ev.atPurchase)} up front. There is no inspection.`,
  body: (h) => `
<h2>Tabs priced on the sticker price, year by year</h2>
<p>The registration tax of ${h.src('mn:reg-tax', 'Minnesota Statutes 168.013')} is $10 plus 1.575% of the manufacturer’s suggested retail price for any car first registered on or after November 16, 2020. The percentage of the MSRP used falls with the year of vehicle life: 100% the first year, then 95%, 90%, 80%, 70%, 60%, 50%, 40%, 25% and 10% in the tenth year. From the eleventh year on, the tax is a flat $10 plus $20. Because the price used is the MSRP, a good deal at the dealer does not lower your tabs, and options added separately are left out.</p>
<h2>What changes when you buy used</h2>
<p>The 6.875% motor vehicle sales tax applies to dealer and private sales alike, on the price minus any trade-in the seller allows; a car in its tenth year or older with a resale value under $3,000 pays a flat $10 instead. The plates and the registration tax already paid stay with the car, so a private buyer pays the tax, the title fees and a $10 transfer tax now, and the tabs at the next renewal. For a 2019 car bought from a private seller for $18,000, that is ${K.usd(used.atPurchase, 2)} at the counter.</p>
<h2>EV surcharge and county wheelage</h2>
<p>Electric cars add 0.5% of the MSRP by year of life, at least $150 for registration periods starting from January 1, 2026 to June 30, 2027 and $100 afterward; plug-in hybrids add 0.25%, at least $75 then $50. Fifty-five counties also collect a wheelage tax of $10 to $20 a year with the tabs, including Hennepin and Ramsey at $20; Dakota, Isanti and Mower move from $10 to $20 in 2027. Next door, ${h.a('state:wisconsin', 'Wisconsin')} charges a flat registration fee instead, and the ${h.a('vehicle-property-tax', 'vehicle property tax guide')} lists the states that tax value every year.</p>`,
  faqs: [
    { q: 'Why are Minnesota tabs on an older car so much cheaper than on a new one?', a: 'Because the registration tax follows the year of vehicle life. It is $10 plus 1.575% of the original MSRP times a percentage that drops from 100% in the first year to 10% in the tenth, then becomes a flat $30 from the eleventh year. The $8 filing fee and $2.25 technology surcharge stay the same.' },
    { q: 'Does a Minnesota buyer of a used car pay new tabs right away?', a: 'Usually not. The license plates and the registration tax already paid are assigned to the new owner with the car. At the title transfer you pay the 6.875% sales tax, the $8.25 title fee, the technology surcharge, the public safety vehicle fee, the $12 filing fee and the $10 transfer tax, and the tabs at the next expiration.' },
    { q: 'How is the Minnesota EV surcharge calculated for an expensive electric car?', a: `It is the greater of the minimum and 0.5% of the MSRP times the year-of-life percentage used for the registration tax. A new $35,000 EV pays ${K.usd(v('ev', ev))}, above the $150 minimum; a $70,000 model pays twice that in its first year. As the car ages the percentage drops, and the minimum takes over.` },
  ],
  related: ['dmv-fees-calculator', 'ev-registration-fee-by-state', 'car-sales-tax-calculator', 'state:wisconsin', 'license-plate-renewal', 'vehicle-property-tax'],
});
