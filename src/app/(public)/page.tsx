import { About } from '@/components/public/About'
import { Contact } from '@/components/public/Contact'
import { Footer } from '@/components/public/Footer'
import { Header } from '@/components/public/Header'
import { Hero } from '@/components/public/Hero'
import { Motion } from '@/components/public/Motion'
import { Services } from '@/components/public/Services'
import { Strip } from '@/components/public/Strip'
import { Work } from '@/components/public/Work'

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Strip />
        <Work />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
      <Motion />
    </>
  )
}
