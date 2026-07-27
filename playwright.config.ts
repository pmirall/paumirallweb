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
    command: 'pnpm build && pnpm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
