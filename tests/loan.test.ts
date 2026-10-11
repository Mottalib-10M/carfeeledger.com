import { describe, expect, it } from 'vitest';
import { balanceAfter, loan, payment } from '../src/lib/engine/loan';
describe('auto loan', () => {
  it('$30,000 at 6% for 60 months = $579.98 a month (standard amortization)', () => {
    expect(Math.round(payment(30000, 0.06, 60) * 100) / 100).toBe(579.98);
  });
  it('zero APR divides evenly', () => { expect(payment(24000, 0, 48)).toBe(500); });
  it('amount financed = price + fees - down - trade-in', () => {
    const r = loan({ price: 35000, down: 5000, tradeIn: 3000, feesFinanced: 2500, apr: 0.07, months: 72 });
    expect(r.amountFinanced).toBe(29500);
    expect(r.interest).toBeGreaterThan(0);
    expect(Math.round(balanceAfter(29500, 0.07, 72, 72))).toBe(0);
  });
});
