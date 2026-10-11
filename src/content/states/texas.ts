import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('texas');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('texas', { fuel: 'ev', weightLbs: 4200 });
const used = K.calc('texas', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019, county: 'dallas-county' });
const renew = K.renew('texas', 1);
const bexar = K.data('texas').counties!.find((c) => c.id === 'bexar-county')!;
const borden = K.data('texas').counties!.find((c) => c.id === 'borden-county')!;

export default defineState({
  slug: 'texas',
  title: 'Texas Vehicle Registration Fees 2026: Tax, Title, County Fees',
  description: `Texas vehicle registration fees for 2026: 6.25% sales tax, $50.75 base, county fees of $0 to $31.50, title $28 or $33, EV $200. New $35,000 car in Harris County: ${K.usd(r.atPurchase)}.`,
  h1: 'Texas vehicle registration fees',
  intro: 'Texas keeps one statewide tax rate and one base registration fee, then lets each county add its own small fees.',
  resume: `A new $35,000 gasoline car bought from a Harris County dealer costs ${K.usd(r.atPurchase)} in taxes and fees at purchase: ${K.usd(v('sales-tax'))} of motor vehicle sales tax at 6.25% statewide, the $33 title fee charged in emissions counties, ${K.usd(v('reg'))} of registration (the $50.75 base plus $1 for the TexasSure insurance database, twice, because a new car sold by a Texas dealer gets 24 months of registration), ${K.usd(v('local'))} of Harris County fees for the same two years, the $16.75 inspection replacement fee covering the first two years, the $4.75 processing fee and a $225 documentary fee, the figure Texas presumes reasonable. The trade-in is deducted from the taxed price and the documentary fee is not taxed. From the second year the renewal is about ${K.usd(renew.perYear)} a year in Harris County, and an older car there also needs its yearly emissions test.`,
  body: (h) => `
<h2>Safety inspections ended, the fee did not</h2>
<p>Since January 1, 2025, ordinary passenger cars no longer need a safety inspection in Texas. The state kept part of the revenue: every registration now carries a $7.50 inspection program replacement fee, or $16.75 at once for a new car's first two years. Seventeen counties around Houston, Dallas-Fort Worth, Austin and El Paso still require an emissions test for gasoline cars after their first two years; the state's $2.75 share is collected with the registration, and the station charges its own part (the regulator's bulletin uses $18.50 as an example).</p>
<h2>County fees: from nothing to $31.50 a year</h2>
<p>Counties may add up to $10 for road and bridge funds, up to $20 for transportation projects in some counties, and up to $1.50 for child safety programs. The ${h.src('tx:fee-chart', 'TxDMV fee chart for 2026')} lists every county: ${bexar.name} charges ${K.usd(bexar.localFee as number, 2)}, ${borden.name} ${K.usd(borden.localFee as number, 2)}. The calculator includes all 254 counties.</p>
<h2>Private sales and the standard presumptive value</h2>
<p>When you buy a used car from a private seller, Texas taxes the price you paid or the car's standard presumptive value, a book value the state publishes, whichever is higher, unless a licensed adjuster or dealer certifies a lower appraisal within 20 working days. A low price on the bill of sale therefore does not always mean a low tax. For an $18,000 2019 car bought privately in Dallas County, the calculator shows ${K.usd(v('sales-tax', used))} of tax on the price and ${K.usd(used.atPurchase)} due at the title transfer; check the presumptive value with the ${h.src('tx:spv', 'TxDMV calculator')} before you agree on a price.</p>
<h2>Electric cars pay two ways</h2>
<p>Fully electric cars pay $200 a year at renewal, and a new EV registered for 24 months pays $400 at once. Hybrids and plug-in hybrids pay nothing extra. Because EVs are exempt from emissions tests, a new EV in Harris County owes ${K.usd(ev.atPurchase)} at purchase, ${K.usd(ev.atPurchase - r.atPurchase)} more than the gasoline version.</p>`,
  faqs: [
    { q: 'How much does it cost to register a new car in Texas?', a: `For a new $35,000 car from a dealer in Harris County, ${K.usd(r.atPurchase)} including the 6.25% sales tax, the $33 title, 24 months of registration and county fees, the $16.75 inspection replacement fee, the processing fee and a $225 documentary fee. Without the tax and the dealer fee, the government fees are about ${K.usd(r.atPurchase - v('sales-tax') - r.docFee)}.` },
    { q: 'Does Texas still require a car inspection in 2026?', a: 'Not a safety inspection for ordinary cars: it ended on January 1, 2025, replaced by a $7.50 fee paid with registration. Seventeen counties still require a yearly emissions test for gasoline cars older than two years, with a $2.75 state share collected at registration.' },
    { q: 'Is the Texas car sales tax charged on the dealer’s documentary fee?', a: 'No. The Comptroller lists a separately stated documentary fee among the charges that are not part of the taxable price, together with the trade-in value, separately stated manufacturer rebates and service contracts. The 6.25% applies to the rest.' },
    { q: 'What does a new resident pay to bring a car to Texas?', a: 'A $90 new resident tax replaces the 6.25% use tax when the car was already registered in the owner’s name in another state, plus the title, registration and county fees. New residents have 30 days to register, according to TxDMV.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-inspection-cost', 'ev-registration-fee-by-state', 'state:california', 'state:florida', 'car-registration-fees'],
});
