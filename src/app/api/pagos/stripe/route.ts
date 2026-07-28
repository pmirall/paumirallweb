import { env } from '@/lib/env'
import { db } from '@/db/client'
import { registerPayment } from '@/db/queries/invoices'
import { verifyStripeSignature } from '@/lib/billing/stripe'

export const dynamic = 'force-dynamic'

/**
 * Webhook de Stripe. Está preparado pero inactivo: sin STRIPE_WEBHOOK_SECRET
 * responde 503 y no procesa nada, porque el cobro hoy es en efectivo o TPV
 * externo. Cuando lleguen las claves, este webhook verifica la firma y registra
 * el cobro con idempotencia por el id del pago, sin tocar el resto del sistema.
 * Ver docs/seguridad-y-privacidad.md.
 */
export async function POST(request: Request): Promise<Response> {
  const secret = env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    // Latente: no configurado. No se acepta ni se procesa nada.
    return new Response('Stripe no está activo.', { status: 503 })
  }

  const payload = await request.text()
  const ok = await verifyStripeSignature({
    payload,
    header: request.headers.get('stripe-signature'),
    secret,
    nowMs: Date.now(),
  })
  if (!ok) return new Response('Firma inválida.', { status: 400 })

  let event: { type?: string; data?: { object?: Record<string, unknown> } }
  try {
    event = JSON.parse(payload)
  } catch {
    return new Response('Cuerpo inválido.', { status: 400 })
  }

  // Solo interesa el cobro completado. El id del pago da idempotencia: el mismo
  // evento dos veces no crea dos cobros. El id de la factura viaja en metadata.
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const object = event.data?.object ?? {}
    const metadata = (object.metadata ?? {}) as Record<string, unknown>
    const invoiceId = typeof metadata.invoiceId === 'string' ? metadata.invoiceId : null
    const providerPaymentId = typeof object.id === 'string' ? object.id : null
    const amountCents = typeof object.amount_total === 'number' ? object.amount_total : null
    if (invoiceId && providerPaymentId && amountCents != null) {
      await registerPayment(
        await db(),
        { invoiceId, method: 'stripe', amountCents, providerPaymentId },
        new Date(),
        'system',
      )
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
