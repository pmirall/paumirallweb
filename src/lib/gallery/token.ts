/**
 * Token de galería: 128 bits de aleatoriedad criptográfica, codificados en
 * base32 sin caracteres ambiguos, para poder dictarlo por teléfono. No es
 * adivinable ni enumerable y no lleva información dentro. Ver ADR 0005.
 */
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' // Crockford: sin I, L, O, U

export function generateToken(): string {
  const bytes = new Uint8Array(16) // 128 bits
  crypto.getRandomValues(bytes)
  return encodeBase32(bytes)
}

function encodeBase32(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) {
    out += ALPHABET[(value << (5 - bits)) & 31]
  }
  return out
}

/**
 * Un PIN de cuatro dígitos. Se genera al crear la galería. Se usa muestreo por
 * rechazo en vez de `n % 10000`: el resto sesgaría los PIN bajos, porque 2^32 no
 * es múltiplo de 10000 y los primeros restos salen una vez más. Con solo diez
 * mil combinaciones, cualquier sesgo estrecha el espacio y no es aceptable.
 */
export function generatePin(): string {
  // El mayor múltiplo de 10000 que cabe en un Uint32. Todo lo que quede por
  // encima se descarta para que las diez mil combinaciones sean equiprobables.
  const limit = Math.floor(0x1_0000_0000 / 10000) * 10000
  let n = crypto.getRandomValues(new Uint32Array(1))[0]!
  while (n >= limit) {
    n = crypto.getRandomValues(new Uint32Array(1))[0]!
  }
  return String(n % 10000).padStart(4, '0')
}
