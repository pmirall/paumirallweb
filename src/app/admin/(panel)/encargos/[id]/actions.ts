'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/db/client'
import {
  changeJobStatus,
  getJobDetail,
  setDeliverableDelivered,
  updateJobNotes,
} from '@/db/queries/job-mutations'
import { addTimeEntry } from '@/db/queries/time-entries'
import { createQuote, markQuoteSent, type QuoteLineDraft } from '@/db/queries/quotes'
import {
  createGalleryForJob,
  getGalleryForJob,
  revokeGallery,
  setGalleryPin,
} from '@/db/queries/admin-gallery'
import { generatePin, generateToken } from '@/lib/gallery/token'
import { hashPin } from '@/lib/gallery/pin'
import { addExpense } from '@/db/queries/expenses'
import { ADMIN_COOKIE, verifySession } from '@/lib/auth/admin'
import {
  EXPENSE_CATEGORIES,
  JOB_STATUSES,
  TIME_ENTRY_KINDS,
  type ExpenseCategory,
  type JobStatus,
  type TimeEntryKind,
} from '@/db/schema'

/** Caducidad por defecto: noventa días desde la entrega. Ver docs/plan. */
const GALLERY_DAYS = 90

async function requireEmail(): Promise<string> {
  const store = await cookies()
  const session = await verifySession(store.get(ADMIN_COOKIE)?.value)
  if (!session) throw new Error('Sin sesión.')
  return session.email
}

export async function changeStatusAction(jobId: string, formData: FormData) {
  const email = await requireEmail()
  const raw = String(formData.get('status') ?? '')
  if (!(JOB_STATUSES as readonly string[]).includes(raw)) return
  await changeJobStatus(await db(), jobId, raw as JobStatus, email)
  revalidatePath(`/admin/encargos/${jobId}`)
  revalidatePath('/admin/encargos')
}

export async function toggleDeliverableAction(
  jobId: string,
  deliverableId: string,
  delivered: boolean,
) {
  await requireEmail()
  await setDeliverableDelivered(await db(), deliverableId, delivered)
  revalidatePath(`/admin/encargos/${jobId}`)
}

export async function saveNotesAction(jobId: string, formData: FormData) {
  await requireEmail()
  await updateJobNotes(await db(), jobId, String(formData.get('notes') ?? ''))
  revalidatePath(`/admin/encargos/${jobId}`)
}

export type GalleryActionResult =
  | { ok: true; pin?: string }
  | { ok: false; error: 'exists' | 'none' }

/**
 * Crea la galería del encargo: token de 128 bits, PIN de cuatro dígitos y
 * caducidad a noventa días. El PIN se devuelve una sola vez, en claro, para que
 * el admin lo envíe; luego solo queda el hash y no se puede recuperar.
 */
export async function createGalleryAction(jobId: string): Promise<GalleryActionResult> {
  await requireEmail()
  const database = await db()
  if (await getGalleryForJob(database, jobId)) return { ok: false, error: 'exists' }
  const pin = generatePin()
  await createGalleryForJob(database, {
    jobId,
    token: generateToken(),
    pinHash: await hashPin(pin),
    expiresAt: new Date(Date.now() + GALLERY_DAYS * 24 * 60 * 60 * 1000),
  })
  revalidatePath(`/admin/encargos/${jobId}`)
  return { ok: true, pin }
}

/** Genera un PIN nuevo y lo devuelve una vez. El anterior deja de valer. */
export async function regeneratePinAction(jobId: string): Promise<GalleryActionResult> {
  await requireEmail()
  const database = await db()
  const gallery = await getGalleryForJob(database, jobId)
  if (!gallery) return { ok: false, error: 'none' }
  const pin = generatePin()
  await setGalleryPin(database, gallery.id, await hashPin(pin))
  revalidatePath(`/admin/encargos/${jobId}`)
  return { ok: true, pin }
}

/** Revoca la galería: el acceso se corta al instante. */
export async function revokeGalleryAction(jobId: string): Promise<GalleryActionResult> {
  await requireEmail()
  const database = await db()
  const gallery = await getGalleryForJob(database, jobId)
  if (!gallery) return { ok: false, error: 'none' }
  await revokeGallery(database, gallery.id)
  revalidatePath(`/admin/encargos/${jobId}`)
  return { ok: true }
}

const quoteLineSchema = z.object({
  description: z.string().trim().min(1).max(300),
  quantity: z.number().int().positive().max(9999),
  unitEuros: z.number().nonnegative().max(1_000_000),
  taxRate: z.number().int().min(0).max(100),
})
const quoteLinesSchema = z.array(quoteLineSchema).min(1).max(50)

/**
 * Crea un presupuesto para el encargo. Las líneas llegan en un campo JSON que el
 * editor mantiene; se validan con Zod y el importe se pasa a céntimos aquí, no en
 * el navegador. El cliente del presupuesto es el del encargo.
 */
export async function createQuoteAction(jobId: string, formData: FormData) {
  const email = await requireEmail()
  const database = await db()
  const detail = await getJobDetail(database, jobId)
  if (!detail) return

  let parsedLines: unknown
  try {
    parsedLines = JSON.parse(String(formData.get('lines') ?? '[]'))
  } catch {
    return
  }
  const lines = quoteLinesSchema.safeParse(parsedLines)
  if (!lines.success) return

  const draft: QuoteLineDraft[] = lines.data.map((l) => ({
    description: l.description,
    quantity: l.quantity,
    unitPriceCents: Math.round(l.unitEuros * 100),
    taxRate: l.taxRate,
  }))
  const validUntil = String(formData.get('validUntil') ?? '') || null
  const notes = String(formData.get('notes') ?? '').trim() || null

  await createQuote(
    database,
    { jobId, clientId: detail.job.clientId, year: new Date().getFullYear(), validUntil, notes, lines: draft },
    email,
  )
  revalidatePath(`/admin/encargos/${jobId}`)
}

export async function markQuoteSentAction(jobId: string, quoteId: string) {
  const email = await requireEmail()
  await markQuoteSent(await db(), quoteId, new Date(), email)
  revalidatePath(`/admin/encargos/${jobId}`)
}

export async function addExpenseAction(jobId: string, formData: FormData) {
  const email = await requireEmail()
  // El importe entra en euros y se guarda en céntimos, sin flotantes que arrastren
  // error: se redondea al céntimo más cercano.
  const euros = Number(formData.get('amount'))
  const description = String(formData.get('description') ?? '').trim()
  const spentOn = String(formData.get('spentOn') ?? '')
  const catRaw = String(formData.get('category') ?? '')
  const category: ExpenseCategory = (EXPENSE_CATEGORIES as readonly string[]).includes(catRaw)
    ? (catRaw as ExpenseCategory)
    : 'other'
  // Un gasto sin importe, sin concepto o sin fecha no se guarda.
  if (!description || !spentOn || !Number.isFinite(euros) || euros <= 0) return
  await addExpense(
    await db(),
    { jobId, amountCents: Math.round(euros * 100), description, category, spentOn },
    email,
  )
  revalidatePath(`/admin/encargos/${jobId}`)
}

export async function addTimeAction(jobId: string, formData: FormData) {
  await requireEmail()
  const minutes = Number(formData.get('minutes'))
  const date = String(formData.get('date') ?? '')
  const kindRaw = String(formData.get('kind') ?? '')
  const kind = (TIME_ENTRY_KINDS as readonly string[]).includes(kindRaw)
    ? (kindRaw as TimeEntryKind)
    : 'shoot'
  // Un registro sin minutos o sin día no se guarda, sin ceremonia.
  if (!date || !Number.isFinite(minutes) || minutes <= 0) return
  await addTimeEntry(await db(), {
    jobId,
    date,
    minutes: Math.round(minutes),
    kind,
    note: String(formData.get('note') ?? '') || undefined,
  })
  revalidatePath(`/admin/encargos/${jobId}`)
}
