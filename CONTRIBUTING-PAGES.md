# Car Fee Ledger: how to add or update a state

Publisher: Radif Partners. English only (US site). Port of the local server: 4410.

## One state = three files

| File | Holds |
|---|---|
| `src/data/states/<ab>.json` | Every figure, its official source (URL, date read, verbatim quote), the engine parameters, the counties, the gaps and 5 to 10 distinctive sourced facts (`singular`). Shape: `StateData` in `src/lib/engine/types.ts`. |
| `tests/states/<ab>.test.ts` | Vitest: the expected amounts for the reference car (`NEW_CAR`), a used private EV (`USED_EV`), a renewal (`RENEW_1`) and the state's special rules, each checked by hand against the source. |
| `src/content/states/<slug>.ts` | The prose of the page only (`defineState`): title, description, intro, resume, body, FAQ, related. Figures quoted in prose come from the engine (`K.calc`, `K.renew`), never typed twice. |

The page itself (strip, calculator locked on the state, folded answer, facts, gaps, line-by-line table, sources) is built by `src/components/StatePage.astro`. A data file with no content file is used by the calculators and the 51-row tables but has no page; every data file must get its page.

## Engine

Most states run on the declarative engine `src/lib/engine/generic.ts` driven by `params.g` (purchase tax with caps, minimum, local rate on the first $X, trade-in credit; once-only fees; flat, weight, age or value registration; yearly add-ons with conditions; value-based fees with depreciation tables; EV, PHEV, hybrid fees; inspections; ranges for what cannot be computed). A state whose formula the generic engine cannot express gets `src/lib/engine/states/<ab>.ts` (see `ca.ts`, `ny.ts`, `nj.ts`, `tx.ts`).

## Rules

1. **Official sources only**: state DMV, revenue department, statute, administrative code. Every source carries `accessed` (date read) and a short verbatim `quote` proving the figure. Aggregators (DMV.org, sales-tax sites, news) are never a source.
2. **A doubtful figure is not published.** If a line cannot be computed exactly (county property tax, station-priced inspection, mpg-based fee), the engine returns `amount: null` with the official `range`, or nothing, and the reason goes in `gaps`; `exactness` becomes `partial`.
3. **Counties**: when local rates change the purchase tax, list the counties (or the main ones plus an `other` entry) with their official rates and the source of the rate table.
4. **Prose**: written for this state only, never adapted from another state page or another site. Titles 50 to 60 characters, descriptions 150 to 160 (with 2026 and one engine figure), a resume of 120 words or more, a body of 250 words or more in 2 to 4 `<h2>` sections, 3 or 4 FAQs of 40 to 90 words whose question appears nowhere else on the site.
5. **Self-checks before the build**: `STATE=<ab> npx vitest run tests/states` and `STATE=<slug> npx vitest run tests/content.test.ts`; `DUMP=<slug> npx vitest run tests/dump.test.ts` prints the lines.
6. **Full control**: `npm run check` (build + every factory check) must end with every check at 0.
