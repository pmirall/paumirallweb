import js from '@eslint/js'
import ts from 'typescript-eslint'

/**
 * eslint-config-next todavía no funciona con ESLint 10, así que la
 * configuración es propia. Cuando salga la versión compatible, se vuelve a
 * añadir y se quitan las reglas que ya cubra.
 */
export default ts.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'docs/**',
      '.claude/**',
      'next-env.d.ts',
      'tests/e2e/**',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    languageOptions: {
      globals: { React: 'readonly', process: 'readonly' },
    },
    rules: {
      // Las reglas del repositorio. Ver docs/convenciones.md.
      // Un argumento que empieza por _ está sin usar a propósito: métodos que
      // cumplen un contrato pero no necesitan todos sus parámetros.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'warn',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message: 'Lee las variables de entorno desde src/lib/env.ts.',
        },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}$/]",
          message:
            'Sin colores escritos a mano. Usa un token de src/styles/tokens.css.',
        },
      ],
    },
  },
  {
    files: ['src/lib/env.ts', '*.config.*', 'src/**/*.test.ts', 'vitest.setup.ts'],
    rules: { 'no-restricted-properties': 'off', 'no-restricted-syntax': 'off' },
  },
)
