import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import * as schema from './schema'

/**
 * Base de datos efímera para las pruebas de integración: Postgres real en
 * memoria, migrado desde cero en cada arranque. Nada de dobles del ORM, que no
 * prueban nada sobre el SQL que se acaba ejecutando.
 */
export async function createTestDatabase() {
  const client = new PGlite()
  const db = drizzle(client, { schema })
  await migrate(db, { migrationsFolder: './drizzle' })
  return { db, client }
}

export type TestDatabase = Awaited<ReturnType<typeof createTestDatabase>>['db']

/**
 * Vacía las tablas sin volver a migrar. Arrancar PGlite cuesta segundos, así
 * que se levanta una vez por fichero y se limpia entre pruebas.
 */
export async function truncateAll(db: TestDatabase) {
  await db.execute(
    `TRUNCATE TABLE audit_log, leads, time_entries, deliverables, slug_history,
     job_publications, jobs, clients RESTART IDENTITY CASCADE`,
  )
}
