import { Footer } from '@/components/public/Footer'
import { Header } from '@/components/public/Header'
import { Motion } from '@/components/public/Motion'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <Motion />
    </>
  )
}
