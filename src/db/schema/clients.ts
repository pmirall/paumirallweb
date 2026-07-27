import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

/**
 * Quien contrata. El correo no es único: hay clientes que repiten con
 * direcciones distintas y empresas que comparten contacto. La deduplicación se
 * hace desde el admin. Ver docs/modelo-de-datos.md.
 */
export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  company: text('company'),
  taxId: text('tax_id'),
  billingAddress: text('billing_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})
