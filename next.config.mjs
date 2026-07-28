import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PGlite trae WASM y binarios que el empaquetador no debe tocar.
  serverExternalPackages: ['@electric-sql/pglite', 'postgres'],
  // El lint corre como paso propio (pnpm lint) y en CI, no dentro del build.
  eslint: { ignoreDuringBuilds: true },
  // El alias de tsconfig no lo recoge el empaquetador en esta versión, así que
  // se declara aquí también. Los dos sitios tienen que decir lo mismo.
  webpack(config) {
    config.resolve.alias['@'] = path.join(root, 'src')
    return config
  },
  turbopack: {
    resolveAlias: { '@/*': './src/*' },
  },
  // Las redirecciones de la web antigua entran aquí en la fase 6, cada una
  // con el comentario de dónde salió. Ver docs/contenido-y-seo.md.
  async redirects() {
    return []
  },
}

export default nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
