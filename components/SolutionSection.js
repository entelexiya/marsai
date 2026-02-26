'use client'
import { useEffect, useRef, useState } from 'react'

const models = [
  {
    step: '01',
    name: 'IsolationForest',
    type: 'sklearn',
    role: 'Anomaly Detection',
    desc: 'Analyzes raw sensor readings — temperature, pressure, chemical composition. Detects statistical outliers that signal unusual scientific findings. Auto-upgrades priority to CRITICAL.',
    color: '#FF4500',
    icon: '⚡',
  },
  {
    step: '02',
    name: 'Sentence Transformer',
    type: 'all-MiniLM-L6-v2',
    role: 'Semantic Value Analysis',
    desc: 'Reads textual descriptions of data files. Compares semantic similarity to known high-value scientific discoveries. Assigns a scientific value score 0–1.',
    color: '#00D4FF',
    icon: '🧠',
  },
  {
    step: '03',
    name: 'LinearRegression',
    type: 'sklearn',
    role: 'Channel Prediction',
    desc: 'Tracks the last 10 signal quality readings and predicts upcoming channel degradation. If bandwidth will drop — flushes critical queue immediately.',
    color: '#FFD700',
    icon: '📡',
  },
  {
    step: '04',
    name: 'RandomForest',
    type: 'sklearn — 8k samples',
    role: 'Final Decision Engine',
    desc: 'Combines all signals: anomaly score, semantic value, predicted channel state, file size, and current bandwidth. Makes the final send/queue/drop decision.',
    color: '#00FF94',
    icon: '🎯',
  },
]

export default function SolutionSection() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState(null)

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="solution" ref={ref} className="relative py-32 px-6">
      {/* Grid bg */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#00D4FF] uppercase">02 / Solution</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#00D4FF]/30 to-transparent" />
        </div>

        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-4 leading-tight">
            A scientist{' '}
            <span className="text-[#00D4FF]">onboard</span>
          </h2>
          <p className="text-[#6B7E8F] text-lg max-w-2xl mx-auto">
            Four ML models work in a cascading pipeline — each adds a layer of intelligence before the final transmission decision.
          </p>
        </div>

        {/* Pipeline */}
        <div className="grid md:grid-cols-4 gap-4">
          {models.map((m, i) => (
            <div
              key={m.step}
              className={`relative cursor-pointer rounded-xl p-5 border transition-all duration-500 hover-lift ${
                active === i
                  ? 'border-opacity-100 bg-[#0A1628]'
                  : 'border-[#1A2B3C] bg-[#050A14]/60 hover:border-opacity-60'
              } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{
                borderColor: active === i ? m.color : undefined,
                boxShadow: active === i ? `0 0 20px ${m.color}22` : undefined,
                transitionDelay: `${i * 100}ms`,
              }}
              onClick={() => setActive(active === i ? null : i)}
            >
              {/* Connector arrow */}
              {i < models.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <svg width="16" height="16" viewBox="0 0 16 16">
                    <path d="M4 8h8M8 4l4 4-4 4" stroke="#1A2B3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                  </svg>
                </div>
              )}

              <div className="text-2xl mb-3">{m.icon}</div>
              <div className="font-mono text-[10px] tracking-widest uppercase mb-2" style={{ color: m.color }}>
                Step {m.step}
              </div>
              <div className="font-display font-bold text-white text-sm mb-1">{m.name}</div>
              <div className="font-mono text-[10px] text-[#445566] mb-3">{m.type}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded text-center"
                style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}30` }}>
                {m.role}
              </div>

              {active === i && (
                <div className="mt-4 pt-4 border-t border-[#1A2B3C]">
                  <p className="text-[#8899AA] text-xs leading-relaxed">{m.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-center font-mono text-xs text-[#445566] mt-6">
          Click any model to learn more
        </p>

        {/* How it works flow */}
        <div className="mt-20 neon-border-blue rounded-xl bg-[#050A14]/60 p-8">
          <h3 className="font-display font-bold text-xl text-white mb-8 text-center">
            Pipeline in action
          </h3>
          <div className="grid md:grid-cols-6 gap-2 items-center text-center">
            {[
              { label: 'Rover collects data', icon: '🛸', color: '#8899AA' },
              { label: '→', icon: null, color: '#1A2B3C' },
              { label: 'Anomaly scan', icon: '⚡', color: '#FF4500' },
              { label: 'Semantic analysis', icon: '🧠', color: '#00D4FF' },
              { label: 'Channel forecast', icon: '📡', color: '#FFD700' },
              { label: 'Final decision', icon: '🎯', color: '#00FF94' },
            ].map((item, i) => item.icon ? (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="text-2xl">{item.icon}</div>
                <div className="font-mono text-[10px] text-center leading-tight" style={{ color: item.color }}>
                  {item.label}
                </div>
              </div>
            ) : (
              <div key={i} className="text-[#1A2B3C] text-xl hidden md:block">→</div>
            ))}
          </div>
          <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#00FF94]" />
              <span className="font-mono text-xs text-[#6B7E8F]">SEND NOW</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#FFD700]" />
              <span className="font-mono text-xs text-[#6B7E8F]">QUEUE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#FF4444]" />
              <span className="font-mono text-xs text-[#6B7E8F]">DROP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
