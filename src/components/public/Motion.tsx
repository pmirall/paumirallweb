'use client'

import { useEffect } from 'react'

/**
 * El movimiento de la portada. Es lo único que necesita cliente.
 *
 * El estado oculto de las apariciones solo se aplica si esto se ejecuta, así
 * que sin JavaScript, y para quien rastrea la página, todo se ve desde el
 * primer momento. Ver docs/landing.md.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('pm-js')

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cleanups: Array<() => void> = [() => root.classList.remove('pm-js')]

    const hero = document.querySelector('.pm-hero')
    const header = document.getElementById('pm-header')
    if (hero && header) {
      const io = new IntersectionObserver(
        ([entry]) => header.classList.toggle('is-stuck', !entry?.isIntersecting),
        { rootMargin: '-88px 0px 0px 0px' },
      )
      io.observe(hero)
      cleanups.push(() => io.disconnect())
    }

    const reveals = document.querySelectorAll('.pm-rise')
    if (reduced) {
      reveals.forEach((el) => el.classList.add('is-in'))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in')
              io.unobserve(entry.target)
            }
          })
        },
        { rootMargin: '0px 0px -12% 0px' },
      )
      reveals.forEach((el) => io.observe(el))
      cleanups.push(() => io.disconnect())
    }

    // La hoja de contactos avanza sola, como un carrete pasando.
    const frames = Array.from(document.querySelectorAll<HTMLElement>('.pm-frame'))
    if (frames.length > 0 && !reduced) {
      let i = 0
      const timer = window.setInterval(() => {
        frames.forEach((f) => f.removeAttribute('data-on'))
        i = (i + 1) % frames.length
        frames[i]?.setAttribute('data-on', '')
      }, 1400)
      cleanups.push(() => window.clearInterval(timer))
    }

    return () => cleanups.forEach((fn) => fn())
  }, [])

  return null
}
