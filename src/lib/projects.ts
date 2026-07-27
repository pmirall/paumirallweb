/**
 * Los proyectos destacados de la portada. En la fase 3 esto pasa a ser una
 * consulta a job_publications; la forma del dato ya es la definitiva para que
 * el cambio no toque los componentes.
 */
export type Project = {
  slug: string
  title: string
  category: 'Artista' | 'Deporte' | 'Vídeo'
  year: number
  coverSrc?: string
  coverAlt?: string
  ratio: string
}

export const featuredProjects: Project[] = [
  { slug: 'julia-ferrer', title: 'Júlia Ferrer', category: 'Artista', year: 2025, ratio: '4 / 5' },
  {
    slug: 'trail-serra-de-tramuntana',
    title: 'Trail Serra de Tramuntana',
    category: 'Deporte',
    year: 2025,
    ratio: '3 / 2',
  },
  { slug: 'sala-pelaires', title: 'Sala Pelaires', category: 'Vídeo', year: 2024, ratio: '4 / 5' },
]
