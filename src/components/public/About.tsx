import Link from 'next/link'
import { Eyebrow, Plate } from '@/components/ui'
import { about } from '@/content/landing'

export function About() {
  return (
    <section
      className="pm-slab pm-slab--cut-rev pm-on-bone"
      id="sobre-mi"
      aria-labelledby="pm-about-title"
    >
      <div className="pm-wrap pm-about">
        <Plate className="pm-about__plate pm-rise" ratio="4 / 5" note={about.platePlaceholder} />
        <div className="pm-rise" data-d={1}>
          <Eyebrow surface="bone">{about.eyebrow}</Eyebrow>
          <h2 id="pm-about-title">{about.title}</h2>
          <p className="pm-lead">{about.lead}</p>
          <div className="pm-chips">
            {about.chips.map((chip) => (
              <span className="pm-chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
          <Link className="pm-link pm-hit" href={about.more.href}>
            {about.more.label} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
