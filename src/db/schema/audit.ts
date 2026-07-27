import { jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Quién tocó qué y cuándo. Obligatorio en facturas, pagos, gastos, cambios de
 * PIN y de caducidad, y borrados. Ver docs/modelo-de-datos.md.
 */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actor: text('actor').notNull(),
  action: text('action').notNull(),
  entity: text('entity').notNull(),
  entityId: uuid('entity_id'),
  diff: jsonb('diff'),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
