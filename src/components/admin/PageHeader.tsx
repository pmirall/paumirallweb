/** Cabecera de página del admin: título, subtítulo y hueco para acciones. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <header className="pm-pagehead">
      <div>
        <h1 className="pm-pagehead__title">{title}</h1>
        {subtitle ? <p className="pm-pagehead__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="pm-pagehead__actions">{actions}</div> : null}
    </header>
  )
}
