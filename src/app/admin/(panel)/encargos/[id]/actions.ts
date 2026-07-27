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
import { ADMIN_COOKIE, verifySession } from '@/lib/auth/admin'
import { JOB_STATUSES, TIME_ENTRY_KINDS, type JobStatus, type TimeEntryKind } from '@/db/schema'

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
