'use client'

import { useTransition } from 'react'
import { buttonClass } from '@/components/ui'
import { quoteView } from '@/content/quote'
import { acceptQuoteAction, rejectQuoteAction } from './actions'

/** Los dos botones de decisión del presupuesto. Aceptar o dejarlo para luego. */
export function QuoteDecision({ token }: { token: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <div className="pm-quote__actions">
      <button
        type="button"
        className={buttonClass('accent')}
        disabled={pending}
        onClick={() => startTransition(() => void acceptQuoteAction(token))}
      >
        {quoteView.accept}
      </button>
      <button
        type="button"
        className={buttonClass('ghost')}
        disabled={pending}
        onClick={() => startTransition(() => void rejectQuoteAction(token))}
      >
        {quoteView.reject}
      </button>
    </div>
  )
}
