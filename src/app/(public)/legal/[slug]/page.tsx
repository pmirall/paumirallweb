import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Eyebrow } from '@/components/ui'
import { legalCommon, legalPages, type LegalSlug } from '@/content/pages'

/** Las tres páginas legales se conocen en el build: cualquier otra es un 404. */
export const dynamicParams = false

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }))
}

function getPage(slug: string) {
  return (legalPages as Record<string, (typeof legalPages)[LegalSlug] | undefined>)[slug]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getPage(slug)
  return page ? { title: `${page.title} · Pau Miralles` } : {}
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = getPage(slug)
  if (!page) notFound()

  return (
    <section className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap pm-prose-wrap">
        <Eyebrow surface="bone">{legalCommon.eyebrow}</Eyebrow>
        <h1 className="pm-page__title">{page.title}</h1>
        {page.provisional ? (
          <p className="pm-notice" role="note">
            {legalCommon.provisionalNotice}
          </p>
        ) : null}
        {page.body.map((paragraph) => (
          <p className="pm-prose" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
