/**
 * Interpreta el nombre de una carpeta para sugerir cliente y fecha. Todo lo que
 * devuelve es una sugerencia: los nombres del Drive real tienen días de tres
 * cifras, meses trece y comas por puntos, así que nada se aplica solo.
 * Ver docs/drive-inventario.md y ADR 0012.
 */
export type FolderHint = {
  clientName: string | null
  date: string | null
  dateAmbiguous: boolean
}

/** Extrae `Nombre.AA.MM.DD` de forma tolerante. Año base para carpetas de año. */
export function parseFolderName(name: string, yearContext?: number): FolderHint {
  // Separa la parte de fecha (dígitos con puntos o comas) del nombre.
  const normalized = name.replace(/,/g, '.').trim()
  const match = normalized.match(/^(.*?)[\s.]*(\d{1,3})[.](\d{1,2})[.](\d{1,3})$/)

  if (!match) {
    return { clientName: cleanName(normalized), date: null, dateAmbiguous: false }
  }

  const [, rawName, a, b, c] = match
  const parts = [Number(a), Number(b), Number(c)]
  const iso = toIso(parts, yearContext)

  return {
    clientName: cleanName(rawName ?? ''),
    date: iso.date,
    dateAmbiguous: iso.ambiguous,
  }
}

function cleanName(raw: string): string | null {
  const name = raw.replace(/[._]+$/g, '').replace(/[._]+/g, ' ').trim()
  return name.length > 0 ? name : null
}

function toIso(
  parts: number[],
  yearContext?: number,
): { date: string | null; ambiguous: boolean } {
  const [p0, p1, p2] = parts as [number, number, number]

  // Dentro de una carpeta de año, ese año manda y el patrón es día, mes, año.
  if (yearContext) {
    const day = p0
    const month = p1
    if (isMonth(month) && isDay(day)) {
      return { date: build(yearContext, month, day), ambiguous: false }
    }
    return { date: null, ambiguous: true }
  }

  // Patrón dominante: AA.MM.DD.
  const year = 2000 + p0
  if (isMonth(p1) && isDay(p2)) {
    return { date: build(year, p1, p2), ambiguous: false }
  }
  // Mes fuera de rango: la fecha es dudosa, no se inventa.
  return { date: null, ambiguous: true }
}

function isMonth(n: number): boolean {
  return n >= 1 && n <= 12
}
function isDay(n: number): boolean {
  return n >= 1 && n <= 31
}
function build(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}
