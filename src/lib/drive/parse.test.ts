import { describe, expect, it } from 'vitest'
import { parseFolderName } from './parse'

/**
 * Casos tomados de docs/drive-inventario.md, que son los nombres reales del
 * Drive. Lo que no se puede fechar con seguridad se marca dudoso, nunca se
 * inventa una fecha.
 */
describe('interpretación del nombre de carpeta', () => {
  it('lee el patrón dominante Nombre.AA.MM.DD', () => {
    expect(parseFolderName('Marlene.25.07.01')).toEqual({
      clientName: 'Marlene',
      date: '2025-07-01',
      dateAmbiguous: false,
    })
    expect(parseFolderName('Perales.25.11.07').date).toBe('2025-11-07')
  })

  it('marca dudosa una fecha con mes fuera de rango', () => {
    const hint = parseFolderName('Jorge.24.13.02')
    expect(hint.clientName).toBe('Jorge')
    expect(hint.date).toBeNull()
    expect(hint.dateAmbiguous).toBe(true)
  })

  it('acepta la coma en lugar del punto', () => {
    expect(parseFolderName('Whekau.24.05,03').date).toBe('2024-05-03')
  })

  it('separa el nombre pegado a la fecha sin separador', () => {
    const hint = parseFolderName('HormiLucio22.10.23')
    expect(hint.clientName).toBe('HormiLucio')
    expect(hint.date).toBe('2022-10-23')
  })

  it('lee nombres con espacios y varias palabras', () => {
    const hint = parseFolderName('Inca Street Art 25.05.17')
    expect(hint.clientName).toBe('Inca Street Art')
    expect(hint.date).toBe('2025-05-17')
  })

  it('usa el año de la carpeta contenedora, donde el patrón es día.mes.año', () => {
    const hint = parseFolderName('Group.21.06.26', 2026)
    expect(hint.clientName).toBe('Group')
    expect(hint.date).toBe('2026-06-21')
  })

  it('trata un día de tres cifras como fecha dudosa', () => {
    const hint = parseFolderName('Isabella.23.11.112')
    expect(hint.date).toBeNull()
    expect(hint.dateAmbiguous).toBe(true)
  })

  it('devuelve solo el nombre cuando no hay fecha', () => {
    expect(parseFolderName('Family')).toEqual({
      clientName: 'Family',
      date: null,
      dateAmbiguous: false,
    })
  })

  it('limpia el guion bajo del nombre', () => {
    expect(parseFolderName('Horizontal_convention.24.10.25').clientName).toBe(
      'Horizontal convention',
    )
  })
})
