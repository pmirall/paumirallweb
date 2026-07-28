import type { BillingProvider, InvoiceInput, IssuedInvoice } from './types'

/**
 * Proveedor de facturación falso para desarrollo y pruebas. Reproduce el contrato
 * del real sin emitir nada con validez legal: inventa un número, una URL de PDF y
 * una de verificación deterministas. Así toda la fase 5 se construye y se prueba
 * sin contrato con nadie. Ver ADR 0007.
 *
 * Guarda las facturas emitidas en memoria del proceso, suficiente para consultar
 * y listar dentro de una misma ejecución; el reflejo persistente vive en la base,
 * no aquí.
 */
export class FakeBillingProvider implements BillingProvider {
  private issued: IssuedInvoice[] = []
  private counter = 0

  private mint(prefix: string): IssuedInvoice {
    this.counter += 1
    const n = String(this.counter).padStart(4, '0')
    const providerInvoiceId = `fake-${prefix}-${n}`
    const invoice: IssuedInvoice = {
      providerInvoiceId,
      number: `${prefix}-${n}`,
      pdfUrl: `https://facturas.ejemplo/${providerInvoiceId}.pdf`,
      verificationUrl: `https://facturas.ejemplo/verificar/${providerInvoiceId}`,
    }
    this.issued.push(invoice)
    return invoice
  }

  async createInvoice(_input: InvoiceInput): Promise<IssuedInvoice> {
    return this.mint('F')
  }

  async getInvoice(providerInvoiceId: string): Promise<IssuedInvoice | null> {
    return this.issued.find((i) => i.providerInvoiceId === providerInvoiceId) ?? null
  }

  async voidWithCorrection(_providerInvoiceId: string, _input: InvoiceInput): Promise<IssuedInvoice> {
    // La rectificativa es una factura nueva con su propio número, enlazada en la
    // base a la que corrige. El proveedor real la marca como rectificativa; el
    // falso solo emite otra.
    return this.mint('R')
  }

  async list(): Promise<IssuedInvoice[]> {
    return [...this.issued]
  }
}
