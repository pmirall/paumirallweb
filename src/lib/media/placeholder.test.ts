import { describe, expect, it } from 'vitest'
import { renderPlaceholder } from './placeholder'

function text(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

describe('imagen de marcador', () => {
  it('genera un SVG con el tipo de contenido correcto', () => {
    const out = renderPlaceholder({ seed: 'x', width: 600, height: 400 })
    expect(out.contentType).toBe('image/svg+xml')
    expect(text(out.bytes)).toContain('<svg')
  })

  it('la misma semilla da la misma imagen', () => {
    const a = renderPlaceholder({ seed: 'foto-1', width: 600, height: 400 })
    const b = renderPlaceholder({ seed: 'foto-1', width: 600, height: 400 })
    expect(text(a.bytes)).toBe(text(b.bytes))
  })

  it('semillas distintas dan imágenes distintas', () => {
    const a = renderPlaceholder({ seed: 'foto-1', width: 600, height: 400 })
    const b = renderPlaceholder({ seed: 'foto-2', width: 600, height: 400 })
    expect(text(a.bytes)).not.toBe(text(b.bytes))
  })

  it('la variante con marca lleva el texto de muestra', () => {
    const clean = renderPlaceholder({ seed: 'x', width: 600, height: 400 })
    const marked = renderPlaceholder({ seed: 'x', width: 600, height: 400, watermark: true })
    expect(text(clean.bytes)).not.toContain('MUESTRA')
    expect(text(marked.bytes)).toContain('MUESTRA')
  })

  it('escapa el texto de la etiqueta', () => {
    const out = renderPlaceholder({ seed: 'x', width: 600, height: 400, label: 'a<b>&c' })
    const svg = text(out.bytes)
    expect(svg).toContain('a&lt;b&gt;&amp;c')
    expect(svg).not.toContain('<b>')
  })
})
