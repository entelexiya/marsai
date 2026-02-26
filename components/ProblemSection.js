'use client'
import { useEffect, useRef, useState } from 'react'

function AnimatedBar({ label, value, max, color, delay = 0 }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setWidth((value / max) * 100), delay)
    return () => clearTimeout(timer)
  }, [value, max, delay])

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-xs text-[#6B7E8F] uppercase tracking-wider">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{value} MB</span>
      </div>
      <div className="h-2 bg-[#0A1628] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
        />
      </div>
    </div>
  )
}

export default function ProblemSection() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.2 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="problem" ref={ref} className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#FF4500] uppercase">01 / Problem</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#FF4500]/30 to-transparent" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-6 leading-tight">
              The bandwidth{' '}
              <span className="text-[#FF4500]">bottleneck</span>{' '}
              of deep space
            </h2>
            <p className="text-[#6B7E8F] text-base leading-relaxed mb-8">
              Perseverance collects up to 2GB of scientific data daily —
              images, chemical readings, atmospheric data, seismic signals.
              But the Mars-Earth link can carry only a fraction of that.
            </p>
            <p className="text-[#6B7E8F] text-base leading-relaxed mb-8">
              Traditional systems transmit data sequentially.
              <span className="text-[#FF8C42]"> A boring rock photo might reach Earth before a critical chemical anomaly.</span>{' '}
              Scientists back on Earth have no control for up to 22 minutes.
            </p>
            <div className="neon-border-mars rounded-lg p-4 bg-[#FF4500]/5">
              <p className="font-mono text-sm text-[#FF8C42]">
                ⚠ Without prioritization, 90% of transmission bandwidth is wasted on low-value data
              </p>
            </div>
          </div>

          {/* Data visualization */}
          <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="neon-border-blue rounded-xl bg-[#050A14]/80 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-[#FF4444] animate-pulse" />
                <span className="font-mono text-xs text-[#445566] uppercase tracking-wider">Daily Data Budget</span>
              </div>

              {visible && (
                <>
                  <AnimatedBar label="Total Collected" value={2048} max={2048} color="#FF4500" delay={200} />
                  <AnimatedBar label="Can Transmit" value={200} max={2048} color="#00D4FF" delay={500} />
                  <AnimatedBar label="Critical Data" value={85} max={2048} color="#00FF94" delay={800} />
                </>
              )}

              <div className="mt-6 pt-6 border-t border-[#1A2B3C]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-[#FF4500]/5 border border-[#FF4500]/10">
                    <div className="font-mono text-xl font-bold text-[#FF4500]">10x</div>
                    <div className="font-mono text-[10px] text-[#445566] uppercase mt-1">More data than bandwidth</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#00D4FF]/5 border border-[#00D4FF]/10">
                    <div className="font-mono text-xl font-bold text-[#00D4FF]">22 min</div>
                    <div className="font-mono text-[10px] text-[#445566] uppercase mt-1">Max signal delay</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
