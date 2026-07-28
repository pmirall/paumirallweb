import { argon2id, argon2Verify } from 'hash-wasm'

/**
 * El PIN se guarda con Argon2id y sal por galería. No se puede recuperar: si el
 * cliente lo pierde, se genera otro. Ver docs/seguridad-y-privacidad.md.
 */
export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return argon2id({
    password: pin,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 19_456, // 19 MiB, dentro de lo razonable para un PIN
    hashLength: 32,
    outputType: 'encoded',
  })
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  try {
    return await argon2Verify({ password: pin, hash })
  } catch {
    return false
  }
}
