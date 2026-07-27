import Link from 'next/link'
import { Eyebrow, buttonClass } from '@/components/ui'
import { contact } from '@/content/landing'

export function Contact() {
  return (
    <section
      className="pm-slab pm-slab--cut pm-on-accent pm-texture"
      id="contacto"
      aria-labelledby="pm-contact-title"
    >
      <div className="pm-wrap pm-contact pm-rise">
        <Eyebrow surface="accent">{contact.eyebrow}</Eyebrow>
        <h2 id="pm-contact-title">{contact.title}</h2>
        <p className="pm-lead pm-contact__lead">{contact.lead}</p>
        <p className="pm-contact__cta">
          <Link className={buttonClass('primary')} href={contact.cta.href}>
            {contact.cta.label}
          </Link>
        </p>
        <dl className="pm-contact__rows">
          {contact.rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>
                <a className="pm-hit" href={row.href}>
                  {row.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
