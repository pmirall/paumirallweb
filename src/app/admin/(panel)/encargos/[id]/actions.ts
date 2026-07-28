'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db } from '@/db/client'
import {
  changeJobStatus,
  setDeliverableDelivered,
  updateJobNotes,
} from '@/db/queries/job-mutations'
import { addTimeEntry } from '@/db/queries/time-entries'
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
