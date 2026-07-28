'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { galleryView } from '@/content/gallery'
import { submitSelectionAction, toggleFavoriteAction } from '@/app/c/[token]/gallery-actions'

export interface GalleryPhoto {
  id: string
  filename: string
  width: number | null
  height: number | null
}

/**
 * La rejilla de la entrega, el visor a pantalla completa y la selección de
 * favoritas. Cada foto reserva su espacio por proporción para que no salte al
 * cargar, y las miniaturas cargan de forma diferida. El visor es un diálogo
 * modal: atrapa el foco, se cierra con Escape, se recorre con las flechas y
 * devuelve el foco a la foto de origen. Marcar favoritas es optimista: se pinta
 * al instante y se revierte si el servidor lo rechaza.
 */
export function GalleryGrid({
  token,
  photos,
  initialFavorites = [],
}: {
  token: string
  photos: GalleryPhoto[]
  initialFavorites?: string[]
}) {
  const [open, setOpen] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set(initialFavorites))
  const [sent, setSent] = useState<number | null>(null)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()
  const triggers = useRef<Array<HTMLButtonElement | null>>([])

  const src = (id: string, v: 'thumb' | 'web') => `/c/${token}/foto/${id}?v=${v}`
  const alt = (i: number) => `${galleryView.photoAlt} ${i + 1}`

  const toggle = useCallback(
    (assetId: string) => {
      setError(false)
      setSent(null)
      // Optimista: se cambia ya y se revierte si la acción falla.
      const wasMarked = favorites.has(assetId)
      setFavorites((prev) => {
        const nextSet = new Set(prev)
        if (wasMarked) nextSet.delete(assetId)
        else nextSet.add(assetId)
        return nextSet
      })
      startTransition(async () => {
        const result = await toggleFavoriteAction(token, assetId)
        if (!result.ok) {
          setError(true)
          setFavorites((prev) => {
            const nextSet = new Set(prev)
            if (wasMarked) nextSet.add(assetId)
            else nextSet.delete(assetId)
            return nextSet
          })
        }
      })
    },
    [favorites, token],
  )

  const submit = useCallback(() => {
    setError(false)
    startTransition(async () => {
      const result = await submitSelectionAction(token)
      if (result.ok) setSent(result.count)
      else setError(true)
    })
  }, [token])

  const close = useCallback(() => {
    setOpen((current) => {
      if (current !== null) triggers.current[current]?.focus()
      return null
    })
  }, [])

  const count = favorites.size

  return (
    <>
      <ul className="pm-photos" aria-label={galleryView.eyebrow}>
        {photos.map((photo, i) => {
          const marked = favorites.has(photo.id)
          return (
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
              <button
                type="button"
                className="pm-fav"
                data-marked={marked}
                aria-pressed={marked}
                aria-label={marked ? galleryView.unmarkFavorite : galleryView.markFavorite}
                onClick={() => toggle(photo.id)}
              >
                <FavIcon filled={marked} />
              </button>
            </li>
          )
        })}
      </ul>

      <div className="pm-selection" role="region" aria-label={galleryView.selectionTitle}>
        <div className="pm-selection__text">
          <strong>{galleryView.selectionTitle}</strong>
          <span aria-live="polite">
            {sent !== null ? galleryView.selectionDone(sent) : galleryView.selectionCount(count)}
          </span>
          {sent === null ? <span className="pm-selection__hint">{galleryView.selectionHint}</span> : null}
          {error ? (
            <span className="pm-selection__error" role="alert">
              {galleryView.selectionError}
            </span>
          ) : null}
        </div>
        {sent === null ? (
          <button
            type="button"
            className="pm-btn pm-btn--accent"
            onClick={submit}
            disabled={count === 0 || pending}
          >
            {pending ? galleryView.selectionSending : galleryView.selectionSend}
          </button>
        ) : null}
      </div>

      {open !== null ? (
        <Lightbox
          photos={photos}
          index={open}
          onClose={close}
          onIndex={setOpen}
          src={src}
          alt={alt}
          isFavorite={(id) => favorites.has(id)}
          onToggle={toggle}
        />
      ) : null}
    </>
  )
}

function FavIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M12 20.5 4.6 13a4.7 4.7 0 0 1 6.6-6.6l.8.8.8-.8a4.7 4.7 0 0 1 6.6 6.6Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
  src,
  alt,
  isFavorite,
  onToggle,
}: {
  photos: GalleryPhoto[]
  index: number
  onClose: () => void
  onIndex: (i: number) => void
  src: (id: string, v: 'thumb' | 'web') => string
  alt: (i: number) => string
  isFavorite: (id: string) => boolean
  onToggle: (id: string) => void
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const total = photos.length
  const photo = photos[index]!
  const marked = isFavorite(photo.id)

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
        <div className="pm-lightbox__actions">
          <button
            type="button"
            className="pm-lightbox__btn"
            data-marked={marked}
            aria-pressed={marked}
            onClick={() => onToggle(photo.id)}
          >
            <FavIcon filled={marked} />
            <span>{marked ? galleryView.unmarkFavorite : galleryView.markFavorite}</span>
          </button>
          <button type="button" className="pm-lightbox__btn" onClick={onClose}>
            {galleryView.close}
          </button>
        </div>
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
