/**
 * Derivadas de marcador para desarrollo y pruebas. El Drive falso no trae bytes
 * de imagen reales, así que se genera una imagen SVG por foto: determinista a
 * partir de una semilla, con la paleta de la marca, para que la galería se vea
 * como una galería y no como una rejilla de huecos. Cuando llegue la derivación
 * real (redimensionar y marcar el original), esto se sustituye sin tocar ni el
 * almacén ni el visor: siguen siendo bytes con un tipo de contenido.
 */

const CONTENT_TYPE = 'image/svg+xml'

/**
 * Paletas tomadas de los tokens de marca. Aquí los valores van en crudo a
 * propósito: no estilan un componente, son los píxeles de una imagen de relleno
 * que solo existe en desarrollo y que la derivación real de fotos sustituye. Por
 * eso se exceptúa la regla de "sin colores a mano", que vela por el estilado de
 * la interfaz, no por el contenido de una imagen generada.
 */
/* eslint-disable no-restricted-syntax -- valores de imagen, no estilado de UI */
const PALETTES = [
  ['#2b6f64', '#54b4a4'],
  ['#0f453c', '#008b6f'],
  ['#3d9787', '#b0e0d7'],
  ['#0f6b57', '#7fcabd'],
  ['#242626', '#54b4a4'],
]
/* eslint-enable no-restricted-syntax */

/** Hash pequeño y estable de la semilla, sin depender de Math.random. */
function seedNumber(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export interface PlaceholderOptions {
  seed: string
  width: number
  height: number
  label?: string
  watermark?: boolean
}

export interface DerivativeBytes {
  bytes: Uint8Array
  contentType: string
}

export function renderPlaceholder(opts: PlaceholderOptions): DerivativeBytes {
  const n = seedNumber(opts.seed)
  const [from, to] = PALETTES[n % PALETTES.length]!
  const angle = n % 180
  // Dos formas suaves para que no sean rectángulos planos.
  const cx = 20 + (n % 60)
  const cy = 25 + ((n >> 3) % 50)
  const r = 30 + ((n >> 6) % 30)

  const watermark = opts.watermark
    ? `<g fill="rgba(255,255,255,0.5)" font-family="sans-serif" font-weight="700" font-size="6" transform="rotate(-30 50 50)">
         ${Array.from({ length: 5 }, (_, row) =>
           Array.from({ length: 4 }, (_, col) => {
             const x = -10 + col * 30
             const y = 10 + row * 22
             return `<text x="${x}" y="${y}">MUESTRA</text>`
           }).join(''),
         ).join('')}
       </g>`
    : ''

  const caption = opts.label
    ? `<text x="4" y="96" fill="rgba(255,255,255,0.72)" font-family="sans-serif" font-size="3.4">${escapeXml(
        opts.label,
      )}</text>`
    : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${opts.width}" height="${opts.height}" preserveAspectRatio="xMidYMid slice" role="img">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle} 0.5 0.5)">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="100" height="100" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="rgba(255,255,255,0.10)"/>
  <circle cx="${100 - cx}" cy="${100 - cy}" r="${r * 0.6}" fill="rgba(0,0,0,0.12)"/>
  ${watermark}
  ${caption}
</svg>`

  return { bytes: new Uint8Array(new TextEncoder().encode(svg)), contentType: CONTENT_TYPE }
}
