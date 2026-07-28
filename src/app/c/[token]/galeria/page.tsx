import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { db } from '@/db/client'
import {
  findValidSession,
  getGalleryByToken,
  listGalleryAssets,
  touchGalleryAccess,
} from '@/db/queries/gallery'
import { GALLERY_COOKIE, readGallerySession } from '@/lib/gallery/session'
import { Eyebrow, Plate } from '@/components/ui'
import { galleryView } from '@/content/gallery'

export const dynamic = 'force-dynamic'

/** La entrega. Solo se llega con una sesión válida atada a esta galería. */
export default async function GalleryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const database = await db()
  const gallery = await getGalleryByToken(database, token)
  if (!gallery || gallery.status !== 'active') notFound()

  // La sesión de la cookie tiene que ser de esta galería, no de otra.
  const store = await cookies()
  const claim = await readGallerySession(store.get(GALLERY_COOKIE)?.value)
  const now = new Date()
  const session = claim ? await findValidSession(database, claim.sessionId, now) : null
  if (!session || session.galleryId !== gallery.id) {
    redirect(`/c/${token}`)
  }

  await touchGalleryAccess(database, gallery.id, now)
  const assets = await listGalleryAssets(database, gallery.jobId)

  return (
    <section className="pm-gallery-view">
      <Eyebrow surface="bone">{galleryView.eyebrow}</Eyebrow>

      {gallery.watermark ? (
        <p className="pm-notice" role="note">
          {galleryView.watermarkNotice}
        </p>
      ) : null}

      {assets.length === 0 ? (
        <p className="pm-field__hint">{galleryView.empty}</p>
      ) : (
        <div className="pm-grid">
          {assets.map((asset) => (
            <Plate
              key={asset.id}
              ratio={asset.width && asset.height ? `${asset.width} / ${asset.height}` : '3 / 2'}
              note={galleryView.photoAlt}
            />
          ))}
        </div>
      )}
    </section>
  )
}
