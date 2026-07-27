/**
 * Las fechas se guardan en UTC y se pintan en la zona horaria de Madrid. Una
 * sola función de formato. Ver docs/convenciones.md.
 */
const MADRID = 'Europe/Madrid'

export function formatDate(value: string | Date | null): string {
  if (!value) return '—'
  const date = typeof value === 'string' ? new Date(value) : value
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: MADRID,
  }).format(date)
}

/** Fecha de hoy en formato ISO corto, para comparar con columnas `date`. */
export function todayIso(now: Date): string {
  return now.toISOString().slice(0, 10)
}
