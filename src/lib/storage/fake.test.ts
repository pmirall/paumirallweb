import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { DiskStorageAdapter } from './fake'

describe('almacén sobre disco', () => {
  let dir: string
  let store: DiskStorageAdapter

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'pm-storage-'))
    store = new DiskStorageAdapter(dir)
  })

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('guarda y recupera bytes con su tipo', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    await store.put('derivatives/a/thumb.svg', bytes, 'image/svg+xml')
    const got = await store.get('derivatives/a/thumb.svg')
    expect(got?.contentType).toBe('image/svg+xml')
    expect(Array.from(got!.bytes)).toEqual([1, 2, 3, 4])
  })

  it('has distingue lo que existe de lo que no', async () => {
    await store.put('derivatives/b/web.svg', new Uint8Array([9]), 'image/svg+xml')
    expect(await store.has('derivatives/b/web.svg')).toBe(true)
    expect(await store.has('derivatives/b/nada.svg')).toBe(false)
    expect(await store.get('derivatives/b/nada.svg')).toBeNull()
  })

  it('una clave con ../ no escapa del directorio base', async () => {
    await store.put('../fuera.svg', new Uint8Array([7]), 'image/svg+xml')
    // La normalización quita el ../, así que se guarda dentro, no fuera.
    expect(await store.has('fuera.svg')).toBe(true)
  })
})
