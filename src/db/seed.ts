import { requireDatabaseUrl } from '@/lib/env'
import { createDatabase } from './client'
import { clients, deliverables, jobPublications, jobs, leads, timeEntries } from './schema'

/**
 * Datos con los que se puede trabajar de verdad, no tres filas de mentira.
 * Cubre todos los estados de encargo para que las pantallas del admin tengan
 * algo que enseñar. Ver docs/testing-y-calidad.md.
 */
export async function seed(db: ReturnType<typeof createDatabase>) {
  const inserted = await db
    .insert(clients)
    .values([
      { name: 'Júlia Ferrer', email: 'julia@example.com', phone: '+34 600 000 001' },
      { name: 'Club Trail Tramuntana', email: 'info@example.com', company: 'Club Trail' },
      { name: 'Sala Pelaires', email: 'produccion@example.com', company: 'Sala Pelaires' },
    ])
    .returning()

  const [julia, club, sala] = inserted
  if (!julia || !club || !sala) throw new Error('No se han creado los clientes de ejemplo.')

  const created = await db
    .insert(jobs)
    .values([
      {
        code: '2025-001',
        clientId: julia.id,
        title: 'Retrato de prensa',
        category: 'artist',
        status: 'delivered',
        shootDate: '2025-06-14',
        dueDate: '2025-06-21',
        budgetCents: 32000,
        published: true,
      },
      {
        code: '2025-002',
        clientId: club.id,
        title: 'Trail Serra de Tramuntana',
        category: 'sport',
        status: 'editing',
        shootDate: '2025-10-05',
        budgetCents: 45000,
        published: true,
      },
      {
        code: '2024-018',
        clientId: sala.id,
        title: 'Pieza de temporada',
        category: 'video',
        status: 'closed',
        shootDate: '2024-11-02',
        budgetCents: 70000,
        published: true,
      },
      {
        code: '2026-003',
        clientId: julia.id,
        title: 'Sesión de gira',
        category: 'artist',
        status: 'confirmed',
        shootDate: '2026-09-12',
        budgetCents: 38000,
      },
      {
        code: '2026-004',
        clientId: club.id,
        title: 'Media maratón',
        category: 'sport',
        status: 'draft',
        budgetCents: 45000,
      },
    ])
    .returning()

  const [retrato, trail, video] = created
  if (!retrato || !trail || !video) throw new Error('No se han creado los encargos.')

  await db.insert(jobPublications).values([
    {
      jobId: retrato.id,
      slug: 'julia-ferrer',
      publicTitle: 'Júlia Ferrer',
      summary: 'Retrato de prensa para el lanzamiento del disco, en su local de ensayo.',
      year: 2025,
      sortOrder: 1,
    },
    {
      jobId: trail.id,
      slug: 'trail-serra-de-tramuntana',
      publicTitle: 'Trail Serra de Tramuntana',
      summary: 'Cobertura de carrera de montaña, de la salida de noche al último corredor.',
      year: 2025,
      sortOrder: 2,
    },
    {
      jobId: video.id,
      slug: 'sala-pelaires',
      publicTitle: 'Sala Pelaires',
      summary: 'Pieza corta para el anuncio de temporada.',
      year: 2024,
      sortOrder: 3,
    },
  ])

  await db.insert(deliverables).values([
    { jobId: retrato.id, kind: 'photos', description: '40 fotos editadas', quantity: 40, delivered: true },
    { jobId: trail.id, kind: 'photos', description: '150 fotos editadas', quantity: 150 },
    { jobId: video.id, kind: 'video', description: 'Montaje de 2 minutos', quantity: 1, delivered: true },
  ])

  await db.insert(timeEntries).values([
    { jobId: retrato.id, date: '2025-06-14', minutes: 120, kind: 'shoot' },
    { jobId: retrato.id, date: '2025-06-16', minutes: 240, kind: 'edit' },
    { jobId: trail.id, date: '2025-10-05', minutes: 300, kind: 'shoot' },
    { jobId: trail.id, date: '2025-10-05', minutes: 90, kind: 'travel' },
  ])

  await db.insert(leads).values([
    {
      name: 'Marta Vidal',
      email: 'marta@example.com',
      message: 'Necesito fotos para la gira de mayo, tres ciudades.',
      service: 'retrato',
    },
    {
      name: 'Pep Sastre',
      email: 'pep@example.com',
      message: 'Media maratón en marzo, ¿cubres la salida y la meta?',
      service: 'deporte',
      status: 'read',
    },
  ])
}

async function main() {
  await seed(createDatabase(requireDatabaseUrl()))
  process.stdout.write('Datos de ejemplo cargados.\n')
}

if (process.argv[1]?.endsWith('seed.ts')) {
  main().catch((error) => {
    process.stderr.write(`${String(error)}\n`)
    process.exit(1)
  })
}
