import { eq, sql } from 'drizzle-orm'
import type { Database } from '../client'
import type { TestDatabase } from '../testing'
import { auditLog, expenses } from '../schema'
import type { ExpenseCategory } from '../schema'

type Db = Database | TestDatabase

export interface NewExpense {
  jobId: string | null
  amountCents: number
  description: string
  category: ExpenseCategory
  spentOn: string
  ticketStorageKey?: string | null
}

/**
 * Da de alta un gasto y deja fila en audit_log: toda escritura sobre dinero se
 * registra. Ver docs/seguridad-y-privacidad.md y la fase 5 del plan.
 */
export async function addExpense(db: Db, input: NewExpense, actor: string): Promise<string> {
  const [row] = await db
    .insert(expenses)
    .values({
      jobId: input.jobId,
      amountCents: input.amountCents,
      description: input.description,
      category: input.category,
      spentOn: input.spentOn,
      ticketStorageKey: input.ticketStorageKey ?? null,
    })
    .returning()
  await db.insert(auditLog).values({
    actor,
    action: 'expense.create',
    entity: 'expense',
    entityId: row!.id,
    diff: { amountCents: input.amountCents, jobId: input.jobId },
  })
  return row!.id
}

/** Suma en céntimos de los gastos atados a un encargo. */
export async function sumExpensesByJob(db: Db, jobId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)` })
    .from(expenses)
    .where(eq(expenses.jobId, jobId))
  return Number(row?.total ?? 0)
}

export async function listExpensesByJob(db: Db, jobId: string) {
  return db
    .select({
      id: expenses.id,
      amountCents: expenses.amountCents,
      description: expenses.description,
      category: expenses.category,
      spentOn: expenses.spentOn,
    })
    .from(expenses)
    .where(eq(expenses.jobId, jobId))
    .orderBy(expenses.spentOn)
}
