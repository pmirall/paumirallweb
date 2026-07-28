import { notFound, redirect } from 'next/navigation'
import { requireGallerySession } from '@/lib/gallery/guard'
import {
  getClientJobView,
  hasVideoDeliverable,
  listClientDeliverables,
} from '@/db/queries/client-job'
import { hasInvoiceForJob } from '@/db/queries/invoices'
import { getGalleryByToken } from '@/db/queries/gallery'
import { db } from '@/db/client'
import { Eyebrow, Tag } from '@/components/ui'
import { ClientNav } from '@/components/client/ClientNav'
import { jobView } from '@/content/gallery'
import { formatDate } from '@/lib/dates'

export const dynamic = 'force-dynamic'

/** El encargo visto por el cliente: la línea de tiempo y lo acordado. */
export default async function ClientJobPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ctx = await requireGallerySession(token)
  if (!ctx) {
    const gallery = await getGalleryByToken(await db(), token)
    if (!gallery || gallery.status !== 'active') notFound()
    redirect(`/c/${token}`)
  }

  const { database, gallery } = ctx
  const job = await getClientJobView(database, gallery.jobId)
  if (!job) notFound()
  const deliverables = await listClientDeliverables(database, gallery.jobId)
  const hasVideo = await hasVideoDeliverable(database, gallery.jobId)
  const hasInvoice = await hasInvoiceForJob(database, gallery.jobId)

  const steps: Array<{ label: string; value: string; done: boolean }> = []
  if (job.shootDate) steps.push({ label: jobView.shoot, value: formatDate(job.shootDate), done: true })
  if (job.dueDate)
    steps.push({
      label: jobView.due,
      value: formatDate(job.dueDate),
      done: Boolean(job.deliveredAt),
    })
  steps.push({
    label: jobView.delivered,
    value: job.deliveredAt ? formatDate(job.deliveredAt) : jobView.pendingDelivery,
    done: Boolean(job.deliveredAt),
  })

  return (
    <section className="pm-jobview">
      <ClientNav token={token} active="job" hasVideo={hasVideo} hasInvoice={hasInvoice} />
      <Eyebrow surface="bone">{jobView.eyebrow}</Eyebrow>
      <h1 className="pm-jobview__title">{job.title}</h1>

      <h2 className="pm-jobview__h2">{jobView.timelineTitle}</h2>
      <ol className="pm-timeline">
        {steps.map((step, i) => (
          <li key={i} className="pm-timeline__step" data-done={step.done}>
            <span className="pm-timeline__label">{step.label}</span>
            <span className="pm-timeline__value">{step.value}</span>
          </li>
        ))}
      </ol>

      <h2 className="pm-jobview__h2">{jobView.deliverablesTitle}</h2>
      {deliverables.length === 0 ? (
        <p className="pm-field__hint">{jobView.deliverablesEmpty}</p>
      ) : (
        <ul className="pm-deliverables">
          {deliverables.map((d) => (
            <li key={d.id} className="pm-deliverables__item">
              <div>
                <span className="pm-deliverables__what">
                  {d.quantity ? `${d.quantity} · ` : ''}
                  {d.description}
                </span>
                <span className="pm-deliverables__kind">{jobView.kinds[d.kind]}</span>
              </div>
              <Tag tone={d.delivered ? 'accent' : 'neutral'}>
                {d.delivered ? jobView.delivered1 : jobView.pending1}
              </Tag>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
