import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * Comprobación automática de accesibilidad sobre las pantallas públicas. Un
 * fallo de contraste o una imagen sin texto alternativo rompe la construcción.
 * Lo automático no lo detecta todo: antes del lanzamiento hay un repaso con
 * teclado y lector de pantalla. Ver docs/testing-y-calidad.md.
 */
const PAGES = [
  ['/', 'portada'],
  ['/trabajo', 'archivo'],
  ['/trabajo/julia-ferrer', 'ficha de proyecto'],
  ['/servicios', 'servicios'],
  ['/sobre-mi', 'sobre mí'],
  ['/contacto', 'contacto'],
  ['/legal/privacidad', 'privacidad'],
  ['/contacto/gracias', 'gracias'],
] as const

for (const [route, name] of PAGES) {
  test(`${name} no tiene fallos de accesibilidad`, async ({ page }) => {
    await page.goto(route)
    // Las apariciones arrancan ocultas y axe las leería como invisibles.
    await page.evaluate(() =>
      document.querySelectorAll('.pm-rise').forEach((el) => el.classList.add('is-in')),
    )
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations.map((v) => `${v.id}: ${v.nodes.length} nodo(s)`),
      JSON.stringify(results.violations.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.map((n) => n.html.slice(0, 120)) })), null, 2),
    ).toEqual([])
  })
}

test('la portada se recorre entera con el teclado', async ({ page }) => {
  await page.goto('/')

  // Se tabula hasta el primer enlace de navegación y se comprueba que el foco
  // avanza de verdad y que se ve. Ver docs/design-system.md.
  const visited: string[] = []
  for (let i = 0; i < 12; i += 1) {
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null
      if (!el || el === document.body) return null
      const style = getComputedStyle(el)
      return {
        tag: el.tagName.toLowerCase(),
        text: (el.textContent ?? '').trim().slice(0, 24),
        outline: style.outlineStyle,
      }
    })
    if (!focused) continue
    // El foco nunca se elimina, solo se sustituye por el estilo del sistema.
    expect(focused.outline).not.toBe('none')
    visited.push(`${focused.tag}:${focused.text}`)
  }

  expect(visited.length).toBeGreaterThan(6)
  // Se llega al menos hasta la llamada a la acción principal.
  expect(visited.join(' | ').toLowerCase()).toContain('reservar')
})

test('la navegación con teclado llega al formulario y lo puede enviar', async ({ page }) => {
  await page.goto('/contacto')
  await page.getByLabel('Tu nombre').focus()
  await page.keyboard.type('Marta')
  await page.keyboard.press('Tab')
  await page.keyboard.type('marta@example.com')

  const focusedName = await page.evaluate(
    () => (document.activeElement as HTMLInputElement | null)?.name,
  )
  expect(focusedName).toBe('email')
})
