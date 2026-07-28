'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { galleryView } from '@/content/gallery'

export interface GalleryPhoto {
  id: string
  filename: string
  width: number | null
  height: number | null
}

/**
 * La rejilla de la entrega y su visor a pantalla completa. Cada foto reserva su
 * espacio por proporción para que no salte al cargar, y las miniaturas cargan de
 * forma diferida. El visor es un diálogo modal: atrapa el foco, se cierra con
 * Escape, se recorre con las flechas y devuelve el foco a la foto de origen.
 */
export function GalleryGrid({ token, photos }: { token: string; photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null)
  const triggers = useRef<Array<HTMLButtonElement | null>>([])

  const src = (id: string, v: 'thumb' | 'web') => `/c/${token}/foto/${id}?v=${v}`
  const alt = (i: number) => `${galleryView.photoAlt} ${i + 1}`

  const close = useCallback(() => {
    setOpen((current) => {
      if (current !== null) triggers.current[current]?.focus()
      return null
    })
  }, [])

  return (
    <>
      <ul className="pm-photos" aria-label={galleryView.eyebrow}>
        {photos.map((photo, i) => (
          <li
            key={photo.id}
            className="pm-photos__item"
            style={{
              aspectRatio:
                photo.width && photo.height ? `${photo.width} / ${photo.height}` : '3 / 2',
            }}
          >
            <button
              type="button"
              ref={(el) => {
                triggers.current[i] = el
              }}
              className="pm-photos__tile"
              onClick={() => setOpen(i)}
              aria-label={`${galleryView.openPhoto} ${i + 1}`}
            >
              <span className="pm-plate">
                <img src={src(photo.id, 'thumb')} alt={alt(i)} loading="lazy" decoding="async" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {open !== null ? (
        <Lightbox
          photos={photos}
          index={open}
          onClose={close}
          onIndex={setOpen}
          src={src}
          alt={alt}
        />
      ) : null}
    </>
  )
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
  src,
  alt,
}: {
  photos: GalleryPhoto[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
  src: (id: string, v: 'thumb' | 'web') => string
  alt: (i: number) => string
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const total = photos.length
  const photo = photos[index]!

  const prev = useCallback(() => onIndex((index - 1 + total) % total), [index, total, onIndex])
  const next = useCallback(() => onIndex((index + 1) % total), [index, total, onIndex])

  // Teclado: Escape cierra, flechas navegan, y el foco no se escapa del diálogo.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        prev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        next()
      } else if (event.key === 'Tab') {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button')
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]!
        const last = focusables[focusables.length - 1]!
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  // El foco entra en el diálogo al abrir y el fondo no hace scroll.
  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <div
      className="pm-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={galleryView.viewerLabel}
      ref={dialogRef}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="pm-lightbox__bar">
        <span className="pm-lightbox__count" aria-live="polite">
          {index + 1} / {total}
        </span>
        <button type="button" className="pm-lightbox__btn" onClick={onClose}>
          {galleryView.close}
        </button>
      </div>

      <button
        type="button"
        className="pm-lightbox__nav pm-lightbox__nav--prev"
        onClick={prev}
        aria-label={galleryView.previous}
      >
        <span aria-hidden="true">‹</span>
      </button>

      <figure className="pm-lightbox__stage">
        <img src={src(photo.id, 'web')} alt={alt(index)} />
      </figure>

      <button
        type="button"
        className="pm-lightbox__nav pm-lightbox__nav--next"
        onClick={next}
        aria-label={galleryView.next}
      >
        <span aria-hidden="true">›</span>
      </button>
    </div>
  )
}
