import { defineState } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const r = K.calc('washington');
const v = (id: string, x: { lines: { id: string; amount: number | null }[] } = r) => x.lines.find((l) => l.id === id)?.amount ?? 0;
const taxes = v('sales-tax') + v('local-tax') + v('mv-tax');
const tabs = ['reg', 'reg-weight', 'reg-filing', 'reg-service', 'license-service', 'plate-tech'].reduce((s, id) => s + v(id), 0);
const titleItems = ['title', 'title-filing', 'title-service', 'ems', 'arbitration'].reduce((s, id) => s + v(id), 0);
const renew = K.renew('washington', 1);
const renewEv = K.renew('washington', 1, { fuel: 'ev', weightLbs: 4200 });
const spokane = K.calc('washington', { county: 'spokane-city-spokane-county' });
const lux = K.calc('washington', { price: 130000 });
const used = K.calc('washington', { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 });

export default defineState({
  slug: 'washington',
  title: 'Washington Car Tab Fees 2026: Sales Tax, RTA and Title Costs',
  description: `Washington car tab fees and taxes for 2026: 7% state tax plus local rate, 1.1% Sound Transit RTA, $40 dealer title fee. New $35,000 car in Seattle: ${K.usd(r.atPurchase)}.`,
  h1: 'Washington car tab fees and vehicle taxes',
  intro: 'In Washington the sales tax is only the first bill: around Seattle and Tacoma, a transit tax on the car’s original sticker price comes back with every set of tabs.',
  resume: `Buying a new $35,000 gasoline car from a Seattle dealer costs ${K.usd(r.atPurchase)} in taxes and fees on the day of the sale. The largest part is ${K.usd(taxes)} of sales tax: the 6.5% state rate, Seattle’s 4.05% local rate and the 0.5% motor vehicle tax added on January 1, 2026. Then come ${K.usd(titleItems)} of title fees (the $40 application fee charged on a dealer sale since October 1, 2026, filing, service, emergency medical services and the $3 arbitration fee), ${K.usd(v('plates'))} for two new plates, ${K.usd(tabs)} of first-year tabs, ${K.usd(v('rta'))} of Sound Transit RTA excise tax and the dealer’s documentary fee, capped at $200 and not taxed. The same car bought in Spokane, outside the transit district and at a lower local rate, costs ${K.usd(spokane.atPurchase)}. In the second year the Seattle owner renews for about ${K.usd(renew.perYear)}, including the city’s $50 transportation benefit district fee; an electric SUV of 4,200 lb renews for ${K.usd(renewEv.perYear)}.`,
  body: (h) => `
<h2>Three layers of tax on a purchase</h2>
<p>Washington adds three percentages to the price after any trade-in. The state takes 6.5%, the city or county adds its own rate (from 1.1% in Klickitat County to 4.2% in Edmonds and Lynnwood, according to the ${h.src('wa:dor-rates', 'Department of Revenue rate table for car dealers')}), and a separate motor vehicle sales/use tax of 0.5% applies to every car since January 1, 2026. Buyers of expensive cars meet a fourth layer: an 8% luxury tax on the price plus the trade-in above $102,000 since July 1, 2026. A $130,000 car in Seattle carries ${K.usd(v('luxury-tax', lux))} of luxury tax on top of the usual taxes. A private sale is taxed too: the licensing office collects use tax at the same combined rate when the buyer transfers the title, so an $18,000 used car bought from a neighbor in Seattle costs ${K.usd(used.atPurchase)} at the counter.</p>
<h2>How the Sound Transit car tab tax is figured</h2>
<p>If you live inside the Sound Transit district in King, Pierce or Snohomish County, your tabs include a 1.1% motor vehicle excise tax. It is not based on what the car is worth today but on its original MSRP, reduced by a fixed schedule: 100% in the first year of service, 95% in the second, 74% in the fifth and 10% from the thirteenth, as the ${h.src('wa:dol-rta', 'Department of Licensing explains')}. Year of service counts the model year as year one. Sound Transit says the 0.3% part approved in 1996 ends in 2028, which should lower the rate to 0.8%. Some cities, such as Bellevue, Kent or Everett, are split by the boundary, so two neighbors can pay different tabs.</p>
<h2>Fees that wait for the first renewal</h2>
<p>Several Washington fees are written into law as renewal fees. An electric car pays $150 of EV fees plus a $75 transportation electrification fee, and a hybrid pays $75, but only when the tabs are renewed, never at the first registration of a new car. The same goes for transportation benefit district fees, from $15 in White Salmon to $50 in Seattle, Vancouver and Lake Forest Park. The calculator therefore leaves them out of a new car’s first year and shows them from the second; on a used car they appear as due at the next tab expiration, because the car keeps its existing Washington tabs. To compare with a state where the yearly value tax is far heavier, see ${h.a('state:california', 'California')}.</p>`,
  faqs: [
    { q: 'Why did Washington charge me $100 for license plates on a new car?', a: 'A new car gets two original-issue plates, and state law sets the original issue fee at $50 per plate plus a $2 reflectivity fee per plate, so $104 for the pair. A used car bought in Washington keeps its plates, so the buyer pays nothing for plates at the title transfer.' },
    { q: 'Does Washington tax the dealer documentary fee on a car?', a: 'No. The Department of Revenue states that document service fees are not subject to sales tax; dealers pay business and occupation tax on them instead. The fee itself is capped at $200, must be disclosed in writing as negotiable and must be listed separately from the price and from government fees.' },
    { q: 'Can I avoid the RTA tax by buying the car outside the Sound Transit district?', a: 'No. The RTA excise tax follows the address where the car is registered, not where it was bought. A car bought in Spokane but registered at a Seattle address pays the tax at the first registration and at every renewal, based on its original MSRP and the state depreciation schedule.' },
  ],
  related: ['dmv-fees-calculator', 'vehicle-property-tax', 'ev-registration-fee-by-state', 'doc-fee-by-state', 'state:california', 'car-sales-tax-calculator'],
});
