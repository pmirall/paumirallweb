import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { StorageAdapter, StoredObject } from './types'

/**
 * Almacén sobre disco para desarrollo y pruebas. Guarda cada objeto como dos
 * ficheros: los bytes y un `.type` con el tipo de contenido. Vive fuera de git,
 * en `.storage/`, y comparte forma con lo que hará el adaptador de Supabase, así
 * que el resto del código no distingue uno de otro. La clave puede llevar barras
 * y se convierte en rutas de carpeta.
 */
export class DiskStorageAdapter implements StorageAdapter {
  constructor(private readonly baseDir: string) {}

  private pathFor(key: string): string {
    // La clave no puede escapar del directorio base.
    const safe = key.replace(/\.\./g, '').replace(/^\/+/, '')
    return join(this.baseDir, safe)
  }

  async put(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
    const file = this.pathFor(key)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, bytes)
    await writeFile(`${file}.type`, contentType, 'utf8')
  }

  async get(key: string): Promise<StoredObject | null> {
    const file = this.pathFor(key)
    try {
      const bytes = await readFile(file)
      let contentType = 'application/octet-stream'
      try {
        contentType = (await readFile(`${file}.type`, 'utf8')).trim() || contentType
      } catch {
        // Sin fichero de tipo, se queda el genérico.
      }
      return { bytes: new Uint8Array(bytes), contentType }
    } catch {
      return null
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      await access(this.pathFor(key))
      return true
    } catch {
      return false
    }
  }
}
