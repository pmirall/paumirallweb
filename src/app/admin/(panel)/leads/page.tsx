import { db } from '@/db/client'
import { listLeads } from '@/db/queries/leads'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState, Tag } from '@/components/ui'
import { leadStatusLabels, leadsPage } from '@/content/admin'
import { formatDate } from '@/lib/dates'

export default async function LeadsPage() {
  const rows = await listLeads(await db())

  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    { key: 'name', header: leadsPage.columns.name, render: (r) => r.name },
    { key: 'service', header: leadsPage.columns.service, render: (r) => r.service ?? '—' },
    {
      key: 'status',
      header: leadsPage.columns.status,
      render: (r) => (
        <Tag tone={r.status === 'new' ? 'notice' : 'neutral'}>{leadStatusLabels[r.status]}</Tag>
      ),
    },
    {
      key: 'date',
      header: leadsPage.columns.date,
      render: (r) => formatDate(r.createdAt),
      align: 'end',
    },
  ]

  return (
    <>
      <PageHeader title={leadsPage.title} subtitle={leadsPage.subtitle} />
      {rows.length === 0 ? (
        <EmptyState level={2} title={leadsPage.title} body={leadsPage.empty} />
      ) : (
        <DataTable columns={columns} rows={rows} hrefFor={(r) => `/admin/leads/${r.id}`} />
      )}
    </>
  )
}
