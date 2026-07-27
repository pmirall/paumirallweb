import type { ButtonHTMLAttributes } from 'react'
import { cn, variantClass } from './cn'

export type ButtonTone = 'primary' | 'ghost' | 'accent'

const TONES: Record<ButtonTone, string> = {
  primary: 'pm-btn--primary',
  ghost: 'pm-btn--ghost',
  accent: 'pm-btn--accent',
}

export function buttonClass(tone: ButtonTone = 'primary', small = false): string {
  return cn(variantClass('pm-btn', TONES, tone), small && 'pm-btn--sm')
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone
  small?: boolean
}

export function Button({ tone = 'primary', small, className, ...rest }: Props) {
  return <button className={cn(buttonClass(tone, small), className)} {...rest} />
}
