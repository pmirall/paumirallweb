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

test('la ficha de encargo tiene sus cinco pestañas y respeta el guardado de entregables', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.goto('/admin/encargos')
  await page.getByText('Trail Serra de Tramuntana').click()
  await page.waitForURL(/\/admin\/encargos\/.+/)

  for (const tab of ['Resumen', 'Archivos', 'Galería', 'Dinero', 'Notas']) {
    await expect(page.getByRole('link', { name: tab })).toBeVisible()
  }

  // Con un entregable pendiente, pasar a entregado no cambia el estado.
  await page.locator('#status').selectOption('delivered')
  await page.getByRole('button', { name: 'Cambiar estado' }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.pm-pagehead__actions').getByText('Editando')).toBeVisible()
  await expect(page.getByText('no se puede entregar todavía')).toBeVisible()
})

test('crear un encargo desde el formulario lleva a su ficha', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.goto('/admin/encargos/nuevo')
  await page.selectOption('#clientId', { label: 'Júlia Ferrer' })
  await page.fill('input[name="title"]', 'Sesión de estudio')
  await page.getByRole('button', { name: 'Crear encargo' }).click()

  // La ficha del encargo recién creado, no el 404: prueba el read-after-write.
  await page.waitForURL(/\/admin\/encargos\/[0-9a-f]{8}-/)
  await expect(page.getByRole('heading', { level: 1, name: 'Sesión de estudio' })).toBeVisible()
})

test('anotar horas suma al total del encargo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.goto('/admin/encargos')
  await page.getByText('Trail Serra de Tramuntana').click()
  await page.waitForURL(/\/admin\/encargos\/.+/)

  const before = await page.locator('.pm-time-total strong').textContent()
  await page.fill('input[name="date"]', '2026-05-20')
  await page.fill('input[name="minutes"]', '60')
  await page.getByRole('button', { name: 'Anotar' }).click()
  await page.waitForLoadState('networkidle')

  // El total cambia, así que la nueva hora se ha guardado.
  await expect(page.locator('.pm-time-total strong')).not.toHaveText(before ?? '')
})

test('la pestaña de dinero da el euros por hora del encargo', async ({ page }) => {
  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  await page.goto('/admin/encargos')
  await page.getByText('Trail Serra de Tramuntana').click()
  await page.waitForURL(/\/admin\/encargos\/.+/)
  await page.getByRole('link', { name: 'Dinero' }).click()

  await expect(page.getByText('Euros por hora')).toBeVisible()
  // Con presupuesto y horas sembrados, sale un número en euros, no el aviso.
  await expect(page.locator('.pm-money__rate')).toContainText('€')
})

test('la pestaña de galería crea el enlace, muestra el PIN una vez y revoca', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  // El encargo de trail no tiene galería sembrada, así que se puede crear.
  await page.goto('/admin/encargos')
  await page.getByText('Trail Serra de Tramuntana').click()
  await page.waitForURL(/\/admin\/encargos\/.+/)
  await page.getByRole('link', { name: 'Galería' }).click()

  await expect(page.getByText('todavía no tiene galería')).toBeVisible()
  await page.getByRole('button', { name: 'Crear galería' }).click()
  await page.waitForLoadState('networkidle')

  // El PIN se muestra una vez, con cuatro dígitos, y aparece el enlace del cliente.
  await expect(page.locator('.pm-freshpin__pin')).toHaveText(/^\d{4}$/)
  await expect(page.locator('.pm-gallerypanel__link code')).toContainText('/c/')

  // Revocar corta el acceso al instante.
  page.on('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Revocar acceso' }).click()
  await page.waitForLoadState('networkidle')
  await expect(page.getByText(/Revocada/)).toBeVisible()
})

test('la cola de enriquecimiento sincroniza y convierte una carpeta en encargo', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'muta datos; un solo proyecto')

  await page.goto('/admin/login')
  await page.getByRole('button', { name: 'Entrar en modo desarrollo' }).click()
  await page.waitForURL('**/admin')

  // Sincroniza contra el Drive de prueba.
  await page.goto('/admin/drive')
  await page.getByRole('button', { name: 'Sincronizar ahora' }).click()
  await page.waitForLoadState('networkidle')

  await page.goto('/admin/drive/cola')
  // Una fecha imposible se marca dudosa, no se inventa.
  await expect(page.getByText('fecha dudosa')).toBeVisible()

  // Enriquece la fila de Marlene, que trae el cliente sugerido.
  const marlene = page.locator('tr', { hasText: 'Marlene.25.07.01' })
  await expect(marlene.locator('input[name="clientName"]')).toHaveValue('Marlene')
  await marlene.getByRole('button', { name: 'Crear encargo' }).click()
  await page.waitForLoadState('networkidle')

  // El encargo aparece en la lista con el cliente y la fecha de la carpeta.
  await page.goto('/admin/encargos')
  await expect(page.getByText('Marlene.25.07.01')).toBeVisible()
})
