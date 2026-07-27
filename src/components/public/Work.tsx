import Link from 'next/link'
import { Eyebrow, Plate, Tag } from '@/components/ui'
import { work } from '@/content/landing'
import { featuredProjects } from '@/lib/projects'

export function Work() {
  return (
    <section className="pm-slab pm-on-bone" id="trabajo" aria-labelledby="pm-work-title">
      <div className="pm-wrap">
        <div className="pm-sec-head pm-rise">
          <div>
            <Eyebrow surface="bone">{work.eyebrow}</Eyebrow>
            <h2 id="pm-work-title">{work.title}</h2>
            <p className="pm-lead">{work.lead}</p>
          </div>
          <Link className="pm-link pm-hit" href={work.allHref}>
            {work.allLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="pm-work">
          {featuredProjects.map((project, i) => (
            <Link
              className="pm-work__item pm-rise"
              data-d={i + 1}
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
              <h3 className="pm-work__title">{project.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
