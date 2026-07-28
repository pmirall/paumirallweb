import { jobDetail } from '@/content/admin'
import { buttonClass } from '@/components/ui'
import { formatEuros } from '@/lib/format'
import { formatDate } from '@/lib/dates'
import { PAYMENT_METHODS } from '@/db/schema'
import { issueInvoiceAction, registerPaymentAction } from '@/app/admin/(panel)/encargos/[id]/actions'

const t = jobDetail.invoices
// El TPV externo y el efectivo se cobran a mano; Stripe entra por su webhook.
const MANUAL_METHODS = PAYMENT_METHODS.filter((m) => m !== 'stripe')

export interface InvoiceView {
  id: string
  number: string
  status: string
  totalCents: number
  paidCents: number
  pdfUrl: string | null
  verificationUrl: string | null
  issuedAt: string | null
  dueAt: string | null
}

/**
 * Las facturas del encargo y el registro de cobros. Emitir va contra el proveedor
 * (falso por ahora). El cobro es manual: efectivo, transferencia o TPV externo.
 * Al cubrir el total, la factura queda pagada. Server Component: solo formularios.
 */
export function InvoicePanel({
  jobId,
  invoices,
  canIssue,
}: {
  jobId: string
  invoices: InvoiceView[]
  canIssue: boolean
}) {
  return (
    <div className="pm-invoices">
      {invoices.length === 0 ? <p className="pm-field__hint">{t.empty}</p> : null}

      {invoices.map((inv) => {
        const owed = Math.max(0, inv.totalCents - inv.paidCents)
        const settled = inv.status === 'paid'
        return (
          <article key={inv.id} className="pm-invoice">
            <header className="pm-invoice__head">
              <div>
                <span className="pm-invoice__number">{inv.number}</span>
                <span className="pm-invoice__meta">
                  {t.statuses[inv.status] ?? inv.status} · {formatEuros(inv.totalCents)}
                  {inv.dueAt ? ` · ${t.pending} ${formatDate(inv.dueAt)}` : ''}
                </span>
              </div>
              <div className="pm-invoice__links">
                {inv.pdfUrl ? (
                  <a className="pm-link pm-hit" href={inv.pdfUrl} target="_blank" rel="noreferrer">
                    {t.pdf}
                  </a>
                ) : null}
                {inv.verificationUrl ? (
                  <a className="pm-link pm-hit" href={inv.verificationUrl} target="_blank" rel="noreferrer">
                    {t.verify}
                  </a>
                ) : null}
              </div>
            </header>

            <p className="pm-invoice__balance">
              {t.paidLabel}: {formatEuros(inv.paidCents)}
              {!settled ? ` · ${t.owedLabel}: ${formatEuros(owed)}` : ''}
            </p>

            {!settled ? (
              <form
                action={registerPaymentAction.bind(null, jobId, inv.id)}
                className="pm-paymentform"
              >
                <input
                  className="pm-field__input pm-paymentform__amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  defaultValue={(owed / 100).toFixed(2)}
                  aria-label={t.amount}
                  required
                />
                <select className="pm-field__input" name="method" aria-label={t.method} defaultValue="cash">
                  {MANUAL_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {t.methods[m]}
                    </option>
                  ))}
                </select>
                <input
                  className="pm-field__input pm-paymentform__ref"
                  name="reference"
                  placeholder={t.reference}
                  aria-label={t.reference}
                />
                <button className={buttonClass('primary', true)} type="submit">
                  {t.register}
                </button>
              </form>
            ) : null}
          </article>
        )
      })}

      {canIssue ? (
        <form action={issueInvoiceAction.bind(null, jobId)} className="pm-invoices__issue">
          <button className={buttonClass('accent')} type="submit">
            {t.issue}
          </button>
          <span className="pm-field__hint">{t.issueHint}</span>
        </form>
      ) : null}
    </div>
  )
}
