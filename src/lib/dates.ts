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

/** Minutos como "2 h 30 min", para el registro de horas. */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h} h`
  return `${h} h ${m} min`
}
