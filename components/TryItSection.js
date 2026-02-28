'use client'
import { useState, useRef, useEffect } from 'react'
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

const NASA_QUERIES = {
  mars: ['Mars Perseverance rover surface', 'Mars rock formation crater', 'Mars methane atmosphere'],
  satellite: ['Earth flood satellite view', 'wildfire satellite image', 'deforestation aerial'],
  lunar: ['Moon lunar surface south pole', 'lunar crater ice', 'Artemis moon mission'],
  deepspace: ['deep space nebula cosmic', 'interstellar medium plasma', 'cosmic ray space'],
}

function MetricsBar({ metrics, mission }) {
  const m = MISSIONS[mission]
  if (!metrics) return null
  const rf = metrics.rf_metrics || {}

  return (
    <div className="rounded-xl p-5 border bg-[#050A14]/80 mb-6" style={{ borderColor: `${m.color}20` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">Model Performance</span>
        <span className="font-mono text-[10px]" style={{ color: metrics.clip_active ? '#00FF94' : '#445566' }}>
          {metrics.clip_active ? '👁️ CLIP Active' : '👁️ CLIP Loading'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Accuracy', value: rf.accuracy, color: '#00FF94' },
          { label: 'Precision', value: rf.precision, color: m.color },
          { label: 'Recall', value: rf.recall, color: '#00D4FF' },
          { label: 'F1 Score', value: rf.f1, color: '#FFD700' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-2 rounded-lg bg-[#0A1628]/60">
            <div className="font-mono text-lg font-bold" style={{ color: stat.color }}>
              {stat.value ? (stat.value * 100).toFixed(1) + '%' : '...'}
            </div>
            <div className="font-mono text-[9px] text-[#445566] uppercase mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#2A3B4C]">
        <span>🧠 {metrics.models?.sentence_transformer}</span>
        <span>🌲 {metrics.models?.random_forest}</span>
        <span>🔬 {metrics.models?.isolation_forest}</span>
        <span>📡 {metrics.models?.channel_predictor}</span>
      </div>
    </div>
  )
}

function NasaImagePanel({ mission, accentColor }) {
  const [nasaData, setNasaData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [queryIdx, setQueryIdx] = useState(0)
  const queries = NASA_QUERIES[mission] || NASA_QUERIES.mars

  const fetchNasaImage = async (idx = queryIdx) => {
    setLoading(true)
    setNasaData(null)
    try {
      const q = encodeURIComponent(queries[idx % queries.length])
      const res = await fetch(`${API_URL}/nasa_image?query=${q}&mission=${mission}`)
      const data = await res.json()
      setNasaData(data)
    } catch (e) {
      setNasaData({ error: 'Failed to fetch NASA image' })
    }
    setLoading(false)
  }

  const next = () => {
    const next = (queryIdx + 1) % queries.length
    setQueryIdx(next)
    fetchNasaImage(next)
  }

  return (
    <div className="rounded-xl p-5 border bg-[#050A14]/80" style={{ borderColor: `${accentColor}20` }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">🛸 Real NASA Images + CLIP</span>
        <div className="flex gap-2">
          <button onClick={next} disabled={loading}
            className="px-3 py-1 font-mono text-[10px] rounded border border-[#1A2B3C] text-[#445566] hover:text-white transition-all">
            Next →
          </button>
          <button onClick={() => fetchNasaImage(queryIdx)} disabled={loading}
            className="px-3 py-1 font-mono text-[10px] rounded transition-all"
            style={{ backgroundColor: `${accentColor}20`, color: accentColor, border: `1px solid ${accentColor}40` }}>
            {loading ? '⏳' : 'Analyze'}
          </button>
        </div>
      </div>

      {!nasaData && !loading && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <div className="text-3xl mb-2">🛸</div>
          <p className="font-mono text-xs text-[#2A3B4C]">Click Analyze to fetch a real NASA image<br />and run CLIP vision analysis</p>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-40">
          <div className="text-3xl animate-spin mb-2">⚙️</div>
          <p className="font-mono text-xs text-[#445566]">Fetching NASA image + CLIP analysis...</p>
        </div>
      )}

      {nasaData && !nasaData.error && (
        <div>
          <div className="relative rounded-lg overflow-hidden mb-3 bg-[#0A1628]">
            <img src={nasaData.image_url} alt={nasaData.title}
              className="w-full h-40 object-cover opacity-90"
              onError={e => { e.target.style.display = 'none' }} />
            <div className="absolute top-2 right-2 flex gap-1">
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${accentColor}30`, color: accentColor, border: `1px solid ${accentColor}50` }}>
                NASA API
              </span>
              {nasaData.clip_active && (
                <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-[#00FF9430] text-[#00FF94] border border-[#00FF9450]">
                  CLIP ✓
                </span>
              )}
            </div>
          </div>

          <p className="font-mono text-xs text-[#8899AA] mb-2 truncate">{nasaData.title}</p>
          {nasaData.date_created && (
            <p className="font-mono text-[9px] text-[#2A3B4C] mb-3">{nasaData.date_created}</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="text-center p-2 rounded bg-[#0A1628]/60">
              <div className="font-mono text-lg font-bold" style={{ color: accentColor }}>
                {nasaData.clip_score?.toFixed(2)}
              </div>
              <div className="font-mono text-[9px] text-[#445566] uppercase">👁️ CLIP Score</div>
            </div>
            <div className="text-center p-2 rounded bg-[#0A1628]/60">
              <div className="font-mono text-lg font-bold text-[#00D4FF]">
                {nasaData.semantic_score?.toFixed(2)}
              </div>
              <div className="font-mono text-[9px] text-[#445566] uppercase">🧠 Semantic</div>
            </div>
          </div>

          <p className="font-mono text-[9px] text-[#2A3B4C] mt-2 leading-relaxed line-clamp-2">
            {nasaData.description}
          </p>
        </div>
      )}

      {nasaData?.error && (
        <div className="flex items-center justify-center h-40">
          <p className="font-mono text-xs text-[#FF4444]">⚠️ {nasaData.error}</p>
        </div>
      )}
    </div>
  )
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
    <div className="rounded-xl p-5 border transition-all duration-500"
      style={{ borderColor: `${s.color}40`, backgroundColor: `${s.color}08` }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{s.icon}</span>
          <span className="font-mono font-bold text-lg" style={{ color: s.color }}>{s.label}</span>
        </div>
        <span className="font-mono text-xs text-[#445566]">confidence: {(result.rf_confidence * 100).toFixed(0)}%</span>
      </div>

      {result.extracted_text_preview && (
        <div className="mb-4 p-3 rounded-lg bg-[#0A1628]/80 border border-[#1A2B3C]">
          <p className="font-mono text-[9px] text-[#445566] uppercase tracking-wider mb-1">
            Extracted text ({result.text_length} chars) · {result.filename}
          </p>
          <p className="font-mono text-[10px] text-[#6B7E8F] leading-relaxed">{result.extracted_text_preview}...</p>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: 'Anomaly', value: result.anomaly_score?.toFixed(2), highlight: result.is_anomaly, icon: '⚡' },
          { label: 'Semantic', value: result.semantic_score?.toFixed(2), highlight: result.semantic_score > 0.6, icon: '🧠' },
          { label: 'CLIP', value: result.clip_score?.toFixed(2), highlight: result.clip_score > 0.6, icon: '👁️' },
          { label: 'AI Score', value: result.ai_score?.toFixed(2), highlight: result.ai_score > 0.5, icon: '🎯' },
        ].map((item, i) => (
          <div key={i} className="text-center p-2 rounded-lg bg-[#0A1628]/60">
            <div className="text-sm mb-0.5">{item.icon}</div>
            <div className="font-mono font-bold text-base mb-0.5"
              style={{ color: item.highlight ? m.color : '#445566' }}>{item.value}</div>
            <div className="font-mono text-[8px] text-[#445566] uppercase">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        {result.decision_reason?.split(' | ').map((reason, i) => (
          <div key={i} className="font-mono text-[10px] text-[#8899AA] flex items-start gap-2">
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
  const fileInputRef = useRef(null)

  const [selectedSample, setSelectedSample] = useState(null)
  const [customDesc, setCustomDesc] = useState('')
  const [customType, setCustomType] = useState(m.fileTypes[0])
  const [customSize, setCustomSize] = useState(10)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('sample')
  const [pdfFile, setPdfFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [showMetrics, setShowMetrics] = useState(false)

  // Load metrics once
  useEffect(() => {
    fetch(`${API_URL}/metrics`)
      .then(r => r.json())
      .then(data => { if (!data.error) setMetrics(data) })
      .catch(() => {})
  }, [])

  const handlePdfDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') { setPdfFile(f); setResult(null) }
  }

  const analyze = async () => {
    setLoading(true)
    setResult(null)
    try {
      if (mode === 'pdf') {
        if (!pdfFile) return
        const formData = new FormData()
        formData.append('file', pdfFile)
        formData.append('mission', mission)
        const res = await fetch(`${API_URL}/analyze_pdf`, { method: 'POST', body: formData })
        setResult(await res.json())
      } else {
        const fileData = mode === 'sample' && selectedSample
          ? { name: selectedSample.name, type: selectedSample.type, size_mb: selectedSample.size, description: selectedSample.desc }
          : { name: `CUSTOM_${Date.now()}.dat`, type: customType, size_mb: customSize, description: customDesc || 'No description' }
        const res = await fetch(`${API_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: fileData, mission }),
        })
        setResult(await res.json())
      }
    } catch (e) {
      setResult({ error: 'Analysis failed — check backend connection' })
    }
    setLoading(false)
  }

  const canAnalyze = !loading && (
    (mode === 'sample' && selectedSample) ||
    (mode === 'custom' && customDesc) ||
    (mode === 'pdf' && pdfFile)
  )

  return (
    <section className="relative py-16 px-6">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, ${m.glowColor} 0%, transparent 70%)` }} />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: m.color }}>
            04 / Try It Yourself
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${m.color}40, transparent)` }} />
          <button onClick={() => setShowMetrics(v => !v)}
            className="font-mono text-[10px] px-3 py-1 rounded border transition-all"
            style={{ borderColor: `${m.color}40`, color: showMetrics ? m.color : '#445566' }}>
            {showMetrics ? '▼ Hide Metrics' : '▲ Model Metrics'}
          </button>
        </div>

        {showMetrics && <MetricsBar metrics={metrics} mission={mission} />}

        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-3">
            Analyze any <span style={{ color: m.color }}>data file</span>
          </h2>
          <p className="text-[#6B7E8F] text-base max-w-xl mx-auto">
            Sample files · Custom input · PDF upload · Real NASA images analyzed with CLIP
          </p>
        </div>

        {/* Top row: File input + Result */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Left */}
          <div className="rounded-xl p-6 border" style={{ borderColor: `${m.color}20`, backgroundColor: '#050A14' }}>
            <div className="flex gap-2 mb-6">
              {[
                { id: 'sample', label: '📁 Samples' },
                { id: 'custom', label: '✏️ Custom' },
                { id: 'pdf', label: '📄 PDF' },
              ].map(md => (
                <button key={md.id} onClick={() => { setMode(md.id); setResult(null) }}
                  className="flex-1 py-2 font-mono text-[10px] uppercase tracking-wider rounded transition-all duration-300"
                  style={{
                    backgroundColor: mode === md.id ? `${m.color}20` : 'transparent',
                    color: mode === md.id ? m.color : '#445566',
                    border: `1px solid ${mode === md.id ? m.color + '40' : '#1A2B3C'}`,
                  }}>
                  {md.label}
                </button>
              ))}
            </div>

            {mode === 'sample' && (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {samples.map((f, i) => (
                  <button key={i} onClick={() => { setSelectedSample(f); setResult(null) }}
                    className="w-full text-left p-3 rounded-lg border transition-all duration-200"
                    style={{
                      borderColor: selectedSample?.name === f.name ? `${m.color}60` : '#1A2B3C',
                      backgroundColor: selectedSample?.name === f.name ? `${m.color}08` : 'transparent',
                    }}>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] text-[#445566]">{f.type}</span>
                      <span className="font-mono text-[10px] text-[#2A3B4C]">{f.size} MB</span>
                    </div>
                    <div className="font-mono text-xs text-[#8899AA] truncate">{f.name}</div>
                    <div className="text-[10px] text-[#445566] mt-0.5 truncate">{f.desc}</div>
                  </button>
                ))}
              </div>
            )}

            {mode === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] text-[#445566] uppercase tracking-wider block mb-2">File Type</label>
                  <select value={customType} onChange={e => setCustomType(e.target.value)}
                    className="w-full bg-[#0A1628] border rounded px-3 py-2 font-mono text-sm text-white focus:outline-none"
                    style={{ borderColor: `${m.color}30` }}>
                    {m.fileTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#445566] uppercase tracking-wider block mb-2">Description</label>
                  <textarea value={customDesc} onChange={e => setCustomDesc(e.target.value)}
                    placeholder="Describe what this data contains..."
                    rows={4}
                    className="w-full bg-[#0A1628] border rounded px-3 py-2 font-mono text-sm text-white placeholder-[#2A3B4C] focus:outline-none resize-none"
                    style={{ borderColor: `${m.color}30` }} />
                </div>
                <div>
                  <label className="font-mono text-[10px] text-[#445566] uppercase tracking-wider block mb-2">
                    File Size: {customSize} MB
                  </label>
                  <input type="range" min={0.1} max={100} step={0.1} value={customSize}
                    onChange={e => setCustomSize(parseFloat(e.target.value))}
                    className="w-full" style={{ accentColor: m.color }} />
                </div>
              </div>
            )}

            {mode === 'pdf' && (
              <div className="space-y-4">
                <p className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">
                  Upload PDF — scientific paper, mission report, sensor log
                </p>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handlePdfDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300"
                  style={{
                    borderColor: dragOver ? m.color : pdfFile ? `${m.color}60` : '#1A2B3C',
                    backgroundColor: dragOver ? `${m.color}08` : 'transparent',
                  }}>
                  <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                    onChange={e => { if (e.target.files[0]) { setPdfFile(e.target.files[0]); setResult(null) } }} />
                  {pdfFile ? (
                    <div>
                      <div className="text-3xl mb-2">📄</div>
                      <p className="font-mono text-sm font-bold" style={{ color: m.color }}>{pdfFile.name}</p>
                      <p className="font-mono text-[10px] text-[#445566] mt-1">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-4xl mb-3">📄</div>
                      <p className="font-mono text-sm text-[#445566]">Drop PDF or click to browse</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button onClick={analyze} disabled={!canAnalyze}
              className="w-full mt-5 py-3 font-mono text-sm uppercase tracking-widest rounded transition-all duration-300 disabled:opacity-30"
              style={{ backgroundColor: `${m.color}20`, color: m.color, border: `1px solid ${m.color}40` }}>
              {loading ? '⏳ Analyzing...' : mode === 'pdf' ? '📄 Analyze PDF' : '🚀 Run AI Analysis'}
            </button>
          </div>

          {/* Right: Result */}
          <div className="rounded-xl p-6 border" style={{ borderColor: '#1A2B3C', backgroundColor: '#050A14' }}>
            <p className="font-mono text-[10px] text-[#445566] uppercase tracking-wider mb-4">AI Pipeline Result</p>

            {!result && !loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4">🤖</div>
                <p className="font-mono text-sm text-[#2A3B4C]">Select a file and run analysis</p>
                <p className="font-mono text-[10px] text-[#1A2B3C] mt-2">
                  IsolationForest · Sentence Transformer<br />
                  CLIP Vision · EMA Channel · RandomForest (15 feat)
                </p>
              </div>
            )}

            {loading && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="text-4xl mb-4 animate-spin">⚙️</div>
                <p className="font-mono text-sm text-[#445566]">Running 5 models...</p>
                <div className="mt-4 space-y-2 w-full max-w-xs">
                  {['IsolationForest (NASA data)', 'Sentence Transformer', 'CLIP Vision', 'EMA Channel Predictor', 'RandomForest (15 feat)'].map((model, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full animate-pulse"
                        style={{ backgroundColor: m.color, animationDelay: `${i * 0.25}s` }} />
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

        {/* Bottom: NASA Image CLIP panel */}
        <NasaImagePanel mission={mission} accentColor={m.color} />
      </div>
    </section>
  )
}