import { mkdir, readFile, writeFile, access } from 'node:fs/promises'
import { dirname, resolve, sep } from 'node:path'
import type { StorageAdapter, StoredObject } from './types'

/**
 * Almacén sobre disco para desarrollo y pruebas. Guarda cada objeto como dos
 * ficheros: los bytes y un `.type` con el tipo de contenido. Vive fuera de git,
 * en `.storage/`, y comparte forma con lo que hará el adaptador de Supabase, así
 * que el resto del código no distingue uno de otro. La clave puede llevar barras
 * y se convierte en rutas de carpeta.
 */
export class DiskStorageAdapter implements StorageAdapter {
  private readonly root: string
  constructor(baseDir: string) {
    this.root = resolve(baseDir)
  }

  private pathFor(key: string): string {
    // Se canonicaliza y se comprueba que queda dentro del directorio base, en vez
    // de borrar `..` a mano. Así falla cerrado si algún día llega una clave con
    // datos del cliente: una ruta que se sale no se sirve, se rechaza.
    const full = resolve(this.root, key.replace(/^\/+/, ''))
    if (full !== this.root && !full.startsWith(this.root + sep)) {
      throw new Error('Clave de almacén fuera del directorio base')
    }
    return full
  }

  async put(key: string, bytes: Uint8Array, contentType: string): Promise<void> {
    const file = this.pathFor(key)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, bytes)
    await writeFile(`${file}.type`, contentType, 'utf8')
  }

  async get(key: string): Promise<StoredObject | null> {
    try {
      const file = this.pathFor(key)
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
