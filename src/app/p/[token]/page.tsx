import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { getQuoteByPublicToken } from '@/db/queries/quotes'
import { Eyebrow } from '@/components/ui'
import { quoteView } from '@/content/quote'
import { formatEuros } from '@/lib/format'
import { formatDate } from '@/lib/dates'
import { QuoteDecision } from './QuoteDecision'

export const dynamic = 'force-dynamic'

/** El presupuesto visto por el cliente, con su decisión. Token inválido, 404. */
export default async function PublicQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const found = await getQuoteByPublicToken(await db(), token)
  if (!found) notFound()
  const { quote, lines } = found

  if (quote.status === 'accepted') {
    return <Resolved title={quoteView.acceptedTitle} body={quoteView.acceptedBody} />
  }
  if (quote.status === 'rejected' || quote.status === 'expired') {
    const rejected = quote.status === 'rejected'
    return (
      <Resolved
        title={rejected ? quoteView.rejectedTitle : quoteView.expiredTitle}
        body={rejected ? quoteView.rejectedBody : quoteView.expiredBody}
      />
    )
  }

  return (
    <section className="pm-quote">
      <Eyebrow surface="bone">{quoteView.eyebrow}</Eyebrow>
      <h1 className="pm-quote__title">{quote.number}</h1>
      <p className="pm-quote__valid">
        {quote.validUntil ? quoteView.validUntil(formatDate(quote.validUntil)) : quoteView.noExpiry}
      </p>

      <div className="pm-table-wrap">
        <table className="pm-table pm-quote__table">
          <thead>
            <tr>
              <th scope="col">{quoteView.colConcept}</th>
              <th scope="col" className="pm-td--end">{quoteView.colQty}</th>
              <th scope="col" className="pm-td--end">{quoteView.colUnit}</th>
              <th scope="col" className="pm-td--end">{quoteView.colLineTotal}</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id}>
                <td>{l.description}</td>
                <td className="pm-td--end">{l.quantity}</td>
                <td className="pm-td--end">{formatEuros(l.unitPriceCents)}</td>
                <td className="pm-td--end">{formatEuros(l.quantity * l.unitPriceCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="pm-quote__totals">
        <div>
          <dt>{quoteView.subtotal}</dt>
          <dd>{formatEuros(quote.subtotalCents)}</dd>
        </div>
        <div>
          <dt>{quoteView.tax}</dt>
          <dd>{formatEuros(quote.taxCents)}</dd>
        </div>
        <div className="pm-quote__grand">
          <dt>{quoteView.total}</dt>
          <dd>{formatEuros(quote.totalCents)}</dd>
        </div>
      </dl>

      {quote.notes ? (
        <div className="pm-quote__notes">
          <h2 className="pm-quote__h2">{quoteView.notesTitle}</h2>
          <p>{quote.notes}</p>
        </div>
      ) : null}

      <QuoteDecision token={token} />
    </section>
  )
}

function Resolved({ title, body }: { title: string; body: string }) {
  return (
    <section className="pm-gate">
      <Eyebrow surface="bone">{quoteView.eyebrow}</Eyebrow>
      <h1 className="pm-gate__title">{title}</h1>
      <p className="pm-gate__body">{body}</p>
      <a className="pm-link pm-hit" href={`mailto:${quoteView.contact}`}>
        {quoteView.contact}
      </a>
    </section>
  )
}
