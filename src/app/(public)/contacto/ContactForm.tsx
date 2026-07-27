'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Field, buttonClass } from '@/components/ui'
import { contactPage } from '@/content/pages'
import { services } from '@/lib/services'
import { submitContact, type ContactState } from './actions'

const OPTIONS = services.map((s) => ({ label: s.name, slug: s.slug }))

export function ContactForm({ preselected }: { preselected?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, {})
  const v = state.values

  return (
    <form className="pm-form" action={action} noValidate>
      <Field label={contactPage.fields.name} name="name" required defaultValue={v?.name} error={state.errors?.name} />
      <Field
        label={contactPage.fields.email}
        name="email"
        type="email"
        required
        defaultValue={v?.email}
        error={state.errors?.email}
      />
      <Field label={contactPage.fields.phone} name="phone" type="tel" defaultValue={v?.phone} />

      <div className="pm-field">
        <label className="pm-field__label" htmlFor="service">
          {contactPage.fields.service}
        </label>
        <select
          className="pm-field__input"
          id="service"
          name="service"
          defaultValue={v?.service ?? preselected ?? ''}
        >
          <option value="">{contactPage.serviceDefault}</option>
          {OPTIONS.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pm-field">
        <label className="pm-field__label" htmlFor="message">
          {contactPage.fields.message}
        </label>
        <textarea
          className="pm-field__input pm-field__input--area"
          id="message"
          name="message"
          rows={5}
          required
          defaultValue={v?.message}
          aria-invalid={state.errors?.message ? true : undefined}
          aria-describedby={
            state.errors?.message ? 'message-hint message-error' : 'message-hint'
          }
        />
        <span className="pm-field__hint" id="message-hint">
          {contactPage.messageHint}
        </span>
        {state.errors?.message ? (
          <span className="pm-field__error" id="message-error" role="alert">
            {state.errors.message}
          </span>
        ) : null}
      </div>

      <div className="pm-field pm-field--check">
        <label>
          <input
            type="checkbox"
            name="consent"
            required
            aria-invalid={state.errors?.consent ? true : undefined}
            aria-describedby={state.errors?.consent ? 'consent-error' : undefined}
          />
          <span>
            {contactPage.consentBefore}
            <Link href="/legal/privacidad">{contactPage.consentLink}</Link>
            {contactPage.consentAfter}
          </span>
        </label>
        {state.errors?.consent ? (
          <span className="pm-field__error" id="consent-error" role="alert">
            {state.errors.consent}
          </span>
        ) : null}
      </div>

      {/* Campo trampa. Invisible para una persona, irresistible para un robot. */}
      <div className="pm-trap" aria-hidden="true">
        <label htmlFor="website">No rellenes esto</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.errors?.form ? (
        <p className="pm-field__error" role="alert">
          {state.errors.form}
        </p>
      ) : null}

      <button className={buttonClass('primary')} type="submit" disabled={pending}>
        {pending ? contactPage.submitting : contactPage.submit}
      </button>
    </form>
  )
}
