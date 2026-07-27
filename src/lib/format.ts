/**
 * El dinero se guarda y se opera en céntimos, en enteros. La conversión a
 * euros ocurre solo al pintar, y siempre por aquí. Ver docs/convenciones.md.
 */
export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}
