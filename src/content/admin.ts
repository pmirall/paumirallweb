/** Etiquetas del panel de administración. Ver docs/contenido-y-seo.md. */
export const adminLogin = {
  eyebrow: 'Administración',
  title: 'Entra a tu panel',
  body: 'El acceso está restringido a tu cuenta de Google.',
  google: 'Entrar con Google',
  dev: 'Entrar en modo desarrollo',
} as const

export const adminNav = [
  { label: 'Panel', href: '/admin' },
  { label: 'Encargos', href: '/admin/encargos' },
  { label: 'Clientes', href: '/admin/clientes' },
  { label: 'Consultas', href: '/admin/leads' },
  { label: 'Drive', href: '/admin/drive' },
] as const

export const adminChrome = {
  brand: 'Pau Miralles',
  brandTag: 'Administración',
  signOut: 'Salir',
  devBadge: 'Modo desarrollo',
} as const

export const dashboard = {
  title: 'Panel',
  subtitle: 'Lo que tienes abierto ahora mismo.',
  metrics: {
    activeJobs: 'Encargos activos',
    pendingDeliveries: 'Entregas pendientes',
    upcomingShoots: 'Próximos rodajes',
    newLeads: 'Consultas sin leer',
  },
  activeTitle: 'Encargos activos',
  activeEmpty: 'No tienes encargos abiertos. Cuando conviertas una consulta, aparecerá aquí.',
  upcomingTitle: 'Próximos rodajes',
  upcomingEmpty: 'No hay rodajes con fecha por delante.',
  leadsTitle: 'Últimas consultas',
  leadsEmpty: 'La bandeja está vacía.',
  seeAll: 'Ver todo',
} as const

/** Los estados de encargo, traducidos para las etiquetas del admin. */
export const jobStatusLabels: Record<string, string> = {
  draft: 'Borrador',
  confirmed: 'Confirmado',
  shot: 'Rodado',
  editing: 'Editando',
  delivered: 'Entregado',
  closed: 'Cerrado',
  cancelled: 'Cancelado',
}

export const jobCategoryLabels: Record<string, string> = {
  artist: 'Artista',
  sport: 'Deporte',
  video: 'Vídeo',
}

export const leadStatusLabels: Record<string, string> = {
  new: 'Nueva',
  read: 'Leída',
  replied: 'Respondida',
  converted: 'Convertida',
  discarded: 'Descartada',
}

export const jobsPage = {
  title: 'Encargos',
  subtitle: 'Todo el trabajo, abierto y cerrado.',
  newJob: 'Nuevo encargo',
  filterAll: 'Todos',
  empty: 'Todavía no hay encargos. Convierte una consulta o crea uno a mano.',
  columns: {
    code: 'Código',
    title: 'Encargo',
    client: 'Cliente',
    category: 'Tipo',
    status: 'Estado',
    shoot: 'Rodaje',
    budget: 'Presupuesto',
  },
} as const

export const clientsPage = {
  title: 'Clientes',
  subtitle: 'Quién te ha contratado.',
  empty: 'Aún no hay clientes. Aparecen al convertir una consulta o crear un encargo.',
  columns: { name: 'Nombre', company: 'Empresa', email: 'Correo', jobs: 'Encargos' },
  detailSubtitle: 'Historial y facturación acumulada.',
  billedLabel: 'Presupuestado acumulado',
  jobsTitle: 'Encargos',
  noJobs: 'Este cliente todavía no tiene encargos.',
} as const

export const leadsPage = {
  title: 'Consultas',
  subtitle: 'Lo que llega por el formulario.',
  empty: 'La bandeja está vacía.',
  columns: { name: 'Nombre', service: 'Servicio', status: 'Estado', date: 'Fecha' },
  detailSubtitle: 'Convierte la consulta en un encargo cuando estés listo.',
  messageLabel: 'Mensaje',
  contactLabel: 'Contacto',
  convert: 'Convertir en encargo',
  convertedNotice: 'Esta consulta ya se convirtió en un encargo.',
  goToJob: 'Ver el encargo',
} as const

export const jobDetail = {
  tabs: {
    resumen: 'Resumen',
    archivos: 'Archivos',
    galeria: 'Galería',
    dinero: 'Dinero',
    notas: 'Notas',
  },
  clientLabel: 'Cliente',
  shootLabel: 'Rodaje',
  dueLabel: 'Entrega comprometida',
  deliveredLabel: 'Entregado el',
  budgetLabel: 'Presupuesto',
  statusLabel: 'Estado',
  changeStatus: 'Cambiar estado',
  statusPending: 'Hay entregables sin marcar, así que no se puede entregar todavía.',
  deliverablesTitle: 'Entregables',
  deliverablesEmpty: 'Este encargo no tiene entregables anotados.',
  deliverableDone: 'Entregado',
  markDelivered: 'Marcar entregado',
  markPending: 'Marcar pendiente',
  notesTitle: 'Notas',
  notesPlaceholder: 'Lo que quieras recordar de este encargo.',
  notesSave: 'Guardar notas',
  timeTitle: 'Horas',
  timeTotal: 'Tiempo dedicado',
  timeEmpty: 'Todavía no has anotado horas en este encargo.',
  timeAdd: 'Anotar',
  timeDate: 'Día',
  timeMinutes: 'Minutos',
  timeKind: 'Qué',
  timeNote: 'Nota',
  timeKinds: { shoot: 'Rodaje', edit: 'Edición', travel: 'Viaje', admin: 'Gestión' },
  filesLaterr: 'La carpeta de Drive vinculada llega en la fase 2.',
  galleryLater: 'El enlace de galería, el PIN y los favoritos llegan en la fase 4.',
  moneyLater: 'Presupuesto, factura, gastos y rentabilidad llegan en la fase 5.',
} as const

export const newJobPage = {
  title: 'Nuevo encargo',
  subtitle: 'Alta manual de un encargo en borrador.',
  clientField: 'Cliente',
  titleField: 'Título interno',
  categoryField: 'Tipo',
  shootField: 'Fecha de rodaje',
  budgetField: 'Presupuesto sin IVA, en euros',
  submit: 'Crear encargo',
  noClients: 'Primero necesitas un cliente. Convierte una consulta o crea uno.',
  errorClient: 'Elige un cliente.',
  errorTitle: 'Ponle un título, aunque sea provisional.',
} as const

export const drivePage = {
  title: 'Drive',
  subtitle: 'Estado de la sincronización con tus carpetas.',
  runSync: 'Sincronizar ahora',
  lastRun: 'Última pasada',
  never: 'todavía no se ha sincronizado',
  foldersSeen: 'Carpetas vistas',
  foldersNew: 'Carpetas nuevas',
  filesNew: 'Archivos nuevos',
  errors: 'Errores',
  queueLink: 'Ir a la cola de enriquecimiento',
  fakeNotice: 'Sincronización de desarrollo contra un Drive de prueba. La real llega con las credenciales de Google.',
} as const

export const queuePage = {
  title: 'Cola de enriquecimiento',
  subtitle: 'Una carpeta por fila. Di qué es cada una.',
  empty: 'No hay carpetas pendientes. Sincroniza para detectar nuevas.',
  filterPending: 'Pendientes',
  filterAll: 'Todas',
  columns: {
    folder: 'Carpeta',
    files: 'Archivos',
    client: 'Cliente',
    date: 'Fecha',
    category: 'Categoría',
    status: 'Estado',
  },
  ambiguous: 'fecha dudosa',
  noDate: 'sin fecha',
  publishLabel: 'Publicar en el portfolio',
  enrich: 'Crear encargo',
  markContainer: 'Es un contenedor',
  ignore: 'Ignorar',
  queueStatusLabels: {
    pending: 'Pendiente',
    enriched: 'Enriquecida',
    ignored: 'Ignorada',
    container: 'Contenedor',
  },
} as const
