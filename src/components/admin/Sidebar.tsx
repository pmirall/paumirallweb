'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminChrome, adminNav } from '@/content/admin'
import { cn } from '@/components/ui'

/**
 * Barra lateral del admin. Prioriza la velocidad de trabajo: una lista corta y
 * densa, con la sección activa marcada. En móvil pasa a barra inferior, porque
 * el dashboard es una de las pantallas que se usan en un rodaje.
 */
export function Sidebar({ dev }: { dev: boolean }) {
  const pathname = usePathname()

  return (
    <nav className="pm-side" aria-label="Secciones">
      <div className="pm-side__brand">
        <span className="pm-side__brand-name">{adminChrome.brand}</span>
        <span className="pm-side__brand-tag">{adminChrome.brandTag}</span>
      </div>
      <ul className="pm-side__list">
        {adminNav.map((item) => {
          const active =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
          return (
            <li key={item.href}>
              <Link
                className={cn('pm-side__link', active && 'is-active')}
                href={item.href}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      {dev ? <span className="pm-side__dev">{adminChrome.devBadge}</span> : null}
    </nav>
  )
}
