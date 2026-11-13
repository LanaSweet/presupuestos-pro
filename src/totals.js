// Pure tax calculations (spec "Reglas de negocio", research R4).
import { roundHalfUp } from './money.js';

export const VAT_RATES = [21, 10, 4, 0];

/** Line amount in cents = roundHalfUp(quantity[hundredths] × unitPrice[thousandths] / 1000). */
export function lineAmount(line) {
  if (!Number.isInteger(line.quantity) || !Number.isInteger(line.unitPrice)) return 0;
  return roundHalfUp(line.quantity * line.unitPrice, 1000);
}

/** Withholding only applies to business clients; none when individual or not chosen yet. */
export function effectiveWithholding(quote) {
  return quote.client.type === 'business' ? quote.withholding : 0;
}

export function computeTotals(quote) {
  const lineAmounts = quote.lines.map(lineAmount);
  const base = lineAmounts.reduce((sum, amount) => sum + amount, 0);

  const baseByRate = new Map();
  quote.lines.forEach((line, index) => {
    baseByRate.set(line.vatRate, (baseByRate.get(line.vatRate) || 0) + lineAmounts[index]);
  });
  const vatByRate = VAT_RATES.filter((rate) => baseByRate.has(rate)).map((rate) => ({
    rate,
    amount: roundHalfUp(baseByRate.get(rate) * rate, 100),
  }));

  const withholdingRate = effectiveWithholding(quote);
  const withholdingAmount = roundHalfUp(base * withholdingRate, 100);
  const vatTotal = vatByRate.reduce((sum, vat) => sum + vat.amount, 0);

  return {
    lineAmounts,
    base,
    vatByRate,
    withholdingRate,
    withholdingAmount,
    total: base + vatTotal - withholdingAmount,
  };
}
