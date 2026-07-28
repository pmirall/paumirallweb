import { describe, expect, it } from 'vitest'
import { FakeBillingProvider } from './fake'

const input = {
  jobCode: '2026-001',
  clientName: 'Cliente',
  clientEmail: 'cliente@example.com',
  subtotalCents: 20000,
  taxCents: 4200,
  totalCents: 24200,
  concept: 'Reportaje',
}

describe('proveedor de facturación falso', () => {
  it('emite una factura con número, PDF y verificación', async () => {
    const billing = new FakeBillingProvider()
    const issued = await billing.createInvoice(input)
    expect(issued.number).toMatch(/^F-\d{4}$/)
    expect(issued.pdfUrl).toContain(issued.providerInvoiceId)
    expect(issued.verificationUrl).toContain('verificar')
  })

  it('cada factura tiene número distinto', async () => {
    const billing = new FakeBillingProvider()
    const a = await billing.createInvoice(input)
    const b = await billing.createInvoice(input)
    expect(a.number).not.toBe(b.number)
  })

  it('consulta una factura ya emitida y lista todas', async () => {
    const billing = new FakeBillingProvider()
    const a = await billing.createInvoice(input)
    expect(await billing.getInvoice(a.providerInvoiceId)).toEqual(a)
    expect(await billing.getInvoice('no-existe')).toBeNull()
    await billing.createInvoice(input)
    expect(await billing.list()).toHaveLength(2)
  })

  it('la rectificativa es una factura nueva con prefijo propio', async () => {
    const billing = new FakeBillingProvider()
    const a = await billing.createInvoice(input)
    const r = await billing.voidWithCorrection(a.providerInvoiceId, input)
    expect(r.number).toMatch(/^R-\d{4}$/)
    expect(r.providerInvoiceId).not.toBe(a.providerInvoiceId)
  })
})
