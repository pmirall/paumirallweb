/**
 * Totales de un presupuesto a partir de sus líneas. Todo en céntimos y enteros:
 * el impuesto de cada línea se redondea al céntimo antes de sumar, para que el
 * total cuadre con lo que ve el cliente línea a línea y no arrastre decimales.
 */
export interface QuoteLineInput {
  quantity: number
  unitPriceCents: number
  taxRate: number
}

export interface QuoteTotals {
  subtotalCents: number
  taxCents: number
  totalCents: number
}

export function computeQuoteTotals(lines: QuoteLineInput[]): QuoteTotals {
  let subtotalCents = 0
  let taxCents = 0
  for (const line of lines) {
    const base = line.quantity * line.unitPriceCents
    subtotalCents += base
    taxCents += Math.round((base * line.taxRate) / 100)
  }
  return { subtotalCents, taxCents, totalCents: subtotalCents + taxCents }
}
