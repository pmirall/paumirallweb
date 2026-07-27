import { describe, expect, it } from 'vitest'
import { buttonClass } from './Button'
import { eyebrowClass } from './Eyebrow'
import { tagClass } from './Tag'
import { cn } from './cn'

describe('cn', () => {
  it('descarta lo vacío', () => {
    expect(cn('a', false, undefined, 'b')).toBe('a b')
  })
})

describe('buttonClass', () => {
  it('lleva siempre la clase base', () => {
    expect(buttonClass('ghost')).toContain('pm-btn')
  })

  it('mapea cada tono a su clase', () => {
    expect(buttonClass('primary')).toContain('pm-btn--primary')
    expect(buttonClass('accent')).toContain('pm-btn--accent')
  })

  it('añade el tamaño pequeño solo cuando se pide', () => {
    expect(buttonClass('primary', true)).toContain('pm-btn--sm')
    expect(buttonClass('primary')).not.toContain('pm-btn--sm')
  })
})

describe('eyebrowClass', () => {
  // El fondo decide el color porque el contraste cambia con la superficie.
  it('cambia de color según el fondo', () => {
    expect(eyebrowClass('bone')).toContain('on-bone')
    expect(eyebrowClass('ink')).toContain('on-ink')
    expect(eyebrowClass('accent')).toContain('on-accent')
  })
})

describe('tagClass', () => {
  it('cubre los cinco tonos', () => {
    for (const tone of ['neutral', 'accent', 'ok', 'notice', 'error'] as const) {
      expect(tagClass(tone)).toContain(`pm-tag--${tone}`)
    }
  })
})
