import { unstable_cache } from 'next/cache'
import { db } from '@/db/client'
import { getPublishedProjectBySlug, getPublishedProjects } from '@/db/queries/jobs'
import type { JobCategory } from '@/db/schema'

/**
 * Los proyectos del portfolio salen de `job_publications`. La caché se invalida
 * por etiqueta cuando el admin publica o despublica, así que no se revalida el
 * sitio entero por cambiar un texto. Ver docs/arquitectura.md.
 */
export const PROJECTS_TAG = 'projects'

/** Las etiquetas visibles y sus slugs. El código va en inglés, la etiqueta en español. */
export const CATEGORY_LABELS: Record<JobCategory, string> = {
  artist: 'Artista',
  sport: 'Deporte',
  video: 'Vídeo',
}

export const CATEGORY_SLUGS: Record<JobCategory, string> = {
  artist: 'artista',
  sport: 'deporte',
  video: 'video',
}

export const CATEGORIES = Object.keys(CATEGORY_LABELS) as JobCategory[]

export type Project = {
  slug: string
  title: string
  summary: string | null
  year: number
  category: JobCategory
  categoryLabel: string
  categorySlug: string
  ratio: string
  coverSrc?: string
  coverAlt?: string
}

/** Las verticales y las apaisadas se alternan para que la rejilla escalone. */
function ratioFor(index: number): string {
  return index % 3 === 1 ? '3 / 2' : '4 / 5'
}

export const listProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const rows = await getPublishedProjects(await db())
    return rows.map((row, i) => ({
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      year: row.year,
      category: row.category,
      categoryLabel: CATEGORY_LABELS[row.category],
      categorySlug: CATEGORY_SLUGS[row.category],
      ratio: ratioFor(i),
    }))
  },
  ['projects'],
  { tags: [PROJECTS_TAG] },
)

export async function listFeaturedProjects(limit = 3): Promise<Project[]> {
  return (await listProjects()).slice(0, limit)
}

export function isCategorySlug(value: unknown): boolean {
  return typeof value === 'string' && Object.values(CATEGORY_SLUGS).includes(value)
}

/**
 * Una categoría desconocida devuelve vacío, no el listado entero: si devolviera
 * todo, el usuario vería la lista completa sin ningún filtro marcado y sin
 * entender por qué.
 */
export async function projectsByCategorySlug(categorySlug?: string): Promise<Project[]> {
  const all = await listProjects()
  if (!categorySlug) return all
  if (!isCategorySlug(categorySlug)) return []
  return all.filter((p) => p.categorySlug === categorySlug)
}

export const getProject = unstable_cache(
  async (slug: string) => {
    const row = await getPublishedProjectBySlug(await db(), slug)
    if (!row) return undefined
    return {
      ...row,
      categoryLabel: CATEGORY_LABELS[row.category],
      categorySlug: CATEGORY_SLUGS[row.category],
      ratio: '4 / 5',
    }
  },
  ['project'],
  { tags: [PROJECTS_TAG] },
)

/** Anterior y siguiente dentro de la misma categoría, como pide el mapa de rutas. */
export async function siblings(slug: string, category: JobCategory) {
  const sameCategory = (await listProjects()).filter((p) => p.category === category)
  const i = sameCategory.findIndex((p) => p.slug === slug)
  return { prev: sameCategory[i - 1], next: sameCategory[i + 1] }
}
