'use client'

import { useState } from 'react'
import { buttonClass } from '@/components/ui'
import { jobDetail } from '@/content/admin'
import { formatEuros } from '@/lib/format'
import { createQuoteAction } from '@/app/admin/(panel)/encargos/[id]/actions'

const t = jobDetail.quotes

interface Line {
  description: string
  quantity: string
  unitEuros: string
  taxRate: string
}

const emptyLine: Line = { description: '', quantity: '1', unitEuros: '', taxRate: '21' }

/**
 * Editor de presupuesto: líneas que se añaden y se quitan, con total en vivo. Al
 * enviar, las líneas van en un campo JSON que la Server Action valida; el importe
 * se pasa a céntimos en el servidor. Números como texto en el estado para no
 * pelear con el input; se convierten al calcular y al serializar.
 */
export function QuoteEditor({ jobId }: { jobId: string }) {
  const [lines, setLines] = useState<Line[]>([{ ...emptyLine }])

  function update(i: number, patch: Partial<Line>) {
    setLines((prev) => prev.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  }
  function addLine() {
    setLines((prev) => [...prev, { ...emptyLine }])
  }
  function removeLine(i: number) {
    setLines((prev) => (prev.length === 1 ? prev : prev.filter((_, j) => j !== i)))
  }

  const valid = lines
    .map((l) => ({
      description: l.description.trim(),
      quantity: Number(l.quantity),
      unitEuros: Number(l.unitEuros),
      taxRate: Number(l.taxRate),
    }))
    .filter(
      (l) =>
        l.description.length > 0 &&
        Number.isFinite(l.quantity) &&
        l.quantity > 0 &&
        Number.isFinite(l.unitEuros) &&
        l.unitEuros >= 0 &&
        Number.isFinite(l.taxRate),
    )

  const totalCents = valid.reduce((sum, l) => {
    const base = l.quantity * Math.round(l.unitEuros * 100)
    return sum + base + Math.round((base * l.taxRate) / 100)
  }, 0)

  return (
    <form action={createQuoteAction.bind(null, jobId)} className="pm-quoteform">
      <input type="hidden" name="lines" value={JSON.stringify(valid)} />

      <div className="pm-quoteform__lines">
        {lines.map((line, i) => (
          <div key={i} className="pm-quoteform__line">
            <input
              className="pm-field__input pm-quoteform__desc"
              value={line.description}
              onChange={(e) => update(i, { description: e.target.value })}
              placeholder={t.lineDescription}
              aria-label={t.lineDescription}
            />
            <input
              className="pm-field__input pm-quoteform__num"
              type="number"
              min="1"
              value={line.quantity}
              onChange={(e) => update(i, { quantity: e.target.value })}
              aria-label={t.lineQty}
            />
            <input
              className="pm-field__input pm-quoteform__num"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={line.unitEuros}
              onChange={(e) => update(i, { unitEuros: e.target.value })}
              placeholder={t.lineUnit}
              aria-label={t.lineUnit}
            />
            <input
              className="pm-field__input pm-quoteform__num"
              type="number"
              min="0"
              max="100"
              value={line.taxRate}
              onChange={(e) => update(i, { taxRate: e.target.value })}
              aria-label={t.lineTax}
            />
            <button
              type="button"
              className="pm-queue__link"
              onClick={() => removeLine(i)}
              aria-label={t.removeLine}
            >
              {t.removeLine}
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={buttonClass('ghost', true)} onClick={addLine}>
        {t.addLine}
      </button>

      <div className="pm-quoteform__meta">
        <label className="pm-field">
          <span className="pm-field__label">{t.validUntil}</span>
          <input className="pm-field__input" type="date" name="validUntil" />
        </label>
        <label className="pm-field pm-quoteform__notes">
          <span className="pm-field__label">{t.notes}</span>
          <input className="pm-field__input" name="notes" />
        </label>
      </div>

      <div className="pm-quoteform__foot">
        <span className="pm-quoteform__total">
          {t.total}: <strong>{formatEuros(totalCents)}</strong>
        </span>
        <button className={buttonClass('primary')} type="submit" disabled={valid.length === 0}>
          {t.create}
        </button>
      </div>
      {valid.length === 0 ? <p className="pm-field__hint">{t.needLine}</p> : null}
    </form>
  )
}
