import { join } from 'node:path'
import { env } from '@/lib/env'
import { DiskStorageAdapter } from './fake'
import type { StorageAdapter } from './types'

export type { StorageAdapter, StoredObject } from './types'

/**
 * Un único almacén por proceso. Hoy siempre es el de disco; cuando lleguen las
 * credenciales de Supabase, aquí se elige el real según el entorno, sin tocar a
 * quien lo usa. La ruta se puede fijar con STORAGE_DIR para las pruebas.
 */
declare global {
  var __pmStorage: StorageAdapter | undefined
}

export function storage(): StorageAdapter {
  if (!globalThis.__pmStorage) {
    const baseDir = env.STORAGE_DIR ?? join(process.cwd(), '.storage')
    globalThis.__pmStorage = new DiskStorageAdapter(baseDir)
  }
  return globalThis.__pmStorage
}
