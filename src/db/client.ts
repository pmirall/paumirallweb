import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { requireDatabaseUrl } from '@/lib/env'
import * as schema from './schema'

/**
 * En producción, Postgres de Supabase por conexión directa. En local y en las
 * pruebas se usa PGlite, que es Postgres de verdad compilado a WASM, para no
 * necesitar ni Docker ni un servidor. El esquema y las migraciones son los
 * mismos en los dos sitios, así que lo que pasa en las pruebas pasa en
 * producción. Ver docs/arquitectura.md.
 */
export type Database = ReturnType<typeof createDatabase>

export function createDatabase(url: string) {
  const client = postgres(url, { prepare: false })
  return drizzlePg(client, { schema })
}

let cached: Database | undefined

export function db(): Database {
  if (!cached) {
    cached = createDatabase(requireDatabaseUrl())
  }
  return cached
}

export { schema }
