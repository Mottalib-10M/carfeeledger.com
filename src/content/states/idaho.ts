import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('idaho');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const doc = K.calc('idaho', { docFee: 399 });
const ev = K.calc('idaho', { fuel: 'ev', weightLbs: 4200 });
const kootenai = K.calc('idaho', { county: 'kootenai-county' });
const renew = K.renew('idaho', 1);
const renewOld = K.renew('idaho', 1, { modelYear: 2017 });
const counties = K.data('idaho').counties!;
const blaine = counties.find((c) => c.id === 'blaine-county')!;

export default defineState({
  slug: 'idaho',
  title: 'Idaho Vehicle Registration Fees 2026: Age, County, 6% Tax',
  description: `Idaho vehicle registration fees for 2026: $69, $57 or $45 by age, county admin fees, EV $140, plug-in $75, 6% sales tax. New $35,000 car in Ada County: ${K.usd(r.atPurchase)}.`,
  h1: 'Idaho vehicle registration fees and sales tax',
  intro: 'Idaho charges a flat 6% on the purchase, then a registration that gets cheaper as the car ages, with each of the 44 counties adding its own small fees.',
  resume: `A new $35,000 gasoline car bought from a dealer in Ada County, home of Boise, costs ${K.usd(r.atPurchase, 2)} in tax and fees: ${K.usd(v('sales-tax'))} of sales tax at 6%, the $14 state title fee plus Ada's $7 title admin fee, $7.50 for two standard plates, $69 of registration for a car up to two years old, the $1.25 EMS and $3 state police fees, Ada's $9.50 registration admin fee and the $40 Ada County Highway District fee. The calculator adds no dealer fee by default, but if the dealer charges one it is taxed too: a $399 fee raises the tax to ${K.usd(v('sales-tax', doc))}. Renewal costs ${K.usd(renew.perYear, 2)} a year while the car is young and ${K.usd(renewOld.perYear, 2)} once it is eight or older. In Kootenai County, where both admin fees are higher and no highway district fee applies, the same purchase comes to ${K.usd(kootenai.atPurchase, 2)}. Idaho has no inspection and no yearly tax on the car's value.`,
  body: (h) => `
<h2>Registration that falls with age</h2>
<p>Idaho prices registration by the age of the vehicle, counted from its model year: $69 a year up to two years old, $57 from three to six and $45 from seven on, according to the ${h.src('id:itd-reg', 'Idaho Transportation Department')}. Owners may register for one or two years. Electric cars add $140 a year and plug-in hybrids $75, which takes a new electric car to ${K.usd(ev.atPurchase, 2)} at purchase in Ada County; ordinary hybrids pay nothing extra. The law treats this operating fee as the car's only yearly charge, in lieu of a personal property tax, so Idaho owners never get a separate bill on the car's value, unlike drivers in ${h.a('state:nevada', 'Nevada')} or ${h.a('state:wyoming', 'Wyoming')}, whose yearly charge depends on it.</p>
<h2>What your county adds</h2>
<p>Registrations and titles are handled by the county assessor's motor vehicle office, and each county keeps an admin fee: from $3 in Lewis County to $14 in Kootenai County per registration, and from nothing to ${K.usd(blaine.titleAdmin as number, 2)} in ${blaine.name} on top of the $14 state title fee. Ada County residents also pay the highway district's vehicle registration fee: $40 a year for a car one or two years old, $36 from three to seven and $24 after that. That fee is authorized through 2028, and Ada voters decide on November 3, 2026 whether to extend it to 2046 at the same rates.</p>
<h2>Sales tax rules worth knowing</h2>
<p>The ${h.src('id:istc', 'Tax Commission guide for vehicle sales')} says the dealer's documentation fee is part of the taxable price, while separately stated title and registration fees are not. A trade-in lowers the taxed amount only when a dealer takes it into inventory; a buyer from a private seller pays 6% on the bill of sale at the county office, or on the NADA average trade-in value when there is no bill of sale. Ada County's emissions testing program ended on June 30, 2023, after almost 40 years. Use the ${h.a('out-the-door-price-calculator', 'out-the-door calculator')} to add your loan and dealer fees.</p>`,
  faqs: [
    { q: 'How much is the Ada County highway district fee on an Idaho registration?', a: 'The Ada County Highway District charges $40 a year for a passenger vehicle one or two years old, $36 from three to seven years old and $24 when it is older, collected with the state registration. Motorcycles pay $8. The fee is authorized through December 31, 2028, and a November 2026 ballot measure would keep the same rates until 2046.' },
    { q: 'Is the dealer doc fee taxed in Idaho?', a: 'Yes. The Idaho State Tax Commission treats documentation fees as services the dealer provides as part of the sale, so they are included in the taxable sales price and taxed at 6%. Registration and title fees the dealer collects for the state are not taxed if they are stated separately and do not exceed the official amounts.' },
    { q: 'Does Idaho still require an emissions test in Boise?', a: 'No. Ada County’s emissions testing program, in place since 1984, ended at midnight on June 30, 2023, and owners who had received testing notices were told to disregard them. Registrations revoked for failing to test were reinstated automatically from July 1, 2023, so a Boise car renews today without any test.' },
  ],
  related: ['dmv-fees-calculator', 'car-registration-fees', 'ev-registration-fee-by-state', 'state:washington', 'state:nevada', 'out-the-door-price-calculator'],
});
