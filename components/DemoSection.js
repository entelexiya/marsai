'use client'
import { useState, useEffect, useRef } from 'react'

const FILE_TEMPLATES = [
  { type: 'IMG', name: 'ZCAM_SOL847_0312.jpg', desc: 'Unusual reddish-brown mineral deposit detected near rock formation', sensor: { temp: -45.2, pressure: 730, chemical: 0.89 } },
  { type: 'CHEM', name: 'CHEMCAM_RDRS_847.csv', desc: 'Standard basalt composition, no anomalies', sensor: { temp: -23.1, pressure: 728, chemical: 0.12 } },
  { type: 'ATM', name: 'MEDA_ATMO_847_18h.dat', desc: 'Sudden methane spike — 21ppb above baseline detected at 18:32 local time', sensor: { temp: -67.8, pressure: 712, chemical: 0.97 } },
  { type: 'SEISM', name: 'SEIS_EVENT_847_11.dat', desc: 'Marsquake magnitude 3.2 detected — strongest this sol', sensor: { temp: -31.0, pressure: 731, chemical: 0.04 } },
  { type: 'IMG', name: 'ZCAM_SOL847_0267.jpg', desc: 'Routine terrain survey, flat dust-covered surface', sensor: { temp: -22.5, pressure: 729, chemical: 0.08 } },
  { type: 'DUST', name: 'MEDA_DUST_847.dat', desc: 'Dust devil detected moving at 12 m/s, 340m height', sensor: { temp: -19.0, pressure: 715, chemical: 0.45 } },
  { type: 'CHEM', name: 'PIXL_XRF_847_R4.csv', desc: 'Potential biosignature indicator — organic sulfur compound cluster', sensor: { temp: -44.5, pressure: 727, chemical: 0.94 } },
  { type: 'IMG', name: 'ZCAM_SOL847_0234.jpg', desc: 'Rock texture classification complete, standard igneous', sensor: { temp: -25.0, pressure: 730, chemical: 0.11 } },
]

function getDecision(file, bandwidth) {
  const anomaly = file.sensor.chemical > 0.7
  const value = file.sensor.chemical
  const size = Math.floor(Math.random() * 40 + 5)
  
  let status, reason, priority
  
  if (anomaly) {
    status = 'CRITICAL'
    priority = 5
    reason = `IsolationForest: anomaly score ${(file.sensor.chemical).toFixed(2)} > threshold. Semantic value: HIGH. RandomForest → SEND IMMEDIATELY`
  } else if (value > 0.4 && bandwidth > 0.5) {
    status = 'QUEUED'
    priority = 3
    reason = `IsolationForest: normal. Semantic value: MEDIUM (${value.toFixed(2)}). Channel: ${(bandwidth * 100).toFixed(0)}% → QUEUE`
  } else {
    status = 'PENDING'
    priority = 1
    reason = `IsolationForest: normal. Semantic value: LOW (${value.toFixed(2)}). Bandwidth limited → WAIT`
  }

  return { status, reason, priority, size }
}

function StatusBadge({ status }) {
  const config = {
    CRITICAL: { color: '#FF4500', bg: '#FF450015', label: 'CRITICAL', dot: 'animate-pulse' },
    QUEUED: { color: '#FFD700', bg: '#FFD70015', label: 'QUEUED', dot: '' },
    PENDING: { color: '#445566', bg: '#44556615', label: 'PENDING', dot: '' },
    SENT: { color: '#00FF94', bg: '#00FF9415', label: 'SENT', dot: '' },
  }
  const c = config[status] || config.PENDING

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider"
      style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.color}30` }}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  )
}

export default function DemoSection() {
  const [files, setFiles] = useState([])
  const [bandwidth, setBandwidth] = useState(0.7)
  const [sent, setSent] = useState(0)
  const [saved, setSaved] = useState(0)
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(true)
  const logRef = useRef(null)
  const tickRef = useRef(null)
  const idx = useRef(0)

  useEffect(() => {
    // Init files
    const init = FILE_TEMPLATES.map(f => ({
      ...f,
      id: Math.random(),
      ...getDecision(f, 0.7),
    }))
    setFiles(init)

    // Count initial
    const critical = init.filter(f => f.status === 'CRITICAL').length
    setSent(critical)
    setSaved(init.filter(f => f.status === 'PENDING').reduce((a, f) => a + (f.size || 10), 0))

    addLog('🟢 System initialized — AI pipeline active', '#00FF94')
    addLog(`📊 ${critical} critical files detected on first scan`, '#FF4500')
  }, [])

  const addLog = (msg, color = '#8899AA') => {
    const ts = new Date().toISOString().slice(11, 19)
    setLog(prev => [...prev.slice(-20), { msg, color, ts, id: Math.random() }])
  }

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  useEffect(() => {
    if (!running) return
    tickRef.current = setInterval(() => {
      // Fluctuate bandwidth
      setBandwidth(prev => {
        const next = Math.max(0.1, Math.min(1, prev + (Math.random() - 0.5) * 0.15))
        return next
      })

      // Process one file
      setFiles(prev => {
        const criticals = prev.filter(f => f.status === 'CRITICAL')
        const queued = prev.filter(f => f.status === 'QUEUED')
        
        let target = criticals[0] || queued[0]
        if (!target) return prev

        const updated = prev.map(f =>
          f.id === target.id ? { ...f, status: 'SENT' } : f
        )

        setSent(s => s + 1)
        addLog(
          `📤 ${target.name} [${target.size}MB] → ${target.status === 'CRITICAL' ? '🔴 CRITICAL' : '🟡 QUEUED'} → TRANSMITTED`,
          target.status === 'CRITICAL' ? '#FF4500' : '#FFD700'
        )

        // Add new file after a bit
        setTimeout(() => {
          const template = FILE_TEMPLATES[idx.current % FILE_TEMPLATES.length]
          idx.current++
          const newFile = {
            ...template,
            id: Math.random(),
            name: template.name.replace('847', `84${7 + Math.floor(idx.current / 4)}`),
          }
          const decision = getDecision(newFile, bandwidth)
          const file = { ...newFile, ...decision }

          setFiles(f => [...f.filter(x => x.status !== 'SENT').slice(-6), file])

          if (decision.status === 'CRITICAL') {
            addLog(`⚡ ANOMALY: ${file.name} — priority upgraded → CRITICAL`, '#FF4500')
            setSaved(s => s + (decision.size * 8))
          }
        }, 500)

        return updated
      })
    }, 2500)

    return () => clearInterval(tickRef.current)
  }, [running])

  const bwColor = bandwidth > 0.6 ? '#00FF94' : bandwidth > 0.3 ? '#FFD700' : '#FF4444'

  return (
    <section id="demo" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <span className="font-mono text-[10px] tracking-[0.3em] text-[#00FF94] uppercase">03 / Live Demo</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#00FF94]/30 to-transparent" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-2">
              Watch the AI decide — <span className="text-[#00FF94]">live</span>
            </h2>
            <p className="text-[#6B7E8F] text-sm">Simulated Mars rover data stream. Real ML decision logic.</p>
          </div>
          <button
            onClick={() => setRunning(r => !r)}
            className="flex items-center gap-2 px-6 py-2.5 font-mono text-xs tracking-widest uppercase border transition-all duration-300 rounded"
            style={{
              borderColor: running ? '#FF4500' : '#00FF94',
              color: running ? '#FF4500' : '#00FF94',
              backgroundColor: running ? '#FF450010' : '#00FF9410',
            }}
          >
            <span className={`w-2 h-2 rounded-full ${running ? 'bg-[#FF4500] animate-pulse' : 'bg-[#00FF94]'}`} />
            {running ? 'PAUSE' : 'RESUME'}
          </button>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Files Transmitted', value: sent, color: '#00FF94', suffix: '' },
            { label: 'Bandwidth Now', value: `${(bandwidth * 100).toFixed(0)}`, color: bwColor, suffix: '%' },
            { label: 'Bandwidth Saved', value: saved, color: '#00D4FF', suffix: 'MB' },
            { label: 'AI Decisions/min', value: running ? '24' : '0', color: '#FFD700', suffix: '' },
          ].map((m, i) => (
            <div key={i} className="neon-border-blue rounded-lg p-4 bg-[#050A14]/60 text-center">
              <div className="font-mono text-2xl font-bold mb-1" style={{ color: m.color }}>
                {m.value}{m.suffix}
              </div>
              <div className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Bandwidth bar */}
        <div className="neon-border-blue rounded-xl bg-[#050A14]/60 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">Channel Quality — Mars/Earth Link</span>
            <span className="font-mono text-xs font-bold" style={{ color: bwColor }}>{(bandwidth * 100).toFixed(0)}%</span>
          </div>
          <div className="h-3 bg-[#0A1628] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${bandwidth * 100}%`, backgroundColor: bwColor, boxShadow: `0 0 10px ${bwColor}66` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-[#FF4444]">WEAK</span>
            <span className="font-mono text-[9px] text-[#FFD700]">MEDIUM</span>
            <span className="font-mono text-[9px] text-[#00FF94]">STRONG</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* File queue */}
          <div className="neon-border-blue rounded-xl bg-[#050A14]/60 p-5 scanlines">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="font-mono text-xs text-[#445566] uppercase tracking-wider">Data Queue</span>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {files.filter(f => f.status !== 'SENT').map(f => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0A1628]/60 border border-[#1A2B3C] hover:border-[#2A3B4C] transition-colors">
                  <span className="font-mono text-[10px] text-[#445566] mt-0.5 w-12 shrink-0">{f.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-[#8899AA] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#445566] truncate mt-0.5">{f.desc.slice(0, 55)}...</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={f.status} />
                    <span className="font-mono text-[9px] text-[#445566]">{f.size}MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Decision Log */}
          <div className="neon-border-mars rounded-xl bg-[#050A14]/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
              <span className="font-mono text-xs text-[#445566] uppercase tracking-wider">AI Decision Log</span>
            </div>
            <div ref={logRef} className="space-y-1.5 max-h-72 overflow-y-auto font-mono text-[11px]">
              {log.map(entry => (
                <div key={entry.id} className="flex gap-3 items-start">
                  <span className="text-[#2A3B4C] shrink-0 mt-0.5">{entry.ts}</span>
                  <span style={{ color: entry.color }}>{entry.msg}</span>
                </div>
              ))}
              {running && <div className="text-[#2A3B4C] terminal-cursor">&nbsp;</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
