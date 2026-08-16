import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Clone, Cloud, Clouds, Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { islandBlueprint } from '../../data/islandBlueprint'
import useGameStore from '../../store/useGameStore'

// Constants
const PLATFORM_Y = -1
const B = '/models/'
const DAY_CYCLE = 720 // 12 minutes full cycle

// Spawn point near the tent
export const ISLAND_SPAWN = [-3, 5, -1]
// Fall threshold
export const FALL_THRESHOLD = -30

// Helper hook: returns dayTime (0-1), respects alwaysDay, synced with real-world time
function useDayProgress() {
  const alwaysDay = useGameStore(s => s.alwaysDay)

  // Sync initial time with user's real local time of day!
  const timeOffset = useMemo(() => {
    const now = new Date()
    const currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
    // Map 24h clock: 6:00 AM = 0.0 (sunrise), 12:00 PM = 0.25 (noon), 6:00 PM = 0.5 (sunset), 12:00 AM = 0.75 (midnight)
    const normalized = ((currentSeconds / 86400) - (6 / 24) + 1) % 1
    return normalized * DAY_CYCLE
  }, [])

  return (elapsedTime) => {
    if (alwaysDay) return 0.25 // noon
    return ((elapsedTime + timeOffset) % DAY_CYCLE) / DAY_CYCLE
  }
}

// ─── Shared Textures ──────────────────────────────────────────

function makeCircleTexture(size = 32) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

function makeRainTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 4
  canvas.height = 32
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createLinearGradient(2, 0, 2, 32)
  gradient.addColorStop(0, 'rgba(180,210,255,0)')
  gradient.addColorStop(0.3, 'rgba(180,210,255,0.8)')
  gradient.addColorStop(1, 'rgba(180,210,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 4, 32)
  return new THREE.CanvasTexture(canvas)
}

function makeSnowTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 16
  canvas.height = 16
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(240,245,255,0.8)')
  gradient.addColorStop(1, 'rgba(220,230,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 16, 16)
  return new THREE.CanvasTexture(canvas)
}

// ─── Sky Shader ────────────────────────────────────────────────

const skyVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragmentShader = `
  varying vec3 vWorldPosition;
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform vec3 sunColor;
  uniform vec3 sunPosition;
  uniform float weatherDarken;
  
  void main() {
    vec3 dir = normalize(vWorldPosition);
    vec3 sunDir = normalize(sunPosition);
    
    float h = smoothstep(-0.2, 0.4, dir.y);
    vec3 skyColor = mix(bottomColor, topColor, h);
    
    // Only show sun glow when sun is near or above the horizon (not at night)
    float sunAboveHorizon = smoothstep(-30.0, 60.0, sunPosition.y);
    float sunDist = distance(dir, sunDir);
    float glow = smoothstep(0.4, 0.0, sunDist) * sunAboveHorizon;
    skyColor = mix(skyColor, sunColor, glow * 0.5);
    
    skyColor = mix(skyColor, skyColor * 0.4, weatherDarken);
    
    gl_FragColor = vec4(skyColor, 1.0);
  }
`

// ─── Background Sky ────────────────────────────────────────────

export function BackgroundSky({ weather }) {
  const materialRef = useRef()
  const getDayProgress = useDayProgress()

  const uniforms = useMemo(() => ({
    topColor: { value: new THREE.Color('#1a0533') },
    bottomColor: { value: new THREE.Color('#ff6b35') },
    sunColor: { value: new THREE.Color('#ffaa55') },
    sunPosition: { value: new THREE.Vector3(0, 400, -400) },
    weatherDarken: { value: 0.0 }
  }), [])

  useFrame((state, delta) => {
    if (!materialRef.current) return
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const angle = dayTime * Math.PI * 2
    const sunY = Math.sin(angle) * 500

    // Weather darken — subtle stormy tint instead of pitch black
    const targetDarken = weather === 'rainy' ? 0.45 : weather === 'snowy' ? 0.2 : 0.0
    materialRef.current.uniforms.weatherDarken.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.weatherDarken.value, targetDarken, delta * 0.5
    )
    
    // Sun position for shader glow (match actual sun orbit)
    materialRef.current.uniforms.sunPosition.value.set(0, sunY, -Math.cos(angle) * 500)

    // Sky colors based on sun height — smooth lerp
    const lerpSpeed = 0.02

    // Sun glow color — smoothly fades to black as sun sets below horizon
    const targetSunColor = sunY > 50 
      ? new THREE.Color('#ffaa55') 
      : (sunY > -20 ? new THREE.Color('#ff5522') : new THREE.Color('#000000'))
    materialRef.current.uniforms.sunColor.value.lerp(targetSunColor, lerpSpeed)

    if (sunY > 150) {
      // Full day — blue sky
      materialRef.current.uniforms.topColor.value.lerp(new THREE.Color('#3a85ff'), lerpSpeed)
      materialRef.current.uniforms.bottomColor.value.lerp(new THREE.Color('#87bfff'), lerpSpeed)
    } else if (sunY > 0) {
      // Golden hour / sunset
      const t = sunY / 150
      const goldenTop = new THREE.Color('#1a2a66').lerp(new THREE.Color('#3a85ff'), t)
      const goldenBot = new THREE.Color('#ff6b35').lerp(new THREE.Color('#87bfff'), t)
      materialRef.current.uniforms.topColor.value.lerp(goldenTop, lerpSpeed)
      materialRef.current.uniforms.bottomColor.value.lerp(goldenBot, lerpSpeed)
    } else if (sunY > -100) {
      // Twilight
      materialRef.current.uniforms.topColor.value.lerp(new THREE.Color('#0a0a20'), lerpSpeed)
      materialRef.current.uniforms.bottomColor.value.lerp(new THREE.Color('#1a0533'), lerpSpeed)
    } else {
      // Deep night — clean dark cosmic void
      materialRef.current.uniforms.topColor.value.lerp(new THREE.Color('#020208'), lerpSpeed)
      materialRef.current.uniforms.bottomColor.value.lerp(new THREE.Color('#050110'), lerpSpeed)
    }
  })

  return (
    <mesh scale={[-500, -500, -500]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial 
        ref={materialRef}
        vertexShader={skyVertexShader}
        fragmentShader={skyFragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── Stars & Galaxy ────────────────────────────────────────────

const starVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  attribute float aTwinkleSpeed;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uTime;
  uniform float uOpacity;

  void main() {
    vColor = aColor;
    
    // Multi-rate twinkling
    float tw = sin(uTime * aTwinkleSpeed + aPhase) * 0.5 + 0.5;
    float dynamicSize = aSize * (0.75 + 0.5 * tw);
    vAlpha = (0.4 + 0.6 * tw) * uOpacity;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = dynamicSize * (350.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.5, 32.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`

const starFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;
    
    // Core + glowing halo
    float core = smoothstep(0.5, 0.0, dist);
    float glow = exp(-dist * 4.5);
    float alpha = (core * 0.6 + glow * 0.4) * vAlpha;
    
    gl_FragColor = vec4(vColor * 1.35, alpha);
  }
`

export function Stars({ weather }) {
  const getDayProgress = useDayProgress()
  const starCount = 8000

  const { positions, sizes, colors, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(starCount * 3)
    const sz = new Float32Array(starCount)
    const col = new Float32Array(starCount * 3)
    const ph = new Float32Array(starCount)
    const sp = new Float32Array(starCount)

    // Palette: white, cyan, gold, soft violet, bright amber
    const palette = [
      [1.0, 1.0, 1.0],      // Pure White
      [0.75, 0.9, 1.0],     // Cyan/Blue
      [1.0, 0.88, 0.65],    // Warm Gold
      [0.9, 0.75, 1.0],     // Soft Violet
      [0.6, 0.85, 1.0],     // Deep Celestial Blue
      [1.0, 0.95, 0.85],    // Diamond White
    ]

    for (let i = 0; i < starCount; i++) {
      const isGalaxy = Math.random() > 0.2 // 80% of stars form Milky Way
      const theta = 2 * Math.PI * Math.random()
      let phi = Math.acos(2 * Math.random() - 1)

      if (isGalaxy) {
        // Gaussian-like concentration along galactic equator
        const spread = (Math.random() - 0.5) * 0.32 * Math.random()
        phi = Math.PI / 2 + spread
      }

      const r = 380 + Math.random() * 120
      let x = r * Math.sin(phi) * Math.cos(theta)
      let y = r * Math.sin(phi) * Math.sin(theta)
      let z = r * Math.cos(phi)

      // Tilt the galaxy band across the night sky (~35 deg)
      if (isGalaxy) {
        const tilt = 0.58
        const newX = x * Math.cos(tilt) - y * Math.sin(tilt)
        const newY = x * Math.sin(tilt) + y * Math.cos(tilt)
        x = newX
        y = newY
      }

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      // Color selection
      let colorSample
      if (isGalaxy && Math.random() > 0.6) {
        // Galaxy core has rich cyan / violet hues
        colorSample = Math.random() > 0.5 ? palette[1] : palette[3]
      } else {
        colorSample = palette[Math.floor(Math.random() * palette.length)]
      }
      col[i * 3] = colorSample[0]
      col[i * 3 + 1] = colorSample[1]
      col[i * 3 + 2] = colorSample[2]

      // Varied star sizes
      if (Math.random() > 0.97) {
        sz[i] = 4.5 + Math.random() * 3.5 // Radiant hero stars / planets
      } else if (isGalaxy && Math.random() > 0.8) {
        sz[i] = 2.5 + Math.random() * 1.8 // Medium bright galactic stars
      } else {
        sz[i] = 1.0 + Math.random() * 1.2 // Fine stardust
      }

      ph[i] = Math.random() * Math.PI * 2
      sp[i] = 0.5 + Math.random() * 2.5
    }

    return { positions: pos, sizes: sz, colors: col, phases: ph, speeds: sp }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0 }
  }), [])

  const matRef = useRef()

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const sunY = Math.sin(dayTime * Math.PI * 2) * 500

    if (matRef.current) {
      matRef.current.uniforms.uTime.value = time
      
      let targetOpacity = 0
      if (sunY > 150) {
        targetOpacity = 0 // Day
      } else if (sunY > 0) {
        targetOpacity = Math.min(0.85, (150 - sunY) / 180) // Sunset emergence
      } else {
        targetOpacity = 0.95 // Deep night
      }

      if (weather === 'rainy') targetOpacity *= 0.15
      else if (weather === 'snowy') targetOpacity *= 0.35

      matRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        matRef.current.uniforms.uOpacity.value,
        targetOpacity,
        0.03
      )
    }
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={starCount} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={starCount} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={starCount} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aPhase" count={starCount} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aTwinkleSpeed" count={starCount} array={speeds} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial
        ref={matRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ─── Sun ───────────────────────────────────────────────────────

export function IslandSun({ weather }) {
  const sunLightRef = useRef()
  const pointLightRef = useRef()
  const groupRef = useRef()
  const matRef = useRef()
  const getDayProgress = useDayProgress()

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const angle = dayTime * Math.PI * 2
    const sunY = Math.sin(angle) * 500

    if (groupRef.current) {
      groupRef.current.position.set(0, sunY, -Math.cos(angle) * 500)
    }

    // Fade out sun sphere when below horizon
    const isNight = sunY < -50
    if (matRef.current) {
      const targetOpacity = weather === 'rainy' ? 0.1 : (isNight ? 0 : 1.0)
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 2)
    }

    if (pointLightRef.current) {
      const targetPoint = isNight ? 0.0 : (weather === 'rainy' ? 0.3 : 2.0)
      pointLightRef.current.intensity = THREE.MathUtils.lerp(pointLightRef.current.intensity, targetPoint, delta * 2)
    }

    if (sunLightRef.current) {
      let targetIntensity = 0.0
      if (!isNight) {
        targetIntensity = weather === 'rainy' ? 0.6 : (weather === 'snowy' ? 0.9 : 1.5)
      }
      sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, targetIntensity, delta * 1.5)
    }
  })

  return (
    <group ref={groupRef} position={[0, 400, -400]}>
      <mesh>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial ref={matRef} color="#ff9933" transparent opacity={1.0} />
      </mesh>
      <pointLight ref={pointLightRef} color="#ff8833" intensity={2} distance={1200} decay={1} />
      <directionalLight ref={sunLightRef} color={weather === 'rainy' ? '#88aacc' : '#ffeedd'} intensity={1.5} castShadow />
    </group>
  )
}

// ─── Moon ──────────────────────────────────────────────────────

export function IslandMoon({ weather }) {
  const moonLightRef = useRef()
  const groupRef = useRef()
  const matRef = useRef()
  const getDayProgress = useDayProgress()

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const angle = dayTime * Math.PI * 2 + Math.PI

    if (groupRef.current) {
      groupRef.current.position.set(0, Math.sin(angle) * 500, -Math.cos(angle) * 500)
    }

    if (matRef.current) {
      const moonY = Math.sin(angle) * 500
      const targetOpacity = weather === 'rainy' ? 0.3 : (moonY < -50 ? 0 : 0.8)
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 2)
    }

    if (moonLightRef.current) {
      const moonY = Math.sin(angle) * 500
      const isDay = moonY < -50
      // During night rain, keep moonlight active for visibility
      let targetIntensity = 0.0
      if (!isDay) {
        targetIntensity = weather === 'rainy' ? 0.4 : 0.6
      }
      moonLightRef.current.intensity = THREE.MathUtils.lerp(moonLightRef.current.intensity, targetIntensity, delta * 1.5)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial ref={matRef} color="#ddeeff" transparent opacity={0.8} />
      </mesh>
      <directionalLight ref={moonLightRef} color="#aaccff" intensity={0.6} castShadow />
    </group>
  )
}

// ─── Wind Lines (Anime-style) ──────────────────────────────────

function WindLeaves() {
  const lineCount = 120
  const meshRef = useRef()
  const materialRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const lines = useMemo(() => {
    return Array.from({ length: lineCount }).map(() => {
      // Random direction angle for each wind line (not all going same way)
      const angle = -0.3 + Math.random() * 0.6 // slight spread around main direction
      return {
        x: (Math.random() - 0.5) * 200,
        y: Math.random() * 25 + PLATFORM_Y,
        z: (Math.random() - 0.5) * 200,
        speed: 0.15 + Math.random() * 0.5,
        seed: Math.random() * Math.PI * 2,
        dirX: Math.cos(angle),
        dirZ: Math.sin(angle),
        waveAmp: 0.5 + Math.random() * 2.5,     // how much it curves
        waveFreq: 0.05 + Math.random() * 0.1,    // how tight the curves are
        length: 1.5 + Math.random() * 2.5,       // varied line lengths
        thickness: 0.02 + Math.random() * 0.04,  // varied thickness
      }
    })
  }, [])

  // Create a tapered wind line texture
  const windTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 4
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 2, 64, 2)
    gradient.addColorStop(0, 'rgba(255,255,255,0)')
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.6)')
    gradient.addColorStop(0.5, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.8, 'rgba(255,255,255,0.6)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 4)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return
    const time = state.clock.elapsedTime
    
    // Multi-frequency gust pattern — feels organic and unpredictable
    const gust1 = Math.sin(time * 0.15) * 0.5 + 0.5
    const gust2 = Math.sin(time * 0.08 + 1.5) * 0.5 + 0.5
    const gust3 = Math.sin(time * 0.3 + 3.0) * 0.3 + 0.5
    const gustStrength = (gust1 * gust2 + gust3 * 0.3) / 1.3 // 0 to 1
    const isWindy = gustStrength > 0.4
    
    const targetOpacity = isWindy ? gustStrength * 0.35 : 0.0
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity, targetOpacity, 0.03
    )
    if (materialRef.current.opacity < 0.005) return

    const speedMultiplier = 0.5 + gustStrength * 1.5

    lines.forEach((line, i) => {
      // Move along the line's direction
      line.x -= line.speed * line.dirX * speedMultiplier
      line.z -= line.speed * line.dirZ * speedMultiplier
      
      // Reset when out of bounds (full map coverage)
      if (line.x < -100 || line.x > 100 || line.z < -100 || line.z > 100) {
        line.x = 100 * line.dirX + (Math.random() - 0.5) * 50
        line.z = 100 * line.dirZ + (Math.random() - 0.5) * 200
        line.y = Math.random() * 25 + PLATFORM_Y
      }
      
      // S-curve wave motion
      const wave = Math.sin(line.x * line.waveFreq + line.seed + time * 0.5) * line.waveAmp
      const waveZ = Math.cos(line.z * line.waveFreq * 0.7 + line.seed) * line.waveAmp * 0.5
      
      const posY = line.y + wave * 0.3
      const posZ = line.z + waveZ * 0.2

      dummy.position.set(line.x, posY, posZ)
      
      // Rotate to follow the curve tangent
      const tangent = Math.cos(line.x * line.waveFreq + line.seed + time * 0.5) * line.waveFreq * line.waveAmp
      dummy.rotation.set(0, Math.atan2(line.dirZ, line.dirX), tangent * 0.3)
      
      dummy.scale.set(line.length, 1, 1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, lineCount]}>
      <planeGeometry args={[1.0, 0.04]} />
      <meshBasicMaterial ref={materialRef} map={windTexture} color="#ffffff" transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </instancedMesh>
  )
}

// ─── Rain Drops (Elongated Streaks) ────────────────────────────

function RainDrops({ active }) {
  const particlesCount = 2000
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 60
      pos[i*3+1] = Math.random() * 50 + PLATFORM_Y
      pos[i*3+2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [])

  // Per-particle speed variation for depth
  const speeds = useMemo(() => {
    return Array.from({ length: particlesCount }, () => 0.4 + Math.random() * 0.5)
  }, [])

  const ref = useRef()
  const matRef = useRef()
  const rainTexture = useMemo(() => makeRainTexture(), [])

  useFrame((state, delta) => {
    if (matRef.current) {
      const targetOpacity = active ? 0.7 : 0.0
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 1.5)
    }

    if (active || (matRef.current && matRef.current.opacity > 0.01)) {
      const pos = ref.current.geometry.attributes.position.array
      for (let i = 0; i < particlesCount; i++) {
        pos[i*3+1] -= speeds[i]
        pos[i*3] -= 0.06 // Wind drift
        if (pos[i*3+1] < PLATFORM_Y) {
          pos[i*3+1] = Math.random() * 30 + 20 + PLATFORM_Y
          pos[i*3] = (Math.random() - 0.5) * 60
          pos[i*3+2] = (Math.random() - 0.5) * 60
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} map={rainTexture} color="#aaccff" size={0.15} transparent opacity={0} sizeAttenuation={true} depthWrite={false} />
    </points>
  )
}

// ─── Snow Flakes (Soft Circles) ────────────────────────────────

function SnowFlakes({ active }) {
  const particlesCount = 1200
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 60
      pos[i*3+1] = Math.random() * 35 + PLATFORM_Y
      pos[i*3+2] = (Math.random() - 0.5) * 60
    }
    return pos
  }, [])

  // Per-flake size variation
  const sizes = useMemo(() => {
    return Array.from({ length: particlesCount }, () => 0.15 + Math.random() * 0.2)
  }, [])

  const ref = useRef()
  const matRef = useRef()
  const snowTexture = useMemo(() => makeSnowTexture(), [])

  useFrame((state, delta) => {
    if (matRef.current) {
      const targetOpacity = active ? 0.85 : 0.0
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 1.5)
    }

    if (active || (matRef.current && matRef.current.opacity > 0.01)) {
      const time = state.clock.elapsedTime
      const pos = ref.current.geometry.attributes.position.array
      for (let i = 0; i < particlesCount; i++) {
        pos[i*3+1] -= 0.04 + sizes[i] * 0.1 // Heavier flakes fall faster
        pos[i*3] += Math.sin(time * 0.8 + i * 0.5) * 0.015
        pos[i*3+2] += Math.cos(time * 0.5 + i * 0.3) * 0.012
        if (pos[i*3+1] < PLATFORM_Y) {
          pos[i*3+1] = Math.random() * 30 + 15 + PLATFORM_Y
          pos[i*3] = (Math.random() - 0.5) * 60
          pos[i*3+2] = (Math.random() - 0.5) * 60
        }
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} map={snowTexture} color="#ffffff" size={0.25} transparent opacity={0} sizeAttenuation={true} depthWrite={false} />
    </points>
  )
}

// ─── Lightning Effect (Multi-Flash Bursts) ─────────────────────

function Lightning({ active }) {
  const lightRef = useRef()
  const nextFlash = useRef(0)
  const flashBurst = useRef(0) // How many rapid flashes remain in current burst

  useFrame((state) => {
    if (!lightRef.current) return
    const time = state.clock.elapsedTime

    if (!active) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.1)
      return
    }

    if (flashBurst.current > 0) {
      // Rapid multi-flash burst
      if (Math.random() > 0.5) {
        lightRef.current.intensity = 4 + Math.random() * 6
        // Randomize position slightly for each flash
        lightRef.current.position.set(
          -30 + Math.random() * 60,
          60 + Math.random() * 40,
          -30 + Math.random() * 60
        )
      } else {
        lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.3)
      }
      flashBurst.current -= 1
    } else if (time > nextFlash.current) {
      // Start a new burst of 2-4 rapid flashes
      flashBurst.current = 2 + Math.floor(Math.random() * 3)
      lightRef.current.intensity = 5 + Math.random() * 5
      nextFlash.current = time + 3 + Math.random() * 8
    } else {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.12)
    }
  })

  return (
    <directionalLight
      ref={lightRef}
      position={[50, 80, 30]}
      color="#ddeeff"
      intensity={0}
    />
  )
}

// ─── Campfire Glow ─────────────────────────────────────────────

function CampfireGlow() {
  const lightRef = useRef()
  const fireRef = useRef()

  const particlesCount = 30
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for (let i = 0; i < particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 0.5
      pos[i*3+1] = Math.random() * 1.5
      pos[i*3+2] = (Math.random() - 0.5) * 0.5
    }
    return pos
  }, [])

  const fireTexture = useMemo(() => makeCircleTexture(32), [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(time * 15) * 0.5 + Math.cos(time * 23) * 0.5
    }
    if (fireRef.current) {
      const pos = fireRef.current.geometry.attributes.position.array
      for (let i = 0; i < particlesCount; i++) {
        pos[i*3+1] += 0.02
        pos[i*3] += Math.sin(time * 10 + i) * 0.01
        if (pos[i*3+1] > 2.0) {
          pos[i*3+1] = 0
          pos[i*3] = (Math.random() - 0.5) * 0.5
        }
      }
      fireRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <group>
      <pointLight ref={lightRef} color="#ff5500" intensity={2} distance={20} decay={2} castShadow />
      <points ref={fireRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial map={fireTexture} color="#ffaa00" size={0.3} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}

// ─── Island Environment ────────────────────────────────────────

export function IslandEnvironment({ weather = 'sunny' }) {
  const ambientRef = useRef()
  const isRainy = weather === 'rainy'
  const isSnowy = weather === 'snowy'
  const getDayProgress = useDayProgress()
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const sunY = Math.sin(dayTime * Math.PI * 2) * 500
    
    if (ambientRef.current) {
      const isNight = sunY < 0
      let target
      if (isRainy) target = isNight ? 0.38 : 0.55
      else if (isSnowy) target = isNight ? 0.4 : 0.6
      else if (isNight) target = 0.35
      else target = 0.55
      
      // Smooth ambient transitions
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity, target, 0.02
      )
    }
  })

  return (
    <>
      <BackgroundSky weather={weather} />
      <Stars weather={weather} />
      <IslandSun weather={weather} />
      <IslandMoon weather={weather} />

      <ambientLight ref={ambientRef} intensity={0.5} color="#99b8d8" />
      <hemisphereLight args={['#6688aa', '#334455', isRainy ? 0.45 : 0.55]} />

      <WindLeaves />
      <RainDrops active={isRainy} />
      <SnowFlakes active={isSnowy} />
      <Lightning active={isRainy} />

      {/* Clouds — Volumetric lit clouds with horizon sea */}
      <Clouds material={THREE.MeshLambertMaterial} limit={400}>
        {/* Distant Sea of Clouds — below the floating island horizon */}
        <Cloud
          seed={1}
          segments={24}
          bounds={[120, 6, 120]}
          volume={30}
          growth={5}
          fade={150}
          color={isRainy ? '#181a24' : (isSnowy ? '#bcc0cc' : '#ffffff')}
          position={[0, -12, 0]}
          opacity={isRainy ? 0.9 : (isSnowy ? 0.75 : 0.45)}
          speed={0.03}
        />
        <Cloud
          seed={2}
          segments={20}
          bounds={[140, 8, 140]}
          volume={35}
          growth={6}
          fade={160}
          color={isRainy ? '#12141c' : (isSnowy ? '#abb0be' : '#f0f4ff')}
          position={[20, -16, -30]}
          opacity={isRainy ? 0.85 : (isSnowy ? 0.7 : 0.4)}
          speed={0.04}
        />

        {/* Mid-Sky Cumulus Clouds — drifting gracefully */}
        <Cloud
          seed={10}
          segments={isRainy ? 35 : (isSnowy ? 25 : 16)}
          bounds={[80, 8, 80]}
          volume={25}
          growth={4}
          fade={120}
          color={isRainy ? '#222634' : (isSnowy ? '#ccd0dc' : '#ffffff')}
          position={[-30, 48, 25]}
          opacity={isRainy ? 0.9 : (isSnowy ? 0.65 : 0.35)}
          speed={0.08}
        />
        <Cloud
          seed={20}
          segments={isRainy ? 35 : (isSnowy ? 25 : 16)}
          bounds={[85, 8, 85]}
          volume={26}
          growth={4}
          fade={120}
          color={isRainy ? '#1e2230' : (isSnowy ? '#d4d8e4' : '#fafcff')}
          position={[35, 52, -20]}
          opacity={isRainy ? 0.88 : (isSnowy ? 0.6 : 0.3)}
          speed={0.07}
        />
        <Cloud
          seed={30}
          segments={isRainy ? 30 : (isSnowy ? 20 : 12)}
          bounds={[70, 6, 70]}
          volume={20}
          growth={4}
          fade={100}
          color={isRainy ? '#262a38' : (isSnowy ? '#c0c4d2' : '#ffffff')}
          position={[0, 44, -45]}
          opacity={isRainy ? 0.85 : (isSnowy ? 0.55 : 0.25)}
          speed={0.09}
        />

        {/* Storm Overcast — Heavy dark storm clouds during rain */}
        {isRainy && (
          <>
            <Cloud
              seed={50}
              segments={45}
              bounds={[100, 10, 100]}
              volume={45}
              growth={6}
              fade={140}
              color="#10121a"
              position={[0, 36, 0]}
              opacity={0.96}
              speed={0.15}
            />
            <Cloud
              seed={60}
              segments={35}
              bounds={[90, 8, 90]}
              volume={35}
              growth={5}
              fade={120}
              color="#0c0e16"
              position={[-15, 40, 15]}
              opacity={0.92}
              speed={0.12}
            />
          </>
        )}

        {/* Winter Snow Blanket — Soft diffuse overcast during snow */}
        {isSnowy && (
          <Cloud
            seed={55}
            segments={35}
            bounds={[100, 8, 100]}
            volume={30}
            growth={5}
            fade={140}
            color="#8c92a2"
            position={[0, 42, 0]}
            opacity={0.7}
            speed={0.06}
          />
        )}
      </Clouds>
    </>
  )
}

// ─── Island Tile ───────────────────────────────────────────────

function IslandTile({ type, position, rotation = [0, 0, 0], scale = 1 }) {
  const file = type + '.glb'
  const { scene } = useGLTF(B + file)
  const cleanRotation = rotation.map(r => isNaN(r) ? 0 : r)

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <group position={position} rotation={cleanRotation} scale={typeof scale === 'number' ? [scale, scale, scale] : scale}>
        <Clone object={scene} />
        {type === 'sign' && (
          <Text
            position={[0, 0.25, -0.06]}
            rotation={[0, Math.PI, 0]}
            fontSize={0.045}
            lineHeight={1.2}
            color="#221100"
            anchorX="center"
            anchorY="middle"
            maxWidth={0.8}
            textAlign="center"
          >
            {"Welcome to\nBaseCamp"}
          </Text>
        )}
      </group>
    </RigidBody>
  )
}

// ─── Main Component ────────────────────────────────────────────

const WEATHER_TYPES = ['sunny', 'rainy', 'snowy']
const WEATHER_WEIGHTS = { sunny: 3, rainy: 1, snowy: 1 } // Sunny 3x more likely

function pickWeather(currentWeather) {
  const others = WEATHER_TYPES.filter(w => w !== currentWeather)
  // Build weighted list
  const weighted = []
  others.forEach(w => {
    for (let i = 0; i < WEATHER_WEIGHTS[w]; i++) weighted.push(w)
  })
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export default function FloatingIsland() {
  const [weather, setWeather] = useState('sunny')
  const alwaysClear = useGameStore(s => s.alwaysClear)

  useEffect(() => {
    let timeout
    const scheduleNextWeather = () => {
      // Weather lasts 60s to 300s (1-5 minutes)
      const duration = 60000 + Math.random() * 240000
      timeout = setTimeout(() => {
        setWeather(current => pickWeather(current))
        scheduleNextWeather()
      }, duration)
    }
    scheduleNextWeather()
    return () => clearTimeout(timeout)
  }, [])

  const effectiveWeather = alwaysClear ? 'sunny' : weather

  const campfireEntry = islandBlueprint.find(e => e.type === 'campfire_stones')

  return (
    <>
      <IslandEnvironment weather={effectiveWeather} />

      <group position={[0, PLATFORM_Y, 0]}>
        {islandBlueprint.map((tile, i) => (
          <IslandTile key={i} {...tile} />
        ))}

        {campfireEntry && (
          <group position={campfireEntry.position}>
            <CampfireGlow />
          </group>
        )}
      </group>
    </>
  )
}

// Preload all unique models
const uniqueFiles = [...new Set(islandBlueprint.map(t => t.type + '.glb'))]
uniqueFiles.forEach(f => useGLTF.preload(B + f))
