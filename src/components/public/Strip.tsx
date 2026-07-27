import { strip } from '@/content/landing'
import { Marquee } from './Marquee'

/** Las constantes del negocio, en marcha. Decorativo: no aporta nada nuevo. */
export function Strip() {
  return <Marquee className="pm-strip pm-marquee" text={strip.join(' · ') + ' · '} />
}
