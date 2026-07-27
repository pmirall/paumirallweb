import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow, buttonClass } from '@/components/ui'
import { servicesPage } from '@/content/pages'
import { services as copy } from '@/content/landing'
import { services } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Servicios y precios · Pau Miralles',
  description: servicesPage.lead,
}

export default function ServicesPage() {
  return (
    <>
      <section className="pm-slab pm-on-ink pm-page">
        <div className="pm-wrap">
          <Eyebrow surface="ink">{servicesPage.eyebrow}</Eyebrow>
          <h1 className="pm-page__title">{servicesPage.title}</h1>
          <p className="pm-lead">{servicesPage.lead}</p>

          <div className="pm-services pm-services--page">
            {services.map((service) => (
              <article className="pm-card" key={service.index}>
                <span className="pm-card__index">{service.index}</span>
                <h2>{service.name}</h2>
                <p>{service.summary}</p>
                <ul>
                  {service.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <p className="pm-price">
                  <small>{copy.fromLabel}</small>
                  <b>{Math.round(service.priceFromCents / 100)}</b>
                  <i>{copy.currency}</i>
                </p>
                {/* Reservar arrastra el servicio en la query. No hay ruta propia. */}
                <Link
                  className={buttonClass('accent', true)}
                  href={`/contacto?servicio=${service.slug}`}
                >
                  {servicesPage.bookLabel}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pm-slab pm-slab--cut pm-on-accent pm-texture">
        <div className="pm-wrap pm-contact">
          <h2>{servicesPage.fallbackTitle}</h2>
          <p className="pm-lead pm-contact__lead">{servicesPage.fallbackBody}</p>
          <p className="pm-contact__cta">
            <Link className={buttonClass('primary')} href="/contacto">
              {servicesPage.fallbackCta}
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
