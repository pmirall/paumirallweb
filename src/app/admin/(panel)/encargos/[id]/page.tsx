import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { getJobDetail } from '@/db/queries/job-mutations'
import { listTimeEntries, totalMinutesByJob } from '@/db/queries/time-entries'
import { hasPendingDeliverables } from '@/db/queries/jobs'
import { getGalleryForJob, listSubmittedFavorites } from '@/db/queries/admin-gallery'
import { isGalleryOpen } from '@/lib/gallery/status'
import { env } from '@/lib/env'
import { PageHeader } from '@/components/admin/PageHeader'
import { GalleryPanel } from '@/components/admin/GalleryPanel'
import { EmptyState, Tag, buttonClass } from '@/components/ui'
import {
  jobCategoryLabels,
  jobDetail,
  jobStatusLabels,
} from '@/content/admin'
import { JOB_STATUSES, TIME_ENTRY_KINDS } from '@/db/schema'
import { formatEuros } from '@/lib/format'
import { formatDate, formatDuration } from '@/lib/dates'
import {
  addTimeAction,
  changeStatusAction,
  saveNotesAction,
  toggleDeliverableAction,
} from './actions'

const TABS = ['resumen', 'archivos', 'galeria', 'dinero', 'notas'] as const
type TabKey = (typeof TABS)[number]

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const active: TabKey = (TABS as readonly string[]).includes(tab ?? '') ? (tab as TabKey) : 'resumen'

  const database = await db()
  const detail = await getJobDetail(database, id)
  if (!detail) notFound()
  const { job, client, deliverables } = detail
  const pending = await hasPendingDeliverables(database, id)
  const timeEntries = await listTimeEntries(database, id)
  const totalMinutes = await totalMinutesByJob(database, id)

  // La galería solo se consulta en su pestaña; el resto no la necesita.
  const galleryRow = active === 'galeria' ? await getGalleryForJob(database, id) : undefined
  const submitted =
    active === 'galeria' && galleryRow ? await listSubmittedFavorites(database, galleryRow.id) : []

  return (
    <>
      <PageHeader
        title={job.title}
        subtitle={`${job.code} · ${client.name}`}
        actions={
          <>
            <Tag tone="accent">{jobCategoryLabels[job.category]}</Tag>{' '}
            <Tag tone="neutral">{jobStatusLabels[job.status]}</Tag>
          </>
        }
      />

      {/* Las pestañas van en la query, no en segmentos de ruta, para que el
          enlace se pueda compartir. Ver docs/mapa-de-rutas.md. */}
      <nav className="pm-tabs" aria-label="Secciones del encargo">
        {TABS.map((key) => (
          <Link
            key={key}
            className="pm-tab pm-hit"
            href={`/admin/encargos/${id}?tab=${key}`}
            aria-current={active === key ? 'page' : undefined}
          >
            {jobDetail.tabs[key]}
          </Link>
        ))}
      </nav>

      {active === 'resumen' ? (
        <div className="pm-detail">
          <dl className="pm-detail__facts">
            <div>
              <dt>{jobDetail.clientLabel}</dt>
              <dd>
                <Link className="pm-hit" href={`/admin/clientes/${client.id}`}>
                  {client.name}
                </Link>
              </dd>
            </div>
            <div>
              <dt>{jobDetail.shootLabel}</dt>
              <dd>{formatDate(job.shootDate)}</dd>
            </div>
            <div>
              <dt>{jobDetail.dueLabel}</dt>
              <dd>{formatDate(job.dueDate)}</dd>
            </div>
            <div>
              <dt>{jobDetail.budgetLabel}</dt>
              <dd>{job.budgetCents != null ? formatEuros(job.budgetCents) : '—'}</dd>
            </div>
            {job.deliveredAt ? (
              <div>
                <dt>{jobDetail.deliveredLabel}</dt>
                <dd>{formatDate(job.deliveredAt)}</dd>
              </div>
            ) : null}
          </dl>

          <form action={changeStatusAction.bind(null, id)} className="pm-statusform">
            <label className="pm-field__label" htmlFor="status">
              {jobDetail.changeStatus}
            </label>
            <div className="pm-statusform__row">
              <select className="pm-field__input" id="status" name="status" defaultValue={job.status}>
                {JOB_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {jobStatusLabels[s]}
                  </option>
                ))}
              </select>
              <button className={buttonClass('primary', true)} type="submit">
                {jobDetail.changeStatus}
              </button>
            </div>
            {pending ? (
              <p className="pm-field__hint" role="note">
                {jobDetail.statusPending}
              </p>
            ) : null}
          </form>

          <section className="pm-panel">
            <h2 className="pm-panel__title">{jobDetail.deliverablesTitle}</h2>
            {deliverables.length === 0 ? (
              <EmptyState
                level={3}
                title={jobDetail.deliverablesTitle}
                body={jobDetail.deliverablesEmpty}
              />
            ) : (
              <ul className="pm-checklist">
                {deliverables.map((item) => (
                  <li key={item.id} className="pm-checklist__item">
                    <span>
                      {item.description}
                      {item.quantity ? ` · ${item.quantity}` : ''}
                    </span>
                    <form
                      action={toggleDeliverableAction.bind(null, id, item.id, !item.delivered)}
                    >
                      <button
                        className={item.delivered ? 'pm-check is-done' : 'pm-check'}
                        type="submit"
                      >
                        {item.delivered ? jobDetail.deliverableDone : jobDetail.markDelivered}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="pm-panel">
            <div className="pm-time-head">
              <h2 className="pm-panel__title">{jobDetail.timeTitle}</h2>
              <span className="pm-time-total">
                {jobDetail.timeTotal}: <strong>{formatDuration(totalMinutes)}</strong>
              </span>
            </div>

            <form action={addTimeAction.bind(null, id)} className="pm-timeform">
              <label className="pm-timeform__field">
                <span className="pm-field__label">{jobDetail.timeDate}</span>
                <input className="pm-field__input" type="date" name="date" required />
              </label>
              <label className="pm-timeform__field">
                <span className="pm-field__label">{jobDetail.timeMinutes}</span>
                <input
                  className="pm-field__input"
                  type="number"
                  name="minutes"
                  inputMode="numeric"
                  min={1}
                  required
                />
              </label>
              <label className="pm-timeform__field">
                <span className="pm-field__label">{jobDetail.timeKind}</span>
                <select className="pm-field__input" name="kind" defaultValue="shoot">
                  {TIME_ENTRY_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {jobDetail.timeKinds[k]}
                    </option>
                  ))}
                </select>
              </label>
              <button className={buttonClass('primary', true)} type="submit">
                {jobDetail.timeAdd}
              </button>
            </form>

            {timeEntries.length === 0 ? (
              <p className="pm-field__hint">{jobDetail.timeEmpty}</p>
            ) : (
              <ul className="pm-list">
                {timeEntries.map((entry) => (
                  <li key={entry.id} className="pm-list__item">
                    <div>
                      <span className="pm-list__title">{formatDuration(entry.minutes)}</span>
                      <span className="pm-list__meta">
                        {jobDetail.timeKinds[entry.kind]}
                        {entry.note ? ` · ${entry.note}` : ''}
                      </span>
                    </div>
                    <span className="pm-list__date">{formatDate(entry.date)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {active === 'archivos' ? (
        <EmptyState level={2} title={jobDetail.tabs.archivos} body={jobDetail.filesLaterr} />
      ) : null}
      {active === 'galeria' ? (
        <GalleryPanel
          jobId={id}
          clientUrl={galleryRow ? `${env.SITE_URL}/c/${galleryRow.token}` : ''}
          gallery={
            galleryRow
              ? {
                  token: galleryRow.token,
                  status: galleryRow.status,
                  watermark: galleryRow.watermark,
                  expiresAt: galleryRow.expiresAt.toISOString(),
                  expired: !isGalleryOpen(galleryRow, new Date()),
                }
              : null
          }
          favorites={submitted.map((f) => ({
            filename: f.filename,
            submittedAt: f.submittedAt ? f.submittedAt.toISOString() : null,
            clientNote: f.clientNote,
          }))}
        />
      ) : null}
      {active === 'dinero' ? (
        <EmptyState level={2} title={jobDetail.tabs.dinero} body={jobDetail.moneyLater} />
      ) : null}

      {active === 'notas' ? (
        <form action={saveNotesAction.bind(null, id)} className="pm-notesform">
          <label className="pm-field__label" htmlFor="notes">
            {jobDetail.notesTitle}
          </label>
          <textarea
            className="pm-field__input pm-field__input--area"
            id="notes"
            name="notes"
            rows={8}
            defaultValue={job.internalNotes ?? ''}
            placeholder={jobDetail.notesPlaceholder}
          />
          <button className={buttonClass('primary', true)} type="submit">
            {jobDetail.notesSave}
          </button>
        </form>
      ) : null}
    </>
  )
}
