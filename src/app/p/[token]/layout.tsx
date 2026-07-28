import type { Metadata } from 'next'
import Link from 'next/link'

/** Presupuesto público. Cabecera mínima, sin navegación del sitio. noindex. */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
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
