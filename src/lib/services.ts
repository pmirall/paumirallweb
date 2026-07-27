/**
 * Las tres tarifas. En la fase 3 salen de la tabla `services` y se editan desde
 * el admin. Los importes van en céntimos, como todo el dinero del sistema.
 */
/** Los slugs que acepta /contacto?servicio=. Ver docs/mapa-de-rutas.md. */
export const SERVICE_SLUGS = ['retrato', 'deporte', 'video'] as const
export type ServiceSlug = (typeof SERVICE_SLUGS)[number]

export type Service = {
  index: string
  slug: ServiceSlug
  name: string
  summary: string
  bullets: string[]
  priceFromCents: number
}

export const services: Service[] = [
  {
    index: '01',
    slug: 'retrato',
    name: 'Retrato de artista',
    summary: 'Prensa, portada de disco y material para la gira.',
    bullets: ['2 horas en tu espacio', '40 fotos editadas', 'Versiones para prensa y para redes'],
    priceFromCents: 32000,
  },
  {
    index: '02',
    slug: 'deporte',
    name: 'Deporte',
    summary: 'Entrenamiento, competición o sesión de marca.',
    bullets: ['Cobertura de media jornada', '150 fotos editadas', 'Entrega en 48 horas si hay prisa'],
    priceFromCents: 45000,
  },
  {
    index: '03',
    slug: 'video',
    name: 'Vídeo',
    summary: 'Piezas cortas para lanzamientos, patrocinadores y redes.',
    bullets: ['Guion y rodaje', 'Montaje de 1 a 3 min', 'Música con licencia'],
    priceFromCents: 70000,
  },
]

export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === 'string' && (SERVICE_SLUGS as readonly string[]).includes(value)
}
