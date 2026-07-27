export default async function GalleryGatePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <main>Puerta de la galería {token}. Se construye en la fase 4.</main>
}
