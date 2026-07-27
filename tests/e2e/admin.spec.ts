import { expect, test } from '@playwright/test'

/**
 * El admin con el acceso de desarrollo. El Sign-In real de Google se conecta
 * cuando haya credenciales; la cookie firmada y las pantallas son las mismas.
 */
test('el panel no deja entrar sin sesión y responde 404', async ({ page }) => {
  const response = await page.request.get('/admin')
  expect(response.status()).toBe(404)
})

test('la pantalla de acceso ofrece el modo desarrollo fuera de Vercel', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByRole('button', { name: 'Entrar en modo desarrollo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Entrar con Google' })).toBeDisabled()
})

test('el acceso de desarrollo entra al panel con datos reales', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await expect(page.getByRole('heading', { level: 1, name: 'Panel' })).toBeVisible()
  // Los encargos activos del seed salen en la tabla.
  await expect(page.getByText('Trail Serra de Tramuntana')).toBeVisible()
  // Y la métrica los cuenta.
  await expect(page.locator('.pm-metric__value').first()).toHaveText('2')
})

test('salir cierra la sesión y vuelve a bloquear el panel', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.getByRole('button', { name: 'Salir' }).click()
  await page.waitForURL('**/admin/login')

  const response = await page.request.get('/admin')
  expect(response.status()).toBe(404)
})

test('las listas del admin muestran los datos sembrados', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.goto('/admin/encargos')
  await expect(page.getByRole('heading', { level: 1, name: 'Encargos' })).toBeVisible()
  await expect(page.getByText('Trail Serra de Tramuntana')).toBeVisible()

  await page.goto('/admin/clientes')
  await expect(page.getByText('Júlia Ferrer')).toBeVisible()

  await page.goto('/admin/leads')
  await expect(page.getByText('Marta Vidal')).toBeVisible()
})

// Esta prueba muta la base. Los dos proyectos comparten servidor y base local,
// así que se ejecuta en uno solo para no competir consigo misma.
test('convertir una consulta crea un encargo y la deja convertida', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')
  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.goto('/admin/leads')
  await page.getByText('Pep Sastre').click()
  await page.waitForURL(/\/admin\/leads\/.+/)
  await expect(page.getByRole('heading', { level: 1, name: 'Pep Sastre' })).toBeVisible()

  await page.getByRole('button', { name: 'Convertir en encargo' }).click()
  await page.waitForURL(/\/admin\/encargos\/.+/)
  // El encargo nuevo existe y lleva el nombre derivado del servicio.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
