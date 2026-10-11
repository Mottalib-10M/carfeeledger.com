/** llms.txt (RECETTE §21), generated at build from the page registry: always in sync with the site. */
import { PAGES, STATE_PAGES, stateId } from '../lib/pages';
import { SITE_URL, LAST_UPDATED, SITE_NAMES } from '../data/site-config';
import { route } from '../i18n/routes';
import { GROUPS } from '../i18n/nav';
import { bySlug } from '../lib/data';
export function GET() {
  const lines = [
    `# ${SITE_NAMES.en}`,
    '',
    `> What a car costs to buy and register in each of the 50 states and the District of Columbia: sales or excise tax with county rates, title, registration (flat, weight, value, age or horsepower formulas), value-based yearly taxes, EV and hybrid surcharges, safety and emissions inspections and dealer documentation fee caps, plus car payment and total cost of ownership. Each jurisdiction has its own data file with the official source and the date each figure was read, and its own tested engine. Calculations run in the browser. Estimates, not DMV receipts. Published by Radif Partners. Last updated ${LAST_UPDATED}.`,
    '',
    ...GROUPS.flatMap((g) => [`## ${g.label}`, ...PAGES.filter((p) => p.group === g.id).map((p) => `- [${p.nav}](${SITE_URL}${route(p.id, 'en')}): ${p.card}`), '']),
    '## Car fees by state',
    ...STATE_PAGES.map((s) => `- [${bySlug(s.slug).name}](${SITE_URL}${route(stateId(s.slug), 'en')}): ${s.intro}`),
    '',
    '## About',
    `- [How the fees are calculated](${SITE_URL}${route('method', 'en')})`,
    `- [About](${SITE_URL}${route('about', 'en')})`,
  ];
  return new Response(lines.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
