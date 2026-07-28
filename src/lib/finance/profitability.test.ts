import { describe, expect, it } from 'vitest'
import { aggregateByCategory, computeProfitability } from './profitability'

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

describe('agregado por servicio', () => {
  it('suma importe, gastos y horas por categoría', () => {
    const out = aggregateByCategory([
      { category: 'sport', budgetCents: 45000, expensesCents: 5000, minutes: 390 },
      { category: 'sport', budgetCents: 30000, expensesCents: 0, minutes: 120 },
      { category: 'artist', budgetCents: 32000, expensesCents: 0, minutes: 360 },
    ])
    const sport = out.find((c) => c.category === 'sport')!
    expect(sport.budgetCents).toBe(75000)
    expect(sport.expensesCents).toBe(5000)
    expect(sport.minutes).toBe(510)
    expect(sport.jobs).toBe(2)
    expect(out).toHaveLength(2)
  })

  it('un importe nulo no rompe la suma del servicio', () => {
    const out = aggregateByCategory([
      { category: 'video', budgetCents: null, expensesCents: 1000, minutes: 60 },
      { category: 'video', budgetCents: 70000, expensesCents: 0, minutes: 120 },
    ])
    expect(out[0]?.budgetCents).toBe(70000)
    expect(out[0]?.jobs).toBe(2)
  })
})
