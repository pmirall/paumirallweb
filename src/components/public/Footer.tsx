import Link from 'next/link'
import { footer, hero } from '@/content/landing'

export function Footer() {
  return (
    <footer className="pm-foot">
      <div className="pm-wrap">
        <div className="pm-foot__top">
          <img
            className="pm-foot__mark"
            src="/brand/logo/logotipo.svg"
            alt={`${hero.name}, ${hero.descriptor.toLowerCase()}`}
            width={220}
            height={49}
          />
          <p className="pm-foot__place">{footer.place}</p>
        </div>
        <div className="pm-foot__links">
          {footer.legal.map((item) => (
            <Link className="pm-hit" key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
