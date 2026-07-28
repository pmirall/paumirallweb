import { notFound, redirect } from 'next/navigation'
import { requireGallerySession } from '@/lib/gallery/guard'
import { getClientInvoiceForJob } from '@/db/queries/invoices'
import { hasVideoDeliverable } from '@/db/queries/client-job'
import { getGalleryByToken } from '@/db/queries/gallery'
import { db } from '@/db/client'
import { Eyebrow, Tag } from '@/components/ui'
import { ClientNav } from '@/components/client/ClientNav'
import { invoiceView } from '@/content/gallery'
import { formatEuros } from '@/lib/format'
import { formatDate } from '@/lib/dates'

export const dynamic = 'force-dynamic'

/** La factura vista por el cliente. Sin factura, la ruta responde 404. */
export default async function ClientInvoicePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ctx = await requireGallerySession(token)
  if (!ctx) {
    const gallery = await getGalleryByToken(await db(), token)
    if (!gallery || gallery.status !== 'active') notFound()
    redirect(`/c/${token}`)
  }

  const { database, gallery } = ctx
  const invoice = await getClientInvoiceForJob(database, gallery.jobId)
  if (!invoice) notFound()
  const hasVideo = await hasVideoDeliverable(database, gallery.jobId)
  const paid = invoice.status === 'paid'
  const owed = Math.max(0, invoice.totalCents - invoice.paidCents)

  return (
    <section className="pm-invoiceview">
      <ClientNav token={token} active="invoice" hasVideo={hasVideo} hasInvoice />
      <Eyebrow surface="bone">{invoiceView.eyebrow}</Eyebrow>
      <h1 className="pm-invoiceview__title">{invoice.number}</h1>

      <div className="pm-invoiceview__status">
        <Tag tone={paid ? 'accent' : 'notice'}>{paid ? invoiceView.paid : invoiceView.pending}</Tag>
      </div>

      <dl className="pm-invoiceview__facts">
        <div>
          <dt>{invoiceView.total}</dt>
          <dd>{formatEuros(invoice.totalCents)}</dd>
        </div>
        {!paid ? (
          <div>
            <dt>{invoiceView.pending1}</dt>
            <dd>{formatEuros(owed)}</dd>
          </div>
        ) : null}
        {!paid && invoice.dueAt ? (
          <div>
            <dt>{invoiceView.dueLabel}</dt>
            <dd>{formatDate(invoice.dueAt)}</dd>
          </div>
        ) : null}
      </dl>

      {invoice.pdfUrl ? (
        <a className="pm-link pm-hit" href={invoice.pdfUrl} target="_blank" rel="noreferrer">
          {invoiceView.pdf}
        </a>
      ) : null}

      {paid ? (
        <p className="pm-invoiceview__body">{invoiceView.paidBody}</p>
      ) : (
        <p className="pm-invoiceview__body">
          {invoiceView.howToPay}{' '}
          <a className="pm-link pm-hit" href={`mailto:${invoiceView.contact}`}>
            {invoiceView.contact}
          </a>
        </p>
      )}
    </section>
  )
}
