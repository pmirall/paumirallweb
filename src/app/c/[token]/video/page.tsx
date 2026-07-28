import { notFound, redirect } from 'next/navigation'
import { requireGallerySession } from '@/lib/gallery/guard'
import { hasVideoDeliverable } from '@/db/queries/client-job'
import { hasInvoiceForJob } from '@/db/queries/invoices'
import { getGalleryByToken } from '@/db/queries/gallery'
import { db } from '@/db/client'
import { Eyebrow, Plate } from '@/components/ui'
import { ClientNav } from '@/components/client/ClientNav'
import { videoView } from '@/content/gallery'

export const dynamic = 'force-dynamic'

/**
 * La pantalla de vídeo. Si el encargo no tiene vídeo, la ruta responde 404, no un
 * mensaje de vacío: no existe para ese encargo. Ver docs/mapa-de-rutas.md.
 */
export default async function ClientVideoPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ctx = await requireGallerySession(token)
  if (!ctx) {
    const gallery = await getGalleryByToken(await db(), token)
    if (!gallery || gallery.status !== 'active') notFound()
    redirect(`/c/${token}`)
  }

  const { database, gallery } = ctx
  const hasVideo = await hasVideoDeliverable(database, gallery.jobId)
  if (!hasVideo) notFound()
  const hasInvoice = await hasInvoiceForJob(database, gallery.jobId)

  return (
    <section className="pm-videoview">
      <ClientNav token={token} active="video" hasVideo hasInvoice={hasInvoice} />
      <Eyebrow surface="bone">{videoView.eyebrow}</Eyebrow>
      <Plate ratio="16 / 9" note={videoView.soon} />
    </section>
  )
}
