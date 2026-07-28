import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// Este entorno trae Chromium preinstalado en una versión distinta a la que
// espera @playwright/test, así que en local se apunta al binario que hay.
// En CI se instalan los navegadores propios y esto no aplica.
const localChromium = '/opt/pw-browsers/chromium'
const useLocalBinary = !process.env.CI && existsSync(localChromium)
const launch = useLocalBinary ? { executablePath: localChromium } : {}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'on-first-retry' },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], launchOptions: launch },
    },
    // WebKit solo en CI: aquí no hay binario disponible.
    ...(useLocalBinary
      ? []
      : [{ name: 'webkit-movil', use: { ...devices['iPhone 13'] } }]),
    {
      name: 'movil',
      use: { ...devices['Pixel 7'], launchOptions: launch },
    },
  ],
  webServer: {
    // La base local se siembra antes de construir, para que el archivo
    // prerenderice proyectos y las pruebas tengan datos que ver.
    command: 'pnpm db:dev && pnpm build && pnpm start',
    url: 'http://127.0.0.1:3000',
    // En producción SITE_URL es obligatoria, así que aquí se pasa igual que
    // lo hará Vercel. Ver src/lib/env.ts.
    env: {
      SITE_URL: 'http://127.0.0.1:3000',
      // El admin se prueba con el acceso de desarrollo, que Vercel nunca activa.
      ADMIN_ALLOWED_EMAILS: 'pau@example.com',
      SESSION_SECRET: 'secreto-de-prueba-e2e',
      ADMIN_DEV_BYPASS: '1',
      IP_HASH_SALT: 'sal-de-prueba',
    },
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
