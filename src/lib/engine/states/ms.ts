import type { FeeLine, StateEngine } from '../types';
import { age, forTransaction, line, taxableBase } from '../helpers';

type P = {
  tax: { rate: number; tradeInCredit: boolean; docFeeTaxable: boolean; privateExemptAge: number };
  title: number;
  privilege: number;
  reg: { tagAndDecals: number; decalsOnly: number };
  ev: { evBase: number; hybridBase: number };
};

/**
 * Mississippi: 5% sales tax on a dealer sale (net of trade-in); a private (casual) sale is taxed at 5% of the
 * DOR assessment-schedule value, not the price, and is exempt when the vehicle is 10 years old or more.
 * Yearly: $15 privilege tax + registration fee ($14 with a new tag, $12.75 decals only), CPI-indexed EV/hybrid tax,
 * county and city ad valorem tax (millage set locally).
 */
const compute: StateEngine = (i, d) => {
  const p = d.params as unknown as P;
  const lines: FeeLine[] = [];
  const notes: string[] = [];
  const purchase = i.transaction === 'purchase';
  if (purchase) {
    if (i.seller === 'dealer') {
      lines.push(line({ id: 'sales-tax', label: 'Sales tax (5% of the net price)', kind: 'tax', amount: taxableBase(i, p.tax) * p.tax.rate, when: 'once', source: 'mv-faq', note: 'Price after dealer discounts and trade-in; manufacturer rebates are not deducted.' }));
    } else if (age(i) >= p.tax.privateExemptAge) {
      lines.push(line({ id: 'sales-tax', label: 'Casual sale tax (vehicle 10 years old or more: exempt)', kind: 'tax', amount: 0, when: 'once', source: 'biz-faq' }));
    } else {
      lines.push(line({ id: 'sales-tax', label: 'Casual sale tax (5% of the DOR assessment value)', kind: 'tax', amount: null, when: 'once', source: 'biz-faq', note: 'Charged by the tax collector on a pre-determined value for that model, not on the price paid.' }));
      notes.push('Private sale: the 5% tax is computed on the Department of Revenue assessment value of the model, so the price on the bill of sale does not set the tax.');
    }
    lines.push(line({ id: 'title', label: 'Certificate of title', kind: 'title', amount: p.title, when: 'once', source: 'titles' }));
  }
  lines.push(line({ id: 'privilege', label: 'Highway privilege tax (private passenger vehicle)', kind: 'registration', amount: p.privilege, when: 'cycle', source: 'code-2026' }));
  lines.push(line({ id: 'reg', label: purchase ? 'Registration fee (new tag and decals)' : 'Registration fee (decals)', kind: 'registration', amount: purchase ? p.reg.tagAndDecals : p.reg.decalsOnly, when: 'cycle', source: 'mv-faq', note: '$5 tag and decals or $3.75 decals, $4 Trauma Care Systems Fund, $5 additional registration fee.' }));
  if (i.fuel === 'ev' || i.fuel === 'hybrid' || i.fuel === 'phev') {
    const base = i.fuel === 'ev' ? p.ev.evBase : p.ev.hybridBase;
    lines.push(line({ id: 'ev', label: i.fuel === 'ev' ? 'Electric vehicle tax (indexed every July 1)' : 'Hybrid vehicle tax (indexed every July 1)', kind: 'ev', amount: null, when: 'cycle', source: i.fuel === 'ev' ? 'ev-law' : 'mv-faq', note: `$${base} in the law, raised every July 1 by the prior year's inflation rate; ask your tax collector for the current amount.` }));
  }
  lines.push(line({ id: 'ad-valorem', label: 'County and city ad valorem tax on the vehicle', kind: 'value', amount: null, when: 'cycle', source: 'ad-valorem', note: '30% of the MSRP, depreciated over 10 years, times your local millage, less the legislative tag credit.' }));
  return { lines: forTransaction(i, lines), notes };
};
export default compute;
