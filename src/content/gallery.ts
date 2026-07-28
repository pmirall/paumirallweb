/** Textos de la zona de cliente. En español, cálidos: quien los lee ha pagado. */
export const gate = {
  eyebrow: 'Tu galería',
  enterPin: 'Escribe tu PIN',
  pinHint: 'Son los cuatro dígitos que te enviamos por correo.',
  submit: 'Entrar',
  wrongPin: 'El PIN no es correcto.',
  attemptsLeft: (n: number) => `Te ${n === 1 ? 'queda' : 'quedan'} ${n} ${n === 1 ? 'intento' : 'intentos'}.`,
  blocked: 'Demasiados intentos. Prueba de nuevo dentro de un rato.',
  expiredTitle: 'Esta galería ha caducado',
  expiredBody:
    'El enlace ya no está activo. Escríbeme y te la reabro sin problema.',
  contact: 'paumirallstudio@gmail.com',
} as const

export const galleryView = {
  eyebrow: 'Entrega',
  downloadAll: 'Descargar todo',
  quality: 'Calidad',
  qualityWeb: 'Web',
  qualityHigh: 'Alta resolución',
  watermarkNotice:
    'Las fotos llevan marca de agua hasta que la factura esté pagada. La descarga en alta resolución se activa entonces.',
  empty: 'Todavía no hay fotos en esta galería.',
  photoAlt: 'Foto de la galería',
} as const
