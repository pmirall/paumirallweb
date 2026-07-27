import type { MetadataRoute } from 'next'
import { env } from '@/lib/env'

/** El bloqueo real lo hace la cabecera X-Robots-Tag del middleware. Esto es la
 *  primera línea, no la única. Ver docs/seguridad-y-privacidad.md. */
export default function robots(): MetadataRoute.Robots {
  const base = env.SITE_URL.replace(/\/$/, '')
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/c/'] }],
    sitemap: `${base}/sitemap.xml`,
  }
}
