import { expect, test } from '@playwright/test'

test('la portada carga con la marca puesta', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Pau Miralles')

  // El token de marca llega al navegador, que es lo que valida la fase 0.
  const teal = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--pm-teal').trim(),
  )
  expect(teal).toBe('#54b4a4')
})

test('la zona de administración no se indexa', async ({ page }) => {
  const response = await page.goto('/admin')
  expect(response?.headers()['x-robots-tag']).toContain('noindex')
})
