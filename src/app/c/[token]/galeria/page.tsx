import { notFound, redirect } from 'next/navigation'
import { listGalleryAssets, touchGalleryAccess } from '@/db/queries/gallery'
import { listActiveFavoriteIds } from '@/db/queries/favorites'
import { requireGallerySession } from '@/lib/gallery/guard'
import { Eyebrow } from '@/components/ui'
import { GalleryGrid } from '@/components/client/GalleryGrid'
import { galleryView } from '@/content/gallery'

export const dynamic = 'force-dynamic'

/** La entrega. Solo se llega con una sesión válida atada a esta galería. */
export default async function GalleryPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const ctx = await requireGallerySession(token)
  // Sin galería activa es 404; con galería pero sin sesión, vuelta a la puerta.
  if (!ctx) {
    const { getGalleryByToken } = await import('@/db/queries/gallery')
    const { db } = await import('@/db/client')
    const gallery = await getGalleryByToken(await db(), token)
    if (!gallery || gallery.status !== 'active') notFound()
    redirect(`/c/${token}`)
  }

  const { database, gallery } = ctx
  const now = new Date()
  await touchGalleryAccess(database, gallery.id, now)
  const assets = await listGalleryAssets(database, gallery.jobId)
  const favorites = await listActiveFavoriteIds(database, gallery.id)

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
        <GalleryGrid token={token} photos={assets} initialFavorites={favorites} />
      )}
    </section>
  )
}
