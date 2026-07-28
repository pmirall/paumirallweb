import { db } from '@/db/client'
import {
  countJobsWithoutHours,
  listJobFinancials,
  sumUnassignedExpenses,
} from '@/db/queries/finance'
import { aggregateByCategory, computeProfitability } from '@/lib/finance/profitability'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/ui'
import { finance, jobCategoryLabels } from '@/content/admin'
import { formatEuros } from '@/lib/format'
import { formatDuration } from '@/lib/dates'

function rate(eurosPerHour: number | null): string {
  return eurosPerHour != null ? formatEuros(Math.round(eurosPerHour * 100)) : finance.noRate
}

export default async function FinancePage() {
  const database = await db()
  const jobsFin = await listJobFinancials(database)
  const withoutHours = await countJobsWithoutHours(database)
  const generalExpenses = await sumUnassignedExpenses(database)

  const serviceRows = aggregateByCategory(jobsFin).map((c) => {
    const p = computeProfitability(c.budgetCents, c.minutes, c.expensesCents)
    return { ...c, id: c.category, net: p.netCents, eurosPerHour: p.eurosPerHour }
  })

  const jobRows = jobsFin
    .map((j) => {
      const p = computeProfitability(j.budgetCents, j.minutes, j.expensesCents)
      return { ...j, id: j.jobId, net: p.netCents, eurosPerHour: p.eurosPerHour }
    })
    // Los que tienen euros por hora primero, y de mayor a menor.
    .sort((a, b) => (b.eurosPerHour ?? -1) - (a.eurosPerHour ?? -1))

  type ServiceRow = (typeof serviceRows)[number]
  const serviceColumns: Column<ServiceRow>[] = [
    { key: 'service', header: finance.colService, render: (r) => jobCategoryLabels[r.category] ?? r.category },
    { key: 'jobs', header: finance.colJobs, render: (r) => String(r.jobs), align: 'end' },
    { key: 'budget', header: finance.colBudget, render: (r) => formatEuros(r.budgetCents), align: 'end' },
    { key: 'expenses', header: finance.colExpenses, render: (r) => formatEuros(r.expensesCents), align: 'end' },
    { key: 'hours', header: finance.colHours, render: (r) => formatDuration(r.minutes), align: 'end' },
    { key: 'rate', header: finance.colRate, render: (r) => rate(r.eurosPerHour), align: 'end' },
  ]

  type JobRow = (typeof jobRows)[number]
  const jobColumns: Column<JobRow>[] = [
    { key: 'title', header: finance.colJob, render: (r) => r.title },
    {
      key: 'budget',
      header: finance.colBudget,
      render: (r) => (r.budgetCents != null ? formatEuros(r.budgetCents) : '—'),
      align: 'end',
    },
    { key: 'expenses', header: finance.colExpenses, render: (r) => formatEuros(r.expensesCents), align: 'end' },
    { key: 'net', header: finance.colNet, render: (r) => (r.net != null ? formatEuros(r.net) : '—'), align: 'end' },
    { key: 'hours', header: finance.colHours, render: (r) => formatDuration(r.minutes), align: 'end' },
    { key: 'rate', header: finance.colRate, render: (r) => rate(r.eurosPerHour), align: 'end' },
  ]

  return (
    <>
      <PageHeader title={finance.title} subtitle={finance.subtitle} />

      <p className="pm-notice" role="note">
        {finance.billingLater}
      </p>
      {withoutHours > 0 ? (
        <p className="pm-field__hint">{finance.missingHours(withoutHours)}</p>
      ) : null}
      {generalExpenses > 0 ? (
        <p className="pm-field__hint">
          {finance.generalExpenses}: {formatEuros(generalExpenses)}
        </p>
      ) : null}

      {jobsFin.length === 0 ? (
        <EmptyState level={2} title={finance.title} body={finance.empty} />
      ) : (
        <>
          <h2 className="pm-finance__h2">{finance.byServiceTitle}</h2>
          <DataTable columns={serviceColumns} rows={serviceRows} />

          <h2 className="pm-finance__h2">{finance.byJobTitle}</h2>
          <DataTable
            columns={jobColumns}
            rows={jobRows}
            hrefFor={(r) => `/admin/encargos/${r.jobId}?tab=dinero`}
          />
        </>
      )}
    </>
  )
}
