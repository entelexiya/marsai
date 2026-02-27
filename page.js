'use client'
import { useState } from 'react'
import StarsCanvas from '../components/StarsCanvas'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import ProblemSection from '../components/ProblemSection'
import SolutionSection from '../components/SolutionSection'
import MissionSelector from '../components/MissionSelector'
import DemoSection from '../components/DemoSection'
import TryItSection from '../components/TryItSection'
import TechSection from '../components/TechSection'

export default function Home() {
  const [mission, setMission] = useState('mars')

  return (
    <main className="relative min-h-screen bg-[#020308]">
      <StarsCanvas />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <ProblemSection />
        <SolutionSection />
        <MissionSelector selected={mission} onChange={setMission} />
        <DemoSection mission={mission} />
        <TryItSection mission={mission} />
        <TechSection />
      </div>
    </main>
  )
}