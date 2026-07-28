/**
 * Adaptador de facturación. El sistema no emite facturas: las emite un proveedor
 * certificado a través de su API, y aquí se guarda el reflejo. Ninguna otra parte
 * del código sabe qué proveedor hay detrás. Cuatro operaciones, como fija el ADR
 * 0007: crear, consultar, anular por rectificativa y listar para conciliación.
 */
export interface InvoiceInput {
  /** Número interno del encargo, para que el proveedor lo lleve en su concepto. */
  jobCode: string
  clientName: string
  clientEmail: string | null
  subtotalCents: number
  taxCents: number
  totalCents: number
  /** Concepto o descripción de la factura. */
  concept: string
}

export interface IssuedInvoice {
  providerInvoiceId: string
  number: string
  pdfUrl: string
  verificationUrl: string
}

export interface BillingProvider {
  /** Emite una factura y devuelve su reflejo. */
  createInvoice(input: InvoiceInput): Promise<IssuedInvoice>
  /** Consulta el reflejo actual de una factura ya emitida. */
  getInvoice(providerInvoiceId: string): Promise<IssuedInvoice | null>
  /** Anula por rectificativa: emite una factura que corrige a otra. */
  voidWithCorrection(providerInvoiceId: string, input: InvoiceInput): Promise<IssuedInvoice>
  /** Lista las facturas del proveedor para conciliar. */
  list(): Promise<IssuedInvoice[]>
}
