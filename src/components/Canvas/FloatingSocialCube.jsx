import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { socialLinks, cubePositions } from '../../data/socialLinks'
import useGameStore from '../../store/useGameStore'

// ─── 1024×1024 High-DPI Procedural Face Textures ───────────────
// Creates crisp, perfectly-centered face textures for each side of the 3D cube

function createFaceTexture(type, side = 'side') {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1024
  const ctx = canvas.getContext('2d')

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  if (type === 'github') {
    renderGitHubFace(ctx, side)
  } else if (type === 'linkedin') {
    renderLinkedInFace(ctx, side)
  } else if (type === 'instagram') {
    renderInstagramFace(ctx, side)
  } else if (type === 'email') {
    renderEmailFace(ctx, side)
  } else if (type === 'resume') {
    renderResumeFace(ctx, side)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.needsUpdate = true
  return texture
}

// ─── 1. GitHub Face ───────────────────────────────────────────
function renderGitHubFace(ctx) {
  // Dark metallic background
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024)
  bgGrad.addColorStop(0, '#0a0d14')
  bgGrad.addColorStop(0.5, '#161b26')
  bgGrad.addColorStop(1, '#0a0d14')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1024)

  // Inset rounded border
  const borderGrad = ctx.createLinearGradient(120, 120, 904, 904)
  borderGrad.addColorStop(0, '#c084fc')
  borderGrad.addColorStop(0.5, '#ffffff')
  borderGrad.addColorStop(1, '#7c3aed')
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.roundRect(120, 120, 784, 784, 100)
  ctx.stroke()

  // Inner purple ambient glow
  const glow = ctx.createRadialGradient(512, 512, 60, 512, 512, 420)
  glow.addColorStop(0, 'rgba(168, 85, 247, 0.4)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 1024)

  // Centered Official GitHub Invertocat Vector (24x24 viewBox)
  ctx.save()
  const iconSize = 420
  ctx.translate(512 - iconSize / 2, 512 - iconSize / 2)
  const scale = iconSize / 24
  ctx.scale(scale, scale)

  const p = new Path2D(
    'M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 ' +
    '0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-' +
    '.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.' +
    '105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-' +
    '.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-' +
    '1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 ' +
    '5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A' +
    '12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z'
  )
  ctx.fillStyle = '#ffffff'
  ctx.fill(p)
  ctx.restore()
}

// ─── 2. LinkedIn Face ──────────────────────────────────────────
function renderLinkedInFace(ctx) {
  // Official LinkedIn Blue gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024)
  bgGrad.addColorStop(0, '#0077b5')
  bgGrad.addColorStop(0.5, '#005885')
  bgGrad.addColorStop(1, '#003d5c')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1024)

  // Inset cyan border
  const borderGrad = ctx.createLinearGradient(120, 120, 904, 904)
  borderGrad.addColorStop(0, '#7dd3fc')
  borderGrad.addColorStop(0.5, '#ffffff')
  borderGrad.addColorStop(1, '#0284c7')
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.roundRect(120, 120, 784, 784, 100)
  ctx.stroke()

  // Radial sheen
  const glow = ctx.createRadialGradient(512, 380, 50, 512, 512, 420)
  glow.addColorStop(0, 'rgba(255, 255, 255, 0.35)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 1024)

  // Centered Official LinkedIn "in" (24x24 viewBox)
  ctx.save()
  const iconSize = 410
  ctx.translate(512 - iconSize / 2, 512 - iconSize / 2)
  const scale = iconSize / 24
  ctx.scale(scale, scale)

  const p = new Path2D(
    'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-' +
    '2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-' +
    '1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 ' +
    '0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'
  )
  ctx.fillStyle = '#ffffff'
  ctx.fill(p)
  ctx.restore()
}

// ─── 3. Instagram Face ─────────────────────────────────────────
function renderInstagramFace(ctx) {
  // Official Instagram 45-degree sunset gradient
  const bgGrad = ctx.createLinearGradient(0, 1024, 1024, 0)
  bgGrad.addColorStop(0, '#ffbe40')
  bgGrad.addColorStop(0.25, '#f54452')
  bgGrad.addColorStop(0.55, '#e1306c')
  bgGrad.addColorStop(0.8, '#c13584')
  bgGrad.addColorStop(1, '#833ab4')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1024)

  // Inset white-gold border
  const borderGrad = ctx.createLinearGradient(120, 120, 904, 904)
  borderGrad.addColorStop(0, '#ffffff')
  borderGrad.addColorStop(0.5, '#fbcfe8')
  borderGrad.addColorStop(1, '#fef08a')
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.roundRect(120, 120, 784, 784, 100)
  ctx.stroke()

  // Centered Official Instagram Camera Glyph (24x24 viewBox)
  ctx.save()
  const iconSize = 410
  ctx.translate(512 - iconSize / 2, 512 - iconSize / 2)
  const scale = iconSize / 24
  ctx.scale(scale, scale)

  const p = new Path2D(
    'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.' +
    '069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.' +
    '07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-' +
    '.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 ' +
    '4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 ' +
    '1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 ' +
    '4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-' +
    '4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-' +
    '4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-' +
    '6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 ' +
    '1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.' +
    '795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z'
  )
  ctx.fillStyle = '#ffffff'
  ctx.fill(p)
  ctx.restore()
}

// ─── 4. Email Face ─────────────────────────────────────────────
function renderEmailFace(ctx) {
  // Deep emerald gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024)
  bgGrad.addColorStop(0, '#044e3a')
  bgGrad.addColorStop(0.5, '#065f46')
  bgGrad.addColorStop(1, '#022c22')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1024)

  // Inset emerald border
  const borderGrad = ctx.createLinearGradient(120, 120, 904, 904)
  borderGrad.addColorStop(0, '#6ee7b7')
  borderGrad.addColorStop(0.5, '#ffffff')
  borderGrad.addColorStop(1, '#10b981')
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.roundRect(120, 120, 784, 784, 100)
  ctx.stroke()

  // Glow
  const glow = ctx.createRadialGradient(512, 512, 60, 512, 512, 420)
  glow.addColorStop(0, 'rgba(52, 211, 153, 0.45)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 1024)

  // Centered Vector Mail Envelope Icon (24x24 viewBox)
  ctx.save()
  const iconSize = 410
  ctx.translate(512 - iconSize / 2, 512 - iconSize / 2)
  const scale = iconSize / 24
  ctx.scale(scale, scale)

  const p = new Path2D(
    'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 ' +
    '4l-8 5-8-5V6l8 5 8-5v2z'
  )
  ctx.fillStyle = '#ffffff'
  ctx.fill(p)
  ctx.restore()
}

// ─── 5. Resume Face ────────────────────────────────────────────
function renderResumeFace(ctx) {
  // Golden Amber gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 1024)
  bgGrad.addColorStop(0, '#78350f')
  bgGrad.addColorStop(0.5, '#92400e')
  bgGrad.addColorStop(1, '#451a03')
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, 1024, 1024)

  // Inset gold-white border
  const borderGrad = ctx.createLinearGradient(120, 120, 904, 904)
  borderGrad.addColorStop(0, '#fde68a')
  borderGrad.addColorStop(0.5, '#ffffff')
  borderGrad.addColorStop(1, '#f59e0b')
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 26
  ctx.beginPath()
  ctx.roundRect(120, 120, 784, 784, 100)
  ctx.stroke()

  // Glow
  const glow = ctx.createRadialGradient(512, 512, 60, 512, 512, 420)
  glow.addColorStop(0, 'rgba(251, 191, 36, 0.45)')
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, 1024, 1024)

  // Centered Vector Document / CV Icon (24x24 viewBox)
  ctx.save()
  const iconSize = 410
  ctx.translate(512 - iconSize / 2, 512 - iconSize / 2)
  const scale = iconSize / 24
  ctx.scale(scale, scale)

  const p = new Path2D(
    'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 ' +
    '16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
  )
  ctx.fillStyle = '#ffffff'
  ctx.fill(p)
  ctx.restore()
}

// ─── Reusable temp vectors ─────────────────────────────────────
const _targetScale = new THREE.Vector3()
const _cubeWorldPos = new THREE.Vector3()

// ─── Social Cubes Group ────────────────────────────────────────

export default function SocialCubesGroup({ islandCenter = [38, 0, 0] }) {
  const cubeRefs = useRef([])
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [proximityIndex, setProximityIndex] = useState(null)
  const setContactModalOpen = useGameStore(s => s.setContactModalOpen)

  const activeIndex = hoveredIndex !== null ? hoveredIndex : proximityIndex

  // Create 6-material arrays for each social cube (all 6 faces: Right, Left, Top, Bottom, Front, Back)
  const cubeMaterials = useMemo(() => {
    return socialLinks.map(link => {
      const tex = createFaceTexture(link.type)
      // Return array of 6 materials for the 6 faces of the cube
      return Array.from({ length: 6 }, () => new THREE.MeshPhysicalMaterial({
        map: tex,
        metalness: 0.25,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        emissive: link.color,
        emissiveIntensity: 0.25,
      }))
    })
  }, [])

  const handleAction = useCallback((link) => {
    if (!link) return
    if (link.type === 'email') {
      document.exitPointerLock()
      setContactModalOpen(true)
    } else {
      // Opens GitHub, LinkedIn, Instagram, and Resume PDF in a new tab for direct viewing
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }, [setContactModalOpen])

  // "Press [E]" Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'KeyE' || e.key === 'e' || e.key === 'E') {
        if (activeIndex !== null && socialLinks[activeIndex]) {
          handleAction(socialLinks[activeIndex])
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, handleAction])

  // Animation + Proximity Detection Loop
  useFrame((state) => {
    const t = state.clock.elapsedTime
    let closestIndex = null
    let minDistance = 3.6

    cubeRefs.current.forEach((ref, i) => {
      if (!ref) return

      _cubeWorldPos.set(
        islandCenter[0] + cubePositions[i][0],
        cubePositions[i][1] - 1.0,
        islandCenter[2] + cubePositions[i][2]
      )
      const dist = state.camera.position.distanceTo(_cubeWorldPos)
      if (dist < minDistance) {
        minDistance = dist
        closestIndex = i
      }

      const isCurrentActive = (hoveredIndex === i || proximityIndex === i)
      const baseY = cubePositions[i][1]
      ref.position.y = baseY + Math.sin(t * 2.0 + i * 1.3) * 0.08

      // Continuous 3D spin (slow & smooth, accelerates on active)
      const spinSpeed = isCurrentActive ? 0.016 : 0.005
      ref.rotation.y += spinSpeed
      ref.rotation.x = Math.sin(t * 1.4 + i * 0.8) * 0.04

      // Scale up when active
      const targetScale = isCurrentActive ? 1.25 : 1.0
      ref.scale.lerp(_targetScale.set(targetScale, targetScale, targetScale), 0.1)

      // Update emissive glow on all 6 materials dynamically
      if (cubeMaterials[i]) {
        const targetEmissive = isCurrentActive ? 0.85 : 0.25
        cubeMaterials[i].forEach(mat => {
          mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.1)
        })
      }
    })

    if (closestIndex !== proximityIndex) {
      setProximityIndex(closestIndex)
    }
  })

  return (
    <group position={islandCenter}>
      {socialLinks.map((link, i) => {
        const isCurrentActive = (activeIndex === i)

        return (
          <group key={link.id} position={[cubePositions[i][0], 0, cubePositions[i][2]]}>

            {/* Glowing energy ring on top of the stone pillar */}
            <mesh position={[0, 1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.38, 0.52, 32]} />
              <meshBasicMaterial
                color={link.color}
                transparent
                opacity={isCurrentActive ? 0.95 : 0.45}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Bright point light illuminating the cube & pillar */}
            <pointLight
              position={[0, cubePositions[i][1], 0]}
              color={link.color}
              intensity={isCurrentActive ? 4.8 : 1.8}
              distance={5}
            />

            {/* The 6-Sided Multi-Material 3D Floating Cube */}
            <group
              ref={el => { cubeRefs.current[i] = el }}
              position={[0, cubePositions[i][1], 0]}
            >
              <mesh
                material={cubeMaterials[i]}
                castShadow
                onClick={(e) => {
                  e.stopPropagation()
                  handleAction(link)
                }}
                onPointerOver={(e) => {
                  e.stopPropagation()
                  setHoveredIndex(i)
                  document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                  setHoveredIndex(null)
                  document.body.style.cursor = 'auto'
                }}
              >
                {/* Clean box geometry: all 6 faces mapped independently */}
                <boxGeometry args={[0.62, 0.62, 0.62]} />

                {/* Glowing neon edge accents */}
                <Edges
                  threshold={15}
                  color={link.color}
                  lineWidth={1.5}
                />
              </mesh>

              {/* ── High-Contrast Floating 3D Text Badge ── */}
              <group position={[0, 0.62, 0]}>
                {/* Title */}
                <Text
                  position={[0, isCurrentActive ? 0.18 : 0, 0]}
                  fontSize={isCurrentActive ? 0.18 : 0.16}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  outlineWidth={0.03}
                  outlineColor="#000000"
                >
                  {link.label}
                </Text>

                {/* Bright "[E] Action" prompt when active */}
                {isCurrentActive && (
                  <Text
                    position={[0, -0.05, 0]}
                    fontSize={0.14}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.035}
                    outlineColor={link.color}
                  >
                    {link.type === 'email'
                      ? '[E] Send Message'
                      : link.type === 'resume'
                      ? '[E] View Resume ↗'
                      : `[E] Open ${link.label} ↗`}
                  </Text>
                )}
              </group>
            </group>
          </group>
        )
      })}
    </group>
  )
}
