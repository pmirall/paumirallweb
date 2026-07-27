import Link from 'next/link'
import { cn } from '@/components/ui'

/**
 * Tabla de datos del admin. Densa, con envoltura que hace scroll horizontal en
 * pantallas estrechas en vez de romper la maqueta. Las filas pueden enlazar.
 */
export type Column<Row> = {
  key: string
  header: string
  render: (row: Row) => React.ReactNode
  align?: 'start' | 'end'
}

export function DataTable<Row extends { id: string }>({
  columns,
  rows,
  hrefFor,
  caption,
}: {
  columns: Column<Row>[]
  rows: Row[]
  hrefFor?: (row: Row) => string
  caption?: string
}) {
  return (
    <div className="pm-table-wrap">
      <table className="pm-table">
        {caption ? <caption className="pm-sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={cn(col.align === 'end' && 'pm-td--end')}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const href = hrefFor?.(row)
            return (
              <tr key={row.id} className={cn(href && 'pm-tr--link')}>
                {columns.map((col, i) => (
                  <td key={col.key} className={cn(col.align === 'end' && 'pm-td--end')}>
                    {href && i === 0 ? (
                      <Link className="pm-tr__link" href={href}>
                        {col.render(row)}
                      </Link>
                    ) : (
                      col.render(row)
                    )}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
