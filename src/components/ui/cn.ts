/** Une clases descartando lo vacío. Sin dependencias. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * Las variantes se resuelven con un mapa, no concatenando cadenas.
 * Ver docs/convenciones.md.
 */
export function variantClass<T extends string>(
  base: string,
  map: Record<T, string>,
  variant: T,
): string {
  return cn(base, map[variant])
}
