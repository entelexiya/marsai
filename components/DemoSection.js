'use client'
import { useState, useEffect, useRef } from 'react'
import { MISSIONS } from './MissionSelector'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://entelexiya-marsai-backend.hf.space'

function StatusBadge({ status }) {
  const col = status === 'critical' ? '#FF4500' : status === 'sent' ? '#00FF94' : status === 'queued' ? '#FFD700' : status === 'sending' ? '#FF6B35' : '#445566'
  const label = status?.toUpperCase() || 'PENDING'
  const pulse = ['critical', 'sending'].includes(status)
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-wider"
      style={{ color: col, backgroundColor: `${col}15`, border: `1px solid ${col}30` }}>
      <span className={`w-1.5 h-1.5 rounded-full ${pulse ? 'animate-pulse' : ''}`} style={{ backgroundColor: col }} />
      {label}
    </span>
  )
}

export default function DemoSection({ mission = 'mars' }) {
  const m = MISSIONS[mission]
  const [queue, setQueue] = useState([])
  const [channel, setChannel] = useState({ bandwidth_mbps: m.stats.bandwidth, packet_loss_percent: 2, mars_delay_minutes: m.stats.delay })
  const [stats, setStats] = useState({ files_sent: 0, total_transmitted_mb: 0, anomalies_detected: 0 })
  const [log, setLog] = useState([])
  const [running, setRunning] = useState(true)
  const [loading, setLoading] = useState(true)
  const [predictedBw, setPredictedBw] = useState(m.stats.bandwidth)
  const logRef = useRef(null)
  const tickRef = useRef(null)
  const prevMission = useRef(mission)

  const addLog = (msg, color = '#8899AA') => {
    const ts = new Date().toISOString().slice(11, 19)
    setLog(prev => [...prev.slice(-40), { msg, color, ts, id: Math.random() }])
  }

  useEffect(() => {
    fetch(`${API_URL}/status`)
      .then(r => r.json())
      .then(data => {
        setChannel(data.channel)
        setStats(data.stats)
        setLoading(false)
        addLog(`🟢 Connected — ${m.name}`, m.color)
      })
      .catch(() => { setLoading(false); addLog('⚠️ Backend offline', '#FF4444') })

    fetch(`${API_URL}/files`)
      .then(r => r.json())
      .then(data => setQueue(data.queue || []))
  }, [])

  // Switch mission on backend when mission changes
  useEffect(() => {
    if (prevMission.current !== mission) {
      prevMission.current = mission
      setLog([])
      setQueue([])
      addLog(`🚀 Switching to ${m.name}...`, m.color)

      fetch(`${API_URL}/mission`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mission }),
      })
        .then(r => r.json())
        .then(data => {
          setChannel(data.channel)
          setQueue([])
          addLog(`✅ Mission active: ${m.name}`, m.color)
          addLog(`📡 Delay: ${m.delayRange} · BW: ${m.bandwidthRange}`, m.color)
        })
        .catch(() => addLog('⚠️ Mission switch failed', '#FF4444'))
    }
  }, [mission])

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
          addLog(`📤 ${f.name} [${f.size_mb}MB] → ${isCritical ? '🔴 CRITICAL' : '🟡'} TRANSMITTED`, isCritical ? '#FF4500' : '#FFD700')
          if (f.is_anomaly) addLog(`⚡ ANOMALY: ${f.decision_reason?.split('|')[0] || ''}`, '#FF4500')
        })

        if (data.channel.mode === 'weak') {
          addLog(`📡 Channel WEAK: ${data.channel.bandwidth_mbps.toFixed(4)} Mbps — flush critical!`, '#FF4444')
        }
        if (data.channel.contact_time_remaining !== null && data.channel.contact_time_remaining < 60) {
          addLog(`⏰ Contact window closing in ${data.channel.contact_time_remaining}s — transmitting!`, '#FFD700')
        }
      } catch (e) {
        addLog('⚠️ Tick failed — retrying...', '#FF4444')
      }
    }, 3000)
    return () => clearInterval(tickRef.current)
  }, [running, mission])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [log])

  const handleReset = async () => {
    await fetch(`${API_URL}/reset`, { method: 'POST' })
    setLog([])
    setQueue([])
    addLog('🔄 Simulation reset', m.color)
  }

  const bwMax = m.stats.bandwidth * 3
  const bwColor = channel.bandwidth_mbps >= bwMax * 0.5 ? '#00FF94' : channel.bandwidth_mbps >= bwMax * 0.2 ? '#FFD700' : '#FF4444'
  const bwPct = Math.min(100, (channel.bandwidth_mbps / (bwMax || 1)) * 100)

  // Format delay based on mission
  const formatDelay = (mins) => {
    if (mission === 'satellite') return `${(mins * 60).toFixed(0)}ms`
    if (mission === 'deepspace') return `${mins.toFixed(1)}h`
    return `${mins.toFixed(1)} min`
  }

  return (
    <section id="demo" className="relative py-16 px-6">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${m.glowColor} 0%, transparent 60%)` }} />

      <div className="relative max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: m.color }}>
            Live Simulation — {m.name}
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${m.color}40, transparent)` }} />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-1">
              {m.emoji} Real AI decisions — <span style={{ color: m.color }}>live</span>
            </h2>
            <p className="text-[#6B7E8F] text-sm">{m.description} · 4 ML models in pipeline</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setRunning(r => !r)}
              className="flex items-center gap-2 px-6 py-2.5 font-mono text-xs tracking-widest uppercase border transition-all duration-300 rounded"
              style={{ borderColor: running ? '#FF4500' : m.color, color: running ? '#FF4500' : m.color, backgroundColor: running ? '#FF450010' : `${m.color}10` }}>
              <span className={`w-2 h-2 rounded-full ${running ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: running ? '#FF4500' : m.color }} />
              {running ? 'PAUSE' : 'RESUME'}
            </button>
            <button onClick={handleReset}
              className="px-4 py-2.5 font-mono text-xs tracking-widest uppercase border border-[#1A2B3C] text-[#445566] hover:text-white transition-all rounded">
              RESET
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Files Transmitted', value: stats.files_sent, color: m.color, suffix: '' },
            { label: 'Bandwidth Now', value: channel.bandwidth_mbps?.toFixed(mission === 'deepspace' ? 4 : 2), color: bwColor, suffix: ' Mbps' },
            { label: 'Data Transmitted', value: stats.total_transmitted_mb?.toFixed(0), color: '#00D4FF', suffix: ' MB' },
            { label: 'Anomalies Found', value: stats.anomalies_detected, color: '#FF4500', suffix: '' },
          ].map((metric, i) => (
            <div key={i} className="rounded-lg p-4 border bg-[#050A14]/60 text-center"
              style={{ borderColor: `${m.color}15` }}>
              <div className="font-mono text-2xl font-bold mb-1" style={{ color: metric.color }}>
                {loading ? '...' : metric.value}{metric.suffix}
              </div>
              <div className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Channel bar */}
        <div className="rounded-xl p-4 mb-5 border bg-[#050A14]/60" style={{ borderColor: `${m.color}20` }}>
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">
              {m.name} Link · Delay: {formatDelay(channel.mars_delay_minutes)} · Loss: {channel.packet_loss_percent?.toFixed(1)}%
              {channel.contact_time_remaining !== null && channel.contact_time_remaining !== undefined &&
                ` · Window: ${channel.contact_time_remaining}s`}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-[#445566]">
                Predicted: <span style={{ color: predictedBw < channel.bandwidth_mbps * 0.7 ? '#FF4444' : '#00FF94' }}>
                  {predictedBw?.toFixed(mission === 'deepspace' ? 4 : 2)} Mbps
                </span>
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: bwColor }}>
                {channel.bandwidth_mbps?.toFixed(mission === 'deepspace' ? 4 : 2)} Mbps
              </span>
            </div>
          </div>
          <div className="h-3 bg-[#0A1628] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${bwPct}%`, backgroundColor: bwColor, boxShadow: `0 0 10px ${bwColor}66` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[9px] text-[#FF4444]">WEAK</span>
            <span className="font-mono text-[9px]" style={{ color: m.color }}>{m.bandwidthRange}</span>
            <span className="font-mono text-[9px] text-[#00FF94]">STRONG</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Queue */}
          <div className="rounded-xl p-5 border bg-[#050A14]/60" style={{ borderColor: `${m.color}20` }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: m.color }} />
              <span className="font-mono text-xs text-[#445566] uppercase tracking-wider">
                Data Queue ({queue.length} files)
              </span>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {queue.length === 0 && <div className="text-center py-8 font-mono text-xs text-[#2A3B4C]">Queue empty...</div>}
              {queue.map(f => (
                <div key={f.id} className="flex items-start gap-3 p-3 rounded-lg bg-[#0A1628]/60 border border-[#1A2B3C]">
                  <span className="font-mono text-[10px] text-[#445566] mt-0.5 w-16 shrink-0">{f.type}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-[#8899AA] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#445566] truncate mt-0.5">{f.description?.slice(0, 55)}...</div>
                    {f.semantic_score !== undefined && (
                      <div className="flex gap-3 mt-1">
                        <span className="font-mono text-[9px] text-[#2A3B4C]">sem: <span style={{ color: m.color }}>{f.semantic_score?.toFixed(2)}</span></span>
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

          {/* Log */}
          <div className="rounded-xl p-5 border bg-[#050A14]/60" style={{ borderColor: '#FF450020' }}>
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
              {running && <div className="text-[#2A3B4C]">█</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}