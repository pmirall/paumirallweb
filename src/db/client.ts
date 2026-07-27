import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/lib/env'
import * as schema from './schema'

/**
 * En producción, Postgres de Supabase por DATABASE_URL. En desarrollo, en las
 * pruebas y durante el build, si no hay DATABASE_URL se cae a PGlite, que es
 * Postgres compilado a WASM guardado en un fichero local. Así el proyecto se
 * clona, se construye y arranca sin credenciales de nadie, con el mismo esquema
 * y las mismas migraciones que Supabase. Ver docs/arquitectura.md.
 */
export type Database = Awaited<ReturnType<typeof createDatabase>>

const LOCAL_DATA_DIR = '.pglite'

export async function createDatabase() {
  if (env.DATABASE_URL) {
    return drizzlePg(postgres(env.DATABASE_URL, { prepare: false }), { schema })
  }

  // Sin URL, base local. Que esto no ocurra en producción lo garantiza env.ts,
  // que exige DATABASE_URL al arrancar.
  const { PGlite } = await import('@electric-sql/pglite')
  const { drizzle } = await import('drizzle-orm/pglite')
  const { migrate } = await import('drizzle-orm/pglite/migrator')

  const db = drizzle(new PGlite(LOCAL_DATA_DIR), { schema })
  await migrate(db, { migrationsFolder: './drizzle' })
  return db
}

let cached: Promise<Database> | undefined

export function db(): Promise<Database> {
  if (!cached) {
    cached = createDatabase()
  }
  return cached
}

export { schema }
