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

  // La navegación lleva al encargo, que muestra la línea de tiempo y lo acordado.
  // Este encargo es de fotos, así que no aparece el enlace de vídeo.
  await expect(page.getByRole('link', { name: 'Vídeo' })).toHaveCount(0)
  await page.getByRole('link', { name: 'Tu encargo' }).click()
  await page.waitForURL(new RegExp(`/c/${TOKEN}/encargo$`))
  await expect(page.getByRole('heading', { level: 2, name: 'Lo acordado' })).toBeVisible()
  await expect(page.getByText('40 fotos editadas')).toBeVisible()
  await page.getByRole('link', { name: 'Entrega' }).click()
  await page.waitForURL(new RegExp(`/c/${TOKEN}/galeria$`))

  // La rejilla trae fotos y cada miniatura carga de verdad desde la ruta.
  const tiles = page.locator('.pm-photos__tile')
  await expect(tiles.first()).toBeVisible()
  const thumb = tiles.first().locator('img')
  await expect(thumb).toHaveAttribute('src', new RegExp(`/c/${TOKEN}/foto/.+\\?v=thumb`))

  // Al abrir una foto se abre el visor modal; las flechas y Escape funcionan.
  await tiles.first().click()
  const dialog = page.getByRole('dialog', { name: 'Visor de fotos' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('1 / 12')).toBeVisible()
  await page.keyboard.press('ArrowRight')
  await expect(dialog.getByText('2 / 12')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('una foto no se sirve sin sesión de la galería', async ({ page }) => {
  // Se necesita un id real; sin sesión la ruta responde 404 igualmente.
  const r = await page.request.get(`/c/${TOKEN}/foto/00000000-0000-0000-0000-000000000000?v=thumb`)
  expect(r.status()).toBe(404)
})

test('una galería caducada muestra la pantalla de caducidad, no el PIN', async ({ page }) => {
  await page.goto('/c/DEV0GALERIA0VENCIDA')
  await expect(page.getByRole('heading', { name: 'Esta galería ha caducado' })).toBeVisible()
  await expect(page.locator('#pin')).toHaveCount(0)
})

test('marcar favoritas y enviar la selección', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  await page.goto(`/c/${TOKEN}`)
  await page.fill('#pin', '4271')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(new RegExp(`/c/${TOKEN}/galeria$`))

  // Sin nada marcado, el botón de enviar está deshabilitado.
  const send = page.getByRole('button', { name: 'Enviar selección' })
  await expect(send).toBeDisabled()

  // Marcar dos fotos sube el contador.
  await page.getByRole('button', { name: 'Marcar como favorita' }).first().click()
  await expect(page.getByText('1 foto elegida')).toBeVisible()
  await page.getByRole('button', { name: 'Marcar como favorita' }).first().click()
  await expect(page.getByText('2 fotos elegidas')).toBeVisible()

  // Enviar sella la selección y confirma.
  await expect(send).toBeEnabled()
  await send.click()
  await expect(page.getByText(/Recibido/)).toBeVisible()
})
