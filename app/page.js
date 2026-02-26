import StarsCanvas from '../components/StarsCanvas'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProblemSection from '../components/ProblemSection'
import SolutionSection from '../components/SolutionSection'
import DemoSection from '../components/DemoSection'
import TechSection from '../components/TechSection'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#020308]">
      <StarsCanvas />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <DemoSection />
        <TechSection />
      </div>
    </main>
  )
}
