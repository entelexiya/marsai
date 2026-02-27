'use client'
import { useState, useEffect } from 'react'

export const MISSIONS = {
  mars: {
    id: 'mars',
    name: 'Mars Rover',
    shortName: 'MARS',
    emoji: '🔴',
    description: 'Perseverance — Jezero Crater',
    color: '#FF4500',
    glowColor: '#FF450033',
    delayRange: '3 – 22 min',
    bandwidthRange: '0.1 – 6 Mbps',
    dataPerDay: '~2 GB',
    canTransmit: '200 MB',
    fileTypes: ['IMG', 'CHEM', 'ATM', 'SEISM', 'PIXL'],
    accent: 'from-[#FF4500]/20 to-transparent',
    stats: { delay: 13, bandwidth: 2.0, dataRatio: '10x' },
  },
  satellite: {
    id: 'satellite',
    name: 'Earth Satellite',
    shortName: 'LEO SAT',
    emoji: '🛰️',
    description: 'Low Earth Orbit — 400km',
    color: '#00D4FF',
    glowColor: '#00D4FF33',
    delayRange: '0.01 – 0.05 sec',
    bandwidthRange: '10 – 150 Mbps',
    dataPerDay: '~50 GB',
    canTransmit: '8 GB',
    fileTypes: ['SAR', 'OPT', 'RADAR', 'THERMAL', 'MULTISPECT'],
    accent: 'from-[#00D4FF]/20 to-transparent',
    stats: { delay: 0.03, bandwidth: 45.0, dataRatio: '6x' },
  },
  lunar: {
    id: 'lunar',
    name: 'Lunar Mission',
    shortName: 'LUNAR',
    emoji: '🌙',
    description: 'Artemis Base Camp — South Pole',
    color: '#C8B8FF',
    glowColor: '#C8B8FF33',
    delayRange: '1.2 – 1.4 sec',
    bandwidthRange: '1 – 20 Mbps',
    dataPerDay: '~500 MB',
    canTransmit: '80 MB',
    fileTypes: ['IMG', 'DRILL', 'SEISM', 'RADAR', 'THERMAL'],
    accent: 'from-[#C8B8FF]/20 to-transparent',
    stats: { delay: 1.3, bandwidth: 8.0, dataRatio: '6x' },
  },
  deepspace: {
    id: 'deepspace',
    name: 'Deep Space',
    shortName: 'DEEP',
    emoji: '🚀',
    description: 'Voyager-class — 20+ AU',
    color: '#FFD700',
    glowColor: '#FFD70033',
    delayRange: '1 – 8 hours',
    bandwidthRange: '0.001 – 0.1 Mbps',
    dataPerDay: '~10 MB',
    canTransmit: '1 MB',
    fileTypes: ['PLASMA', 'MAG', 'COSMIC', 'RADIO', 'PARTICLE'],
    accent: 'from-[#FFD700]/20 to-transparent',
    stats: { delay: 240, bandwidth: 0.04, dataRatio: '10x' },
  },
}

export default function MissionSelector({ selected, onChange }) {
  const [hovered, setHovered] = useState(null)

  const mission = MISSIONS[selected]

  return (
    <div className="relative py-16 px-6">
      {/* Background glow for selected mission */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${mission.glowColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase" style={{ color: mission.color }}>
            Mission Control
          </span>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${mission.color}40, transparent)` }} />
        </div>

        <div className="text-center mb-10">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white mb-3">
            Select Your <span style={{ color: mission.color }}>Mission</span>
          </h2>
          <p className="text-[#6B7E8F] text-base">
            The AI adapts to every mission's unique bandwidth constraints
          </p>
        </div>

        {/* Mission tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {Object.values(MISSIONS).map((m) => (
            <button
              key={m.id}
              onClick={() => onChange(m.id)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative rounded-xl p-4 border transition-all duration-300 text-left group"
              style={{
                borderColor: selected === m.id ? m.color : hovered === m.id ? `${m.color}60` : '#1A2B3C',
                backgroundColor: selected === m.id ? `${m.color}10` : hovered === m.id ? `${m.color}05` : '#050A14',
                boxShadow: selected === m.id ? `0 0 20px ${m.color}20, inset 0 0 20px ${m.color}08` : 'none',
              }}
            >
              {selected === m.id && (
                <div
                  className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: m.color }}
                />
              )}
              <div className="text-2xl mb-2">{m.emoji}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: m.color }}>
                {m.shortName}
              </div>
              <div className="font-display font-bold text-white text-sm mb-1">{m.name}</div>
              <div className="font-mono text-[10px] text-[#445566]">{m.description}</div>
            </button>
          ))}
        </div>

        {/* Selected mission stats */}
        <div
          className="rounded-xl p-6 border transition-all duration-500"
          style={{
            borderColor: `${mission.color}30`,
            backgroundColor: `${mission.color}05`,
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Signal Delay', value: mission.delayRange, icon: '📡' },
              { label: 'Bandwidth', value: mission.bandwidthRange, icon: '⚡' },
              { label: 'Daily Collection', value: mission.dataPerDay, icon: '💾' },
              { label: 'Can Transmit', value: mission.canTransmit, icon: '📤' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="font-mono font-bold text-sm mb-1" style={{ color: mission.color }}>
                  {stat.value}
                </div>
                <div className="font-mono text-[10px] text-[#445566] uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#1A2B3C]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#445566]">
                Data types: {mission.fileTypes.join(' · ')}
              </span>
              <span
                className="font-mono text-xs px-3 py-1 rounded-full"
                style={{ backgroundColor: `${mission.color}15`, color: mission.color, border: `1px solid ${mission.color}30` }}
              >
                {mission.dataRatio} more data than bandwidth
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
