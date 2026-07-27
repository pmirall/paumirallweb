import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { getJobWithClient } from '@/db/queries/jobs'
import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState, Tag } from '@/components/ui'
import { jobCategoryLabels, jobStatusLabels } from '@/content/admin'

/** Ficha de encargo. Las cinco pestañas se construyen en el siguiente paso. */
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await getJobWithClient(await db(), id)
  if (!row) notFound()

  const { jobs: job, clients: client } = row

  return (
    <>
      <PageHeader
        title={job.title}
        subtitle={`${job.code} · ${client.name}`}
        actions={
          <>
            <Tag tone="accent">{jobCategoryLabels[job.category]}</Tag>{' '}
            <Tag tone="neutral">{jobStatusLabels[job.status]}</Tag>
          </>
        }
      />
      <EmptyState
        level={2}
        title="Ficha en construcción"
        body="Las pestañas de resumen, archivos, galería, dinero y notas llegan en el siguiente paso de la fase 1."
      />
    </>
  )
}
