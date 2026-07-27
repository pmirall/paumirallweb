import type { InputHTMLAttributes } from 'react'
import { useId } from 'react'
import { cn } from './cn'

/**
 * Etiqueta y campo siempre asociados, y el error junto al campo, no arriba del
 * formulario. El error se anuncia a los lectores de pantalla, no solo se pinta
 * en rojo. Ver docs/design-system.md.
 */
type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  hint?: string
  error?: string
}

export function Field({ label, hint, error, className, ...rest }: Props) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = cn(hint && hintId, error && errorId) || undefined

  return (
    <div className={cn('pm-field', className)}>
      <label className="pm-field__label" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="pm-field__input"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      {hint ? (
        <span className="pm-field__hint" id={hintId}>
          {hint}
        </span>
      ) : null}
      {error ? (
        <span className="pm-field__error" id={errorId} role="alert">
          {error}
        </span>
      ) : null}
    </div>
  )
}
