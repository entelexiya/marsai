'use client'
import { useState, useEffect, useRef } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://entelexiya-marsai-backend.hf.space'

function StatusBadge({ status }) {
  const config = {
    critical: { color: '#FF4500', bg: '#FF450015', label: 'CRITICAL', dot: 'animate-pulse' },
    sending:  { color: '#FF6B35', bg: '#FF6B3515', label: 'SENDING',  dot: 'animate-pulse' },
    queued:   { color: '#FFD700', bg: '#FFD70015', label: 'QUEUED',   dot: '' },
    pending:  { color: '#445566', bg: '#44556615', label: 'PENDING',  dot: '' },
    sent:     { color: '#00FF94', bg: '#00FF9415', label: 'SENT',     dot: '' },
  }
  const c = config[status] || config.pending
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider"
      style={{ color: c.color, backgroundColor: c.bg, border: `1px solid ${c.color}30` }}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} style={{ backgroundColor: c.color }} />
      {c.label}
    </span>
  )
}

export default function DemoSection() {
  const [queue, setQueue] = useState([])
  const [channel, setChannel] = useState({ bandwidth_mbps: 2, packet_loss_percent: 2, mode: 'strong', mars_delay_minutes: 13 })
  const [stats, setStats] = useState({ files_sent: 0, total_transmitted_mb: 0, anomalies_detected: 0 })
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(true)
  const [loading, setLoading] = useState(true)
  const [predictedBw, setPredictedBw] = useState(2)
  const logRef = useRef(null)
  const tickRef = useRef(null)

  const addLog = (msg, color = '#8899AA') => {
    const ts = new Date().toISOString().slice(11, 19)
    setLog(prev => [...prev.slice(-30), { msg, color, ts, id: Math.random() }])
  }

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(r => r.json())
      .then(data => {
        setChannel(data.channel)
        setStats(data.stats)
        setLoading(false)
        addLog('🟢 Connected to MarsAI backend', '#00FF94')
        addLog(`📊 Models ready: ${data.models_ready ? 'YES' : 'Loading...'}`, data.models_ready ? '#00FF94' : '#FFD700')
      })
      .catch(() => {
        setLoading(false)
        addLog('⚠️ Backend offline — check HF Space', '#FF4444')
      })

    fetch(`${API_URL}/files`)
      .then(r => r.json())
      .then(data => setQueue(data.queue || []))
  }, [])

  useEffect(() => {
    if (!running) return
    tickRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/tick`, { method: 'POST' })
        const data = await res.json()
        if (data.status === 'loading') { addLog('⏳ AI models loading...', '#FFD700'); return }
        setChannel(data.channel)
        setStats(data.stats)
        setQueue(data.queue || [])
        setPredictedBw(data.predicted_bandwidth || data.channel.bandwidth_mbps)
        const newlySent = data.sent_this_tick || []
        newlySent.forEach(f => {
          const isCritical = f.status === 'critical' || f.is_anomaly
          addLog(`📤 ${f.name} [${f.size_mb}MB] → ${isCritical ? '🔴 CRITICAL' : '🟡 QUEUED'} → TRANSMITTED`, isCritical ? '#FF4500' : '#FFD700')
          if (f.is_anomaly) addLog(`⚡ ANOMALY: ${f.decision_reason?.split('|')[0] || ''}`, '#FF4500')
        })
        if (data.channel.mode === 'weak') addLog(`📡 Channel WEAK: ${data.channel.bandwidth_mbps.toFixed(2)} Mbps`, '#FF4444')
      } catch (e) {
        addLog('⚠️ Tick failed — retrying...', '#FF4444')
      }
    }, 3000)
    return () => clearInterval(tickRef.current)
  }, [running])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  const handleReset = async () => {
    await fetch(`${API_URL}/reset`, { method: 'POST' })
    setLog([])
    setQueue([])
    addLog('🔄 Simulation reset', '#00D4FF')
  }

  const bwColor = channel.bandwidth_mbps >= 1.5 ? '#00FF94' : channel.bandwidth_mbps >= 0.6 ? '#FFD700' : '#FF4444'
  const bwPct = Math.min(100, (channel.bandwidth_mbps / 6) * 100)

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
              Real AI decisions — <span className="text-[#00FF94]">live</span>
            </h2>
            <p className="text-[#6B7E8F] text-sm">Connected to real ML backend · IsolationForest + Sentence Transformer + RandomForest</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRunning(r => !r)}
              className="flex items-center gap-2 px-6 py-2.5 font-mono text-xs tracking-widest uppercase border transition-all duration-300 rounded"
              style={{ borderColor: running ? '#FF4500' : '#00FF94', color: running ? '#FF4500' : '#00FF94', backgroundColor: running ? '#FF450010' : '#00FF9410' }}>
              <span className={`w-2 h-2 rounded-full ${running ? 'bg-[#FF4500] animate-pulse' : 'bg-[#00FF94]'}`} />
              {running ? 'PAUSE' : 'RESUME'}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2.5 font-mono text-xs tracking-widest uppercase border border-[#1A2B3C] text-[#445566] hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition-all rounded">
              RESET
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Files Transmitted', value: stats.files_sent, color: '#00FF94', suffix: '' },
            { label: 'Bandwidth Now', value: channel.bandwidth_mbps?.toFixed(2), color: bwColor, suffix: ' Mbps' },
            { label: 'Data Transmitted', value: stats.total_transmitted_mb?.toFixed(0), color: '#00D4FF', suffix: ' MB' },
            { label: 'Anomalies Found', value: stats.anomalies_detected, color: '#FF4500', suffix: '' },
          ].map((m, i) => (
            <div key={i} className="neon-border-blue rounded-lg p-4 bg-[#050A14]/60 text-center">
              <div className="font-mono text-2xl font-bold mb-1" style={{ color: m.color }}>
                {loading ? '...' : m.value}{m.suffix}
              </div>
              <div className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">{m.label}</div>
            </div>
          ))}
        </div>

        <div className="neon-border-blue rounded-xl bg-[#050A14]/60 p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">
              Channel Quality · Delay: {channel.mars_delay_minutes?.toFixed(1)} min · Loss: {channel.packet_loss_percent?.toFixed(1)}%
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#445566]">
                Predicted: <span style={{ color: predictedBw < channel.bandwidth_mbps * 0.7 ? '#FF4444' : '#00FF94' }}>{predictedBw?.toFixed(2)} Mbps</span>
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: bwColor }}>{channel.bandwidth_mbps?.toFixed(2)} Mbps</span>
            </div>
          </div>
          <div className="h-3 bg-[#0A1628] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${bwPct}%`, backgroundColor: bwColor, boxShadow: `0 0 10px ${bwColor}66` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-[#FF4444]">WEAK 0.1</span>
            <span className="font-mono text-[9px] text-[#FFD700]">MEDIUM 1.5</span>
            <span className="font-mono text-[9px] text-[#00FF94]">STRONG 6.0</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="neon-border-blue rounded-xl bg-[#050A14]/60 p-5 scanlines">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#00D4FF] animate-pulse" />
              <span className="font-mono text-xs text-[#445566] uppercase tracking-wider">Data Queue ({queue.length} files)</span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {queue.length === 0 && <div className="text-center py-8 font-mono text-xs text-[#2A3B4C]">Queue empty...</div>}
              {queue.map(f => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0A1628]/60 border border-[#1A2B3C]">
                  <span className="font-mono text-[10px] text-[#445566] mt-0.5 w-12 shrink-0">{f.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-[#8899AA] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#445566] truncate mt-0.5">{f.description?.slice(0, 55)}...</div>
                    {f.semantic_score !== undefined && (
                      <div className="flex gap-3 mt-1">
                        <span className="font-mono text-[9px] text-[#2A3B4C]">sem: <span className="text-[#00D4FF]">{f.semantic_score?.toFixed(2)}</span></span>
                        <span className="font-mono text-[9px] text-[#2A3B4C]">anom: <span className={f.is_anomaly ? 'text-[#FF4500]' : 'text-[#445566]'}>{f.is_anomaly ? 'YES' : 'no'}</span></span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <StatusBadge status={f.status} />
                    <span className="font-mono text-[9px] text-[#445566]">{f.size_mb}MB</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="neon-border-mars rounded-xl bg-[#050A14]/60 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" />
              <span className="font-mono text-xs text-[#445566] uppercase tracking-wider">AI Decision Log</span>
            </div>
            <div ref={logRef} className="space-y-1.5 max-h-80 overflow-y-auto font-mono text-[11px]">
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