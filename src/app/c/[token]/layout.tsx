import type { Metadata } from 'next'
import Link from 'next/link'

/** Zona de cliente. Sin navegación del sitio público, cabecera mínima. noindex
 *  por cabecera HTTP en el middleware. */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pm-client">
      <header className="pm-client__head">
        <Link className="pm-client__mark" href="/" aria-label="Pau Miralles">
          <img src="/brand/logo/logotipo.svg" alt="Pau Miralles" width={150} height={33} />
        </Link>
      </header>
      <main className="pm-client__main">{children}</main>
    </div>
  )
}
