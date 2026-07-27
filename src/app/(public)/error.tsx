'use client'

import Link from 'next/link'
import { buttonClass } from '@/components/ui'
import { ui } from '@/content/ui'

/** La zona pública se disculpa sobria y ofrece volver. Ver docs/arquitectura.md. */
export default function PublicError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap pm-prose-wrap">
        <h1 className="pm-page__title">{ui.errorPublicTitle}</h1>
        <p className="pm-prose">{ui.errorPublicBody}</p>
        <p className="pm-contact__cta">
          <button className={buttonClass('primary')} onClick={reset} type="button">
            {ui.errorRetry}
          </button>{' '}
          <Link className={buttonClass('ghost')} href="/">
            {ui.errorHome}
          </Link>
        </p>
      </div>
    </section>
  )
}
