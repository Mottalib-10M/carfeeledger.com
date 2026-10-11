import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('nevada');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const washoe = K.calc('nevada', { county: 'washoe-county' });
const renew = K.renew('nevada', 1);
const renew9 = K.renew('nevada', 9);
const priv = K.calc('nevada', { condition: 'used', seller: 'private', price: 18000, msrp: 30000, modelYear: 2021 });

export default defineState({
  slug: 'nevada',
  title: 'Nevada DMV Fees 2026: Sales Tax, $33 Registration, GST',
  description: `Nevada DMV fees 2026: 6.85% to 8.375% sales tax, $33 registration, tax on 35% of MSRP, $28.25 title. New $35,000 car in Las Vegas: ${K.usd(r.atPurchase, 2)} before plates.`,
  h1: 'Nevada DMV fees and governmental services tax',
  intro: 'Nevada keeps its registration fee flat and puts the weight of the yearly bill on a tax tied to the car’s original sticker price.',
  resume: `A new $35,000 gasoline car bought from a dealer in Clark County costs ${K.usd(r.atPurchase, 2)} in taxes and DMV charges, plates aside: ${K.usd(v('sales-tax'), 2)} of sales tax at 8.375%, the $28.25 first title, the $33 registration fee, ${K.usd(v('gst'))} of governmental services tax and ${K.usd(v('sgst'), 2)} of the supplemental tax Clark County voters approved for roads. The governmental services tax is 4% of a valuation equal to 35% of the MSRP, so the price you negotiate does not change it. In Washoe County, around Reno, the sales tax is 8.265% and there is no supplemental tax: ${K.usd(washoe.atPurchase, 2)} in all. The following year the renewal in Clark County comes to about ${K.usd(renew.perYear, 2)}, and once the valuation reaches its 15% floor after nine years the yearly bill is near ${K.usd(renew9.perYear, 2)}.`,
  body: (h) => `
<h2>How the governmental services tax works</h2>
<p>Every year at renewal the DMV takes 35% of the car's original MSRP, applies the ${h.src('nv:nrs-371', 'depreciation schedule of NRS 371.060')} and charges 4 cents per dollar of the result. A vehicle never registered before counts at 100%, then 95% after one year, 85% after two and ten points less each year until the floor of 15% at nine years. The minimum tax is $16. Clark and Churchill counties add a supplemental tax of 1 cent per dollar on the same valuation. Because the base is the sticker price, a used car bought cheaply still carries the tax of its original MSRP: a 2021 car that listed at $30,000, bought privately for $18,000, costs ${K.usd(priv.atPurchase, 2)} to title and register in Clark County.</p>
<h2>Sales tax: dealers only</h2>
<p>The rate depends on the county, from 6.85% in the smallest rural counties to 8.375% in Clark, according to the ${h.src('nv:county-rates', 'Department of Taxation')}. A trade-in lowers the taxed price and the dealer's document fee is taxed. A private party sale, a sale between relatives or a gift owes no sales tax at all, which makes private purchases noticeably cheaper than in most states. For a nearby comparison with a value-based fee and a higher rate, see ${h.a('state:california', 'California')}.</p>
<h2>Smog checks in Las Vegas and Reno</h2>
<p>Gasoline cars based in the urban parts of Clark and Washoe counties need an emissions test every year before renewal. A new car is exempt for its first three registrations, a hybrid for five model years, and an electric car always. Test stations set their own prices, so the calculator lists the test without an amount. Nevada has no extra registration fee for electric cars.</p>`,
  faqs: [
    { q: 'Does Nevada charge sales tax on a car bought from a private seller?', a: 'No. Nevada DMV states that private party sales, family sales and gifts are not subject to sales tax. You still pay the first title, the $33 registration fee and the governmental services tax, which is based on the original MSRP of the car, not on the price you paid.' },
    { q: 'Why is the Nevada governmental services tax so high on a new car?', a: 'It starts from 35% of the full MSRP and applies 4% to it, with no depreciation in the first registration. A $35,000 car therefore owes $490, plus 1% more in Clark and Churchill counties. The valuation then drops each year, to 55% after five years and 15% from nine years.' },
    { q: 'When does a new car need its first smog check in Las Vegas?', a: 'A new gasoline car based in the urban area of Clark or Washoe county is exempt for its first three registrations and needs a passing emissions test before the fourth. Hybrids are exempt for five model years and electric cars do not need a test.' },
  ],
  related: ['dmv-fees-calculator', 'smog-check-cost', 'vehicle-property-tax', 'state:california', 'state:arizona', 'car-sales-tax-calculator'],
});
