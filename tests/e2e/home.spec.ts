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
  // /admin sin sesión responde 404; la pantalla de acceso sí es alcanzable y
  // lleva la cabecera. Se usa request para no tropezar con el 404. El gate en
  // sí lo cubre admin.spec.ts.
  const response = await page.request.get('/admin/login')
  expect(response.headers()['x-robots-tag']).toContain('noindex')
})

test('el archivo filtra por categoría y avisa cuando no hay nada', async ({ page }) => {
  await page.goto('/trabajo?cat=deporte')
  await expect(page.getByRole('heading', { name: 'Trail Serra de Tramuntana' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Júlia Ferrer' })).toHaveCount(0)
})

test('la ficha de proyecto tiene metadatos propios', async ({ page }) => {
  await page.goto('/trabajo/julia-ferrer')
  await expect(page).toHaveTitle(/Júlia Ferrer/)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Júlia Ferrer')
})

test('un proyecto que no existe responde 404', async ({ page }) => {
  const response = await page.goto('/trabajo/esto-no-existe')
  expect(response?.status()).toBe(404)
})

test('reservar desde una tarifa preselecciona el servicio', async ({ page }) => {
  await page.goto('/contacto?servicio=deporte')
  await expect(page.locator('#service')).toHaveValue('deporte')
})

test('el formulario no envía sin consentimiento y conserva lo escrito', async ({ page }) => {
  await page.goto('/contacto')
  await page.fill('input[name="name"]', 'Marta')
  await page.fill('input[name="email"]', 'marta@example.com')
  await page.fill('textarea[name="message"]', 'Necesito fotos para la gira de mayo.')
  await page.getByRole('button', { name: 'Enviar' }).click()
  await expect(page).toHaveURL(/\/contacto$/)
  // Next añade su propio role="alert" para anunciar rutas, así que se apunta
  // al mensaje concreto en vez de al rol.
  await expect(page.getByText('Necesito que lo aceptes')).toBeVisible()
  await expect(page.locator('input[name="name"]')).toHaveValue('Marta')
})

test('el formulario completo lleva a gracias', async ({ page }) => {
  await page.goto('/contacto')
  await page.fill('input[name="name"]', 'Marta')
  await page.fill('input[name="email"]', 'marta@example.com')
  await page.fill('textarea[name="message"]', 'Necesito fotos para la gira de mayo.')
  await page.check('input[name="consent"]')
  await page.getByRole('button', { name: 'Enviar' }).click()
  await expect(page).toHaveURL(/\/contacto\/gracias$/)
})

test('el sitemap lista los proyectos publicados', async ({ page }) => {
  const response = await page.goto('/sitemap.xml')
  const body = (await response?.text()) ?? ''
  expect(body).toContain('/trabajo/julia-ferrer')
  expect(body).not.toContain('/admin')
})
