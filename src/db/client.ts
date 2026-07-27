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

/**
 * Una sola conexión en todo el proceso. Se guarda en globalThis porque Next
 * empaqueta las páginas y las Server Actions por separado, y con una variable
 * de módulo normal cada bundle abriría su propia conexión. Con PGlite en
 * fichero eso significa dos copias en memoria que no ven los cambios de la
 * otra, así que un encargo recién creado no aparecería al leerlo. Con Postgres
 * de verdad no pasaría, pero el singleton es correcto en los dos casos.
 */
const globalForDb = globalThis as unknown as { __pmDb?: Promise<Database> }

export function db(): Promise<Database> {
  if (!globalForDb.__pmDb) {
    globalForDb.__pmDb = createDatabase()
  }
  return globalForDb.__pmDb
}

export { schema }
