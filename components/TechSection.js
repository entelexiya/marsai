'use client'

const techStack = [
  { category: 'AI / ML', items: ['RandomForestClassifier', 'IsolationForest', 'LinearRegression', 'Sentence Transformer (MiniLM)'], color: '#FF4500' },
  { category: 'Backend', items: ['FastAPI (Python)', 'scikit-learn', 'sentence-transformers', 'HuggingFace Spaces'], color: '#00D4FF' },
  { category: 'Frontend', items: ['Next.js 14', 'Tailwind CSS', 'Canvas API', 'Vercel deployment'], color: '#00FF94' },
  { category: 'Data', items: ['NASA PDS Open Data', 'Perseverance telemetry', 'Synthetic 8k training set', 'Real sensor formats'], color: '#FFD700' },
]

const MISSION_NODES = {
  mars: {
    source: { icon: '🛸', label: 'Mars Rover', items: ['ZCAM / CHEMCAM / MEDA', 'SEIS / PIXL instruments', '~2GB daily generation', 'Sol 847 — Jezero Crater'], color: '#FF4500' },
    middle: { icon: '🧠', label: 'Onboard AI', color: '#00D4FF' },
    target: { icon: '🌍', label: 'Mission Control', color: '#00FF94' },
  },
  satellite: {
    source: { icon: '🛰️', label: 'LEO Satellite', items: ['SAR / Optical / Thermal', 'RADAR / Multispectral', '~50GB daily collection', '10-min contact window'], color: '#00D4FF' },
    middle: { icon: '🧠', label: 'Onboard AI', color: '#00D4FF' },
    target: { icon: '🌍', label: 'Ground Station', color: '#00FF94' },
  },
  lunar: {
    source: { icon: '🌙', label: 'Lunar Base', items: ['Drill cores / SEISM', 'RADAR / Thermal', '~500MB daily', 'South Pole — Artemis'], color: '#C8B8FF' },
    middle: { icon: '🧠', label: 'Onboard AI', color: '#00D4FF' },
    target: { icon: '🌍', label: 'Mission Control', color: '#00FF94' },
  },
  deepspace: {
    source: { icon: '🚀', label: 'Deep Space Probe', items: ['PLASMA / MAG / COSMIC', 'RADIO / PARTICLE', '~10MB daily', '20+ AU from Earth'], color: '#FFD700' },
    middle: { icon: '🧠', label: 'Onboard AI', color: '#00D4FF' },
    target: { icon: '🌍', label: 'DSN Ground Station', color: '#00FF94' },
  },
}

export default function TechSection({ mission = 'mars' }) {
  const nodes = MISSION_NODES[mission] || MISSION_NODES.mars
  const accentColor = nodes.source.color

  return (
    <>
      <section id="tech" className="relative py-32 px-6">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-12">
            <span className="font-mono text-[10px] tracking-[0.3em] text-[#FFD700] uppercase">05 / Tech Stack</span>
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

          {/* Architecture diagram — updates with mission */}
          <div className="neon-border-blue rounded-xl bg-[#050A14]/60 p-8 mb-12">
            <h3 className="font-display font-bold text-xl text-white mb-2 text-center">System Architecture</h3>
            <p className="font-mono text-[10px] text-[#445566] text-center mb-8 uppercase tracking-wider">
              {mission === 'mars' ? 'Mars Rover → Deep Space → Earth' :
               mission === 'satellite' ? 'LEO Satellite → 400km Orbit → Ground Station' :
               mission === 'lunar' ? 'Lunar Base → 1.3s delay → Mission Control' :
               'Deep Space Probe → 4h delay → DSN Earth'}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                nodes.source,
                {
                  icon: nodes.middle.icon,
                  label: nodes.middle.label,
                  items: ['decision_engine.py', 'channel_simulator.py', '4 ML models pipeline', '/tick · /analyze · /mission'],
                  color: nodes.middle.color,
                },
                {
                  icon: nodes.target.icon,
                  label: nodes.target.label,
                  items: ['Next.js dashboard', 'Real-time metrics', 'AI decision log', 'Vercel deployed'],
                  color: nodes.target.color,
                },
              ].map((node, i) => (
                <div key={i} className="relative">
                  {i < 2 && (
                    <div className="hidden md:flex absolute -right-4 top-8 z-10 items-center">
                      <div className="w-6 h-px border-t border-dashed border-[#1A2B3C]" />
                      <svg className="w-3 h-3" viewBox="0 0 12 12">
                        <path d="M2 6h8M6 2l4 4-4 4" stroke="#1A2B3C" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                      </svg>
                    </div>
                  )}
                  <div className="rounded-lg p-4 border border-[#1A2B3C] bg-[#0A1628]/60 text-center transition-all duration-500"
                    style={{ borderColor: `${node.color}20` }}>
                    <div className="text-3xl mb-2">{node.icon}</div>
                    <div className="font-display font-bold text-sm mb-3 transition-colors duration-500" style={{ color: node.color }}>
                      {node.label}
                    </div>
                    <ul className="space-y-1">
                      {node.items?.map(item => (
                        <li key={item} className="font-mono text-[10px] text-[#445566]">{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mission comparison table */}
          <div className="rounded-xl border border-[#1A2B3C] bg-[#050A14]/60 p-6">
            <h3 className="font-display font-bold text-lg text-white mb-6 text-center">Universal Architecture — Any Mission</h3>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead>
                  <tr className="border-b border-[#1A2B3C]">
                    <th className="text-left text-[#445566] pb-3 pr-4">Mission</th>
                    <th className="text-right text-[#445566] pb-3 pr-4">Delay</th>
                    <th className="text-right text-[#445566] pb-3 pr-4">Bandwidth</th>
                    <th className="text-right text-[#445566] pb-3 pr-4">Daily Data</th>
                    <th className="text-right text-[#445566] pb-3">Bottleneck</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {[
                    { mission: '🔴 Mars Rover', delay: '3–22 min', bw: '0.1–6 Mbps', data: '~2 GB', bottleneck: 'Distance', color: '#FF4500', id: 'mars' },
                    { mission: '🛰️ LEO Satellite', delay: '~20 ms', bw: '10–150 Mbps', data: '~50 GB', bottleneck: 'Contact window', color: '#00D4FF', id: 'satellite' },
                    { mission: '🌙 Lunar Base', delay: '1.3 sec', bw: '1–20 Mbps', data: '~500 MB', bottleneck: 'Bandwidth', color: '#C8B8FF', id: 'lunar' },
                    { mission: '🚀 Deep Space', delay: '1–8 hrs', bw: '0.001–0.08 Mbps', data: '~10 MB', bottleneck: 'Extreme distance', color: '#FFD700', id: 'deepspace' },
                  ].map((row) => (
                    <tr key={row.id} className="border-b border-[#0A1628] transition-all duration-300"
                      style={{ backgroundColor: mission === row.id ? `${row.color}08` : 'transparent' }}>
                      <td className="py-2.5 pr-4 font-bold" style={{ color: mission === row.id ? row.color : '#8899AA' }}>
                        {row.mission}
                      </td>
                      <td className="py-2.5 pr-4 text-right text-[#445566]">{row.delay}</td>
                      <td className="py-2.5 pr-4 text-right text-[#445566]">{row.bw}</td>
                      <td className="py-2.5 pr-4 text-right text-[#445566]">{row.data}</td>
                      <td className="py-2.5 text-right" style={{ color: mission === row.id ? row.color : '#2A3B4C' }}>{row.bottleneck}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative py-16 px-6 border-t border-[#1A2B3C]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="font-display font-bold text-2xl text-white mb-1">
                MARS<span className="text-[#FF4500]">AI</span>
              </div>
              <div className="font-mono text-xs text-[#445566]">Universal Space Data Prioritization — AEROO Space AI Competition</div>
            </div>
            <div className="font-mono text-xs text-[#445566] text-center md:text-right">
              <div>Built with ❤️ for deep space exploration</div>
              <div className="mt-1 text-[#2A3B4C]">Mars · Lunar · LEO Satellite · Deep Space</div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}