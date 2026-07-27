import { Eyebrow } from '@/components/ui'
import { services as copy } from '@/content/landing'
import { services } from '@/lib/services'

/**
 * El precio es el titular, no la letra pequeña. Para quien contrata una sesión
 * es la información que decide si sigue leyendo. Ver docs/landing.md.
 */
export function Services() {
  return (
    <section
      className="pm-slab pm-slab--cut pm-on-ink"
      id="servicios"
      aria-labelledby="pm-services-title"
    >
      <div className="pm-wrap">
        <div className="pm-sec-head pm-rise">
          <div>
            <Eyebrow surface="ink">{copy.eyebrow}</Eyebrow>
            <h2 id="pm-services-title">{copy.title}</h2>
            <p className="pm-lead">{copy.lead}</p>
          </div>
        </div>

        <div className="pm-services">
          {services.map((service, i) => (
            <article className="pm-card pm-rise" data-d={i + 1} key={service.index}>
              <span className="pm-card__index">{service.index}</span>
              <h3>{service.name}</h3>
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
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
