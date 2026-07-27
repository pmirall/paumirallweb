import { z } from 'zod'

/**
 * Las variables de entorno se leen y se validan aquí una sola vez. Si falta
 * una obligatoria, la aplicación no arranca en vez de fallar tres pantallas
 * más adelante. Ninguna lleva el prefijo NEXT_PUBLIC_: nada de esto puede
 * llegar al navegador. Ver docs/seguridad-y-privacidad.md.
 */
/**
 * En producción SITE_URL es obligatoria: con el valor por defecto, el sitemap se
 * publicaría con URL a localhost y nada fallaría. Durante el build no se exige,
 * porque construir no debería necesitar la configuración de ejecución.
 */
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
const requireSiteUrl = process.env.NODE_ENV === 'production' && !isBuild

const schema = z.object({
  SITE_URL: requireSiteUrl
    ? z.string().url()
    : z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Se vuelven obligatorias en la fase 1, cuando exista base de datos.
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  ADMIN_ALLOWED_EMAILS: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  const missing = parsed.error.issues.map((i) => i.path.join('.')).join(', ')
  throw new Error(`Faltan o son inválidas estas variables de entorno: ${missing}`)
}

export const env = parsed.data

/**
 * La base de datos no es obligatoria para construir la web pública, pero sí
 * para cualquier cosa que la toque. Se pide aquí para que el mensaje sea
 * siempre el mismo y para que nadie lea process.env por su cuenta.
 */
export function requireDatabaseUrl(): string {
  if (!env.DATABASE_URL) {
    throw new Error('Falta DATABASE_URL. Ver .env.example.')
  }
  return env.DATABASE_URL
}

/**
 * En un despliegue real, DATABASE_URL es obligatoria: no se corre contra la
 * base local efímera en producción. El distintivo no es NODE_ENV, porque
 * `next start` en las pruebas de extremo a extremo también es producción y allí
 * sí se usa PGlite. El distintivo es Vercel, que fija VERCEL=1 al desplegar.
 */
const isVercelDeploy = process.env.VERCEL === '1'
if (isVercelDeploy && !env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL. En el despliegue la base de datos es obligatoria.')
}

export const adminAllowedEmails = (env.ADMIN_ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)
