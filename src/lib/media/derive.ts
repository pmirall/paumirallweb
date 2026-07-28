import { storage } from '@/lib/storage'
import { renderPlaceholder } from './placeholder'

/**
 * Las cuatro derivadas que sirve la web por cada foto: miniatura y tamaño web,
 * cada una limpia y con marca de agua. Se generan una vez y se guardan en el
 * almacén; la web nunca toca el original. Con marca activa solo se sirven las
 * versiones marcadas, así que las limpias tienen que existir aparte para cuando
 * la factura se pague. Ver docs/seguridad-y-privacidad.md.
 */
export const VARIANTS = ['thumb', 'web', 'thumb-wm', 'web-wm'] as const
export type Variant = (typeof VARIANTS)[number]

const DIMENSIONS: Record<Variant, { w: number; h: number }> = {
  thumb: { w: 600, h: 600 },
  web: { w: 1600, h: 1600 },
  'thumb-wm': { w: 600, h: 600 },
  'web-wm': { w: 1600, h: 1600 },
}

export function storageKey(assetId: string, variant: Variant): string {
  return `derivatives/${assetId}/${variant}.svg`
}

export interface DerivedVariant {
  variant: Variant
  storageKey: string
  bytes: number
  width: number
  height: number
}

/**
 * Genera y guarda las cuatro derivadas de una foto. Devuelve los datos que van a
 * `media_derivatives`. En desarrollo la imagen es un marcador; el contrato con el
 * almacén y con la base es el mismo que tendrá la derivación real.
 */
export async function deriveAsset(
  assetId: string,
  filename: string,
  ratio: number,
): Promise<DerivedVariant[]> {
  const store = storage()
  const results: DerivedVariant[] = []
  for (const variant of VARIANTS) {
    const dim = DIMENSIONS[variant]
    const height = Math.round(dim.w / (ratio || 1))
    const image = renderPlaceholder({
      seed: `${assetId}:${variant}`,
      width: dim.w,
      height,
      label: filename,
      watermark: variant.endsWith('-wm'),
    })
    const key = storageKey(assetId, variant)
    await store.put(key, image.bytes, image.contentType)
    results.push({ variant, storageKey: key, bytes: image.bytes.length, width: dim.w, height })
  }
  return results
}
