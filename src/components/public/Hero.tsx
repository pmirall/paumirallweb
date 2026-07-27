import Link from 'next/link'
import { Plate, buttonClass } from '@/components/ui'
import { hero } from '@/content/landing'
import { Marquee } from './Marquee'

const SHEET_FRAMES = 6

export function Hero() {
  return (
    <section className="pm-hero pm-texture" aria-labelledby="pm-hero-title">
      <Marquee className="pm-hero__marquee pm-marquee" text={hero.marquee} />

      <div className="pm-wrap pm-hero__stage">
        <Plate className="pm-hero__band" ratio="21 / 8" note={hero.platePlaceholder} />

        {/* El logotipo cruza dentro de su propia placa de tinta: en tinta sobre
            la foto no se leería, y en hueso sobre el turquesa tampoco.
            Ver docs/landing.md. */}
        <div className="pm-hero__plaque">
          <h1 className="pm-hero__wordmark" id="pm-hero-title">
            {hero.name}
          </h1>
        </div>

        <div className="pm-hero__foot">
          <p className="pm-hero__lead">{hero.lead}</p>
          <div className="pm-hero__cta">
            <Link className={buttonClass('primary')} href={hero.ctaWork.href}>
              {hero.ctaWork.label}
            </Link>
            <Link className={buttonClass('ghost')} href={hero.ctaBook.href}>
              {hero.ctaBook.label}
            </Link>
          </div>
        </div>
      </div>

      <div className="pm-wrap pm-hero__bottom">
        <div className="pm-sheet" aria-hidden="true">
          <span className="pm-sheet__label">{hero.sheetLabel}</span>
          {Array.from({ length: SHEET_FRAMES }, (_, i) => (
            <span className="pm-frame" key={i} data-on={i === 0 ? '' : undefined} />
          ))}
        </div>
        <div className="pm-cue" aria-hidden="true">
          <span>{hero.scrollCue}</span>
          <i />
        </div>
      </div>
    </section>
  )
}
