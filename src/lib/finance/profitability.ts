/**
 * Rentabilidad de un encargo: cuánto se gana de verdad por hora. Cruza el importe
 * con las horas dedicadas y, cuando los haya, los gastos. Todo en céntimos y
 * enteros hasta el último momento; nada de flotantes para el dinero. Ver
 * docs/plan-de-ejecucion.md, fase 5.
 */
export interface Profitability {
  /** Importe del encargo menos gastos, en céntimos. Null si no hay importe. */
  netCents: number | null
  /** Minutos dedicados. */
  minutes: number
  /** Euros por hora sobre el neto. Null si faltan importe u horas. */
  eurosPerHour: number | null
}

export function computeProfitability(
  budgetCents: number | null,
  minutes: number,
  expensesCents = 0,
): Profitability {
  const netCents = budgetCents == null ? null : budgetCents - expensesCents
  let eurosPerHour: number | null = null
  if (netCents != null && minutes > 0) {
    // Céntimos por minuto, pasado a euros por hora: (netCents/100) / (minutes/60).
    eurosPerHour = (netCents / 100 / minutes) * 60
  }
  return { netCents, minutes, eurosPerHour }
}
