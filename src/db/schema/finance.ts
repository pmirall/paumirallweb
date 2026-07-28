import { date, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs } from './jobs'

/**
 * Gastos del negocio. Un gasto puede ir atado a un encargo, y entonces baja su
 * rentabilidad, o ser general. El importe va en céntimos y enteros, como todo el
 * dinero. La foto del ticket, cuando la haya, vive en el almacén y aquí queda su
 * clave. Ver docs/plan-de-ejecucion.md, fase 5.
 */
export const EXPENSE_CATEGORIES = ['travel', 'gear', 'software', 'studio', 'other'] as const
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export const expenseCategory = pgEnum('expense_category', EXPENSE_CATEGORIES)

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
  amountCents: integer('amount_cents').notNull(),
  description: text('description').notNull(),
  category: expenseCategory('category').notNull().default('other'),
  spentOn: date('spent_on').notNull(),
  ticketStorageKey: text('ticket_storage_key'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
