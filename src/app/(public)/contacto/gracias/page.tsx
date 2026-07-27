import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow, buttonClass } from '@/components/ui'
import { thanksPage } from '@/content/pages'

export const metadata: Metadata = { title: 'Gracias · Pau Miralles', robots: { index: false } }

export default function ThanksPage() {
  return (
    <section className="pm-slab pm-on-accent pm-texture pm-page">
      <div className="pm-wrap pm-contact">
        <Eyebrow surface="accent">{thanksPage.eyebrow}</Eyebrow>
        <h1 className="pm-page__title">{thanksPage.title}</h1>
        <p className="pm-lead pm-contact__lead">{thanksPage.body}</p>
        <p className="pm-contact__cta">
          <Link className={buttonClass('primary')} href="/">
            {thanksPage.back}
          </Link>
        </p>
      </div>
    </section>
  )
}
