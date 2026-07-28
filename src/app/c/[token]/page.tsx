import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { getGalleryByToken } from '@/db/queries/gallery'
import { getJobWithClient } from '@/db/queries/jobs'
import { isGalleryOpen } from '@/lib/gallery/status'
import { Eyebrow } from '@/components/ui'
import { gate } from '@/content/gallery'
import { GateForm } from './GateForm'

export const dynamic = 'force-dynamic'

/** La puerta. Cuatro estados: entra, PIN erróneo, caducada, token inválido. */
export default async function GatePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const database = await db()
  const gallery = await getGalleryByToken(database, token)

  // Token inválido o galería revocada: 404, sin confirmar que exista un panel.
  if (!gallery || gallery.status === 'revoked') notFound()

  const expired = !isGalleryOpen(gallery, new Date())
  const job = await getJobWithClient(database, gallery.jobId)
  const name = job?.jobs.title ?? ''

  if (expired) {
    return (
      <section className="pm-gate">
        <Eyebrow surface="bone">{gate.eyebrow}</Eyebrow>
        <h1 className="pm-gate__title">{gate.expiredTitle}</h1>
        <p className="pm-gate__body">{gate.expiredBody}</p>
        <a className="pm-link pm-hit" href={`mailto:${gate.contact}`}>
          {gate.contact}
        </a>
      </section>
    )
  }

  return (
    <section className="pm-gate">
      <Eyebrow surface="bone">{gate.eyebrow}</Eyebrow>
      <h1 className="pm-gate__title">{name}</h1>
      <GateForm token={token} />
    </section>
  )
}
