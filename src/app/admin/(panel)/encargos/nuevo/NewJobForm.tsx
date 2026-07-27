'use client'

import { useActionState } from 'react'
import { Field, buttonClass } from '@/components/ui'
import { jobCategoryLabels, newJobPage } from '@/content/admin'
import { JOB_CATEGORIES } from '@/db/schema'
import { createJobAction, type NewJobState } from './actions'

export function NewJobForm({ clients }: { clients: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<NewJobState, FormData>(createJobAction, {})

  return (
    <form className="pm-form" action={action}>
      <div className="pm-field">
        <label className="pm-field__label" htmlFor="clientId">
          {newJobPage.clientField}
        </label>
        <select className="pm-field__input" id="clientId" name="clientId" required defaultValue="">
          <option value="" disabled>
            —
          </option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {state.errors?.clientId ? (
          <span className="pm-field__error" role="alert">
            {state.errors.clientId}
          </span>
        ) : null}
      </div>

      <Field label={newJobPage.titleField} name="title" required error={state.errors?.title} />

      <div className="pm-field">
        <label className="pm-field__label" htmlFor="category">
          {newJobPage.categoryField}
        </label>
        <select className="pm-field__input" id="category" name="category" defaultValue="artist">
          {JOB_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {jobCategoryLabels[c]}
            </option>
          ))}
        </select>
      </div>

      <Field label={newJobPage.shootField} name="shootDate" type="date" />
      <Field label={newJobPage.budgetField} name="budget" type="number" inputMode="numeric" />

      <button className={buttonClass('primary')} type="submit" disabled={pending}>
        {newJobPage.submit}
      </button>
    </form>
  )
}
