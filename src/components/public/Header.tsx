import Link from 'next/link'
import { buttonClass } from '@/components/ui'
import { hero, nav } from '@/content/landing'

export function Header() {
  return (
    <header className="pm-header" id="pm-header">
      <Link className="pm-header__mark pm-hit" href="/" aria-label={`${hero.name}, inicio`}>
        {/* El logotipo es el SVG de marca, servido desde public/brand. */}
        <img src="/brand/logo/logotipo.svg" alt="" width={170} height={38} />
      </Link>
      <nav className="pm-nav" aria-label="Principal">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <Link className={buttonClass('accent', true)} href={hero.ctaBook.href}>
        {hero.ctaBook.label}
      </Link>
    </header>
  )
}
