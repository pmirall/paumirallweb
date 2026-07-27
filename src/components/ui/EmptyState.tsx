import { cn } from './cn'

/**
 * Un estado vacío siempre dice qué pasa y ofrece una salida. Nunca una pantalla
 * en blanco.
 */
export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string
  body: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('pm-empty', className)}>
      <h3 className="pm-empty__title">{title}</h3>
      <p className="pm-empty__body">{body}</p>
      {action}
    </div>
  )
}
