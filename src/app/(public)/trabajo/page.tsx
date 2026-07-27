import type { Metadata } from 'next'
import Link from 'next/link'
import { Eyebrow, EmptyState, Plate, Tag } from '@/components/ui'
import { archive } from '@/content/pages'
import { CATEGORIES, CATEGORY_SLUGS, projectsByCategorySlug } from '@/lib/projects'
import { z } from 'zod'

/** Un parámetro repetido llega como array, así que se valida antes de usarlo. */
const catSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v[0] : v))

export const metadata: Metadata = {
  title: 'Trabajo · Pau Miralles',
  description: archive.lead,
}

/**
 * Los filtros van en la query y no en el segmento de ruta, para no multiplicar
 * URL indexables por categorías que comparten contenido. Ver docs/mapa-de-rutas.md.
 */
export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const cat = catSchema.parse(params.cat)
  const list = projectsByCategorySlug(cat)

  return (
    <section className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap">
        <Eyebrow surface="bone">{archive.eyebrow}</Eyebrow>
        <h1 className="pm-page__title">{archive.title}</h1>
        <p className="pm-lead">{archive.lead}</p>

        <nav className="pm-filters" aria-label={archive.filtersLabel}>
          <Link className="pm-filter pm-hit" href="/trabajo" aria-current={!cat ? 'page' : undefined}>
            {archive.allLabel}
          </Link>
          {CATEGORIES.map((category) => {
            const slug = CATEGORY_SLUGS[category]
            return (
              <Link
                className="pm-filter pm-hit"
                key={slug}
                href={`/trabajo?cat=${slug}`}
                aria-current={cat === slug ? 'page' : undefined}
              >
                {category}
              </Link>
            )
          })}
        </nav>

        {list.length === 0 ? (
          <EmptyState
            level={2}
            title={archive.emptyTitle}
            body={archive.emptyBody}
            action={
              <Link className="pm-link pm-hit" href="/trabajo">
                {archive.allLabel} <span aria-hidden="true">→</span>
              </Link>
            }
          />
        ) : (
          <div className="pm-work">
            {list.map((project, i) => (
              <Link
                className="pm-work__item pm-rise"
                data-d={(i % 3) + 1}
                key={project.slug}
                href={`/trabajo/${project.slug}`}
              >
                <Plate
                  className="pm-work__plate"
                  ratio={project.ratio}
                  src={project.coverSrc}
                  alt={project.coverAlt}
                />
                <div className="pm-work__meta">
                  <Tag tone="accent">{project.category}</Tag>
                  <span className="pm-work__year">{project.year}</span>
                </div>
                <h2 className="pm-work__title">{project.title}</h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
