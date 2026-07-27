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
  /** El nivel se pasa desde fuera: el correcto depende de lo que haya encima. */
  level = 3,
}: {
  title: string
  body: string
  action?: React.ReactNode
  className?: string
  level?: 2 | 3 | 4
}) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4'
  return (
    <div className={cn('pm-empty', className)}>
      <Heading className="pm-empty__title">{title}</Heading>
      <p className="pm-empty__body">{body}</p>
      {action}
    </div>
  )
}
