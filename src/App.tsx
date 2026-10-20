import About from './components/About'
import Achievements from './components/Achievements'
import { Contact, Footer } from './components/Contact'
import Experience from './components/Experience'
import Header from './components/Header'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Publications from './components/Publications'
import Skills from './components/Skills'
import Spine from './components/Spine'
import { useSmoothScroll } from './lib/motion'

export default function App() {
  useSmoothScroll()
  return (
    <>
      <a href="#about" className="mono sr-only z-[60] bg-ink px-4 py-3 text-void focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Skip to content
      </a>
      <Header />
      <Spine />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Publications />
        <Achievements />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
