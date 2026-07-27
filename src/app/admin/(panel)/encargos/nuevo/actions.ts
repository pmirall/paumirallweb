'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/db/client'
import { createJob } from '@/db/queries/job-mutations'
import { ADMIN_COOKIE, verifySession } from '@/lib/auth/admin'
import { JOB_CATEGORIES } from '@/db/schema'
import { newJobPage } from '@/content/admin'

const schema = z.object({
  clientId: z.string().uuid(newJobPage.errorClient),
  title: z.string().trim().min(2, newJobPage.errorTitle),
  category: z.enum(JOB_CATEGORIES),
  shootDate: z.string().optional(),
  budget: z.string().optional(),
})

export type NewJobState = { errors?: Partial<Record<'clientId' | 'title' | 'form', string>> }

export async function createJobAction(
  _prev: NewJobState,
  formData: FormData,
): Promise<NewJobState> {
  const store = await cookies()
  const session = await verifySession(store.get(ADMIN_COOKIE)?.value)
  if (!session) return { errors: { form: 'Sin sesión.' } }

  const parsed = schema.safeParse({
    clientId: formData.get('clientId'),
    title: formData.get('title'),
    category: formData.get('category'),
    shootDate: formData.get('shootDate'),
    budget: formData.get('budget'),
  })

  if (!parsed.success) {
    const errors: NewJobState['errors'] = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]
      if (key === 'clientId' || key === 'title') errors[key] = issue.message
    }
    return { errors }
  }

  const euros = Number(parsed.data.budget)
  const created = await createJob(
    await db(),
    {
      clientId: parsed.data.clientId,
      title: parsed.data.title,
      category: parsed.data.category,
      shootDate: parsed.data.shootDate || undefined,
      budgetCents: Number.isFinite(euros) && euros > 0 ? Math.round(euros * 100) : undefined,
    },
    session.email,
    new Date().getFullYear(),
  )

  redirect(`/admin/encargos/${created.id}`)
}
