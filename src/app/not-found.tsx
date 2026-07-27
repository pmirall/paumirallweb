import { Footer } from '@/components/public/Footer'
import { Header } from '@/components/public/Header'
import { NotFoundView } from '@/components/public/NotFoundView'

/**
 * Next solo usa el not-found de la raíz para las URL que no encajan en ninguna
 * ruta, y ese no pasa por el layout de la zona pública. Así que la cabecera y
 * el pie se ponen aquí a mano, para que el 404 no salga desnudo.
 */
export default function RootNotFound() {
  return (
    <>
      <Header />
      <main>
        <NotFoundView />
      </main>
      <Footer />
    </>
  )
}
