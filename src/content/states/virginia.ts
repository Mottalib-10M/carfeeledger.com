import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('virginia');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('virginia', { fuel: 'ev', weightLbs: 4200 });
const trade = K.calc('virginia', { tradeIn: 10000 });
const renewEv = K.renew('virginia', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'virginia',
  title: 'Virginia Car Tax and DMV Fees 2026: 4.15% SUT, Title, HUF',
  description: `Virginia car tax and DMV fees 2026: 4.15% sales and use tax (minimum $75), $15 title, $30.75 registration, EV use fee $135.63. New $35,000 car: ${K.usd(r.atPurchase)}.`,
  h1: 'Virginia car sales tax and DMV fees',
  intro: 'Virginia charges little at the DMV counter; the real yearly cost of a car there is the personal property tax your county or city sends.',
  resume: `A new $35,000 gasoline car titled in Fairfax County costs ${K.usd(r.atPurchase)} in state taxes and DMV fees at purchase: ${K.usd(v('sales-tax'))} of motor vehicle sales and use tax at 4.15%, the $15 original title, ${K.usd(v('reg'))} of yearly registration for a car of 4,000 lb or less and the $2 Northern Virginia emissions fee. Two lines are not in that total. The highway use fee applies to gasoline and hybrid cars rated 25 mpg or more and depends on the EPA rating, from $0 to $135.63 a year. And every county and city taxes cars as personal property, at its own rate on its own valuation, billed each year. A trade-in does not lower the tax: with a $10,000 trade-in the tax stays ${K.usd(v('sales-tax', trade))}. A new electric SUV of 4,200 lb pays ${K.usd(ev.atPurchase)} at purchase and about ${K.usd(renewEv.perYear)} a year to renew, before the local tax.`,
  body: (h) => `
<h2>A low rate, no trade-in credit</h2>
<p>At 4.15%, Virginia's motor vehicle sales and use tax is one of the lowest in the country, and no locality adds to it. The catch is the base: the ${h.src('va:va-code', 'Code of Virginia')} defines the sale price without any deduction for a trade-in, so a buyer who trades a car worth $10,000 pays the same tax as one who does not. Manufacturer rebates, on the other hand, are left out of the price. The minimum tax is $75, which matters only for cheap used cars.</p>
<h2>The highway use fee, explained</h2>
<p>Electric cars pay $135.63 a year in the 2026 ${h.src('va:fee-chart', 'DMV fee chart')}, updated every July 1. Gasoline and hybrid cars rated 25 mpg or more pay a smaller fee computed by the ${h.src('va:huf', 'highway use fee formula')}: 85% of the fuel tax they avoid compared with a 23.7 mpg car over 11,600 miles. The higher the rating, the closer the fee comes to the electric-car amount. Our calculator shows it as a range because it needs the car's EPA rating.</p>
<h2>Northern Virginia: emissions and higher local taxes</h2>
<p>Cars garaged in Arlington, Fairfax, Loudoun, Prince William or Stafford counties, or in five cities of the area, need an emissions inspection and pay a $2 emissions program fee with registration; every Virginia car also needs a safety inspection at a licensed station. Personal property tax rates vary by locality and so do local registration fees, so ask your treasurer for the rate. For comparison, ${h.a('state:pennsylvania', 'Pennsylvania')} has no yearly tax on the car's value at all.</p>`,
  faqs: [
    { q: 'Does a trade-in reduce the car sales tax in Virginia?', a: 'No. Virginia law defines the sale price of a motor vehicle without any allowance for a trade-in, so the 4.15% sales and use tax applies to the full price. Manufacturer rebates are excluded from the taxable price, and the minimum tax is $75 on any vehicle titled in Virginia.' },
    { q: 'What is the Virginia highway use fee for hybrid cars?', a: 'Hybrids and gasoline cars rated 25 mpg combined or more pay a yearly highway use fee equal to 85% of the fuel tax they avoid compared with a 23.7 mpg car driven 11,600 miles. The amount depends on the EPA rating and stays below the $135.63 that fully electric cars pay in the 2026 fee chart.' },
    { q: 'Is the Virginia car tax paid to the DMV?', a: 'No. The yearly car tax is a local personal property tax, assessed and billed by your county or city on the vehicle’s value, at a rate set locally. The DMV collects only the sales and use tax at titling, the title and registration fees, and the highway use and emissions fees.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'state:pennsylvania', 'state:new-york', 'car-sales-tax-calculator'],
});
