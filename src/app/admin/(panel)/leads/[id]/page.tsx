import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/db/client'
import { getLead } from '@/db/queries/leads'
import { PageHeader } from '@/components/admin/PageHeader'
import { Tag, buttonClass } from '@/components/ui'
import { leadStatusLabels, leadsPage } from '@/content/admin'
import { formatDate } from '@/lib/dates'
import { convertLead } from './actions'

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const lead = await getLead(await db(), id)
  if (!lead) notFound()

  const converted = lead.status === 'converted'
  const convertAction = convertLead.bind(null, lead.id)

  return (
    <>
      <PageHeader
        title={lead.name}
        subtitle={leadsPage.detailSubtitle}
        actions={<Tag tone={lead.status === 'new' ? 'notice' : 'neutral'}>{leadStatusLabels[lead.status]}</Tag>}
      />

      <div className="pm-detail">
        <dl className="pm-detail__facts">
          <div>
            <dt>{leadsPage.contactLabel}</dt>
            <dd>
              <a className="pm-hit" href={`mailto:${lead.email}`}>
                {lead.email}
              </a>
              {lead.phone ? <span> · {lead.phone}</span> : null}
            </dd>
          </div>
          {lead.service ? (
            <div>
              <dt>{leadsPage.columns.service}</dt>
              <dd>{lead.service}</dd>
            </div>
          ) : null}
          <div>
            <dt>{leadsPage.columns.date}</dt>
            <dd>{formatDate(lead.createdAt)}</dd>
          </div>
        </dl>

        <div className="pm-detail__message">
          <h2 className="pm-panel__title">{leadsPage.messageLabel}</h2>
          <p className="pm-prose">{lead.message}</p>
        </div>

        {converted ? (
          <p className="pm-notice" role="note">
            {leadsPage.convertedNotice}{' '}
            {lead.jobId ? (
              <Link className="pm-link pm-hit" href={`/admin/encargos/${lead.jobId}`}>
                {leadsPage.goToJob}
              </Link>
            ) : null}
          </p>
        ) : (
          <form action={convertAction}>
            <button className={buttonClass('primary')} type="submit">
              {leadsPage.convert}
            </button>
          </form>
        )}
      </div>
    </>
  )
}
