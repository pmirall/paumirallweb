import { expect, test } from '@playwright/test'

/**
 * La puerta de la galería con el PIN. El token y el PIN son fijos en la base
 * sembrada de desarrollo. Ver docs/seguridad-y-privacidad.md.
 */
const TOKEN = 'DEV0GALERIA0JULIA'

test('un token inválido responde 404', async ({ page }) => {
  const r = await page.request.get('/c/NOEXISTE')
  expect(r.status()).toBe(404)
})

test('la puerta no se indexa', async ({ page }) => {
  const r = await page.request.get(`/c/${TOKEN}`)
  expect(r.headers()['x-robots-tag']).toContain('noindex')
})

test('un PIN erróneo avisa y descuenta intentos', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')
  await page.goto(`/c/${TOKEN}`)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Retrato de prensa')
  await page.fill('#pin', '0000')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText(/El PIN no es correcto/)).toBeVisible()
})

test('el PIN correcto abre la galería, y sin sesión no se entra', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  // Sin sesión, la galería redirige a la puerta.
  await page.goto(`/c/${TOKEN}/galeria`)
  await expect(page).toHaveURL(new RegExp(`/c/${TOKEN}$`))

  await page.fill('#pin', '4271')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(new RegExp(`/c/${TOKEN}/galeria$`))
  await expect(page.locator('.pm-gallery-view')).toBeVisible()
})
