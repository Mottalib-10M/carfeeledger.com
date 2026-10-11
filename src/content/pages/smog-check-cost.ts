import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const st = K.st;
const emisStates = st.which((S) => S.inspection === 'emissions' || S.inspection === 'both');
const ca = K.data('california');
const sm = (ca.params as { smog: { abatement: number; transferFee: number; certificate: number; exemptRenewalAge: number; transferMaxAge: number } }).smog;

export default definePage({
  id: 'smog-check-cost',
  group: 'owning',
  order: 25,
  slug: 'smog-check-cost',
  nav: 'Smog check cost',
  card: 'California’s smog check rules and fees, and the emissions test of every other state that has one.',
  title: 'Smog Check Cost 2026: Fees, Exemptions and Who Must Test',
  description: `Smog check cost in 2026: California's $${sm.certificate.toFixed(2)} certificate fee, $${sm.abatement} abatement fee and exemptions, and the emissions tests of the other states, by county and model year.`,
  h1: 'Smog check cost and rules',
  intro: '"Smog check" is California’s name for its emissions test; other states call it an emissions or I/M inspection.',
  resume: `In California, a gasoline or hybrid car skips the smog check for its first ${sm.exemptRenewalAge} model years and pays a $${sm.abatement} smog abatement fee with each renewal instead; after that it needs a smog check every two years, and at a change of ownership if it is more than ${sm.transferMaxAge + 1} model years old (newer cars pay an $${sm.transferFee} smog transfer fee). The state does not set the price of the test: the Bureau of Automotive Repair says stations price it freely, but every certificate carries an $${sm.certificate.toFixed(2)} state fee. Electric cars are exempt. Outside California, ${emisStates.length} jurisdictions in this site's data run an emissions program in all or part of their territory${emisStates.length ? ` (${K.listOf(emisStates)})` : ''}, usually around their largest metro areas, with their own exemptions for new cars. The calculator shows which lines apply to your car and county.`,
  faqs: [
    { q: 'How much does a smog check cost in California?', a: `The price is set by each station; the Bureau of Automotive Repair does not regulate it. What is fixed is the $${sm.certificate.toFixed(2)} certificate fee the station must charge for the state. Prices therefore vary by area and station type, and shopping around is the advice the Bureau itself gives.` },
    { q: 'When does a new car need its first smog check in California?', a: `Add ${sm.exemptRenewalAge} to the model year: a 2020 car needs its first smog check for the registration renewal of 2028. Until then a $${sm.abatement} smog abatement fee is paid with each renewal. At a sale, cars four model years old or newer pay an $${sm.transferFee} smog transfer fee instead of a check.` },
    { q: 'Do I need a smog check to sell my car?', a: 'In California the seller must provide a valid smog certificate for most gasoline cars more than four model years old; for newer cars the buyer pays the transfer fee instead. Georgia similarly requires sellers inside its 13-county test area to have a passing emissions test at the time of sale.' },
    { q: 'Are diesel and hybrid cars smog checked?', a: 'In California, hybrids follow the gasoline rules, and diesel vehicles of model year 1998 and newer are tested, with no model-year exemption for diesels. Electric vehicles are exempt. Other states set their own rules for each fuel type; the state pages list them.' },
  ],
  body: (h) => `
<h2>California's three smog charges</h2>
<p>A California owner meets three different charges over the life of a gasoline car. The <strong>smog abatement fee</strong> is paid to the DMV with the renewal during the first eight model years, when no test is required. The <strong>smog transfer fee</strong> is paid by a buyer of a car four model years old or newer, in place of a certificate. The <strong>smog check</strong> itself is paid to a station every two years after the eighth model year and at most sales of older cars, and it includes the state's certificate fee. The ${h.a('state:california', 'California page')} shows all three in the calculator.</p>
<h2>Emissions tests elsewhere</h2>
<p>Most other programs test every year rather than every two years, cover only some counties, and exempt the newest model years. In Georgia, for example, 13 counties around Atlanta test cars yearly, and the three newest model years are exempt. Texas tests in 17 counties and collects a $2.75 state share at registration. The ${h.a('vehicle-inspection-cost', 'inspection cost page')} lists every state, safety inspections included.</p>
<h2>What a failed test costs</h2>
<p>A failed test means repairs and a retest; states often cap the retest price or offer a repair waiver above a spending limit. These amounts depend on the program and are not added by the calculator. The renewal cannot be completed until the car passes or obtains a waiver, so a failed test can also bring a late penalty.</p>
<h2>Keeping the yearly bill in view</h2>
<p>An emissions test adds to the registration renewal. The ${h.a('license-plate-renewal', 'renewal page')} shows the total yearly DMV bill, and the ${h.a('car-ownership-cost', 'ownership cost calculator')} spreads a biennial test over the years.</p>`,
  tool: 'inspection',
  state: 'california',
  related: ['vehicle-inspection-cost', 'license-plate-renewal', 'state:california', 'state:georgia', 'state:texas', 'dmv-fees-calculator'],
  sources: ['ca:bar-faq', 'ca:dmv-fees', 'ca:hsc-44060', 'ga:caf', 'tx:txdmv-reg'],
});
