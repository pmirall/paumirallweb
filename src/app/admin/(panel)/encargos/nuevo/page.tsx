import { db } from '@/db/client'
import { listClientsForSelect } from '@/db/queries/job-mutations'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/ui'
import { newJobPage } from '@/content/admin'
import { NewJobForm } from './NewJobForm'

export default async function NewJobPage() {
  const clients = await listClientsForSelect(await db())

  return (
    <>
      <PageHeader title={newJobPage.title} subtitle={newJobPage.subtitle} />
      {clients.length === 0 ? (
        <EmptyState level={2} title={newJobPage.title} body={newJobPage.noClients} />
      ) : (
        <div className="pm-formwrap">
          <NewJobForm clients={clients} />
        </div>
      )}
    </>
  )
}
