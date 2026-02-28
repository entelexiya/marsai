'use client'
import { useState, useEffect, useRef } from 'react'

const MISSION_VIZ = {
  mars: {
    source: { label: 'MARS', color: '#FF4500', grad: ['#FF8C42', '#CC3300', '#661100'], glow: 'rgba(255, 69, 0, 0.08)', r: 28 },
    target: { label: 'EARTH', color: '#00D4FF', grad: ['#4FC3F7', '#1565C0', '#0D47A1'], glow: 'rgba(0, 212, 255, 0.06)', r: 22 },
    delay: { value: 22, unit: 'min', label: 'Signal Delay' },
    collected: { value: '~2', unit: 'GB', label: 'Daily Collection' },
    transmit: { value: '200', unit: 'MB', label: 'Can Transmit' },
    headline: 'Onboard AI decides what matters',
    desc: 'A rover generates <b>gigabytes</b> daily. Only <r>100–300 MB</r> can reach Earth. Our AI decides what transmits — <g>right now</g>.',
  },
  satellite: {
    source: { label: 'SAT LEO', color: '#00D4FF', grad: ['#80DEEA', '#00ACC1', '#006064'], glow: 'rgba(0, 212, 255, 0.08)', r: 18 },
    target: { label: 'EARTH', color: '#00FF94', grad: ['#4FC3F7', '#1565C0', '#0D47A1'], glow: 'rgba(0, 255, 148, 0.06)', r: 22 },
    delay: { value: 0.03, unit: 'sec', label: 'Signal Delay' },
    collected: { value: '~50', unit: 'GB', label: 'Daily Collection' },
    transmit: { value: '8', unit: 'GB', label: 'Contact Window' },
    headline: 'AI prioritizes 50GB in 10-minute windows',
    desc: 'A LEO satellite collects <b>50GB daily</b> but only sees the ground station for <r>10 minutes per orbit</r>. AI decides what downloads — <g>right now</g>.',
  },
  lunar: {
    source: { label: 'MOON', color: '#C8B8FF', grad: ['#E8E0FF', '#B39DDB', '#7E57C2'], glow: 'rgba(200, 184, 255, 0.08)', r: 24 },
    target: { label: 'EARTH', color: '#00D4FF', grad: ['#4FC3F7', '#1565C0', '#0D47A1'], glow: 'rgba(0, 212, 255, 0.06)', r: 22 },
    delay: { value: 1.3, unit: 'sec', label: 'Signal Delay' },
    collected: { value: '~500', unit: 'MB', label: 'Daily Collection' },
    transmit: { value: '80', unit: 'MB', label: 'Can Transmit' },
    headline: 'Lunar AI transmits only what matters',
    desc: 'Artemis base generates <b>500MB daily</b> — water ice data, moonquakes, ISRU analysis. Only <r>80MB</r> fits the link. AI chooses — <g>right now</g>.',
  },
  deepspace: {
    source: { label: 'PROBE', color: '#FFD700', grad: ['#FFF176', '#FFD600', '#F9A825'], glow: 'rgba(255, 215, 0, 0.08)', r: 14 },
    target: { label: 'EARTH', color: '#00D4FF', grad: ['#4FC3F7', '#1565C0', '#0D47A1'], glow: 'rgba(0, 212, 255, 0.06)', r: 22 },
    delay: { value: 4, unit: 'hrs', label: 'Signal Delay' },
    collected: { value: '~10', unit: 'MB', label: 'Daily Collection' },
    transmit: { value: '1', unit: 'MB', label: 'Can Transmit' },
    headline: 'Every bit counts at 20 billion km',
    desc: 'A deep space probe has <b>4-hour signal delay</b> and only <r>0.04 Mbps</r> bandwidth. Each byte costs millions. AI chooses wisely — <g>always</g>.',
  },
}

function SpaceViz({ mission }) {
  const canvasRef = useRef(null)
  const packetsRef = useRef([])
  const vizConfig = MISSION_VIZ[mission] || MISSION_VIZ.mars

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    packetsRef.current = []

    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const src = { x: W * 0.82, y: H * 0.5, r: vizConfig.source.r }
    const tgt = { x: W * 0.18, y: H * 0.5, r: vizConfig.target.r }

    const addPacket = (critical = false) => {
      packetsRef.current.push({
        progress: 0,
        speed: 0.003 + Math.random() * 0.003,
        critical,
        size: critical ? 4 : 2.5,
        color: critical ? '#FF4500' : vizConfig.source.color,
        trail: [],
      })
    }

    const drawPlanet = (p, cfg) => {
      const grad = ctx.createRadialGradient(p.x - p.r * 0.3, p.y - p.r * 0.3, 2, p.x, p.y, p.r)
      cfg.grad.forEach((c, i) => grad.addColorStop(i / (cfg.grad.length - 1), c))
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r + 7, 0, Math.PI * 2)
      ctx.fillStyle = cfg.glow
      ctx.fill()
      ctx.font = '10px Space Mono'
      ctx.fillStyle = cfg.color
      ctx.textAlign = 'center'
      ctx.fillText(cfg.label, p.x, p.y + p.r + 18)
    }

    let lastPacket = 0
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H)

      const lineGrad = ctx.createLinearGradient(tgt.x, H/2, src.x, H/2)
      lineGrad.addColorStop(0, `${vizConfig.target.color}18`)
      lineGrad.addColorStop(1, `${vizConfig.source.color}18`)
      ctx.beginPath()
      ctx.moveTo(tgt.x, H/2)
      ctx.lineTo(src.x, H/2)
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.stroke()
      ctx.setLineDash([])

      drawPlanet(src, vizConfig.source)
      drawPlanet(tgt, vizConfig.target)

      if (t - lastPacket > 800) {
        addPacket(Math.random() < 0.3)
        lastPacket = t
      }

      packetsRef.current = packetsRef.current.filter(p => p.progress <= 1)
      packetsRef.current.forEach(p => {
        p.progress += p.speed
        const x = src.x + (tgt.x - src.x) * p.progress
        const y = H * 0.5 + Math.sin(p.progress * Math.PI) * -15
        p.trail.push({ x, y })
        if (p.trail.length > 12) p.trail.shift()

        p.trail.forEach((pt, i) => {
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = `${p.color}${Math.floor((i / p.trail.length) * 60).toString(16).padStart(2, '0')}`
          ctx.fill()
        })

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, p.size + 3, 0, Math.PI * 2)
        ctx.fillStyle = p.critical ? 'rgba(255,69,0,0.3)' : `${vizConfig.source.color}33`
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [mission])

  return (
    <canvas ref={canvasRef} className="w-full h-40 md:h-48" style={{ display: 'block' }} />
  )
}

export default function Hero({ mission = 'mars' }) {
  const [delay, setDelay] = useState(0)
  const [chars, setChars] = useState(0)
  const viz = MISSION_VIZ[mission] || MISSION_VIZ.mars
  const headline = viz.headline

  useEffect(() => {
    setDelay(0)
    setChars(0)

    const maxDelay = viz.delay.value
    const interval = setInterval(() => {
      setDelay(d => {
        const next = d + maxDelay / 70
        return next >= maxDelay ? maxDelay : next
      })
    }, 50)

    let i = 0
    const typer = setInterval(() => {
      i++
      setChars(i)
      if (i >= headline.length) clearInterval(typer)
    }, 50)

    return () => { clearInterval(interval); clearInterval(typer) }
  }, [mission])

  const accentColor = viz.source.color

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-700"
          style={{ backgroundColor: `${accentColor}08` }} />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#00D4FF]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border bg-opacity-5 transition-all duration-500"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8899AA]">
            {mission === 'mars' ? 'Mission Active — Sol 847' :
             mission === 'satellite' ? 'LEO Orbit — Pass #1247' :
             mission === 'lunar' ? 'Artemis Base — South Pole' :
             'Deep Space — 20+ AU'}
          </span>
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl mb-4 leading-none tracking-tight">
          <span className="text-white">
            {mission === 'mars' ? 'MARS' :
             mission === 'satellite' ? 'SAT' :
             mission === 'lunar' ? 'LUNAR' : 'DEEP'}
          </span>
          <span style={{ color: accentColor }}>AI</span>
        </h1>

        <div className="font-mono text-lg md:text-xl mb-6 h-8 terminal-cursor" style={{ color: accentColor }}>
          {headline.slice(0, chars)}
        </div>

        <p className="font-body text-[#6B7E8F] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
          {mission === 'mars' && <>A rover generates <span className="text-white font-medium">gigabytes</span> daily. Only <span className="text-[#FF4500] font-medium">100–300 MB</span> can reach Earth. Our AI reads the data, understands its scientific value, and decides what transmits — <span className="text-[#00FF94] font-medium">right now</span>.</>}
          {mission === 'satellite' && <>A LEO satellite collects <span className="text-white font-medium">50GB daily</span> but only sees a ground station for <span className="text-[#00D4FF] font-medium">10 minutes per orbit</span>. AI decides what downloads — <span className="text-[#00FF94] font-medium">right now</span>.</>}
          {mission === 'lunar' && <>Artemis base generates <span className="text-white font-medium">500MB daily</span> — ice data, moonquakes, ISRU analysis. Only <span className="text-[#C8B8FF] font-medium">80MB</span> fits the link. AI chooses — <span className="text-[#00FF94] font-medium">right now</span>.</>}
          {mission === 'deepspace' && <>A deep space probe has <span className="text-white font-medium">4-hour signal delay</span> and only <span className="text-[#FFD700] font-medium">0.04 Mbps</span> bandwidth. Each byte costs millions. AI chooses wisely — <span className="text-[#00FF94] font-medium">always</span>.</>}
        </p>

        <div className="flex items-center justify-center gap-8 mb-12">
          {[
            { value: viz.delay.value.toFixed(viz.delay.unit === 'min' ? 0 : viz.delay.unit === 'sec' ? 2 : 0), unit: viz.delay.unit, label: viz.delay.label, color: accentColor },
            { value: viz.collected.value, unit: viz.collected.unit, label: viz.collected.label, color: '#00D4FF' },
            { value: viz.transmit.value, unit: viz.transmit.unit, label: viz.transmit.label, color: '#00FF94' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              {i > 0 && <div className="hidden" />}
              <div className="font-mono text-3xl font-bold transition-colors duration-500" style={{ color: stat.color }}>
                {i === 0 ? (mission === 'mars' ? `${delay.toFixed(1)}` : stat.value) : stat.value}
                <span className="text-lg">{stat.unit}</span>
              </div>
              <div className="font-mono text-[10px] tracking-widest text-[#445566] uppercase mt-1">{stat.label}</div>
              {i < 2 && <div className="absolute w-px h-12 bg-[#1A2B3C]" style={{ marginLeft: '100%', marginTop: '-3rem' }} />}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mb-16">
          <a href="#demo"
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase text-white transition-all duration-300 rounded"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 0 0 ${accentColor}` }}
            onMouseEnter={e => e.target.style.boxShadow = `0 0 30px ${accentColor}80`}
            onMouseLeave={e => e.target.style.boxShadow = `0 0 0 0 ${accentColor}`}>
            Live Demo →
          </a>
          <a href="#tech"
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-[#1A2B3C] text-[#6B7E8F] hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition-all duration-300 rounded">
            How It Works
          </a>
        </div>

        <div className="neon-border-blue rounded-xl bg-[#050A14]/60 backdrop-blur-sm p-4 scanlines">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="font-mono text-[10px] tracking-widest text-[#445566] uppercase">
              Live Transmission — {viz.source.label} → {viz.target.label}
            </span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#FF4500]">
                <span className="w-2 h-2 rounded-full bg-[#FF4500]" /> Critical
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px]" style={{ color: viz.source.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: viz.source.color }} /> Standard
              </span>
            </div>
          </div>
          <SpaceViz mission={mission} />
        </div>
      </div>
    </section>
  )
}