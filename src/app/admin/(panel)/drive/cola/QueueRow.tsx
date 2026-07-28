import { Tag, buttonClass } from '@/components/ui'
import { jobCategoryLabels, queuePage } from '@/content/admin'
import { JOB_CATEGORIES } from '@/db/schema'
import { containerAction, enrichAction, ignoreAction } from '../actions'

type Folder = {
  id: string
  name: string
  fileCount: number
  queueStatus: string
  suggestedClientName: string | null
  suggestedDate: string | null
  dateAmbiguous: string | null
}

/**
 * Una fila de la cola. La fecha sugerida se muestra como sugerencia, y si es
 * dudosa se dice; nunca se aplica una fecha inventada. Ver ADR 0012.
 */
export function QueueRow({ folder }: { folder: Folder }) {
  const done = folder.queueStatus !== 'pending'

  if (done) {
    return (
      <tr>
        <td>{folder.name}</td>
        <td className="pm-td--end">{folder.fileCount}</td>
        <td colSpan={3} className="pm-queue__resolved">
          <Tag tone={folder.queueStatus === 'ignored' ? 'neutral' : 'ok'}>
            {queuePage.queueStatusLabels[folder.queueStatus as keyof typeof queuePage.queueStatusLabels]}
          </Tag>
        </td>
      </tr>
    )
  }

  return (
    <tr>
      <td>
        <span className="pm-queue__name">{folder.name}</span>
        <span className="pm-queue__meta">
          {folder.suggestedDate ? (
            folder.suggestedDate
          ) : folder.dateAmbiguous ? (
            <em>{queuePage.ambiguous}</em>
          ) : (
            queuePage.noDate
          )}
        </span>
      </td>
      <td className="pm-td--end">{folder.fileCount}</td>
      <td colSpan={3}>
        <form action={enrichAction.bind(null, folder.id)} className="pm-queue__form">
          <input
            className="pm-field__input pm-queue__client"
            name="clientName"
            aria-label={queuePage.columns.client}
            defaultValue={folder.suggestedClientName ?? ''}
            placeholder={queuePage.columns.client}
          />
          <select
            className="pm-field__input pm-queue__cat"
            name="category"
            aria-label={queuePage.columns.category}
            defaultValue="artist"
          >
            {JOB_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {jobCategoryLabels[c]}
              </option>
            ))}
          </select>
          <label className="pm-queue__pub">
            <input type="checkbox" name="published" />
            <span>{queuePage.publishLabel}</span>
          </label>
          <div className="pm-queue__actions">
            <button className={buttonClass('primary', true)} type="submit">
              {queuePage.enrich}
            </button>
            <button className="pm-queue__link" formAction={containerAction.bind(null, folder.id)}>
              {queuePage.markContainer}
            </button>
            <button className="pm-queue__link" formAction={ignoreAction.bind(null, folder.id)}>
              {queuePage.ignore}
            </button>
          </div>
        </form>
      </td>
    </tr>
  )
}
