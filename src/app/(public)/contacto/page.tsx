import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow } from '@/components/ui'
import { contact } from '@/content/landing'
import { contactPage } from '@/content/pages'
import { isServiceSlug } from '@/lib/services'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Contacto · Pau Miralles',
  description: contactPage.lead,
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  // Se valida contra los slugs de servicios; uno desconocido se ignora sin
  // romper la página. Ver docs/mapa-de-rutas.md.
  const raw = Array.isArray(params.servicio) ? params.servicio[0] : params.servicio
  const servicio = isServiceSlug(raw) ? raw : undefined

  return (
    <section className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap pm-contact-grid">
        <div>
          <Eyebrow surface="bone">{contactPage.eyebrow}</Eyebrow>
          <h1 className="pm-page__title">{contactPage.title}</h1>
          <p className="pm-lead">{contactPage.lead}</p>
          <dl className="pm-contact__direct">
            {contact.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>
                  <Link className="pm-hit" href={row.href}>
                    {row.value}
                  </Link>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <ContactForm preselected={servicio} />
      </div>
    </section>
  )
}
