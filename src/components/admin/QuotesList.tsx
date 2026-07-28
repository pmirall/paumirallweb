'use client'

import { useState, useTransition } from 'react'
import { buttonClass } from '@/components/ui'
import { jobDetail } from '@/content/admin'
import { formatEuros } from '@/lib/format'
import { markQuoteSentAction } from '@/app/admin/(panel)/encargos/[id]/actions'

const t = jobDetail.quotes

export interface QuoteRow {
  id: string
  number: string
  status: string
  totalCents: number
  publicToken: string
}

/** Los presupuestos del encargo, con su enlace público y el botón de enviar. */
export function QuotesList({
  jobId,
  quotes,
  siteUrl,
}: {
  jobId: string
  quotes: QuoteRow[]
  siteUrl: string
}) {
  const [pending, startTransition] = useTransition()
  const [copied, setCopied] = useState<string | null>(null)

  async function copy(token: string) {
    try {
      await navigator.clipboard.writeText(`${siteUrl}/p/${token}`)
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Sin portapapeles no pasa nada: el enlace sigue a la vista.
    }
  }

  if (quotes.length === 0) return <p className="pm-field__hint">{t.empty}</p>

  return (
    <ul className="pm-list">
      {quotes.map((q) => (
        <li key={q.id} className="pm-list__item">
          <div>
            <span className="pm-list__title">{q.number}</span>
            <span className="pm-list__meta">
              {t.statuses[q.status] ?? q.status} · {formatEuros(q.totalCents)}
            </span>
          </div>
          <div className="pm-quotes__actions">
            <button
              type="button"
              className={buttonClass('ghost', true)}
              onClick={() => copy(q.publicToken)}
            >
              {copied === q.publicToken ? t.copied : t.copyLink}
            </button>
            {q.status === 'draft' ? (
              <button
                type="button"
                className={buttonClass('ghost', true)}
                disabled={pending}
                onClick={() => startTransition(() => void markQuoteSentAction(jobId, q.id))}
              >
                {t.send}
              </button>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  )
}
