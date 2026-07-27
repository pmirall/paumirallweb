import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { getClient, getClientJobs } from '@/db/queries/clients'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { PageHeader } from '@/components/admin/PageHeader'
import { MetricCard } from '@/components/admin/MetricCard'
import { EmptyState, Tag } from '@/components/ui'
import { clientsPage, jobCategoryLabels, jobStatusLabels } from '@/content/admin'
import { formatEuros } from '@/lib/format'
import { formatDate } from '@/lib/dates'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const database = await db()
  const client = await getClient(database, id)
  if (!client) notFound()

  const jobs = await getClientJobs(database, id)
  const billed = jobs.reduce((sum, j) => sum + (j.budgetCents ?? 0), 0)

  type Row = (typeof jobs)[number]
  const columns: Column<Row>[] = [
    { key: 'title', header: 'Encargo', render: (r) => r.title },
    {
      key: 'category',
      header: 'Tipo',
      render: (r) => <Tag tone="accent">{jobCategoryLabels[r.category]}</Tag>,
    },
    {
      key: 'status',
      header: 'Estado',
      render: (r) => <Tag tone="neutral">{jobStatusLabels[r.status]}</Tag>,
    },
    { key: 'shoot', header: 'Rodaje', render: (r) => formatDate(r.shootDate) },
    {
      key: 'budget',
      header: 'Presupuesto',
      render: (r) => (r.budgetCents != null ? formatEuros(r.budgetCents) : '—'),
      align: 'end',
    },
  ]

  return (
    <>
      <PageHeader title={client.name} subtitle={clientsPage.detailSubtitle} />

      <div className="pm-metrics">
        <MetricCard label={clientsPage.columns.jobs} value={jobs.length} />
        <div className="pm-metric">
          <span className="pm-metric__value">{formatEuros(billed)}</span>
          <span className="pm-metric__label">{clientsPage.billedLabel}</span>
        </div>
      </div>

      <section className="pm-panel">
        <h2 className="pm-panel__title">{clientsPage.jobsTitle}</h2>
        {jobs.length === 0 ? (
          <EmptyState level={3} title={clientsPage.jobsTitle} body={clientsPage.noJobs} />
        ) : (
          <DataTable columns={columns} rows={jobs} hrefFor={(r) => `/admin/encargos/${r.id}`} />
        )}
      </section>
    </>
  )
}
