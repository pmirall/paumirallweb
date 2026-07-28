import { describe, expect, it } from 'vitest'
import { computeQuoteTotals } from './quote-totals'

describe('totales de presupuesto', () => {
  it('suma base e IVA por línea', () => {
    // 2 x 100 € al 21% = 200 € base, 42 € IVA, 242 € total.
    const t = computeQuoteTotals([{ quantity: 2, unitPriceCents: 10000, taxRate: 21 }])
    expect(t.subtotalCents).toBe(20000)
    expect(t.taxCents).toBe(4200)
    expect(t.totalCents).toBe(24200)
  })

  it('mezcla tipos de IVA distintos', () => {
    const t = computeQuoteTotals([
      { quantity: 1, unitPriceCents: 10000, taxRate: 21 },
      { quantity: 1, unitPriceCents: 5000, taxRate: 0 },
    ])
    expect(t.subtotalCents).toBe(15000)
    expect(t.taxCents).toBe(2100)
    expect(t.totalCents).toBe(17100)
  })

  it('sin líneas todo es cero', () => {
    expect(computeQuoteTotals([])).toEqual({ subtotalCents: 0, taxCents: 0, totalCents: 0 })
  })

  it('redondea el IVA al céntimo por línea', () => {
    // 33,33 € al 21% = 6,9993 € → 7,00 € redondeado.
    const t = computeQuoteTotals([{ quantity: 1, unitPriceCents: 3333, taxRate: 21 }])
    expect(t.taxCents).toBe(700)
  })
})
