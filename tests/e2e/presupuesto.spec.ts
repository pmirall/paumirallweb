import { expect, test } from '@playwright/test'

/**
 * El presupuesto público. Se abre con un token, sin cuenta, y se acepta desde el
 * enlace. El token y los importes son fijos en la base sembrada de desarrollo.
 */
const TOKEN = 'DEV0PRESUPUESTO'

test('un token de presupuesto inválido responde 404', async ({ page }) => {
  const r = await page.request.get('/p/NOEXISTE')
  expect(r.status()).toBe(404)
})

test('el presupuesto no se indexa', async ({ page }) => {
  const r = await page.request.get(`/p/${TOKEN}`)
  expect(r.headers()['x-robots-tag']).toContain('noindex')
})

test('el presupuesto muestra líneas y total', async ({ page }) => {
  await page.goto(`/p/${TOKEN}`)
  await expect(page.getByRole('heading', { level: 1, name: 'P-2026-001' })).toBeVisible()
  await expect(page.getByText('Cobertura de carrera')).toBeVisible()
  // 605,00 € de total, en formato español.
  await expect(page.getByText('605,00', { exact: false })).toBeVisible()
})

test('aceptar el presupuesto confirma y lo deja aceptado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')
  // Un presupuesto aparte, sobre un encargo ya confirmado, para no alterar ni el
  // presupuesto que leen otras pruebas ni el recuento de encargos activos.
  await page.goto('/p/DEV0PRESUPUESTO0OK')
  await page.getByRole('button', { name: 'Aceptar el presupuesto' }).click()
  await expect(page.getByRole('heading', { name: 'Presupuesto aceptado' })).toBeVisible()
})
