import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'
import { projects } from '@/lib/projects'
import { legalPages } from '@/content/pages'

/** Se genera desde los datos, no a mano. Ver docs/contenido-y-seo.md. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.SITE_URL.replace(/\/$/, '')
  const routes = ['', '/trabajo', '/servicios', '/sobre-mi', '/contacto']
  const legal = Object.keys(legalPages).map((slug) => `/legal/${slug}`)

  return [...routes, ...legal, ...projects.map((p) => `/trabajo/${p.slug}`)].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }))
}
