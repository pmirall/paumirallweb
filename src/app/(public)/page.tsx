import { Button, Eyebrow, Plate, Tag } from '@/components/ui'
import { home } from '@/content/home'

/**
 * Pantalla de muestra de la fase 0. Enseña las cuatro composiciones
 * tipográficas, el corte a 45 grados y la sombra de placa, y comprueba que
 * cambiar un token cambia el sitio sin tocar componentes. La portada de verdad
 * se construye en la fase 3 desde docs/landing.md.
 */
export default function HomePage() {
  return (
    <main className="pm-sample">
      <section className="pm-sample__hero">
        <Eyebrow surface="accent">{home.eyebrow}</Eyebrow>

        <Plate className="pm-sample__band" ratio="21 / 8" note={home.platePlaceholder} />

        <div className="pm-sample__plaque">
          <h1 className="pm-sample__wordmark">{home.name}</h1>
        </div>

        <p className="pm-sample__lead">{home.lead}</p>

        <div className="pm-sample__cta">
          <Button tone="primary">{home.ctaWork}</Button>
          <Button tone="ghost">{home.ctaBook}</Button>
        </div>

        <div className="pm-sample__tags">
          {home.categories.map((category) => (
            <Tag key={category} tone="accent">
              {category}
            </Tag>
          ))}
        </div>
      </section>
    </main>
  )
}
