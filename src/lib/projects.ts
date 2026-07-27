/**
 * Los proyectos publicados. En la fase 3 esto pasa a ser una consulta a
 * job_publications; la forma del dato ya es la definitiva para que el cambio
 * no toque los componentes.
 */
export const CATEGORIES = ['Artista', 'Deporte', 'Vídeo'] as const
export type Category = (typeof CATEGORIES)[number]

/** El slug de la URL va en minúsculas y sin acentos. */
export const CATEGORY_SLUGS: Record<Category, string> = {
  Artista: 'artista',
  Deporte: 'deporte',
  'Vídeo': 'video',
}

export type Project = {
  slug: string
  title: string
  category: Category
  year: number
  client?: string
  summary: string
  coverSrc?: string
  coverAlt?: string
  ratio: string
  featured?: boolean
}

export const projects: Project[] = [
  {
    slug: 'julia-ferrer',
    title: 'Júlia Ferrer',
    category: 'Artista',
    year: 2025,
    client: 'Júlia Ferrer',
    summary: 'Retrato de prensa para el lanzamiento del disco, en su local de ensayo.',
    ratio: '4 / 5',
    featured: true,
  },
  {
    slug: 'trail-serra-de-tramuntana',
    title: 'Trail Serra de Tramuntana',
    category: 'Deporte',
    year: 2025,
    summary: 'Cobertura de carrera de montaña, de la salida de noche al último corredor.',
    ratio: '3 / 2',
    featured: true,
  },
  {
    slug: 'sala-pelaires',
    title: 'Sala Pelaires',
    category: 'Vídeo',
    year: 2024,
    client: 'Sala Pelaires',
    summary: 'Pieza corta para el anuncio de temporada.',
    ratio: '4 / 5',
    featured: true,
  },
]

export const featuredProjects = projects.filter((p) => p.featured)

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}

export function isCategorySlug(value: unknown): boolean {
  return typeof value === 'string' && Object.values(CATEGORY_SLUGS).includes(value)
}

/**
 * Una categoría desconocida devuelve vacío, no el listado entero: si devolviera
 * todo, el usuario vería la lista completa sin ningún filtro marcado y sin
 * entender por qué.
 */
export function projectsByCategorySlug(categorySlug?: string): Project[] {
  if (!categorySlug) return projects
  const entry = Object.entries(CATEGORY_SLUGS).find(([, slug]) => slug === categorySlug)
  if (!entry) return []
  return projects.filter((p) => p.category === entry[0])
}

/** Anterior y siguiente dentro de la misma categoría, como pide el mapa de rutas. */
export function siblings(project: Project): { prev?: Project; next?: Project } {
  const sameCategory = projects.filter((p) => p.category === project.category)
  const i = sameCategory.findIndex((p) => p.slug === project.slug)
  return { prev: sameCategory[i - 1], next: sameCategory[i + 1] }
}
