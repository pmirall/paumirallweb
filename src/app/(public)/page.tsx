import { home } from '@/content/home'

/**
 * Portada provisional de la fase 0. Sirve para comprobar que los tokens y las
 * tipografías llegan al navegador. La portada de verdad se construye en la
 * fase 3 a partir de docs/landing.md y del prototipo.
 */
export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeContent: 'center',
        gap: 'var(--sp-5)',
        padding: 'var(--page-pad)',
        background: 'var(--surface-accent)',
      }}
    >
      <p
        style={{
          font: 'var(--type-eyebrow)',
          letterSpacing: 'var(--tracking-eyebrow)',
          textTransform: 'uppercase',
          color: 'var(--pm-ink)',
          margin: 0,
        }}
      >
        {home.eyebrow}
      </p>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontWeight: 'var(--fw-black)',
          fontStretch: '88%',
          fontSize: 'var(--fs-display-l)',
          lineHeight: 'var(--lh-display)',
          letterSpacing: 'var(--tracking-display)',
          color: 'var(--pm-ink)',
          margin: 0,
        }}
      >
        {home.name}
      </h1>
      <p style={{ font: 'var(--type-lead)', color: 'var(--pm-ink)', maxWidth: '34ch', margin: 0 }}>
        {home.lead}
      </p>
    </main>
  )
}
