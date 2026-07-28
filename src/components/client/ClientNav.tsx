import Link from 'next/link'
import { galleryView } from '@/content/gallery'

/**
 * Navegación de la zona de cliente entre la entrega, el encargo y, si lo hay, el
 * vídeo. La pantalla de vídeo solo aparece cuando el encargo tiene vídeo; si no,
 * ni sale en el menú ni existe la ruta. Ver docs/mapa-de-rutas.md.
 */
export function ClientNav({
  token,
  active,
  hasVideo,
  hasInvoice,
}: {
  token: string
  active: 'gallery' | 'job' | 'video' | 'invoice'
  hasVideo: boolean
  hasInvoice?: boolean
}) {
  const items: Array<{ key: 'gallery' | 'job' | 'video' | 'invoice'; href: string; label: string }> = [
    { key: 'gallery', href: `/c/${token}/galeria`, label: galleryView.navGallery },
    { key: 'job', href: `/c/${token}/encargo`, label: galleryView.navJob },
  ]
  if (hasVideo) {
    items.push({ key: 'video', href: `/c/${token}/video`, label: galleryView.navVideo })
  }
  if (hasInvoice) {
    items.push({ key: 'invoice', href: `/c/${token}/factura`, label: galleryView.navInvoice })
  }

  return (
    <nav className="pm-clientnav" aria-label={galleryView.navJob}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="pm-clientnav__link"
          aria-current={item.key === active ? 'page' : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
