import { expect, test } from '@playwright/test'

test('la portada carga con la marca puesta', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pau Miralles')

  // El token de marca llega al navegador, que es lo que valida el sistema.
  const teal = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--pm-teal').trim(),
  )
  expect(teal).toBe('#54b4a4')
})

test('la portada enseña las tres secciones que venden', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Lo último' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Cómo trabajo' })).toBeVisible()
  // El precio es titular, no letra pequeña. Ver docs/landing.md.
  await expect(page.getByText('320', { exact: true })).toBeVisible()
})

test('reservar sesión lleva a contacto y no existe una ruta propia', async ({ page }) => {
  await page.goto('/')
  const cta = page.getByRole('link', { name: 'Reservar sesión' }).first()
  await expect(cta).toHaveAttribute('href', '/contacto')
})

test('el contenido se ve aunque no haya JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Lo último' })).toBeVisible()
  await context.close()
})

test('la zona de administración no se indexa', async ({ page }) => {
  const response = await page.goto('/admin')
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
})
