import { describe, expect, it } from 'vitest'
import { computeProfitability } from './profitability'

describe('rentabilidad de un encargo', () => {
  it('euros por hora sobre el importe y las horas', () => {
    // 600 € en 6 horas (360 min) son 100 €/h.
    const p = computeProfitability(60000, 360)
    expect(p.netCents).toBe(60000)
    expect(p.eurosPerHour).toBeCloseTo(100)
  })

  it('los gastos bajan el neto y el euros por hora', () => {
    // 600 € menos 120 € de gastos, en 6 horas: 480 € / 6 = 80 €/h.
    const p = computeProfitability(60000, 360, 12000)
    expect(p.netCents).toBe(48000)
    expect(p.eurosPerHour).toBeCloseTo(80)
  })

  it('sin importe no hay número, no un cero engañoso', () => {
    const p = computeProfitability(null, 360)
    expect(p.netCents).toBeNull()
    expect(p.eurosPerHour).toBeNull()
  })

  it('sin horas no se divide entre cero', () => {
    const p = computeProfitability(60000, 0)
    expect(p.eurosPerHour).toBeNull()
  })
})
