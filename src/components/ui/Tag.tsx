import { cn, variantClass } from './cn'

export type TagTone = 'neutral' | 'accent' | 'ok' | 'notice' | 'error'

const TONES: Record<TagTone, string> = {
  neutral: 'pm-tag--neutral',
  accent: 'pm-tag--accent',
  ok: 'pm-tag--ok',
  notice: 'pm-tag--notice',
  error: 'pm-tag--error',
}

export function tagClass(tone: TagTone = 'neutral'): string {
  return variantClass('pm-tag', TONES, tone)
}

export function Tag({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: TagTone
  className?: string
  children: React.ReactNode
}) {
  return <span className={cn(tagClass(tone), className)}>{children}</span>
}
