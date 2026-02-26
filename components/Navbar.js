'use client'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'bg-[#020308]/90 backdrop-blur-xl border-b border-[#1A2B3C]' : ''
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-full bg-mars-red/20 animate-ping" />
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#FF4500] to-[#FF6B35] flex items-center justify-center">
              <span className="text-white text-xs font-bold font-mono">M</span>
            </div>
          </div>
          <span className="font-display font-bold text-lg tracking-wide text-white">
            MARS<span className="text-[#FF4500]">AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-xs tracking-widest text-[#8899AA] uppercase">
          <a href="#problem" className="hover:text-[#00D4FF] transition-colors">Problem</a>
          <a href="#solution" className="hover:text-[#00D4FF] transition-colors">Solution</a>
          <a href="#demo" className="hover:text-[#00D4FF] transition-colors">Live Demo</a>
          <a href="#tech" className="hover:text-[#00D4FF] transition-colors">Tech</a>
        </div>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 font-mono text-xs tracking-widest uppercase border border-[#FF4500]/40 text-[#FF4500] hover:bg-[#FF4500]/10 hover:border-[#FF4500] transition-all duration-300 rounded"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </div>
    </nav>
  )
}
