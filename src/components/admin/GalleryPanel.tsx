'use client'

import { useState, useTransition } from 'react'
import { buttonClass } from '@/components/ui'
import { jobDetail } from '@/content/admin'
import {
  createGalleryAction,
  regeneratePinAction,
  revokeGalleryAction,
  type GalleryActionResult,
} from '@/app/admin/(panel)/encargos/[id]/actions'

const t = jobDetail.gallery

export interface GallerySummary {
  token: string
  status: string
  watermark: boolean
  expiresAt: string
  expired: boolean
}

export interface SubmittedFavorite {
  filename: string
  submittedAt: string | null
  clientNote: string | null
}

export function GalleryPanel({
  jobId,
  clientUrl,
  gallery,
  favorites,
}: {
  jobId: string
  clientUrl: string
  gallery: GallerySummary | null
  favorites: SubmittedFavorite[]
}) {
  const [pending, startTransition] = useTransition()
  const [freshPin, setFreshPin] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [copied, setCopied] = useState(false)

  function run(action: () => Promise<GalleryActionResult>) {
    setError(false)
    startTransition(async () => {
      const result = await action()
      if (!result.ok) {
        setError(true)
        return
      }
      if (result.pin) setFreshPin(result.pin)
    })
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(clientUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError(true)
    }
  }

  if (!gallery) {
    return (
      <div className="pm-gallerypanel">
        <p className="pm-field__hint">{t.none}</p>
        <button
          className={buttonClass('primary')}
          type="button"
          disabled={pending}
          onClick={() => run(() => createGalleryAction(jobId))}
        >
          {t.create}
        </button>
        {error ? (
          <p className="pm-field__error" role="alert">
            {t.error}
          </p>
        ) : null}
        {freshPin ? <FreshPin pin={freshPin} /> : null}
      </div>
    )
  }

  const revoked = gallery.status === 'revoked'

  return (
    <div className="pm-gallerypanel">
      {revoked ? (
        <p className="pm-notice pm-notice--warn" role="note">
          {t.statusRevoked}
        </p>
      ) : null}

      {freshPin ? <FreshPin pin={freshPin} /> : null}

      <dl className="pm-keyvals">
        <div>
          <dt>{t.linkLabel}</dt>
          <dd className="pm-gallerypanel__link">
            <code>{clientUrl}</code>
            <button className={buttonClass('ghost', true)} type="button" onClick={copy}>
              {copied ? t.copied : t.copyLink}
            </button>
          </dd>
        </div>
        <div>
          <dt>{t.expiresLabel}</dt>
          <dd>
            {new Date(gallery.expiresAt).toLocaleDateString('es-ES')}
            {gallery.expired ? ` · ${t.expiredNote}` : ''}
          </dd>
        </div>
        <div>
          <dt>{t.pinLabel}</dt>
          <dd>{gallery.watermark ? t.watermarkOn : t.watermarkOff}</dd>
        </div>
      </dl>

      {!revoked ? (
        <div className="pm-gallerypanel__actions">
          <button
            className={buttonClass('ghost')}
            type="button"
            disabled={pending}
            onClick={() => run(() => regeneratePinAction(jobId))}
          >
            {t.regenerate}
          </button>
          <button
            className={buttonClass('ghost')}
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm(t.revokeConfirm)) run(() => revokeGalleryAction(jobId))
            }}
          >
            {t.revoke}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="pm-field__error" role="alert">
          {t.error}
        </p>
      ) : null}

      <section className="pm-gallerypanel__favs">
        <h3 className="pm-gallerypanel__favstitle">{t.favoritesTitle}</h3>
        {favorites.length === 0 ? (
          <p className="pm-field__hint">{t.favoritesEmpty}</p>
        ) : (
          <ul className="pm-list">
            {favorites.map((fav, i) => (
              <li key={`${fav.filename}-${i}`} className="pm-list__item">
                <div>
                  <span className="pm-list__title">{fav.filename}</span>
                  {fav.clientNote ? (
                    <span className="pm-list__meta">
                      {t.favoritesNote}: {fav.clientNote}
                    </span>
                  ) : null}
                </div>
                {fav.submittedAt ? (
                  <span className="pm-list__date">
                    {new Date(fav.submittedAt).toLocaleDateString('es-ES')}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function FreshPin({ pin }: { pin: string }) {
  return (
    <div className="pm-freshpin" role="status">
      <span className="pm-freshpin__pin">{pin}</span>
      <span className="pm-freshpin__note">{jobDetail.gallery.pinFresh}</span>
    </div>
  )
}
