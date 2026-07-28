/**
 * Almacén de derivadas. Las versiones que sirve la web (miniatura, tamaño web,
 * copia con marca de agua) se generan una vez y se guardan aquí, no en Drive. El
 * origen de la verdad para los originales es Drive; esto es solo lo que la web
 * necesita servir deprisa. Ver docs/arquitectura.md y CLAUDE.md.
 *
 * En producción es Supabase Storage; en desarrollo y pruebas, un adaptador sobre
 * disco. El código de la aplicación habla siempre con esta interfaz, nunca con
 * uno u otro directamente.
 */
export interface StoredObject {
  bytes: Uint8Array
  contentType: string
}

export interface StorageAdapter {
  put(key: string, bytes: Uint8Array, contentType: string): Promise<void>
  get(key: string): Promise<StoredObject | null>
  has(key: string): Promise<boolean>
}
