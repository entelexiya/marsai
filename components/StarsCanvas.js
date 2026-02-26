'use client'
import { useEffect, useRef } from 'react'

export default function StarsCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.2,
      alpha: Math.random(),
      speed: Math.random() * 0.005 + 0.002,
      twinkleOffset: Math.random() * Math.PI * 2,
    }))

    // Shooting stars
    const shootingStars = []
    const addShootingStar = () => {
      if (shootingStars.length < 3 && Math.random() < 0.004) {
        shootingStars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          len: Math.random() * 80 + 40,
          speed: Math.random() * 8 + 6,
          alpha: 1,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
        })
      }
    }

    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.01

      stars.forEach(s => {
        s.alpha = 0.3 + 0.7 * Math.abs(Math.sin(t * s.speed * 10 + s.twinkleOffset))
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha})`
        ctx.fill()
      })

      addShootingStar()
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i]
        const grad = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - Math.cos(ss.angle) * ss.len,
          ss.y - Math.sin(ss.angle) * ss.len
        )
        grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`)
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)')
        ctx.beginPath()
        ctx.moveTo(ss.x, ss.y)
        ctx.lineTo(ss.x - Math.cos(ss.angle) * ss.len, ss.y - Math.sin(ss.angle) * ss.len)
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.stroke()

        ss.x += Math.cos(ss.angle) * ss.speed
        ss.y += Math.sin(ss.angle) * ss.speed
        ss.alpha -= 0.02
        if (ss.alpha <= 0) shootingStars.splice(i, 1)
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      id="stars-canvas"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
