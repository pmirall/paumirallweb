import Link from 'next/link'
import { db } from '@/db/client'
import { listQueue } from '@/db/queries/drive'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/ui'
import { queuePage } from '@/content/admin'
import { QueueRow } from './QueueRow'

export const dynamic = 'force-dynamic'

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const showAll = estado === 'todas'
  const rows = await listQueue(await db(), showAll ? undefined : 'pending')

  return (
    <>
      <PageHeader title={queuePage.title} subtitle={queuePage.subtitle} />

      <nav className="pm-filters" aria-label="Filtrar la cola">
        <Link className="pm-filter pm-hit" href="/admin/drive/cola" aria-current={!showAll ? 'page' : undefined}>
          {queuePage.filterPending}
        </Link>
        <Link className="pm-filter pm-hit" href="/admin/drive/cola?estado=todas" aria-current={showAll ? 'page' : undefined}>
          {queuePage.filterAll}
        </Link>
      </nav>

      {rows.length === 0 ? (
        <EmptyState level={2} title={queuePage.title} body={queuePage.empty} />
      ) : (
        <div className="pm-table-wrap">
          <table className="pm-table pm-queue">
            <thead>
              <tr>
                <th scope="col">{queuePage.columns.folder}</th>
                <th scope="col" className="pm-td--end">
                  {queuePage.columns.files}
                </th>
                <th scope="col" colSpan={3}>
                  {queuePage.columns.client} · {queuePage.columns.category}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((folder) => (
                <QueueRow key={folder.id} folder={folder} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
