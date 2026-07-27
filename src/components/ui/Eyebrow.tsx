import { cn, variantClass } from './cn'

/** El fondo sobre el que se pinta decide el color, porque el contraste cambia. */
export type Surface = 'bone' | 'ink' | 'accent'

const SURFACES: Record<Surface, string> = {
  bone: 'pm-eyebrow--on-bone',
  ink: 'pm-eyebrow--on-ink',
  accent: 'pm-eyebrow--on-accent',
}

export function eyebrowClass(surface: Surface = 'bone'): string {
  return variantClass('pm-eyebrow', SURFACES, surface)
}

export function Eyebrow({
  surface = 'bone',
  className,
  children,
}: {
  surface?: Surface
  className?: string
  children: React.ReactNode
}) {
  return <p className={cn(eyebrowClass(surface), className)}>{children}</p>
}
