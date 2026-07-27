import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { requireDatabaseUrl } from '@/lib/env'

/**
 * Las migraciones se aplican antes del despliegue, nunca durante. Toda
 * migración tiene que ser compatible con la versión anterior del código.
 * Ver docs/operativa.md.
 */
async function main() {
  const client = postgres(requireDatabaseUrl(), { max: 1 })
  await migrate(drizzle(client), { migrationsFolder: './drizzle' })
  await client.end()
  process.stdout.write('Migraciones aplicadas.\n')
}

main().catch((error) => {
  process.stderr.write(`${String(error)}\n`)
  process.exit(1)
})
