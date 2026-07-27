import Link from 'next/link'
import { cn } from '@/components/ui'

/** Tarjeta de métrica del panel. Un número grande y su etiqueta. */
export function MetricCard({
  label,
  value,
  href,
  emphasis,
}: {
  label: string
  value: number
  href?: string
  emphasis?: boolean
}) {
  const content = (
    <>
      <span className="pm-metric__value">{value}</span>
      <span className="pm-metric__label">{label}</span>
    </>
  )
  const className = cn('pm-metric', emphasis && value > 0 && 'pm-metric--alert')
  return href ? (
    <Link className={className} href={href}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  )
}
