/** Rótulo en marcha. La copia duplicada es decorativa y se oculta al lector. */
export function Marquee({
  text,
  className,
  repeat = 2,
}: {
  text: string
  className?: string
  repeat?: number
}) {
  return (
    <div className={className} aria-hidden="true">
      <div className="pm-marquee__track">
        {Array.from({ length: repeat }, (_, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>
    </div>
  )
}
