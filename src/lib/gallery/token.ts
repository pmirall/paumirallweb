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

/** Un PIN de cuatro dígitos. Se genera al crear la galería. */
export function generatePin(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]!
  return String(n % 10000).padStart(4, '0')
}
