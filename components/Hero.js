'use client'
import { useState, useEffect, useRef } from 'react'

const MISSION_VIZ = {
  mars: {
    source: { type: 'mars', label: 'MARS', color: '#FF4500' },
    target: { type: 'earth', label: 'EARTH', color: '#00D4FF' },
    delay: { value: 22, unit: 'min', label: 'Signal Delay' },
    collected: { value: '~2', unit: 'GB', label: 'Daily Collection' },
    transmit: { value: '200', unit: 'MB', label: 'Can Transmit' },
    headline: 'Onboard AI decides what matters',
    badge: 'Mission Active — Sol 847',
    packetColor: '#FF4500',
  },
  satellite: {
    source: { type: 'satellite', label: 'LEO SAT', color: '#00D4FF' },
    target: { type: 'earth', label: 'EARTH', color: '#00FF94' },
    delay: { value: 0.03, unit: 'sec', label: 'Signal Delay' },
    collected: { value: '~50', unit: 'GB', label: 'Daily Collection' },
    transmit: { value: '8', unit: 'GB', label: 'Contact Window' },
    headline: 'AI prioritizes 50GB in 10-min windows',
    badge: 'LEO Orbit — Pass #1247 · Alt 400km',
    packetColor: '#00D4FF',
  },
  lunar: {
    source: { type: 'moon', label: 'MOON', color: '#C8B8FF' },
    target: { type: 'earth', label: 'EARTH', color: '#00D4FF' },
    delay: { value: 1.3, unit: 'sec', label: 'Signal Delay' },
    collected: { value: '~500', unit: 'MB', label: 'Daily Collection' },
    transmit: { value: '80', unit: 'MB', label: 'Can Transmit' },
    headline: 'Lunar AI transmits only what matters',
    badge: 'Artemis Base — South Pole · Day 12',
    packetColor: '#C8B8FF',
  },
  deepspace: {
    source: { type: 'probe', label: 'PROBE', color: '#FFD700' },
    target: { type: 'earth', label: 'EARTH', color: '#00D4FF' },
    delay: { value: 4, unit: 'hrs', label: 'Signal Delay' },
    collected: { value: '~10', unit: 'MB', label: 'Daily Collection' },
    transmit: { value: '1', unit: 'MB', label: 'Can Transmit' },
    headline: 'Every bit counts at 20 billion km',
    badge: 'Deep Space — 20+ AU · Voyager Class',
    packetColor: '#FFD700',
  },
}

function drawMars(ctx, x, y, r, t) {
  // Base planet
  const grad = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.05, x, y, r)
  grad.addColorStop(0, '#FF9966')
  grad.addColorStop(0.3, '#CC4400')
  grad.addColorStop(0.7, '#992200')
  grad.addColorStop(1, '#440800')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  // Surface details - craters
  ctx.save()
  ctx.clip()
  ctx.beginPath()
  ctx.arc(x - r * 0.3, y + r * 0.15, r * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(80, 20, 0, 0.5)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + r * 0.2, y - r * 0.25, r * 0.12, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(60, 10, 0, 0.4)'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x - r * 0.1, y - r * 0.1, r * 0.22, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(180, 60, 0, 0.2)'
  ctx.fill()

  // Polar ice cap
  ctx.beginPath()
  ctx.arc(x, y - r, r * 0.45, 0, Math.PI)
  ctx.fillStyle = 'rgba(255, 240, 220, 0.25)'
  ctx.fill()
  ctx.restore()

  // Atmosphere glow
  const atm = ctx.createRadialGradient(x, y, r, x, y, r * 1.35)
  atm.addColorStop(0, 'rgba(255, 100, 30, 0.15)')
  atm.addColorStop(1, 'rgba(255, 60, 0, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r * 1.35, 0, Math.PI * 2)
  ctx.fillStyle = atm
  ctx.fill()

  // Dust storm shimmer
  const shimmer = Math.sin(t * 0.001) * 0.05 + 0.08
  const dust = ctx.createRadialGradient(x + r * 0.2, y + r * 0.1, 0, x + r * 0.2, y + r * 0.1, r * 0.6)
  dust.addColorStop(0, `rgba(255, 160, 60, ${shimmer})`)
  dust.addColorStop(1, 'rgba(255, 100, 0, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = dust
  ctx.fill()

  // Highlight
  const hi = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x - r * 0.3, y - r * 0.3, r * 0.6)
  hi.addColorStop(0, 'rgba(255, 200, 150, 0.25)')
  hi.addColorStop(1, 'rgba(255, 150, 80, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = hi
  ctx.fill()
}

function drawEarth(ctx, x, y, r, t) {
  // Base ocean
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.05, x, y, r)
  grad.addColorStop(0, '#5BC8F5')
  grad.addColorStop(0.35, '#1A6EBF')
  grad.addColorStop(0.7, '#0A3D8A')
  grad.addColorStop(1, '#020F2B')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.save()
  ctx.clip()
  // Continents
  const landColor = 'rgba(50, 160, 80, 0.7)'
  const continents = [
    [x - r * 0.15, y - r * 0.1, r * 0.28, r * 0.35],
    [x + r * 0.2, y - r * 0.05, r * 0.22, r * 0.3],
    [x - r * 0.35, y + r * 0.2, r * 0.18, r * 0.2],
    [x + r * 0.05, y + r * 0.15, r * 0.25, r * 0.18],
  ]
  continents.forEach(([cx, cy, rw, rh]) => {
    ctx.beginPath()
    ctx.ellipse(cx, cy, rw, rh, Math.random() * 0.5, 0, Math.PI * 2)
    ctx.fillStyle = landColor
    ctx.fill()
  })

  // Clouds
  const cloudAlpha = 0.4 + Math.sin(t * 0.0005) * 0.1
  ctx.beginPath()
  ctx.ellipse(x + r * 0.1, y - r * 0.35, r * 0.4, r * 0.1, -0.3, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${cloudAlpha})`
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x - r * 0.25, y + r * 0.1, r * 0.3, r * 0.08, 0.4, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${cloudAlpha * 0.8})`
  ctx.fill()
  ctx.restore()

  // Atmosphere
  const atm = ctx.createRadialGradient(x, y, r, x, y, r * 1.3)
  atm.addColorStop(0, 'rgba(100, 200, 255, 0.2)')
  atm.addColorStop(0.5, 'rgba(50, 150, 255, 0.08)')
  atm.addColorStop(1, 'rgba(0, 100, 255, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r * 1.3, 0, Math.PI * 2)
  ctx.fillStyle = atm
  ctx.fill()

  // Highlight
  const hi = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x - r * 0.3, y - r * 0.3, r * 0.7)
  hi.addColorStop(0, 'rgba(200, 240, 255, 0.3)')
  hi.addColorStop(1, 'rgba(100, 200, 255, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = hi
  ctx.fill()
}

function drawMoon(ctx, x, y, r, t) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  grad.addColorStop(0, '#E8E0D0')
  grad.addColorStop(0.4, '#B0A898')
  grad.addColorStop(0.8, '#786860')
  grad.addColorStop(1, '#302820')
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = grad
  ctx.fill()

  ctx.save()
  ctx.clip()
  // Craters
  const craters = [
    [x - r * 0.3, y + r * 0.2, r * 0.2],
    [x + r * 0.25, y - r * 0.15, r * 0.15],
    [x - r * 0.1, y - r * 0.3, r * 0.12],
    [x + r * 0.1, y + r * 0.1, r * 0.18],
    [x - r * 0.4, y - r * 0.1, r * 0.1],
  ]
  craters.forEach(([cx, cy, cr]) => {
    ctx.beginPath()
    ctx.arc(cx, cy, cr, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(100, 80, 60, 0.6)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(cx, cy, cr * 0.7, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(50, 40, 30, 0.3)'
    ctx.fill()
  })

  // South pole ice
  ctx.beginPath()
  ctx.arc(x, y + r * 0.85, r * 0.3, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(220, 240, 255, 0.35)'
  ctx.fill()
  ctx.restore()

  // Glow
  const glow = ctx.createRadialGradient(x, y, r, x, y, r * 1.2)
  glow.addColorStop(0, 'rgba(200, 184, 255, 0.15)')
  glow.addColorStop(1, 'rgba(180, 160, 255, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r * 1.2, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()
}

function drawSatellite(ctx, x, y, r, t) {
  const angle = t * 0.001
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)

  // Solar panels
  const panelColor = '#1A3A6A'
  const panelHighlight = '#4488FF'
  const panelW = r * 2.8
  const panelH = r * 0.7

  // Left panel
  ctx.fillStyle = panelColor
  ctx.fillRect(-panelW - r * 0.3, -panelH / 2, panelW, panelH)
  // Panel grid lines
  ctx.strokeStyle = panelHighlight
  ctx.lineWidth = 0.5
  for (let i = 1; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(-panelW - r * 0.3 + (panelW / 4) * i, -panelH / 2)
    ctx.lineTo(-panelW - r * 0.3 + (panelW / 4) * i, panelH / 2)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(-panelW - r * 0.3, 0)
  ctx.lineTo(-r * 0.3, 0)
  ctx.stroke()
  // Panel glow
  const panelGlow = ctx.createLinearGradient(-panelW - r * 0.3, 0, -r * 0.3, 0)
  panelGlow.addColorStop(0, 'rgba(0, 150, 255, 0)')
  panelGlow.addColorStop(0.5, 'rgba(0, 150, 255, 0.15)')
  panelGlow.addColorStop(1, 'rgba(0, 150, 255, 0)')
  ctx.fillStyle = panelGlow
  ctx.fillRect(-panelW - r * 0.3, -panelH / 2, panelW, panelH)

  // Right panel
  ctx.fillStyle = panelColor
  ctx.fillRect(r * 0.3, -panelH / 2, panelW, panelH)
  ctx.strokeStyle = panelHighlight
  for (let i = 1; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(r * 0.3 + (panelW / 4) * i, -panelH / 2)
    ctx.lineTo(r * 0.3 + (panelW / 4) * i, panelH / 2)
    ctx.stroke()
  }
  ctx.beginPath()
  ctx.moveTo(r * 0.3, 0)
  ctx.lineTo(panelW + r * 0.3, 0)
  ctx.stroke()
  const panelGlow2 = ctx.createLinearGradient(r * 0.3, 0, panelW + r * 0.3, 0)
  panelGlow2.addColorStop(0, 'rgba(0, 150, 255, 0)')
  panelGlow2.addColorStop(0.5, 'rgba(0, 150, 255, 0.15)')
  panelGlow2.addColorStop(1, 'rgba(0, 150, 255, 0)')
  ctx.fillStyle = panelGlow2
  ctx.fillRect(r * 0.3, -panelH / 2, panelW, panelH)

  // Main body
  const bodyGrad = ctx.createLinearGradient(-r * 0.3, -r * 0.5, r * 0.3, r * 0.5)
  bodyGrad.addColorStop(0, '#C0D8F0')
  bodyGrad.addColorStop(0.4, '#8090B0')
  bodyGrad.addColorStop(1, '#303848')
  ctx.fillStyle = bodyGrad
  ctx.beginPath()
  ctx.roundRect(-r * 0.3, -r * 0.5, r * 0.6, r * 1.0, r * 0.08)
  ctx.fill()

  // Dish antenna
  ctx.strokeStyle = '#A0B8D0'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, -r * 0.7, r * 0.35, Math.PI, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.35)
  ctx.lineTo(0, -r * 0.7)
  ctx.stroke()

  // Status light
  const blink = Math.sin(t * 0.005) > 0
  ctx.beginPath()
  ctx.arc(r * 0.15, -r * 0.2, r * 0.08, 0, Math.PI * 2)
  ctx.fillStyle = blink ? '#00FF94' : '#004422'
  ctx.fill()
  if (blink) {
    ctx.beginPath()
    ctx.arc(r * 0.15, -r * 0.2, r * 0.18, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 255, 148, 0.3)'
    ctx.fill()
  }

  ctx.restore()

  // Orbit ring
  ctx.beginPath()
  ctx.arc(x, y, r * 4.5, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.08)'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 8])
  ctx.stroke()
  ctx.setLineDash([])

  // Glow
  const glow = ctx.createRadialGradient(x, y, r, x, y, r * 2.5)
  glow.addColorStop(0, 'rgba(0, 212, 255, 0.12)')
  glow.addColorStop(1, 'rgba(0, 212, 255, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r * 2.5, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()
}

function drawProbe(ctx, x, y, r, t) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(0.3)

  // Main bus
  ctx.fillStyle = '#8090A8'
  ctx.beginPath()
  ctx.roundRect(-r * 0.25, -r * 0.6, r * 0.5, r * 1.2, r * 0.05)
  ctx.fill()
  ctx.strokeStyle = '#A0B0C8'
  ctx.lineWidth = 1
  ctx.stroke()

  // RTG (radioisotope thermoelectric generator) rods
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2
    ctx.save()
    ctx.rotate(angle)
    ctx.fillStyle = '#404858'
    ctx.fillRect(-r * 0.05, r * 0.3, r * 0.1, r * 0.8)
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(-r * 0.05, r * 0.3, r * 0.1, r * 0.15)
    ctx.restore()
  }

  // Dish
  ctx.strokeStyle = '#D0D8E8'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(0, -r * 1.1, r * 0.55, Math.PI, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, -r * 0.55)
  ctx.lineTo(0, -r * 1.1)
  ctx.stroke()

  // Status light
  const blink = Math.sin(t * 0.002) > 0.3
  ctx.beginPath()
  ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2)
  ctx.fillStyle = blink ? '#FFD700' : '#443300'
  ctx.fill()

  ctx.restore()

  // Glow
  const glow = ctx.createRadialGradient(x, y, r, x, y, r * 3)
  glow.addColorStop(0, 'rgba(255, 215, 0, 0.1)')
  glow.addColorStop(1, 'rgba(255, 215, 0, 0)')
  ctx.beginPath()
  ctx.arc(x, y, r * 3, 0, Math.PI * 2)
  ctx.fillStyle = glow
  ctx.fill()
}

function SpaceViz({ mission }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ packets: [], stars: [], nebulas: [] })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    // Initialize stars
    stateRef.current.stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.2,
      brightness: Math.random(),
      twinkle: Math.random() * Math.PI * 2,
    }))

    // Nebula clouds
    stateRef.current.nebulas = Array.from({ length: 4 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 40 + Math.random() * 60,
    }))

    stateRef.current.packets = []

    const viz = MISSION_VIZ[mission] || MISSION_VIZ.mars

    const srcX = W * 0.82
    const tgtX = W * 0.18
    const midY = H * 0.5
    const srcR = mission === 'satellite' ? 16 : mission === 'probe' ? 14 : mission === 'deepspace' ? 10 : 28
    const tgtR = 22

    const addPacket = () => {
      stateRef.current.packets.push({
        progress: 0,
        speed: 0.0025 + Math.random() * 0.0025,
        critical: Math.random() < 0.25,
        trail: [],
      })
    }

    let lastPacket = 0
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H)

      // Background nebula
      stateRef.current.nebulas.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r)
        if (mission === 'mars') {
          g.addColorStop(0, 'rgba(255, 50, 0, 0.04)')
        } else if (mission === 'satellite') {
          g.addColorStop(0, 'rgba(0, 150, 255, 0.04)')
        } else if (mission === 'lunar') {
          g.addColorStop(0, 'rgba(150, 100, 255, 0.04)')
        } else {
          g.addColorStop(0, 'rgba(255, 200, 0, 0.03)')
        }
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
      })

      // Stars
      stateRef.current.stars.forEach(s => {
        const twinkle = 0.4 + Math.sin(t * 0.001 + s.twinkle) * 0.3 + s.brightness * 0.3
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkle * 0.7})`
        ctx.fill()
      })

      // Signal line
      const lineGrad = ctx.createLinearGradient(tgtX, midY, srcX, midY)
      lineGrad.addColorStop(0, `${viz.target.color}20`)
      lineGrad.addColorStop(0.5, `${viz.packetColor}08`)
      lineGrad.addColorStop(1, `${viz.source.color}20`)
      ctx.beginPath()
      ctx.moveTo(tgtX, midY)
      ctx.lineTo(srcX, midY)
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1
      ctx.setLineDash([3, 10])
      ctx.stroke()
      ctx.setLineDash([])

      // Draw source body
      if (mission === 'mars') drawMars(ctx, srcX, midY, srcR, t)
      else if (mission === 'satellite') drawSatellite(ctx, srcX, midY, 16, t)
      else if (mission === 'lunar') drawMoon(ctx, srcX, midY, 26, t)
      else if (mission === 'deepspace') drawProbe(ctx, srcX, midY, 12, t)

      // Draw Earth (always)
      drawEarth(ctx, tgtX, midY, tgtR, t)

      // Labels
      ctx.font = '10px Space Mono'
      ctx.textAlign = 'center'
      ctx.fillStyle = `${viz.source.color}CC`
      ctx.fillText(viz.source.label, srcX, midY + (mission === 'satellite' ? 30 : srcR + 18))
      ctx.fillStyle = `${viz.target.color}CC`
      ctx.fillText(viz.target.label, tgtX, midY + tgtR + 18)

      // Packets
      if (t - lastPacket > 900) {
        addPacket()
        lastPacket = t
      }

      stateRef.current.packets = stateRef.current.packets.filter(p => p.progress <= 1)
      stateRef.current.packets.forEach(p => {
        p.progress += p.speed
        const x = srcX + (tgtX - srcX) * p.progress
        const y = midY + Math.sin(p.progress * Math.PI) * -20
        p.trail.push({ x, y })
        if (p.trail.length > 14) p.trail.shift()

        // Trail
        p.trail.forEach((pt, i) => {
          const alpha = (i / p.trail.length) * 0.5
          const col = p.critical ? `rgba(255,69,0,${alpha})` : `rgba(0,212,255,${alpha})`
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, p.critical ? 3 : 2, 0, Math.PI * 2)
          ctx.fillStyle = col
          ctx.fill()
        })

        // Packet glow
        const pSize = p.critical ? 5 : 3
        const pCol = p.critical ? '#FF4500' : viz.packetColor
        ctx.beginPath()
        ctx.arc(x, y, pSize + 4, 0, Math.PI * 2)
        ctx.fillStyle = p.critical ? 'rgba(255,69,0,0.2)' : `${viz.packetColor}22`
        ctx.fill()
        ctx.beginPath()
        ctx.arc(x, y, pSize, 0, Math.PI * 2)
        ctx.fillStyle = pCol
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [mission])

  return <canvas ref={canvasRef} className="w-full h-44 md:h-52" style={{ display: 'block' }} />
}

export default function Hero({ mission = 'mars' }) {
  const [delay, setDelay] = useState(0)
  const [chars, setChars] = useState(0)
  const viz = MISSION_VIZ[mission] || MISSION_VIZ.mars
  const headline = viz.headline
  const accentColor = viz.source.color

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

  const formatDelay = () => {
    if (viz.delay.unit === 'sec') return delay.toFixed(2)
    if (viz.delay.unit === 'hrs') return delay.toFixed(1)
    return delay.toFixed(1)
  }

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl transition-all duration-1000"
          style={{ backgroundColor: `${accentColor}06` }} />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 rounded-full bg-[#00D4FF]/4 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: `${accentColor}03` }} />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border transition-all duration-700"
          style={{ borderColor: `${accentColor}40`, backgroundColor: `${accentColor}08` }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#00FF94' }} />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8899AA]">{viz.badge}</span>
        </div>

        <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl mb-4 leading-none tracking-tight">
          <span className="text-white">
            {mission === 'mars' ? 'MARS' : mission === 'satellite' ? 'SAT' : mission === 'lunar' ? 'LUNAR' : 'DEEP'}
          </span>
          <span className="transition-colors duration-700" style={{ color: accentColor }}>AI</span>
        </h1>

        <div className="font-mono text-lg md:text-xl mb-6 h-8 terminal-cursor transition-colors duration-700"
          style={{ color: accentColor }}>
          {headline.slice(0, chars)}
        </div>

        <p className="font-body text-[#6B7E8F] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
          {mission === 'mars' && <>A rover generates <span className="text-white font-medium">gigabytes</span> daily. Only <span style={{ color: accentColor }} className="font-medium">100–300 MB</span> can reach Earth. Our AI reads the data, understands its scientific value, and decides what transmits — <span className="text-[#00FF94] font-medium">right now</span>.</>}
          {mission === 'satellite' && <>A LEO satellite collects <span className="text-white font-medium">50GB daily</span> but only sees a ground station for <span style={{ color: accentColor }} className="font-medium">10 minutes per orbit</span>. AI decides what downloads — <span className="text-[#00FF94] font-medium">right now</span>.</>}
          {mission === 'lunar' && <>Artemis base generates <span className="text-white font-medium">500MB daily</span> — ice data, moonquakes, ISRU analysis. Only <span style={{ color: accentColor }} className="font-medium">80MB</span> fits the link. AI chooses — <span className="text-[#00FF94] font-medium">right now</span>.</>}
          {mission === 'deepspace' && <>A deep space probe has <span className="text-white font-medium">4-hour signal delay</span> and only <span style={{ color: accentColor }} className="font-medium">0.04 Mbps</span> bandwidth. Each byte costs millions. AI chooses wisely — <span className="text-[#00FF94] font-medium">always</span>.</>}
        </p>

        <div className="flex items-center justify-center gap-6 md:gap-12 mb-12">
          {[
            { value: formatDelay(), unit: viz.delay.unit, label: viz.delay.label, color: accentColor },
            { value: viz.collected.value, unit: viz.collected.unit, label: viz.collected.label, color: '#00D4FF' },
            { value: viz.transmit.value, unit: viz.transmit.unit, label: viz.transmit.label, color: '#00FF94' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-6 md:gap-12">
              {i > 0 && <div className="w-px h-10 bg-[#1A2B3C]" />}
              <div className="text-center">
                <div className="font-mono text-2xl md:text-3xl font-bold transition-colors duration-700" style={{ color: stat.color }}>
                  {stat.value}<span className="text-base md:text-lg">{stat.unit}</span>
                </div>
                <div className="font-mono text-[10px] tracking-widest text-[#445566] uppercase mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mb-14">
          <a href="#demo"
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase text-white transition-all duration-300 rounded"
            style={{ backgroundColor: accentColor }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 30px ${accentColor}80`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            Live Demo →
          </a>
          <a href="#tech"
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-[#1A2B3C] text-[#6B7E8F] hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition-all duration-300 rounded">
            How It Works
          </a>
        </div>

        <div className="rounded-xl bg-[#050A14]/80 backdrop-blur-sm p-4 border transition-all duration-700"
          style={{ borderColor: `${accentColor}25` }}>
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="font-mono text-[10px] tracking-widest text-[#445566] uppercase">
              Live Transmission · {viz.source.label} → {viz.target.label}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#FF4500]">
                <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse" /> Critical
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] transition-colors duration-500"
                style={{ color: viz.packetColor }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: viz.packetColor }} /> Standard
              </span>
            </div>
          </div>
          <SpaceViz mission={mission} />
        </div>
      </div>
    </section>
  )
}