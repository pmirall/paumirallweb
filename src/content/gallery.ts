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
  openPhoto: 'Ver foto',
  viewerLabel: 'Visor de fotos',
  close: 'Cerrar',
  previous: 'Foto anterior',
  next: 'Foto siguiente',
  markFavorite: 'Marcar como favorita',
  navGallery: 'Entrega',
  navJob: 'Tu encargo',
  navVideo: 'Vídeo',
  navInvoice: 'Factura',
  unmarkFavorite: 'Quitar de favoritas',
  selectionTitle: 'Tu selección',
  selectionCount: (n: number) =>
    n === 0 ? 'Aún no has elegido ninguna' : `${n} ${n === 1 ? 'foto elegida' : 'fotos elegidas'}`,
  selectionHint: 'Marca las que quieres que edite y envíamelas cuando estén.',
  selectionSend: 'Enviar selección',
  selectionSending: 'Enviando…',
  selectionDone: (n: number) =>
    `Recibido. Me llegan ${n === 1 ? 'tu foto' : `tus ${n} fotos`} y me pongo con ellas.`,
  selectionError: 'No se ha podido guardar. Vuelve a intentarlo en un momento.',
} as const

export const videoView = {
  eyebrow: 'Vídeo',
  soon: 'El vídeo se reproduce aquí en cuanto esté montado y subido.',
} as const

export const invoiceView = {
  eyebrow: 'Factura',
  total: 'Total',
  pending: 'Pendiente de pago',
  paid: 'Pagada',
  paidBody: 'Recibido y todo en orden. Gracias.',
  pending1: 'Queda por pagar',
  pdf: 'Descargar la factura',
  dueLabel: 'Vence el',
  howToPay:
    'Puedes pagar en efectivo, por transferencia o con tarjeta cuando quedemos. Escríbeme y cerramos el detalle.',
  contact: 'paumirallstudio@gmail.com',
} as const

export const jobView = {
  eyebrow: 'Tu encargo',
  timelineTitle: 'Cómo va',
  shoot: 'Rodaje',
  due: 'Entrega prevista',
  delivered: 'Entregado',
  pendingDelivery: 'En preparación',
  deliverablesTitle: 'Lo acordado',
  deliverablesEmpty: 'Todavía no hay nada anotado aquí.',
  delivered1: 'Listo',
  pending1: 'En camino',
  kinds: {
    photos: 'Fotos',
    video: 'Vídeo',
    reel: 'Reel',
    raw: 'Archivos en bruto',
  },
} as const
