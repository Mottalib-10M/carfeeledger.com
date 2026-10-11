import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('iowa');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('iowa', { fuel: 'ev', weightLbs: 4200 });
const priv = K.calc('iowa', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021, fuel: 'ev', weightLbs: 4200, msrp: 42000 });
const older = K.calc('iowa', { condition: 'used', seller: 'private', price: 9000, modelYear: 2017, msrp: 31000 });
const trade = K.calc('iowa', { tradeIn: 10000 });
const renew = K.renew('iowa', 1);
const renewEv = K.renew('iowa', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'iowa',
  title: 'Iowa Car Registration Fees 2026: 5% Fee, List Price, Weight',
  description: `Iowa car registration fees for 2026: $10 plus 5% fee for new registration, $30 title, yearly 1% of list price plus 40¢ per 100 lb. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Iowa car registration fees and fee for new registration',
  intro: 'Iowa replaces the usual sales tax on a car with a fee for new registration, then bills a yearly registration built on the model\'s list price and its weight.',
  resume: `A new $35,000 gasoline car of 3,500 lb bought from an Iowa dealer costs ${K.usd(r.atPurchase)} at the county treasurer and the dealership: ${K.usd(v('sales-tax'))} of fee for new registration ($10 plus 5% of the price, the $180 documentary fee included because the dealer must build it into the price), the $30 title, ${K.usd(v('reg'))} of yearly registration (1% of the list price plus 40 cents per 100 lb) and the $180 documentary fee, the legal maximum. A trade-in lowers the 5% base, so trading a $10,000 car brings the fee down to ${K.usd(v('sales-tax', trade))}. The same car costs ${K.usd(renew.perYear)} to renew the next year, and the amount stays the same for seven model years before it starts to fall. A battery electric version pays $130 more each year and a plug-in hybrid $65, so a new 4,200 lb electric car costs ${K.usd(ev.atPurchase)} at purchase and ${K.usd(renewEv.perYear)} a year afterwards. Iowa has no inspection and no separate property tax on cars.`,
  body: (h) => `
<h2>The fee for new registration replaces the sales tax</h2>
<p>When a car is titled in a new owner's name, the county treasurer collects a ${h.src('ia:code-321-105a', 'fee for new registration')} of $10 plus 5% of the purchase price. It applies to dealer and private sales alike, at the same rate in every county. A trade-in is subtracted from the price when the dealer takes it into stock, and also when two private parties swap vehicles, provided the same person appears on both titles; spouses and close family members can qualify. Manufacturer cash rebates applied to the price are not taxed.</p>
<h2>Why the registration follows the list price, not the price you paid</h2>
<p>The yearly fee is 1% of the value fixed by the Iowa DOT, which is the model's retail list price, plus 40 cents for each 100 lb or fraction of weight. Your discount at the dealership does not lower it, and a used car keeps the fee of its original sticker. After seven model years the value part drops to 75%, after nine to 50%, with a $50 floor, and from twelve model years every car pays a flat $50. A 2017 car that listed at $31,000 and sells for $9,000 still owes ${K.usd(v('reg', older))} in 2026. A used electric car that listed at $42,000 and sells privately for $18,000 costs ${K.usd(priv.atPurchase)} at the treasurer, the $130 electric fee included. When you buy used, type the original MSRP in the calculator: without it the registration line stays empty.</p>
<h2>What the treasurer bills at the counter</h2>
<p>At purchase the treasurer charges the registration only until your renewal month, which follows your birth month, so the first payment is often less than a full year. A $20 fee applies when a lender records a lien. Iowa has no safety or emissions inspection. For a neighbor that taxes cars by value every year through the county, see ${h.a('state:nebraska', 'Nebraska')}, or compare with ${h.a('state:minnesota', 'Minnesota')}.</p>`,
  faqs: [
    { q: 'Does a private car sale in Iowa owe the 5% fee for new registration?', a: 'Yes. The fee for new registration is due whenever a vehicle is titled to a new owner, whether the seller is a dealer or a private person, and it is $10 plus 5% of the purchase price. In a direct swap between two private parties, the value of the traded vehicle can be deducted if the same owner is listed on both titles.' },
    { q: 'When does the Iowa registration fee go down for an older car?', a: 'The part of the fee based on value falls to 75% once the car is more than seven model years old and to 50% after nine, with a total of at least $50. From twelve model years the annual registration is a flat $50. The weight part, 40 cents per 100 lb, does not change with age.' },
    { q: 'How much can an Iowa dealer charge as a documentary fee?', a: 'No more than $180 per vehicle under Iowa Code 322.19A. The dealer must include the fee in any advertised price and print a notice in the purchase agreement saying it is not an official fee. Because it is part of the price, the calculator includes it in the base of the 5% fee for new registration.' },
  ],
  related: ['car-registration-fees', 'ev-registration-fee-by-state', 'doc-fee-by-state', 'state:nebraska', 'state:minnesota', 'dmv-fees-calculator'],
});
