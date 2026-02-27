'use client'
import { useState, useRef } from 'react'
import { MISSIONS } from './MissionSelector'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://entelexiya-marsai-backend.hf.space'

const SAMPLE_FILES = {
  mars: [
    { name: 'ZCAM_SOL847_unusual_deposit.jpg', type: 'IMG', desc: 'Unusual reddish-brown mineral deposit, possible hematite concretions', size: 12.4 },
    { name: 'CHEMCAM_methane_spike.csv', type: 'CHEM', desc: 'Sudden methane spike: 21 ppb above baseline — high scientific priority', size: 3.2 },
    { name: 'MEDA_routine_atmo.dat', type: 'ATM', desc: 'Standard atmospheric pressure reading, nominal conditions', size: 1.8 },
    { name: 'SEIS_marsquake_M3.2.dat', type: 'SEISM', desc: 'Marsquake magnitude 3.2 detected — strongest seismic event this sol', size: 8.7 },
    { name: 'PIXL_biosignature.csv', type: 'PIXL', desc: 'Potential biosignature: organic sulfur compound cluster detected', size: 15.3 },
    { name: 'ZCAM_routine_terrain.jpg', type: 'IMG', desc: 'Routine terrain survey, flat dust-covered basalt, no notable features', size: 9.1 },
  ],
  satellite: [
    { name: 'SAR_flood_detection.tif', type: 'SAR', desc: 'Flash flood detected in river delta — emergency mapping required', size: 45.2 },
    { name: 'OPT_routine_coverage.tif', type: 'OPT', desc: 'Standard optical coverage pass, nominal cloud conditions', size: 32.1 },
    { name: 'THERMAL_wildfire_anomaly.dat', type: 'THERMAL', desc: 'Thermal anomaly detected — possible wildfire ignition point', size: 18.4 },
    { name: 'RADAR_ship_tracking.dat', type: 'RADAR', desc: 'Routine maritime traffic monitoring, no suspicious vessels', size: 22.7 },
  ],
  lunar: [
    { name: 'DRILL_ice_detection.csv', type: 'DRILL', desc: 'Water ice confirmed at 2.3m depth — significant ISRU discovery', size: 5.6 },
    { name: 'SEISM_moonquake.dat', type: 'SEISM', desc: 'Shallow moonquake M2.1 — structural survey data', size: 11.2 },
    { name: 'THERMAL_surface_nominal.dat', type: 'THERMAL', desc: 'Standard surface thermal mapping, expected diurnal variation', size: 3.4 },
  ],
  deepspace: [
    { name: 'PLASMA_heliosphere_boundary.dat', type: 'PLASMA', desc: 'Unexpected plasma density spike — possible heliosphere boundary crossing', size: 0.8 },
    { name: 'MAG_field_nominal.dat', type: 'MAG', desc: 'Standard magnetic field measurement, no anomalies detected', size: 0.3 },
    { name: 'COSMIC_ray_burst.dat', type: 'COSMIC', desc: 'High-energy cosmic ray burst detected — galactic origin confirmed', size: 1.2 },
  ],
}

function ResultCard({ result, mission }) {
  if (!result) return null
  const m = MISSIONS[mission]

  const statusConfig = {
    critical: { color: '#FF4500', label: 'SEND IMMEDIATELY', icon: '🔴' },
    sending: { color: '#FF6B35', label: 'SEND NOW', icon: '🟠' },
    queued: { color: '#FFD700', label: 'QUEUE', icon: '🟡' },
    pending: { color: '#445566', label: 'WAIT / LOW PRIORITY', icon: '⚪' },
  }
  const s = statusConfig[result.status] || statusConfig.pending

  return (
    <div
      className="rounded-xl p-5 border transition-all duration-500 mt-4"
      style={{ borderColor: `${s.color}40`, backgroundColor: `${s.color}08` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{s.icon}</span>
          <span className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.label}</span>
        </div>
        <span className="font-mono text-xs text-[#445566]">
          confidence: {(result.rf_confidence * 100).toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Anomaly Score', value: result.anomaly_score?.toFixed(2), highlight: result.is_anomaly, icon: '⚡' },
          { label: 'Semantic Value', value: result.semantic_score?.toFixed(2), highlight: result.semantic_score > 0.6, icon: '🧠' },
          { label: 'AI Score', value: result.ai_score?.toFixed(2), highlight: result.ai_score > 0.5, icon: '🎯' },
        ].map((item, i) => (
          <div key={i} className="text-center p-3 rounded-lg bg-[#0A1628]/60">
            <div className="text-lg mb-1">{item.icon}</div>
            <div
              className="font-mono font-bold text-xl mb-1"
              style={{ color: item.highlight ? m.color : '#445566' }}
            >
              {item.value}
            </div>
            <div className="font-mono text-[9px] text-[#445566] uppercase">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        {result.decision_reason?.split(' | ').map((reason, i) => (
          <div key={i} className="font-mono text-xs text-[#8899AA] flex items-start gap-2">
            <span className="text-[#2A3B4C] shrink-0">→</span>
            <span>{reason}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TryItSection({ mission }) {
  const m = MISSIONS[mission]
  const samples = SAMPLE_FILES[mission] || SAMPLE_FILES.mars

  const [selectedSample, setSelectedSample] = useState(null)
  const [customDesc, setCustomDesc] = useState('')
  const [customType, setCustomType] = useState(m.fileTypes[0])
  const [customSize, setCustomSize] = useState(10)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('sample') // 'sample' | 'custom'

  const analyze = async () => {
    setLoading(true)
    setResult(null)

    const fileData = mode === 'sample' && selectedSample
      ? {
          name: selectedSample.name,
          type: selectedSample.type,
          size_mb: selectedSample.size,
          description: selectedSample.desc,
        }
      : {
          name: `CUSTOM_FILE_${Date.now()}.dat`,
          type: customType,
          size_mb: customSize,
          description: customDesc || 'No description provided',
        }

    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileData,
          mission: mission,
        }),
      })
      const data = await res.json()
      setResult(data)
    } catch (e) {
      setResult({ error: 'Analysis failed — check backend connection' })
    }
    setLoading(false)
  }

  return (
    <section className="relative py-16 px-6">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor} 0%, transparent 70%)` }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: m.color }}>
            04 / Try It Yourself
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${m.color}40, transparent)` }} />
        </div>

        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-3">
            Analyze any <span style={{ color: m.color }}>data file</span>
          </h2>
          <p className="text-[#6B7E8F] text-base max-w-xl mx-auto">
            Submit a file to the AI pipeline — watch all 4 models decide its transmission priority in real time
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: file selector */}
          <div
            className="rounded-xl p-6 border"
            style={{ borderColor: `${m.color}20`, backgroundColor: '#050A14' }}
          >
            {/* Mode toggle */}
            <div className="flex gap-2 mb-6">
              {['sample', 'custom'].map(md => (
                <button
                  key={md}
                  onClick={() => { setMode(md); setResult(null) }}
                  className="flex-1 py-2 font-mono text-xs uppercase tracking-widest rounded transition-all duration-300"
                  style={{
                    backgroundColor: mode === md ? `${m.color}20` : 'transparent',
                    color: mode === md ? m.color : '#445566',
                    border: `1px solid ${mode === md ? m.color + '40' : '#1A2B3C'}`,
                  }}
                >
                  {md === 'sample' ? '📁 Sample Files' : '✏️ Custom Input'}
                </button>
              ))}
            </div>

            {mode === 'sample' ? (
              <div className="space-y-2">
                <p className="font-mono text-[10px] text-[#445566] uppercase tracking-wider mb-3">
                  Select a file from {m.name} mission:
                </p>
                {samples.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedSample(f); setResult(null) }}
                    className="w-full text-left p-3 rounded-lg border transition-all duration-200"
                    style={{
                      borderColor: selectedSample?.name === f.name ? `${m.color}60` : '#1A2B3C',
                      backgroundColor: selectedSample?.name === f.name ? `${m.color}08` : 'transparent',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-[#445566]">{f.type}</span>
                      <span className="font-mono text-[10px] text-[#2A3B4C]">{f.size} MB</span>
                    </div>
                    <div className="font-mono text-xs text-[#8899AA] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#445566] mt-0.5 truncate">{f.desc}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] text-[#445566] uppercase tracking-wider block mb-2">
                    File Type
                  </label>
                  <select
                    value={customType}
                    onChange={e => setCustomType(e.target.value)}
                    className="w-full bg-[#0A1628] border border-[#1A2B3C] rounded px-3 py-2 font-mono text-sm text-white focus:outline-none"
                    style={{ borderColor: `${m.color}30` }}
                  >
                    {m.fileTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#445566] uppercase tracking-wider block mb-2">
                    Description
                  </label>
                  <textarea
                    value={customDesc}
                    onChange={e => setCustomDesc(e.target.value)}
                    placeholder="Describe what this data contains..."
                    rows={4}
                    className="w-full bg-[#0A1628] border border-[#1A2B3C] rounded px-3 py-2 font-mono text-sm text-white placeholder-[#2A3B4C] focus:outline-none resize-none"
                    style={{ borderColor: `${m.color}30` }}
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#445566] uppercase tracking-wider block mb-2">
                    File Size: {customSize} MB
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={100}
                    step={0.1}
                    value={customSize}
                    onChange={e => setCustomSize(parseFloat(e.target.value))}
                    className="w-full accent-current"
                    style={{ accentColor: m.color }}
                  />
                  <div className="flex justify-between font-mono text-[9px] text-[#2A3B4C] mt-1">
                    <span>0.1 MB</span><span>100 MB</span>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={analyze}
              disabled={loading || (mode === 'sample' && !selectedSample) || (mode === 'custom' && !customDesc)}
              className="w-full mt-6 py-3 font-mono text-sm uppercase tracking-widest rounded transition-all duration-300 disabled:opacity-30"
              style={{
                backgroundColor: `${m.color}20`,
                color: m.color,
                border: `1px solid ${m.color}40`,
              }}
            >
              {loading ? '⏳ Analyzing...' : '🚀 Run AI Analysis'}
            </button>
          </div>

          {/* Right: result */}
          <div
            className="rounded-xl p-6 border"
            style={{ borderColor: '#1A2B3C', backgroundColor: '#050A14' }}
          >
            <p className="font-mono text-[10px] text-[#445566] uppercase tracking-wider mb-4">
              AI Pipeline Result
            </p>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4">🤖</div>
                <p className="font-mono text-sm text-[#2A3B4C]">
                  Select a file and click<br />"Run AI Analysis"
                </p>
                <p className="font-mono text-[10px] text-[#1A2B3C] mt-2">
                  IsolationForest → Sentence Transformer<br />→ LinearRegression → RandomForest
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4 animate-spin">⚙️</div>
                <p className="font-mono text-sm text-[#445566]">Running 4 models...</p>
                <div className="mt-4 space-y-2 w-full max-w-xs">
                  {['IsolationForest', 'Sentence Transformer', 'LinearRegression', 'RandomForest'].map((model, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: m.color, animationDelay: `${i * 0.3}s` }}
                      />
                      <span className="font-mono text-[10px] text-[#445566]">{model}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result && !result.error && <ResultCard result={result} mission={mission} />}
            {result?.error && (
              <div className="p-4 rounded-lg border border-[#FF444440] bg-[#FF444408]">
                <p className="font-mono text-xs text-[#FF4444]">⚠️ {result.error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
