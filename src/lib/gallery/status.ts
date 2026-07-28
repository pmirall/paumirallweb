/**
 * Una galería está abierta cuando está activa y no ha caducado. La caducidad se
 * comprueba aquí, en el mismo sitio para todos los caminos: la puerta, el visor,
 * la ruta de fotos y las acciones de favoritos. Antes solo la puerta miraba
 * `expiresAt`, así que una sesión abierta seguía sirviendo fotos después de la
 * fecha; comprobarlo en un único helper cierra ese hueco. Ver
 * docs/seguridad-y-privacidad.md.
 */
export function isGalleryOpen(
  gallery: { status: string; expiresAt: Date },
  now: Date,
): boolean {
  return gallery.status === 'active' && gallery.expiresAt.getTime() > now.getTime()
}
