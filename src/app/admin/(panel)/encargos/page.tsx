import Link from 'next/link'
import { db } from '@/db/client'
import { listJobs } from '@/db/queries/jobs'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState, Tag, buttonClass } from '@/components/ui'
import { jobCategoryLabels, jobStatusLabels, jobsPage } from '@/content/admin'
import { JOB_STATUSES } from '@/db/schema'
import { formatEuros } from '@/lib/format'
import { formatDate } from '@/lib/dates'

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>
}) {
  const { estado } = await searchParams
  const status = (JOB_STATUSES as readonly string[]).includes(estado ?? '') ? estado : undefined
  const rows = await listJobs(await db(), status)

  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    { key: 'title', header: jobsPage.columns.title, render: (r) => r.title },
    { key: 'client', header: jobsPage.columns.client, render: (r) => r.clientName },
    {
      key: 'category',
      header: jobsPage.columns.category,
      render: (r) => <Tag tone="accent">{jobCategoryLabels[r.category]}</Tag>,
    },
    {
      key: 'status',
      header: jobsPage.columns.status,
      render: (r) => <Tag tone="neutral">{jobStatusLabels[r.status]}</Tag>,
    },
    { key: 'shoot', header: jobsPage.columns.shoot, render: (r) => formatDate(r.shootDate) },
    {
      key: 'budget',
      header: jobsPage.columns.budget,
      render: (r) => (r.budgetCents != null ? formatEuros(r.budgetCents) : '—'),
      align: 'end',
    },
  ]

  return (
    <>
      <PageHeader
        title={jobsPage.title}
        subtitle={jobsPage.subtitle}
        actions={
          <Link className={buttonClass('primary', true)} href="/admin/encargos/nuevo">
            {jobsPage.newJob}
          </Link>
        }
      />

      <nav className="pm-filters" aria-label="Filtrar por estado">
        <Link
          className="pm-filter pm-hit"
          href="/admin/encargos"
          aria-current={!status ? 'page' : undefined}
        >
          {jobsPage.filterAll}
        </Link>
        {JOB_STATUSES.map((s) => (
          <Link
            key={s}
            className="pm-filter pm-hit"
            href={`/admin/encargos?estado=${s}`}
            aria-current={status === s ? 'page' : undefined}
          >
            {jobStatusLabels[s]}
          </Link>
        ))}
      </nav>

      {rows.length === 0 ? (
        <EmptyState level={2} title={jobsPage.title} body={jobsPage.empty} />
      ) : (
        <DataTable columns={columns} rows={rows} hrefFor={(r) => `/admin/encargos/${r.id}`} />
      )}
    </>
  )
}
