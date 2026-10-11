/** Fixed-rate installment loan (simple-interest amortization, the method of U.S. auto loans). */
export function payment(principal: number, apr: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = apr / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}
export interface LoanResult { amountFinanced: number; monthly: number; totalPaid: number; interest: number; firstYearInterest: number }
export function loan(o: { price: number; down: number; tradeIn: number; feesFinanced: number; apr: number; months: number }): LoanResult {
  const amountFinanced = Math.max(0, o.price + o.feesFinanced - o.down - o.tradeIn);
  const monthly = payment(amountFinanced, o.apr, o.months);
  const totalPaid = monthly * o.months;
  let bal = amountFinanced, fy = 0;
  for (let k = 0; k < Math.min(12, o.months); k++) { const i = bal * (o.apr / 12); fy += i; bal -= monthly - i; }
  return { amountFinanced, monthly, totalPaid, interest: totalPaid - amountFinanced, firstYearInterest: fy };
}
/** Balance left after k payments. */
export function balanceAfter(principal: number, apr: number, months: number, k: number): number {
  const m = payment(principal, apr, months); const r = apr / 12;
  if (r === 0) return Math.max(0, principal - m * k);
  return Math.max(0, principal * Math.pow(1 + r, k) - m * ((Math.pow(1 + r, k) - 1) / r));
}
