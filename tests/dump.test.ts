/** Dev helper: DUMP=ohio npx vitest run tests/dump.test.ts prints the engine lines for the reference car and variants. */
import { it } from 'vitest';
import { calcState, renewState } from '../src/lib/data';
const slug = process.env.DUMP;
it.skipIf(!slug)('dump', () => {
  const show = (t: string, r: { lines: { id: string; label: string; amount: number | null; range?: number[] }[]; atPurchase: number }) =>
    console.log(`\n== ${t}: atPurchase ${r.atPurchase}\n` + r.lines.map((l) => `  ${l.id} | ${l.label} | ${l.amount ?? (l.range ? l.range.join('-') : 'null')}`).join('\n'));
  show('new $35k gas car', calcState(slug!));
  show('used private $18k 2019', calcState(slug!, { condition: 'used', seller: 'private', price: 18000, modelYear: 2019 }));
  show('new EV 4200 lb', calcState(slug!, { fuel: 'ev', weightLbs: 4200 }));
  console.log('renewal y2 perYear', renewState(slug!, 1).perYear, '| EV', renewState(slug!, 1, { fuel: 'ev', weightLbs: 4200 }).perYear);
});
