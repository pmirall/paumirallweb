import { date, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs } from './jobs'
import { clients } from './clients'

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

/**
 * Presupuesto. Lo genera el sistema, no un proveedor: no es una factura y no tiene
 * requisitos de certificación. Ver ADR 0007 y docs/modelo-de-datos.md. Se acepta
 * desde un enlace público con `public_token`, sin cuenta. Un presupuesto aceptado
 * no se edita: se duplica y se envía otro.
 */
export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired'] as const
export type QuoteStatus = (typeof QUOTE_STATUSES)[number]
export const quoteStatus = pgEnum('quote_status', QUOTE_STATUSES)

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: text('number').notNull().unique(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),
  status: quoteStatus('status').notNull().default('draft'),
  validUntil: date('valid_until'),
  subtotalCents: integer('subtotal_cents').notNull().default(0),
  taxCents: integer('tax_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull().default(0),
  notes: text('notes'),
  publicToken: text('public_token').notNull().unique(),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const quoteLines = pgTable('quote_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id')
    .notNull()
    .references(() => quotes.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitPriceCents: integer('unit_price_cents').notNull(),
  taxRate: integer('tax_rate').notNull().default(21),
  sortOrder: integer('sort_order').notNull().default(0),
})

/**
 * Reflejo de la factura que emite el proveedor certificado. El sistema no la
 * genera: guarda número, importes, estado, PDF y URL de verificación. Una factura
 * emitida no se borra ni se edita; si está mal, el proveedor emite una
 * rectificativa y aquí se enlaza por `corrects_invoice_id`. Ver ADR 0007.
 */
export const INVOICE_STATUSES = ['draft', 'issued', 'paid', 'overdue', 'void'] as const
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number]
export const invoiceStatus = pgEnum('invoice_status', INVOICE_STATUSES)

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  number: text('number').notNull().unique(),
  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, { onDelete: 'restrict' }),
  clientId: uuid('client_id')
    .notNull()
    .references(() => clients.id, { onDelete: 'restrict' }),
  provider: text('provider').notNull(),
  providerInvoiceId: text('provider_invoice_id'),
  status: invoiceStatus('status').notNull().default('issued'),
  subtotalCents: integer('subtotal_cents').notNull().default(0),
  taxCents: integer('tax_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull().default(0),
  issuedAt: timestamp('issued_at', { withTimezone: true }),
  dueAt: date('due_at'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  pdfUrl: text('pdf_url'),
  verificationUrl: text('verification_url'),
  correctsInvoiceId: uuid('corrects_invoice_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * Cobros de una factura. Puede haber varios (anticipo y resto). El método arranca
 * en efectivo, transferencia y TPV externo; Stripe queda preparado pero inactivo
 * hasta que se conecte. `provider_payment_id` sirve para la idempotencia del
 * webhook cuando Stripe entre.
 */
export const PAYMENT_METHODS = ['cash', 'transfer', 'card_terminal', 'stripe'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]
export const paymentMethod = pgEnum('payment_method', PAYMENT_METHODS)

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'restrict' }),
  method: paymentMethod('method').notNull(),
  providerPaymentId: text('provider_payment_id').unique(),
  amountCents: integer('amount_cents').notNull(),
  reference: text('reference'),
  paidAt: timestamp('paid_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
