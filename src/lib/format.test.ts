import { describe, expect, it } from 'vitest'
import { formatEuros } from './format'

// Intl separa el importe del símbolo con un espacio duro, no con uno normal.
const NBSP = '\u00a0'

describe('formatEuros', () => {
  it('convierte céntimos a euros', () => {
    expect(formatEuros(32000)).toBe(`320,00${NBSP}€`)
  })

  it('no pierde los céntimos sueltos', () => {
    expect(formatEuros(45050)).toBe(`450,50${NBSP}€`)
  })

  it('acepta el cero', () => {
    expect(formatEuros(0)).toBe(`0,00${NBSP}€`)
  })
})
