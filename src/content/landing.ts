/**
 * Textos de la portada. Salen de docs/contenido-de-lanzamiento.md, que es el
 * texto aprobado. Nada de esto se escribe dentro de un componente.
 */
export const nav = [
  { label: 'Trabajo', href: '/trabajo' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'Sobre mí', href: '/sobre-mi' },
  { label: 'Contacto', href: '/contacto' },
] as const

export const hero = {
  marquee: 'Fotógrafo y videógrafo · Retrato de artistas · Fotografía de deporte · Vídeo · ',
  name: 'Pau Miralles',
  descriptor: 'Fotógrafo y videógrafo',
  lead: 'Retrato de artistas y fotografía de deporte. Vivo en Palma de Mallorca y viajo a donde estés trabajando.',
  ctaWork: { label: 'Ver el trabajo', href: '/trabajo' },
  ctaBook: { label: 'Reservar sesión', href: '/contacto' },
  sheetLabel: 'Hoja de contactos',
  scrollCue: 'Desliza',
  platePlaceholder: 'Foto de portada, a todo el ancho',
} as const

export const strip = ['Artista', 'Deporte', 'Vídeo', 'Palma de Mallorca', 'Viajo'] as const

export const work = {
  eyebrow: 'Selección',
  title: 'Lo último',
  lead: 'Tres trabajos de los dos últimos años, entre escenario y pista.',
  allLabel: 'Todo el trabajo',
  allHref: '/trabajo',
} as const

export const services = {
  eyebrow: 'Servicios',
  title: 'Cómo trabajo',
  lead: 'Tres formatos. Si tu proyecto no encaja en ninguno, escríbeme y lo hablamos.',
  fromLabel: 'Desde',
  currency: 'EUR',
} as const

export const about = {
  eyebrow: 'Sobre mí',
  title: 'Pau Miralles',
  lead: 'Trabajo solo, así que hablas conmigo de principio a fin. Vengo del deporte y sigo entrenando, que ayuda a saber dónde ponerse.',
  chips: ['Palma de Mallorca', 'Sony A7', 'Viajo'],
  more: { label: 'Seguir leyendo', href: '/sobre-mi' },
  platePlaceholder: 'Retrato de Pau',
} as const

export const contact = {
  eyebrow: 'Contacto',
  title: 'Cuéntame qué necesitas',
  lead: 'Escríbeme con la fecha y el sitio. Te contesto con un presupuesto cerrado.',
  cta: { label: 'Reservar sesión', href: '/contacto' },
  rows: [
    { label: 'Correo', value: 'paumirallstudio@gmail.com', href: 'mailto:paumirallstudio@gmail.com' },
    { label: 'Teléfono', value: '+34 676 779 771', href: 'tel:+34676779771' },
    { label: 'Instagram', value: '@paumirall_studio', href: 'https://instagram.com/paumirall_studio' },
  ],
} as const

export const footer = {
  place: 'Palma de Mallorca · Viajo',
  legal: [
    { label: 'Aviso legal', href: '/legal/aviso-legal' },
    { label: 'Privacidad', href: '/legal/privacidad' },
    { label: 'Cookies', href: '/legal/cookies' },
  ],
} as const
