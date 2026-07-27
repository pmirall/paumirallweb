import type { Metadata } from 'next'
import { Eyebrow, Plate } from '@/components/ui'
import { aboutPage } from '@/content/pages'

export const metadata: Metadata = {
  title: 'Sobre mí · Pau Miralles',
  description: aboutPage.body[0],
}

export default function AboutPage() {
  return (
    <section className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap pm-about">
        <Plate className="pm-about__plate" ratio="4 / 5" note={aboutPage.portraitNote} />
        <div>
          <Eyebrow surface="bone">{aboutPage.eyebrow}</Eyebrow>
          <h1 className="pm-page__title">{aboutPage.title}</h1>
          {aboutPage.body.map((paragraph) => (
            <p className="pm-prose" key={paragraph}>
              {paragraph}
            </p>
          ))}
          <div className="pm-chips">
            {aboutPage.chips.map((chip) => (
              <span className="pm-chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
