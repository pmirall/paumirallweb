import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eyebrow, Plate, Tag } from '@/components/ui'
import { projectPage } from '@/content/pages'
import { getProject, listProjects, siblings } from '@/lib/projects'

/**
 * El conjunto de proyectos se conoce en el build, así que un slug que no esté
 * en la lista devuelve un 404 de verdad y no un 200 con la página de error.
 * Al publicar desde el admin se revalida la etiqueta `projects`.
 */
export const dynamicParams = false

export async function generateStaticParams() {
  return (await listProjects()).map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}
  const title = project.seoTitle ?? `${project.title} · Pau Miralles`
  const description = project.seoDescription ?? project.summary ?? undefined
  return { title, description, openGraph: { title, description, type: 'article' } }
}

/** Donde se decide una contratación. Ver docs/vision-y-alcance.md. */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  const { prev, next } = await siblings(project.slug, project.category)

  return (
    <article className="pm-slab pm-on-bone pm-page">
      <div className="pm-wrap">
        <Eyebrow surface="bone">{project.categoryLabel}</Eyebrow>
        <h1 className="pm-page__title">{project.title}</h1>
        {project.summary ? <p className="pm-lead">{project.summary}</p> : null}

        <dl className="pm-facts">
          <div>
            <dt>{projectPage.clientLabel}</dt>
            <dd>{project.clientName}</dd>
          </div>
          <div>
            <dt>{projectPage.yearLabel}</dt>
            <dd>{project.year}</dd>
          </div>
          <div>
            <dt>{projectPage.categoryLabel}</dt>
            <dd>
              <Tag tone="accent">{project.categoryLabel}</Tag>
            </dd>
          </div>
        </dl>

        {project.body ? <p className="pm-prose">{project.body}</p> : null}

        <div className="pm-gallery">
          {[0, 1, 2].map((i) => (
            <Plate
              className="pm-gallery__item"
              key={i}
              ratio={i === 1 ? '3 / 2' : project.ratio}
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
