import { About } from '@/components/public/About'
import { Contact } from '@/components/public/Contact'
import { Hero } from '@/components/public/Hero'
import { Services } from '@/components/public/Services'
import { Strip } from '@/components/public/Strip'
import { Work } from '@/components/public/Work'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Strip />
      <Work />
      <Services />
      <About />
      <Contact />
    </>
  )
}
