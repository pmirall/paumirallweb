import { env } from '@/lib/env'
import { FakeBillingProvider } from './fake'
import type { BillingProvider } from './types'

export type { BillingProvider, InvoiceInput, IssuedInvoice } from './types'

/**
 * Un único proveedor de facturación por proceso. Se elige por BILLING_PROVIDER.
 * Hoy solo existe el falso; cuando se elija el real, se escribe su adaptador y se
 * añade aquí, sin tocar a quien lo usa. Ver ADR 0007.
 */
declare global {
  var __pmBilling: BillingProvider | undefined
}

export function billing(): BillingProvider {
  if (!globalThis.__pmBilling) {
    // El único valor soportado hoy es 'fake'. Cualquier otro cae también al falso
    // hasta que exista un adaptador real, en vez de romper el arranque.
    globalThis.__pmBilling = new FakeBillingProvider()
  }
  return globalThis.__pmBilling
}

/** ¿Hay un proveedor real configurado? Hoy siempre falso. */
export function billingIsFake(): boolean {
  return (env.BILLING_PROVIDER ?? 'fake') === 'fake'
}
