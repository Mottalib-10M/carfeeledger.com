import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('kentucky');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const ev = K.calc('kentucky', { fuel: 'ev', weightLbs: 4200 });
const trade = K.calc('kentucky', { tradeIn: 10000 });
const priv = K.calc('kentucky', { condition: 'used', seller: 'private', price: 18000, modelYear: 2021, fuel: 'ev', weightLbs: 4200 });
const renew = K.renew('kentucky', 1);
const renewEv = K.renew('kentucky', 1, { fuel: 'ev', weightLbs: 4200 });

export default defineState({
  slug: 'kentucky',
  title: 'Kentucky Usage Tax 2026: 6% on Cars, Title, Registration',
  description: `Kentucky car usage tax for 2026: 6% after trade-in, $9 title, $11.50 registration plus clerk fees, $126 EV fee, property tax. New $35,000 car: ${K.usd(r.atPurchase, 2)}.`,
  h1: 'Kentucky motor vehicle usage tax and clerk fees',
  intro: 'Kentucky has no sales tax line on a car: the county clerk collects a 6% usage tax at titling, and the yearly cost comes from the property tax, not the plate.',
  resume: `A new $35,000 gasoline car titled in Kentucky costs ${K.usd(r.atPurchase, 2)} at the county clerk: ${K.usd(v('sales-tax'), 2)} of motor vehicle usage tax at 6%, the $9 title application, the $11.50 registration fee, the clerk's $6 and the additional $3 collected with every registration. A trade-in comes off the taxed amount on new and used cars, so trading a $10,000 car lowers the tax to ${K.usd(v('sales-tax', trade), 2)}. The total leaves out two things. Every vehicle owes a yearly property tax, assessed on January 1 at state and local rates and paid with the renewal, which the calculator cannot price without the car's book value. And the dealer's documentary fee, which Kentucky does not cap. The renewal fees themselves are only ${K.usd(renew.perYear, 2)} a year. An electric car or a plug-in hybrid adds the $126 ownership fee each year, so a new 4,200 lb electric car costs ${K.usd(ev.atPurchase, 2)} at purchase and ${K.usd(renewEv.perYear, 2)} a year in fees afterwards.`,
  body: (h) => `
<h2>The usage tax and the affidavit of total consideration</h2>
<p>The ${h.src('ky:krs-138-460', '6% usage tax')} is charged on the "retail price" the first time a vehicle is titled or registered in a new owner's name. For a new car that price is the total consideration minus the trade-in allowance, as long as buyer and seller sign the notarized affidavit that dealers routinely prepare; without it, the clerk taxes 90% of the sticker price. Manufacturer and dealer rebates applied at purchase, extended warranties and service contracts are not part of the taxed amount. Kentucky has no county or city sales tax on vehicles, so the rate is the same in Louisville, Lexington and the smallest county.</p>
<h2>Used cars and private sales</h2>
<p>A car bought from a private seller is taxed the same way, on the price stated in the affidavit, with one safeguard: the ${h.src('ky:krs-138-450', 'statute')} does not accept a price lower than 50% of the gap between the book trade-in values of the car bought and of any car traded. An $18,000 used electric car bought privately costs ${K.usd(priv.atPurchase, 2)} at the clerk, the ownership fee included. A car brought from another state is checked once by the sheriff's certified inspector before titling, for $15 when the owner is an individual.</p>
<h2>Plug-in fees and the property tax bill</h2>
<p>The ownership fee covers any vehicle with plug-in charging capability, fully electric or plug-in hybrid. It started at $120 and rose to $126 on January 1, 2025, while ordinary hybrids stopped paying in 2025. The property tax is the bigger yearly cost: the Department of Revenue values each vehicle on January 1, and the clerk bills the state and local rates at renewal, so a car bought during the year is first taxed at the following renewal. ${h.a('state:indiana', 'Indiana')} uses an excise table instead, and ${h.a('state:tennessee', 'Tennessee')} has no yearly tax on a car's value.</p>`,
  faqs: [
    { q: 'Is the Kentucky usage tax charged on 90% of the sticker price?', a: 'Only when no notarized affidavit of total consideration is provided. With the affidavit, which dealers prepare as a matter of course, the 6% applies to the agreed price minus the trade-in. Without it, the clerk uses 90% of the manufacturer’s suggested retail price including options and transportation charges.' },
    { q: 'Do plug-in hybrids pay the Kentucky electric vehicle fee?', a: 'Yes. Kentucky defines an electric vehicle as any vehicle with plug-in charging capability, so plug-in hybrids pay the same ownership fee as fully electric cars, $126 a year since January 1, 2025. Hybrids that cannot be plugged in stopped paying the hybrid fee at the start of 2025.' },
    { q: 'When is the first Kentucky property tax due on a car bought mid-year?', a: 'The tax is assessed on the vehicle as of January 1 and collected by the county clerk with the registration renewal. A car bought during the year is therefore first taxed at the renewal that follows the next January 1 assessment, at the state rate plus the local rates of the place where it is registered.' },
  ],
  related: ['car-sales-tax-calculator', 'vehicle-property-tax', 'title-and-registration-fees', 'state:indiana', 'state:tennessee', 'car-ownership-cost'],
});
