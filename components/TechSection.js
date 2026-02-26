'use client'

const techStack = [
  { category: 'AI / ML', items: ['RandomForestClassifier', 'IsolationForest', 'LinearRegression', 'Sentence Transformer (MiniLM)'], color: '#FF4500' },
  { category: 'Backend', items: ['FastAPI (Python)', 'scikit-learn', 'sentence-transformers', 'Railway deployment'], color: '#00D4FF' },
  { category: 'Frontend', items: ['Next.js 14', 'Tailwind CSS', 'Canvas API', 'Vercel deployment'], color: '#00FF94' },
  { category: 'Data', items: ['NASA PDS Open Data', 'Perseverance telemetry', 'Synthetic 8k training set', 'Real sensor formats'], color: '#FFD700' },
]

export default function TechSection() {
  return (
    <>
      <section id="tech" className="relative py-32 px-6">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#FFD700] uppercase">04 / Tech Stack</span>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FFD700]/30 to-transparent" />
          </div>

          <h2 className="font-display font-bold text-4xl md:text-5xl text-white mb-12 leading-tight">
            Built for <span className="text-[#FFD700]">real space</span> constraints
          </h2>

          <div className="grid md:grid-cols-4 gap-4 mb-20">
            {techStack.map((cat) => (
              <div key={cat.category} className="rounded-xl border border-[#1A2B3C] bg-[#050A14]/60 p-5 hover-lift">
                <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: cat.color }}>
                  {cat.category}
                </div>
                <ul className="space-y-2">
                  {cat.items.map(item => (
                    <li key={item} className="flex items-center gap-2 font-mono text-xs text-[#8899AA]">
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Architecture diagram */}
          <div className="neon-border-blue rounded-xl bg-[#050A14]/60 p-8">
            <h3 className="font-display font-bold text-xl text-white mb-8 text-center">System Architecture</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  label: 'Mars Rover',
                  icon: '🛸',
                  items: ['satellite_files.py', 'Sensor data collection', '~2GB daily generation'],
                  color: '#FF4500',
                },
                {
                  label: 'Onboard AI (FastAPI)',
                  icon: '🧠',
                  items: ['decision_engine.py', 'channel_simulator.py', '4 ML models pipeline', '/tick endpoint'],
                  color: '#00D4FF',
                },
                {
                  label: 'Mission Control (Earth)',
                  icon: '🌍',
                  items: ['Next.js dashboard', 'Real-time metrics', 'AI decision log', 'Vercel deployed'],
                  color: '#00FF94',
                },
              ].map((node, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-4 top-8 z-10 items-center">
                      <div className="w-8 h-px border-t border-dashed border-[#1A2B3C]" />
                      <svg className="w-3 h-3" viewBox="0 0 12 12">
                        <path d="M2 6h8M6 2l4 4-4 4" stroke="#1A2B3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                  <div className="rounded-lg p-4 border border-[#1A2B3C] bg-[#0A1628]/60 text-center">
                    <div className="text-3xl mb-2">{node.icon}</div>
                    <div className="font-display font-bold text-sm mb-3" style={{ color: node.color }}>{node.label}</div>
                    <ul className="space-y-1">
                      {node.items.map(item => (
                        <li key={item} className="font-mono text-[10px] text-[#445566]">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-6 border-t border-[#1A2B3C]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display font-bold text-2xl text-white mb-1">
                MARS<span className="text-[#FF4500]">AI</span>
              </div>
              <div className="font-mono text-xs text-[#445566]">Onboard Science Selection — AEROO Space AI Competition</div>
            </div>
            <div className="font-mono text-xs text-[#445566] text-center md:text-right">
              <div>Built with ❤️ for deep space exploration</div>
              <div className="mt-1 text-[#2A3B4C]">Concept aligned with NASA onboard autonomy research</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
