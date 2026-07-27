import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eyebrow, Plate, Tag } from '@/components/ui'
import { projectPage } from '@/content/pages'
import { getProject, projects, siblings } from '@/lib/projects'

/**
 * El conjunto de proyectos se conoce en el build, así que un slug que no esté
 * en la lista devuelve un 404 de verdad y no un 200 con la página de error.
 * Cuando los proyectos salgan de la base de datos, se revalida al publicar.
 */
export const dynamicParams = false

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) return {}
  const title = `${project.title} · Pau Miralles`
  return {
    title,
    description: project.summary,
    openGraph: { title, description: project.summary, type: 'article' },
  }
}

/** Donde se decide una contratación. Ver docs/vision-y-alcance.md. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const { prev, next } = siblings(project)

  return (
    <article className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap">
        <Eyebrow surface="bone">{project.category}</Eyebrow>
        <h1 className="pm-page__title">{project.title}</h1>
        <p className="pm-lead">{project.summary}</p>

        <dl className="pm-facts">
          {project.client ? (
            <div>
              <dt>{projectPage.clientLabel}</dt>
              <dd>{project.client}</dd>
            </div>
          ) : null}
          <div>
            <dt>{projectPage.yearLabel}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{projectPage.categoryLabel}</dt>
            <dd>
              <Tag tone="accent">{project.category}</Tag>
            </dd>
          </div>
        </dl>

        <div className="pm-gallery">
          {[0, 1, 2].map((i) => (
            <Plate
              className="pm-gallery__item"
              key={i}
              ratio={i === 1 ? '3 / 2' : project.ratio}
              src={project.coverSrc}
              alt={project.coverAlt}
              note={i === 0 ? projectPage.galleryNote : undefined}
            />
          ))}
        </div>

        <nav className="pm-prevnext" aria-label={projectPage.siblingsLabel}>
          {prev ? (
            <Link className="pm-link pm-hit" href={`/trabajo/${prev.slug}`}>
              <span aria-hidden="true">←</span> {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="pm-link pm-hit" href={`/trabajo/${next.slug}`}>
              {next.title} <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </article>
  )
}
