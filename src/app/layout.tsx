import type { Metadata } from 'next'
import { archivo, bitter } from '@/lib/fonts'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Pau Miralles · Fotógrafo y videógrafo',
  description:
    'Retrato de artistas y fotografía de deporte. Vivo en Palma de Mallorca y viajo a donde estés trabajando.',
  icons: {
    icon: '/brand/logo/favicon.svg',
    apple: '/brand/logo/apple-touch-icon-180.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${archivo.variable} ${bitter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
