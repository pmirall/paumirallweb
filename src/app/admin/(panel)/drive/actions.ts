'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { db } from '@/db/client'
import { enrichAsJob, setFolderStatus } from '@/db/queries/drive'
import { syncDrive } from '@/lib/drive/sync'
import { FakeDriveAdapter, rootFolderId } from '@/lib/drive/fake'
import { ADMIN_COOKIE, verifySession } from '@/lib/auth/admin'
import { JOB_CATEGORIES, type JobCategory } from '@/db/schema'

async function requireEmail(): Promise<string> {
  const store = await cookies()
  const session = await verifySession(store.get(ADMIN_COOKIE)?.value)
  if (!session) throw new Error('Sin sesión.')
  return session.email
}

/** Sincroniza contra el Drive de prueba. La real se conecta con credenciales. */
export async function runSyncAction() {
  await requireEmail()
  await syncDrive(await db(), new FakeDriveAdapter(), rootFolderId)
  revalidatePath('/admin/drive')
  revalidatePath('/admin/drive/cola')
}

export async function enrichAction(folderId: string, formData: FormData) {
  const email = await requireEmail()
  const catRaw = String(formData.get('category') ?? '')
  const category: JobCategory = (JOB_CATEGORIES as readonly string[]).includes(catRaw)
    ? (catRaw as JobCategory)
    : 'artist'
  await enrichAsJob(
    await db(),
    folderId,
    {
      clientName: String(formData.get('clientName') ?? ''),
      category,
      published: formData.get('published') === 'on',
    },
    email,
    new Date().getFullYear(),
  )
  revalidatePath('/admin/drive/cola')
}

export async function ignoreAction(folderId: string) {
  await requireEmail()
  await setFolderStatus(await db(), folderId, 'ignored')
  revalidatePath('/admin/drive/cola')
}

export async function containerAction(folderId: string) {
  await requireEmail()
  await setFolderStatus(await db(), folderId, 'container')
  revalidatePath('/admin/drive/cola')
}
