import { existsSync } from 'node:fs'
import { PGlite } from '@electric-sql/pglite'
import { drizzle } from 'drizzle-orm/pglite'
import { migrate } from 'drizzle-orm/pglite/migrator'
import * as schema from '../src/db/schema'
import { seed } from '../src/db/seed'
import { listJobs } from '../src/db/queries/jobs'

/**
 * Prepara la base local de desarrollo: migra y siembra si está vacía. Es
 * idempotente. Sin esto, clonar el proyecto y arrancarlo daría una web sin nada
 * que enseñar y unas pruebas de extremo a extremo sin datos.
 */
async function main() {
  const fresh = !existsSync('.pglite')
  const client = new PGlite('.pglite')
  const db = drizzle(client, { schema })

  // Migrar solo si la base es nueva. Volver a migrar una ya migrada cuelga.
  if (fresh) {
    await migrate(db, { migrationsFolder: './drizzle' })
  }

  const existing = await listJobs(db)
  if (existing.length > 0) {
    process.stdout.write(`Base local ya sembrada: ${existing.length} encargos.\n`)
  } else {
    await seed(db as unknown as Parameters<typeof seed>[0])
    process.stdout.write('Base local creada y sembrada.\n')
  }

  await client.close()
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    process.stderr.write(`${String(error)}\n`)
    process.exit(1)
  })
