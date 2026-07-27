'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/db/client'
import { convertLeadToJob } from '@/db/queries/leads'
import { ADMIN_COOKIE, verifySession } from '@/lib/auth/admin'

/**
 * Convierte un lead en encargo. El actor del registro de auditoría es el correo
 * de la sesión, así que se lee de la cookie ya verificada.
 */
export async function convertLead(leadId: string) {
  const store = await cookies()
  const session = await verifySession(store.get(ADMIN_COOKIE)?.value)
  if (!session) {
    throw new Error('Sin sesión.')
  }
  // El año lo pone el servidor en el momento de convertir.
  const year = new Date().getFullYear()
  const result = await convertLeadToJob(await db(), leadId, session.email, year)
  if (!result) {
    redirect(`/admin/leads/${leadId}`)
  }
  revalidatePath('/admin/encargos')
  redirect(`/admin/encargos/${result.jobId}`)
}
