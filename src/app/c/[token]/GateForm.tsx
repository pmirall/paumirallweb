'use client'

import { useActionState } from 'react'
import { buttonClass } from '@/components/ui'
import { gate } from '@/content/gallery'
import { submitPin, type GateResult } from './actions'

const initial: GateResult = { ok: true }

export function GateForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<GateResult, FormData>(
    (_prev, formData) => submitPin(token, formData),
    initial,
  )

  return (
    <form className="pm-gate__form" action={action}>
      <label className="pm-field__label" htmlFor="pin">
        {gate.enterPin}
      </label>
      <input
        className="pm-field__input pm-gate__pin"
        id="pin"
        name="pin"
        inputMode="numeric"
        autoComplete="off"
        maxLength={4}
        pattern="[0-9]*"
        required
        autoFocus
        aria-describedby="pin-hint"
      />
      <span className="pm-field__hint" id="pin-hint">
        {gate.pinHint}
      </span>

      {!state.ok && state.reason === 'wrong' ? (
        <p className="pm-field__error" role="alert">
          {gate.wrongPin} {gate.attemptsLeft(state.attemptsLeft)}
        </p>
      ) : null}
      {!state.ok && state.reason === 'blocked' ? (
        <p className="pm-field__error" role="alert">
          {gate.blocked}
        </p>
      ) : null}
      {!state.ok && state.reason === 'expired' ? (
        <p className="pm-field__error" role="alert">
          {gate.expiredBody}
        </p>
      ) : null}

      <button className={buttonClass('primary')} type="submit" disabled={pending}>
        {gate.submit}
      </button>
    </form>
  )
}
