'use client'
import { useState, useEffect, useRef } from 'react'

function MarsEarthViz() {
  const canvasRef = useRef(null)
  const packetsRef = useRef([])
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const mars = { x: W * 0.82, y: H * 0.5, r: 28 }
    const earth = { x: W * 0.18, y: H * 0.5, r: 22 }

    const addPacket = (critical = false) => {
      packetsRef.current.push({
        progress: 0,
        speed: 0.003 + Math.random() * 0.003,
        critical,
        y: H * 0.5 + (Math.random() - 0.5) * 20,
        size: critical ? 4 : 2.5,
        color: critical ? '#FF4500' : '#00D4FF',
        trail: [],
      })
    }

    let lastPacket = 0
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H)

      // Connection line
      const lineGrad = ctx.createLinearGradient(earth.x, H/2, mars.x, H/2)
      lineGrad.addColorStop(0, 'rgba(0, 212, 255, 0.1)')
      lineGrad.addColorStop(0.5, 'rgba(0, 212, 255, 0.05)')
      lineGrad.addColorStop(1, 'rgba(255, 69, 0, 0.1)')
      ctx.beginPath()
      ctx.moveTo(earth.x, H/2)
      ctx.lineTo(mars.x, H/2)
      ctx.strokeStyle = lineGrad
      ctx.lineWidth = 1
      ctx.setLineDash([4, 8])
      ctx.stroke()
      ctx.setLineDash([])

      // Mars planet
      const marsGrad = ctx.createRadialGradient(mars.x - 8, mars.y - 8, 2, mars.x, mars.y, mars.r)
      marsGrad.addColorStop(0, '#FF8C42')
      marsGrad.addColorStop(0.5, '#CC3300')
      marsGrad.addColorStop(1, '#661100')
      ctx.beginPath()
      ctx.arc(mars.x, mars.y, mars.r, 0, Math.PI * 2)
      ctx.fillStyle = marsGrad
      ctx.fill()
      // Mars glow
      ctx.beginPath()
      ctx.arc(mars.x, mars.y, mars.r + 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 69, 0, 0.08)'
      ctx.fill()
      // Mars label
      ctx.font = '10px Space Mono'
      ctx.fillStyle = 'rgba(255, 140, 66, 0.8)'
      ctx.textAlign = 'center'
      ctx.fillText('MARS', mars.x, mars.y + mars.r + 18)

      // Earth planet
      const earthGrad = ctx.createRadialGradient(earth.x - 6, earth.y - 6, 2, earth.x, earth.y, earth.r)
      earthGrad.addColorStop(0, '#4FC3F7')
      earthGrad.addColorStop(0.4, '#1565C0')
      earthGrad.addColorStop(0.7, '#0D47A1')
      earthGrad.addColorStop(1, '#01132B')
      ctx.beginPath()
      ctx.arc(earth.x, earth.y, earth.r, 0, Math.PI * 2)
      ctx.fillStyle = earthGrad
      ctx.fill()
      ctx.beginPath()
      ctx.arc(earth.x, earth.y, earth.r + 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0, 212, 255, 0.06)'
      ctx.fill()
      ctx.font = '10px Space Mono'
      ctx.fillStyle = 'rgba(0, 212, 255, 0.8)'
      ctx.textAlign = 'center'
      ctx.fillText('EARTH', earth.x, earth.y + earth.r + 18)

      // Packets
      if (t - lastPacket > 800) {
        addPacket(Math.random() < 0.3)
        lastPacket = t
      }

      packetsRef.current = packetsRef.current.filter(p => p.progress <= 1)
      packetsRef.current.forEach(p => {
        p.progress += p.speed
        const x = mars.x + (earth.x - mars.x) * p.progress
        const y = H * 0.5 + Math.sin(p.progress * Math.PI) * -15

        p.trail.push({ x, y })
        if (p.trail.length > 12) p.trail.shift()

        // Trail
        p.trail.forEach((pt, i) => {
          const alpha = (i / p.trail.length) * 0.4
          ctx.beginPath()
          ctx.arc(pt.x, pt.y, p.size * 0.5, 0, Math.PI * 2)
          ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba').replace('#', 'rgba(').replace('FF4500', '255,69,0').replace('00D4FF', '0,212,255')
          ctx.fill()
        })

        // Packet dot
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        // Glow
        ctx.beginPath()
        ctx.arc(x, y, p.size + 3, 0, Math.PI * 2)
        ctx.fillStyle = p.critical ? 'rgba(255,69,0,0.3)' : 'rgba(0,212,255,0.2)'
        ctx.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    animId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-40 md:h-48"
      style={{ display: 'block' }}
    />
  )
}

export default function Hero() {
  const [delay, setDelay] = useState(0)
  const [chars, setChars] = useState(0)
  const headline = "Onboard AI decides what matters"

  useEffect(() => {
    // Animate delay counter
    const interval = setInterval(() => {
      setDelay(d => {
        const next = d + 0.3
        return next >= 22 ? 22 : next
      })
    }, 50)

    // Typewriter
    let i = 0
    const typer = setInterval(() => {
      i++
      setChars(i)
      if (i >= headline.length) clearInterval(typer)
    }, 60)

    return () => { clearInterval(interval); clearInterval(typer) }
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#FF4500]/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-[#00D4FF]/5 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl w-full mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full border border-[#FF4500]/30 bg-[#FF4500]/5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF94] animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#8899AA]">
            Mission Active — Sol 847
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl mb-4 leading-none tracking-tight">
          <span className="text-white">MARS</span>
          <span className="text-[#FF4500]">AI</span>
        </h1>

        <div className="font-mono text-[#00D4FF] text-lg md:text-xl mb-6 h-8 terminal-cursor">
          {headline.slice(0, chars)}
        </div>

        <p className="font-body text-[#6B7E8F] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-12">
          A rover generates <span className="text-white font-medium">gigabytes</span> daily.
          Only <span className="text-[#FF4500] font-medium">100–300 MB</span> can reach Earth.
          Our AI reads the data, understands its scientific value, and decides
          what transmits — <span className="text-[#00FF94] font-medium">right now</span>.
        </p>

        {/* Delay counter */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-[#FF4500]">
              {delay.toFixed(1)}<span className="text-lg">min</span>
            </div>
            <div className="font-mono text-[10px] tracking-widest text-[#445566] uppercase mt-1">
              Signal Delay
            </div>
          </div>
          <div className="w-px h-12 bg-[#1A2B3C]" />
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-[#00D4FF]">
              ~2<span className="text-lg">GB</span>
            </div>
            <div className="font-mono text-[10px] tracking-widest text-[#445566] uppercase mt-1">
              Daily Collection
            </div>
          </div>
          <div className="w-px h-12 bg-[#1A2B3C]" />
          <div className="text-center">
            <div className="font-mono text-3xl font-bold text-[#00FF94]">
              200<span className="text-lg">MB</span>
            </div>
            <div className="font-mono text-[10px] tracking-widest text-[#445566] uppercase mt-1">
              Can Transmit
            </div>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <a
            href="#demo"
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase bg-[#FF4500] text-white hover:bg-[#FF6B35] transition-all duration-300 rounded hover:shadow-[0_0_30px_rgba(255,69,0,0.5)]"
          >
            Live Demo →
          </a>
          <a
            href="#tech"
            className="px-8 py-3 font-mono text-sm tracking-widest uppercase border border-[#1A2B3C] text-[#6B7E8F] hover:border-[#00D4FF]/40 hover:text-[#00D4FF] transition-all duration-300 rounded"
          >
            How It Works
          </a>
        </div>

        {/* Mars-Earth visualization */}
        <div className="neon-border-blue rounded-xl bg-[#050A14]/60 backdrop-blur-sm p-4 scanlines">
          <div className="flex justify-between items-center mb-3 px-2">
            <span className="font-mono text-[10px] tracking-widest text-[#445566] uppercase">Live Transmission</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#FF4500]">
                <span className="w-2 h-2 rounded-full bg-[#FF4500]" /> Critical
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-[#00D4FF]">
                <span className="w-2 h-2 rounded-full bg-[#00D4FF]" /> Standard
              </span>
            </div>
          </div>
          <MarsEarthViz />
        </div>
      </div>
    </section>
  )
}
