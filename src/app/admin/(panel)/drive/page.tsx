import Link from 'next/link'
import { db } from '@/db/client'
import { lastSyncRun } from '@/db/queries/drive'
import { PageHeader } from '@/components/admin/PageHeader'
import { MetricCard } from '@/components/admin/MetricCard'
import { buttonClass } from '@/components/ui'
import { drivePage } from '@/content/admin'
import { formatDate } from '@/lib/dates'
import { runSyncAction } from './actions'

export const dynamic = 'force-dynamic'

export default async function DrivePage() {
  const run = await lastSyncRun(await db())

  return (
    <>
      <PageHeader
        title={drivePage.title}
        subtitle={drivePage.subtitle}
        actions={
          <form action={runSyncAction}>
            <button className={buttonClass('primary', true)} type="submit">
              {drivePage.runSync}
            </button>
          </form>
        }
      />

      <p className="pm-notice" role="note">
        {drivePage.fakeNotice}
      </p>

      <p className="pm-field__hint">
        {drivePage.lastRun}: {run?.finishedAt ? formatDate(run.finishedAt) : drivePage.never}
      </p>

      <div className="pm-metrics">
        <MetricCard label={drivePage.foldersSeen} value={run?.foldersSeen ?? 0} />
        <MetricCard label={drivePage.foldersNew} value={run?.foldersNew ?? 0} href="/admin/drive/cola" />
        <MetricCard label={drivePage.filesNew} value={run?.filesNew ?? 0} />
        <MetricCard label={drivePage.errors} value={run?.errors ?? 0} emphasis />
      </div>

      <p>
        <Link className="pm-link pm-hit" href="/admin/drive/cola">
          {drivePage.queueLink} <span aria-hidden="true">→</span>
        </Link>
      </p>
    </>
  )
}
