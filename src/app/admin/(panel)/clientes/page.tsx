import { db } from '@/db/client'
import { listClients } from '@/db/queries/clients'
import { DataTable, type Column } from '@/components/admin/DataTable'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/ui'
import { clientsPage } from '@/content/admin'

export default async function ClientsPage() {
  const rows = await listClients(await db())

  type Row = (typeof rows)[number]
  const columns: Column<Row>[] = [
    { key: 'name', header: clientsPage.columns.name, render: (r) => r.name },
    { key: 'company', header: clientsPage.columns.company, render: (r) => r.company ?? '—' },
    { key: 'email', header: clientsPage.columns.email, render: (r) => r.email ?? '—' },
    { key: 'jobs', header: clientsPage.columns.jobs, render: (r) => r.jobCount, align: 'end' },
  ]

  return (
    <>
      <PageHeader title={clientsPage.title} subtitle={clientsPage.subtitle} />
      {rows.length === 0 ? (
        <EmptyState level={2} title={clientsPage.title} body={clientsPage.empty} />
      ) : (
        <DataTable columns={columns} rows={rows} hrefFor={(r) => `/admin/clientes/${r.id}`} />
      )}
    </>
  )
}
