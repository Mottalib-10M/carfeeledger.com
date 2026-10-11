import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('indiana');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('indiana', { fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('indiana', 1);
const renew5 = K.renew('indiana', 5);
const renewEv = K.renew('indiana', 1, { fuel: 'ev', weightLbs: 4200 });
const old = K.calc('indiana', { condition: 'used', seller: 'private', price: 9000, msrp: 31000, modelYear: 2016 });

export default defineState({
  slug: 'indiana',
  title: 'Indiana BMV Fees 2026: Excise Tax, Registration, Sales Tax',
  description: `Indiana BMV fees for 2026: 7% sales tax, $15 title, $21.35 registration plus $15 TIIF, and an excise tax by class and age. New $35,000 car: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Indiana BMV fees, excise tax and sales tax',
  intro: 'In Indiana the registration fee is small; the line that moves the yearly bill is the vehicle excise tax, read from a table by price class and age.',
  resume: `A new $35,000 gasoline car bought from a dealer in Marion County costs ${K.usd(r.atPurchase, 2)} at the BMV and the dealership: ${K.usd(v('sales-tax'), 2)} of sales tax at 7%, charged on the price plus the ${K.usd(r.docFee, 2)} documentation fee because Indiana taxes that fee, the $15 title, the $21.35 passenger registration, the $15 Transportation Infrastructure Improvement Fee and ${K.usd(v('excise'), 2)} of vehicle excise tax for a class 16 car in its first year. The documentation fee shown is the level below which the Secretary of State takes no enforcement action from July 1, 2026, not a legal maximum. The excise tax then falls each year, so the second registration costs ${K.usd(renew.perYear, 2)} and the sixth ${K.usd(renew5.perYear, 2)}, before any county wheel tax or surtax. An electric car adds a $242 supplemental fee every year, bringing a new one to ${K.usd(ev.atPurchase, 2)} at purchase and ${K.usd(renewEv.perYear, 2)} at its first renewal; a hybrid pays $81.`,
  body: (h) => `
<h2>How the excise tax table works</h2>
<p>Indiana does not tax the value of a car each year the way a property tax would. It puts every passenger vehicle in one of 17 classes according to the manufacturer's original retail price, then reads a fixed amount for its age, counted as the registration year minus the model year. The ${h.src('in:excise', 'BMV excise tax table')} runs from $12 for class 1 to $532 for a new class 17 car priced at $42,500 or more. The price class never changes when the car is resold: a used car keeps the class of its original sticker. A 2016 car that listed at $31,000 and sells privately for $9,000 still pays ${K.usd(v('excise', old), 2)} of excise in 2026, the class 15 amount for its tenth year and beyond. Type the original MSRP in the calculator when you know it.</p>
<h2>Sales tax rules that differ from neighbors</h2>
<p>The state rate is 7% everywhere, with no county or city sales tax on vehicles. According to ${h.src('in:sib28s', 'Department of Revenue bulletin 28S')}, a trade-in is deducted only in a like-kind exchange, and the dealer's documentation fee is part of the taxed price, while a separately stated convenience fee for BMV paperwork is not. The documentation fee must also be included in any advertised price.</p>
<h2>Local taxes and Lake and Porter counties</h2>
<p>Many counties and some cities add a wheel tax or an excise surtax adopted by ordinance, either a flat amount or a percentage rate, paid along with your registration. In Lake and Porter counties, next to Chicago, gasoline cars and light trucks also need an emissions test every other year once they are older than the four newest model years. The rest of the state has no inspection at all. For a state with a value-based yearly charge collected by the county instead, see ${h.a('state:virginia', 'Virginia')}, or compare totals with the ${h.a('dmv-fees-calculator', 'DMV fees calculator')}.</p>`,
  faqs: [
    { q: 'Does a used car in Indiana keep its original excise tax class?', a: 'Yes. The class is set by the manufacturer’s original retail price, not by what you paid, so a used car pays the excise amount of its original class for its current age. A car worth little today can therefore owe more than its market value suggests until it reaches the last column of the table, age 9 and older, where every class bottoms out.' },
    { q: 'Is the dealer documentation fee taxed in Indiana?', a: 'Yes. The Department of Revenue treats a documentation fee as a charge for services necessary to complete the sale, so the 7% sales tax applies to it. A separately stated convenience fee for processing BMV transactions is not taxable. For 2026 the Secretary of State takes no action against documentation fees at or below $261.72.' },
    { q: 'Who pays the hybrid supplemental fee in Indiana?', a: 'Owners of hybrid vehicles pay an $81 supplemental fee with each yearly registration, and battery electric vehicles pay $242, according to the BMV fee chart revised on January 1, 2026. The fee comes on top of the $21.35 registration, the $15 infrastructure fee and the excise tax.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'doc-fee-by-state', 'ev-registration-fee-by-state', 'car-registration-fees', 'state:virginia'],
});
