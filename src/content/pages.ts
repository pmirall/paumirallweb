/**
 * Textos de las páginas públicas. En la fase 3, `sobre-mi` y las tres legales
 * pasan a la tabla `pages` y se editan desde el admin. La forma no cambia.
 */
export const archive = {
  eyebrow: 'Archivo',
  title: 'Trabajo',
  lead: 'Retrato de artistas y fotografía de deporte, entre escenario y pista.',
  allLabel: 'Todo',
  emptyTitle: 'Todavía no hay nada aquí',
  emptyBody: 'Esta categoría está vacía por ahora. Prueba con otra o escríbeme y lo hablamos.',
  filtersLabel: 'Filtrar por categoría',
} as const

export const projectPage = {
  clientLabel: 'Cliente',
  yearLabel: 'Año',
  categoryLabel: 'Categoría',
  galleryNote: 'Galería del proyecto',
  siblingsLabel: 'Otros proyectos de la misma categoría',
} as const

export const servicesPage = {
  eyebrow: 'Servicios',
  title: 'Cómo trabajo',
  lead: 'Tres formatos. Si tu proyecto no encaja en ninguno, escríbeme y lo hablamos.',
  fallbackTitle: '¿Nada de esto encaja?',
  fallbackBody:
    'Cuéntame qué necesitas y te digo si puedo ayudarte. Si no puedo, te digo quién.',
  bookLabel: 'Reservar',
  fallbackCta: 'Escríbeme',
} as const

export const aboutPage = {
  eyebrow: 'Sobre mí',
  title: 'Pau Miralles',
  body: [
    'Trabajo solo, así que hablas conmigo de principio a fin. Nadie te pasa a otro departamento porque no hay otro departamento.',
    'Vengo del deporte y sigo entrenando. Eso ayuda más de lo que parece: sé dónde ponerme para no molestar y sé cuándo va a pasar algo.',
    'Vivo en Palma de Mallorca y viajo a donde estés trabajando.',
  ],
  chips: ['Palma de Mallorca', 'Sony A7', 'Viajo'],
  portraitNote: 'Retrato de Pau',
} as const

export const contactPage = {
  eyebrow: 'Contacto',
  title: 'Cuéntame qué necesitas',
  lead: 'Escríbeme con la fecha y el sitio. Te contesto con un presupuesto cerrado.',
  fields: {
    name: 'Tu nombre',
    email: 'Tu correo',
    phone: 'Teléfono, si prefieres que te llame',
    service: 'Qué necesitas',
    message: 'Cuéntame',
  },
  messageHint: 'Fecha, sitio y qué quieres conseguir. Con eso ya puedo darte un precio.',
  consentBefore: 'He leído la ',
  consentLink: 'política de privacidad',
  consentAfter: ' y acepto que me contestes por aquí.',
  submit: 'Enviar',
  submitting: 'Enviando…',
  trapLabel: 'No rellenes esto',
  serviceDefault: 'Todavía no lo sé',
  errors: {
    name: 'Dime cómo te llamas.',
    email: 'Ese correo no parece válido.',
    message: 'Cuéntame algo más, aunque sea una línea.',
    consent: 'Necesito que lo aceptes para poder contestarte.',
    generic: 'No se ha podido enviar. Prueba otra vez o escríbeme al correo.',
  },
} as const

export const thanksPage = {
  eyebrow: 'Recibido',
  title: 'Gracias, ya lo tengo',
  body: 'Te contesto en menos de 24 horas. Si tienes prisa, llámame y lo hablamos ahora.',
  back: 'Volver al inicio',
} as const

export const legalCommon = {
  eyebrow: 'Legal',
  provisionalNotice:
    'Texto provisional. Tiene que revisarlo una asesoría antes del lanzamiento.',
} as const

export const notFoundPage = {
  eyebrow: 'Error 404',
  title: 'Esta página no existe',
  body: 'Puede que la hayas escrito mal o que ya no esté. El trabajo sigue donde estaba.',
  home: 'Volver al inicio',
  work: 'Ver el trabajo',
} as const

/** Textos legales provisionales. Bloquean el lanzamiento hasta que los revise
 *  una asesoría. Ver docs/seguridad-y-privacidad.md. */
export const legalPages = {
  'aviso-legal': {
    title: 'Aviso legal',
    provisional: true,
    body: [
      'Titular del sitio: Pau Miralles. Contacto: paumirallstudio@gmail.com.',
      'Este texto es provisional y tiene que revisarlo una asesoría antes del lanzamiento.',
    ],
  },
  privacidad: {
    title: 'Privacidad',
    provisional: true,
    body: [
      'Los datos que envías por el formulario se usan solo para contestarte y preparar un presupuesto. No se ceden a nadie.',
      'Puedes pedir que se borren escribiendo a paumirallstudio@gmail.com.',
      'Este texto es provisional y tiene que revisarlo una asesoría antes del lanzamiento.',
    ],
  },
  cookies: {
    title: 'Cookies',
    provisional: true,
    body: [
      'Este sitio no usa cookies de seguimiento ni analítica que identifique a nadie, así que no hay banner de consentimiento.',
      'Las únicas cookies son técnicas: la sesión del panel de administración y la de las galerías privadas. Sin ellas el servicio no funciona.',
      'Este texto es provisional y tiene que revisarlo una asesoría antes del lanzamiento.',
    ],
  },
} as const

export type LegalSlug = keyof typeof legalPages
