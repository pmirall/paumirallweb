import { ui } from '@/content/ui'

/** Esqueleto de contenido, no un indicador giratorio. Ver docs/mapa-de-rutas.md. */
export default function Loading() {
  return (
    <div className="pm-slab pm-on-bone pm-page" role="status" aria-live="polite">
      <div className="pm-wrap">
        <span className="pm-sr-only">{ui.loading}</span>
        <div className="pm-skeleton pm-skeleton--title" />
        <div className="pm-skeleton pm-skeleton--line" />
        <div className="pm-skeleton pm-skeleton--line pm-skeleton--short" />
        <div className="pm-work">
          {[0, 1, 2].map((i) => (
            <div className="pm-skeleton pm-skeleton--plate" key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
