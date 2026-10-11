import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('rhode-island');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('rhode-island', { fuel: 'ev', weightLbs: 4200 });
const hybrid = K.calc('rhode-island', { fuel: 'hybrid' });
const used = K.calc('rhode-island', { condition: 'used', seller: 'private', price: 14000, modelYear: 2018 });
const trade = K.calc('rhode-island', { tradeIn: 10000 });

export default defineState({
  slug: 'rhode-island',
  title: 'Rhode Island DMV Fees 2026: 7% Sales Tax, Title, EV Fee',
  description: `Rhode Island DMV fees for 2026: 7% sales tax, $53.50 title, $40 DOT surcharge per 2-year term, EV fee $200 a year. New $35,000 car: ${K.usd(r.atPurchase, 2)} + weight fee.`,
  h1: 'Rhode Island DMV fees and car sales tax',
  intro: 'Rhode Island raised two registration charges on January 1, 2026 and started billing electric and hybrid cars, while the old municipal car tax is gone.',
  resume: `For a new $35,000 gasoline car bought from a dealer, Rhode Island collects ${K.usd(r.atPurchase, 2)} in known amounts at registration: ${K.usd(v('sales-tax'), 2)} of sales tax at 7%, the $53.50 title, $8 for the original plates, the DOT surcharge of $40 for the two-year registration and the $3.50 technology surcharge. One more line must be added from the sticker on the driver's door: the registration fee goes by gross vehicle weight rating, $30 a year up to 4,000 lb and $40 up to 5,000 lb, so $60 to $112 for the two-year term of most cars and SUVs. A $10,000 trade-in lowers the tax to ${K.usd(v('sales-tax', trade), 2)}. Since January 2026 a battery electric car pays $200 per registration year, which puts a new one at ${K.usd(ev.atPurchase, 2)}, and a hybrid $50 a year, for ${K.usd(hybrid.atPurchase, 2)}. New cars skip inspection for two years; after that a $55 safety and emissions check is due every 24 months.`,
  body: (h) => `
<h2>What changed on January 1, 2026</h2>
<p>Two charges moved at the start of the year. The ${h.src('ri:surcharge', 'DOT surcharge')} that funds highway work rose from $30 to $40 for a two-year passenger registration, or $20 for a one-year one. And the ${h.src('ri:ev-fee', 'DMV fee notice')} introduced a yearly fee for cars that buy little or no gasoline: $200 for a battery electric car, $100 for a plug-in hybrid and $50 for a hybrid, mild hybrids included. Because most passenger cars register for two years, the amount at renewal is double: $400 for an electric car.</p>
<h2>Private sales and the book value</h2>
<p>Dealers subtract the trade-in before applying the 7%. Between private parties, a car seven years old or newer is taxed on its NADA clean retail value or the sale price, whichever is higher, so a bargain price does not always mean a bargain tax. Cars 8 to 29 years old are taxed on the sale price unless they appear on the state's list of cars of particular interest. For a 2018 car bought privately for $14,000, the calculator shows ${K.usd(v('sales-tax', used), 2)} of tax on the price and ${K.usd(used.atPurchase, 2)} due at registration, including the first $55 inspection. Gifts between immediate family members are exempt with a signed letter.</p>
<h2>No more car tax bill from your town</h2>
<p>Rhode Island phased out the municipal motor vehicle excise tax, and the state now reimburses cities, towns and fire districts for the lost revenue. Owners therefore pay nothing each year on the value of the car, only the registration and surcharges every two years. The registration fee itself follows ${h.src('ri:reg-statute', 'R.I. Gen. Laws § 31-6-1')} by gross weight. To compare a weight-based state with one that taxes value each year, see ${h.a('state:new-york', 'New York')} or the ${h.a('vehicle-property-tax', 'vehicle property tax by state')} page.</p>`,
  faqs: [
    { q: 'Which weight sets the Rhode Island registration fee?', a: 'The gross vehicle weight rating printed on the label inside the driver’s door, which is the car plus its maximum load, not the empty weight. A passenger car pays $30 a year up to 4,000 lb, $40 up to 5,000 lb, $48 up to 6,000 lb and $56 up to 7,000 lb, billed for two years at a time.' },
    { q: 'Do mild hybrids pay the new Rhode Island hybrid fee?', a: 'Yes. The DMV applies the $50 yearly hybrid fee to every non-plug-in hybrid, including mild hybrids whose small electric motor only assists the gasoline engine. Plug-in hybrids pay $100 and battery electric cars $200 per registration year, starting with registrations processed or expiring from January 2026.' },
    { q: 'When does a car need its first inspection in Rhode Island?', a: 'A new car is exempt for two years from the purchase date or until it reaches 24,000 miles, whichever comes first. A used car bought from a Rhode Island dealer must come with a fresh sticker, and any other newly registered car must pass within five days. The combined safety and emissions inspection costs $55 and lasts 24 months.' },
  ],
  related: ['dmv-fees-calculator', 'ev-registration-fee-by-state', 'vehicle-inspection-cost', 'title-and-registration-fees', 'state:new-york', 'car-ownership-cost'],
});
