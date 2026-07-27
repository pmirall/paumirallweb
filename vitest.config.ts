import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    // Las pruebas de integración levantan Postgres en memoria, que tarda unos
    // segundos en arrancar. El límite por defecto de 5s no llega.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
})
