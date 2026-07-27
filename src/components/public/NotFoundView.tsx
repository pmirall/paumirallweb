import Link from 'next/link'
import { Eyebrow, buttonClass } from '@/components/ui'
import { notFoundPage } from '@/content/pages'

export function NotFoundView() {
  return (
    <section className="pm-slab pm-on-accent pm-texture pm-page">
      <div className="pm-wrap pm-contact">
        <Eyebrow surface="accent">{notFoundPage.eyebrow}</Eyebrow>
        <h1 className="pm-page__title">{notFoundPage.title}</h1>
        <p className="pm-lead pm-contact__lead">{notFoundPage.body}</p>
        <p className="pm-contact__cta">
          <Link className={buttonClass('primary')} href="/">
            {notFoundPage.home}
          </Link>{' '}
          <Link className={buttonClass('ghost')} href="/trabajo">
            {notFoundPage.work}
          </Link>
        </p>
      </div>
    </section>
  )
}
