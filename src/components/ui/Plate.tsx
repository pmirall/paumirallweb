import { cn } from './cn'

/**
 * Toda imagen del sitio va dentro de una placa: lleva el corte a 45 grados y
 * reserva su espacio con la proporción real, para que no haya saltos mientras
 * carga. Sin imagen, el hueco se ve como un fotograma sin revelar en vez de
 * como una imagen rota.
 */
export function Plate({
  src,
  alt,
  ratio = '4 / 5',
  note,
  className,
}: {
  src?: string
  alt?: string
  ratio?: string
  note?: string
  className?: string
}) {
  return (
    <div className={cn('pm-plate', className)} style={{ aspectRatio: ratio }}>
      {src ? <img src={src} alt={alt ?? ''} /> : null}
      {!src && note ? <span className="pm-plate__note">{note}</span> : null}
    </div>
  )
}
