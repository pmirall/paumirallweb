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
