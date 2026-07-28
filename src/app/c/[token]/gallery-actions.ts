'use server'

import { z } from 'zod'
import { requireGallerySession } from '@/lib/gallery/guard'
import { submitSelection, toggleFavorite } from '@/db/queries/favorites'

const idSchema = z.string().uuid()
const noteSchema = z.string().trim().max(500).optional()

export type ToggleResult = { ok: true; marked: boolean } | { ok: false }

/** Marca o desmarca una foto como favorita. Requiere sesión de esta galería. */
export async function toggleFavoriteAction(token: string, assetId: string): Promise<ToggleResult> {
  const parsed = idSchema.safeParse(assetId)
  if (!parsed.success) return { ok: false }
  const ctx = await requireGallerySession(token)
  if (!ctx) return { ok: false }

  const result = await toggleFavorite(ctx.database, ctx.gallery.id, ctx.gallery.jobId, parsed.data)
  if (!result) return { ok: false }
  return { ok: true, marked: result.marked }
}

export type SubmitResult = { ok: true; count: number } | { ok: false }

/** Envía la selección. Sella lo marcado y deja un aviso en la cola del admin. */
export async function submitSelectionAction(token: string, note?: string): Promise<SubmitResult> {
  const parsedNote = noteSchema.safeParse(note)
  const ctx = await requireGallerySession(token)
  if (!ctx) return { ok: false }

  const count = await submitSelection(
    ctx.database,
    ctx.gallery.id,
    parsedNote.success ? (parsedNote.data ?? null) : null,
    new Date(),
  )
  return { ok: true, count }
}
