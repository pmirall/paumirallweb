import { db } from '@/db/client'
import {
  countActiveJobs,
  countNewLeads,
  countPendingDeliveries,
  countUpcomingShoots,
  listActiveJobs,
  listRecentLeads,
  listUpcomingShoots,
} from '@/db/queries/dashboard'
import { MetricCard } from '@/components/admin/MetricCard'
import { PageHeader } from '@/components/admin/PageHeader'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { EmptyState, Tag } from '@/components/ui'
import {
  dashboard,
  jobCategoryLabels,
  jobStatusLabels,
  leadStatusLabels,
} from '@/content/admin'
import { formatDate, todayIso } from '@/lib/dates'

/** Se diseña pensando primero en el móvil. Ver docs/mapa-de-rutas.md. */
export default async function DashboardPage() {
  const database = await db()
  const today = todayIso(new Date())

  const [activeCount, pendingCount, upcomingCount, newLeadsCount, active, upcoming, recentLeads] =
    await Promise.all([
      countActiveJobs(database),
      countPendingDeliveries(database),
      countUpcomingShoots(database, today),
      countNewLeads(database),
      listActiveJobs(database),
      listUpcomingShoots(database, today),
      listRecentLeads(database),
    ])

  type ActiveRow = (typeof active)[number]
  const activeColumns: Column<ActiveRow>[] = [
    { key: 'title', header: 'Encargo', render: (r) => r.title },
    { key: 'client', header: 'Cliente', render: (r) => r.clientName },
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
    { key: 'shoot', header: 'Rodaje', render: (r) => formatDate(r.shootDate), align: 'end' },
  ]

  return (
    <>
      <PageHeader title={dashboard.title} subtitle={dashboard.subtitle} />

      <div className="pm-metrics">
        <MetricCard label={dashboard.metrics.activeJobs} value={activeCount} href="/admin/encargos" />
        <MetricCard
          label={dashboard.metrics.pendingDeliveries}
          value={pendingCount}
          href="/admin/encargos"
          emphasis
        />
        <MetricCard label={dashboard.metrics.upcomingShoots} value={upcomingCount} />
        <MetricCard
          label={dashboard.metrics.newLeads}
          value={newLeadsCount}
          href="/admin/leads"
          emphasis
        />
      </div>

      <section className="pm-panel">
        <h2 className="pm-panel__title">{dashboard.activeTitle}</h2>
        {active.length === 0 ? (
          <EmptyState level={3} title={dashboard.activeTitle} body={dashboard.activeEmpty} />
        ) : (
          <DataTable
            columns={activeColumns}
            rows={active}
            hrefFor={(r) => `/admin/encargos/${r.id}`}
            caption={dashboard.activeTitle}
          />
        )}
      </section>

      <div className="pm-panel-grid">
        <section className="pm-panel">
          <h2 className="pm-panel__title">{dashboard.upcomingTitle}</h2>
          {upcoming.length === 0 ? (
            <EmptyState level={3} title={dashboard.upcomingTitle} body={dashboard.upcomingEmpty} />
          ) : (
            <ul className="pm-list">
              {upcoming.map((shoot) => (
                <li key={shoot.id} className="pm-list__item">
                  <div>
                    <span className="pm-list__title">{shoot.title}</span>
                    <span className="pm-list__meta">{shoot.clientName}</span>
                  </div>
                  <span className="pm-list__date">{formatDate(shoot.shootDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="pm-panel">
          <h2 className="pm-panel__title">{dashboard.leadsTitle}</h2>
          {recentLeads.length === 0 ? (
            <EmptyState level={3} title={dashboard.leadsTitle} body={dashboard.leadsEmpty} />
          ) : (
            <ul className="pm-list">
              {recentLeads.map((lead) => (
                <li key={lead.id} className="pm-list__item">
                  <div>
                    <span className="pm-list__title">{lead.name}</span>
                    <span className="pm-list__meta">{lead.service ?? '—'}</span>
                  </div>
                  <Tag tone={lead.status === 'new' ? 'notice' : 'neutral'}>
                    {leadStatusLabels[lead.status]}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
