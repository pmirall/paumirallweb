import { pgEnum } from 'drizzle-orm/pg-core'

/**
 * Sin enums de TypeScript: uniones de literales, que se llevan mejor con Zod.
 * Los de Postgres sí, para que la base de datos rechace un valor inventado.
 * La traducción al vocabulario del negocio está en docs/glosario.md.
 */
export const JOB_STATUSES = [
  'draft',
  'confirmed',
  'shot',
  'editing',
  'delivered',
  'closed',
  'cancelled',
] as const
export type JobStatus = (typeof JOB_STATUSES)[number]
export const jobStatus = pgEnum('job_status', JOB_STATUSES)

/** Al cliente solo se le enseñan los cuatro centrales. */
export const CLIENT_VISIBLE_STATUSES = ['confirmed', 'shot', 'editing', 'delivered'] as const

export const JOB_CATEGORIES = ['artist', 'sport', 'video'] as const
export type JobCategory = (typeof JOB_CATEGORIES)[number]
export const jobCategory = pgEnum('job_category', JOB_CATEGORIES)

export const LEAD_STATUSES = ['new', 'read', 'replied', 'converted', 'discarded'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export const leadStatus = pgEnum('lead_status', LEAD_STATUSES)

export const DELIVERABLE_KINDS = ['photos', 'video', 'reel', 'raw'] as const
export type DeliverableKind = (typeof DELIVERABLE_KINDS)[number]
export const deliverableKind = pgEnum('deliverable_kind', DELIVERABLE_KINDS)

export const TIME_ENTRY_KINDS = ['shoot', 'edit', 'travel', 'admin'] as const
export type TimeEntryKind = (typeof TIME_ENTRY_KINDS)[number]
export const timeEntryKind = pgEnum('time_entry_kind', TIME_ENTRY_KINDS)
