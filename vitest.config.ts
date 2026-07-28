import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Las pruebas de integración levantan Postgres en memoria, que tarda unos
    // segundos en arrancar. El límite por defecto de 5s no llega, y con muchos
    // ficheros a la vez el arranque compite por CPU, así que el margen es amplio.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
