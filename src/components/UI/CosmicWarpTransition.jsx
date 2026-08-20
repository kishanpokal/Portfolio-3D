import React, { useState, useEffect } from 'react'
import useGameStore from '../../store/useGameStore'

export default function CosmicWarpTransition() {
  const isTransitioning = useGameStore((state) => state.isTransitioning)
  const currentLocation = useGameStore((state) => state.currentLocation)
  const [animState, setAnimState] = useState('idle') // 'idle' | 'in' | 'out'

  const isGoingToGalaxy = currentLocation === 'void-island-4'
  const primaryColor = isGoingToGalaxy ? '#a855f7' : '#06b6d4'
  const secondaryColor = isGoingToGalaxy ? '#22d3ee' : '#10b981'

  useEffect(() => {
    if (isTransitioning) {
      setAnimState('in')
      const timer = setTimeout(() => {
        setAnimState('out')
      }, 520)
      return () => clearTimeout(timer)
    } else {
      setAnimState('idle')
    }
  }, [isTransitioning])

  if (animState === 'idle') return null

  const isClosing = animState === 'in'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* ─── 1. Iris Void Wipe (Snappy Camera Aperture) ─── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 50%, #0d061f 0%, #03010a 70%, #000000 100%)',
          clipPath: isClosing
            ? 'circle(150% at 50% 50%)'
            : 'circle(0% at 50% 50%)',
          transition: isClosing
            ? 'clip-path 0.45s cubic-bezier(0.7, 0, 0.2, 1)'
            : 'clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ─── 2. Cosmic Stargate Vortex Rays (Rotating Energy Tunnel) ─── */}
      <div
        style={{
          position: 'absolute',
          width: '100vmax',
          height: '100vmax',
          opacity: isClosing ? 0.85 : 0,
          transform: isClosing ? 'scale(1.1) rotate(60deg)' : 'scale(0.3) rotate(0deg)',
          transition: 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          background: `conic-gradient(from 0deg at 50% 50%, 
            transparent 0deg, 
            ${primaryColor}33 30deg, 
            transparent 60deg, 
            ${secondaryColor}44 120deg, 
            transparent 160deg, 
            ${primaryColor}33 220deg, 
            transparent 270deg, 
            ${secondaryColor}44 330deg, 
            transparent 360deg
          )`,
          filter: 'blur(20px)',
          animation: 'vortexSpin 4s linear infinite',
        }}
      />

      {/* ─── 3. Dual Counter-Rotating Stargate Energy Rings ─── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isClosing ? 1 : 0,
          transform: isClosing ? 'scale(1)' : 'scale(1.35)',
          transition: 'all 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Outer Dashed Glowing Energy Ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `2px dashed ${primaryColor}`,
              boxShadow: `0 0 35px ${primaryColor}88, inset 0 0 25px ${secondaryColor}44`,
              animation: 'ringSpinClockwise 3s linear infinite',
            }}
          />

          {/* Inner Counter-Rotating Hex Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '18px',
              borderRadius: '50%',
              border: `1.5px solid ${secondaryColor}`,
              boxShadow: `0 0 20px ${secondaryColor}aa`,
              animation: 'ringSpinCounter 2s linear infinite',
            }}
          />

          {/* Center Dimensional Singularity Core */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: `0 0 30px #ffffff, 0 0 60px ${primaryColor}`,
              animation: 'corePulse 0.8s ease-in-out infinite alternate',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000',
              fontWeight: 900,
              fontSize: '14px',
            }}
          >
            ✦
          </div>
        </div>

        {/* ─── 4. Sleek Futuristic Warp HUD Title ─── */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 800,
              letterSpacing: '8px',
              textTransform: 'uppercase',
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, sans-serif",
              textShadow: `0 0 20px ${primaryColor}, 0 0 40px ${secondaryColor}`,
              paddingLeft: '8px',
            }}
          >
            {isGoingToGalaxy ? 'SKILL GALAXY' : 'BASECAMP'}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span style={{ width: '20px', height: '1px', background: primaryColor }} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: secondaryColor,
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {isGoingToGalaxy ? '✦ DIMENSION WARP ✦' : '✦ RETURNING TO REALM ✦'}
            </span>
            <span style={{ width: '20px', height: '1px', background: primaryColor }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes vortexSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringSpinClockwise {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ringSpinCounter {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes corePulse {
          0% { transform: scale(0.9); filter: drop-shadow(0 0 15px #fff); }
          100% { transform: scale(1.15); filter: drop-shadow(0 0 35px #fff); }
        }
      `}</style>
    </div>
  )
}
