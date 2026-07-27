import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { clients } from './clients'
import { jobs } from './jobs'
import { leadStatus } from './enums'

/**
 * Lo que entra por el formulario. Un lead convertido no se borra: el texto
 * original del cliente sirve de contexto meses después.
 */
export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  service: text('service'),
  source: text('source').notNull().default('web'),
  status: leadStatus('status').notNull().default('new'),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  ipHash: text('ip_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
