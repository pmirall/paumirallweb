import { PageHeader } from '@/components/admin/PageHeader'
import { EmptyState } from '@/components/ui'

/** Alta de encargo. El formulario completo llega más adelante en la fase 1. */
export default function NewJobPage() {
  return (
    <>
      <PageHeader title="Nuevo encargo" subtitle="Alta manual de un encargo." />
      <EmptyState
        level={2}
        title="En construcción"
        body="El formulario de alta llega en el siguiente paso de la fase 1. Por ahora, los encargos se crean convirtiendo una consulta."
      />
    </>
  )
}
