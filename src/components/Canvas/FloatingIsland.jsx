import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Clone, Cloud, Clouds, Text } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { islandBlueprint } from '../../data/islandBlueprint'
import useGameStore from '../../store/useGameStore'

// Constants
const PLATFORM_Y = -1
const SUN_POS = [200, 20, -400]
const B = '/models/'
const DAY_CYCLE = 720 // 12 minutes full cycle

// Spawn point near the tent
export const ISLAND_SPAWN = [-3, 5, -1]
// Fall threshold
export const FALL_THRESHOLD = -30

// Helper hook: returns dayTime (0-1) and angle, respects alwaysDay
function useDayProgress() {
  const alwaysDay = useGameStore(s => s.alwaysDay)
  // 0.25 = noon (sun at top), normal = time-based cycle
  return (elapsedTime) => {
    if (alwaysDay) return 0.25
    return (elapsedTime % DAY_CYCLE) / DAY_CYCLE
  }
}

// Weather types: 'sunny' | 'rainy' | 'snowy'

// Custom Shaders
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
    
    float sunDist = distance(dir, sunDir);
    float glow = smoothstep(0.5, 0.0, sunDist);
    skyColor = mix(skyColor, sunColor, glow * 0.5);
    
    skyColor = mix(skyColor, skyColor * 0.4, weatherDarken);
    
    gl_FragColor = vec4(skyColor, 1.0);
  }
`

// ─── Environment Components ────────────────────────────────────

export function BackgroundSky({ weather }) {
  const materialRef = useRef()
  const getDayProgress = useDayProgress()

  const uniforms = useMemo(() => ({
    topColor: { value: new THREE.Color('#1a0533') },
    bottomColor: { value: new THREE.Color('#ff6b35') },
    sunColor: { value: new THREE.Color('#ffaa55') },
    sunPosition: { value: new THREE.Vector3(...SUN_POS) },
    weatherDarken: { value: 0.0 }
  }), [])

  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetDarken = weather === 'rainy' ? 1.0 : weather === 'snowy' ? 0.3 : 0.0;
      materialRef.current.uniforms.weatherDarken.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.weatherDarken.value, 
        targetDarken, 
        delta
      )
      
      // Day/Night Cycle
      const time = state.clock.elapsedTime;
      const dayTime = getDayProgress(time);
      const angle = dayTime * Math.PI * 2;
      const sunY = Math.sin(angle) * 400;
      
      materialRef.current.uniforms.sunPosition.value.set(Math.cos(angle) * 400, sunY, -400);

      // Colors based on sun height
      const dayTop = new THREE.Color('#3a85ff')
      const dayBot = new THREE.Color('#87bfff')
      const sunsetTop = new THREE.Color('#1a0533')
      const sunsetBot = new THREE.Color('#ff6b35')
      const nightTop = new THREE.Color('#05010a')
      const nightBot = new THREE.Color('#1a0533')

      if (sunY > 100) {
        materialRef.current.uniforms.topColor.value.lerp(dayTop, 0.05);
        materialRef.current.uniforms.bottomColor.value.lerp(dayBot, 0.05);
      } else if (sunY > -50) {
        materialRef.current.uniforms.topColor.value.lerp(sunsetTop, 0.05);
        materialRef.current.uniforms.bottomColor.value.lerp(sunsetBot, 0.05);
      } else {
        materialRef.current.uniforms.topColor.value.lerp(nightTop, 0.05);
        materialRef.current.uniforms.bottomColor.value.lerp(nightBot, 0.05);
      }
    }
  })

  return (
    <mesh scale={[-500, -500, -500]} rotation={[0, 0, 0]}>
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

export function Stars({ weather }) {
  const ref = useRef()
  const getDayProgress = useDayProgress()

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(3000 * 3)
    const ph = new Float32Array(3000)
    for (let i = 0; i < 3000; i++) {
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 400 + Math.random() * 100
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      if (pos[i * 3 + 1] < -50) pos[i * 3 + 1] *= -1

      ph[i] = Math.random() * Math.PI * 2
    }
    return [pos, ph]
  }, [])

  const materialRef = useRef()
  useFrame((state) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const sunY = Math.sin(dayTime * Math.PI * 2) * 400

    if (materialRef.current) {
      const targetOpacity = weather !== 'sunny' ? 0 : (sunY > 0 ? 0 : Math.min(1, -sunY / 100))
      materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, targetOpacity, 0.05)
    }
    if (ref.current) {
      const sizes = ref.current.geometry.attributes.size.array
      for(let i=0; i<3000; i++) {
        sizes[i] = (Math.sin(time * 2 + phases[i]) + 1) * 2.0
      }
      ref.current.geometry.attributes.size.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-size" count={phases.length} array={new Float32Array(3000)} itemSize={1} />
      </bufferGeometry>
      <pointsMaterial ref={materialRef} size={3} color="#ffffff" transparent opacity={0.8} sizeAttenuation={false} fog={false} />
    </points>
  )
}

export function IslandSun({ weather }) {
  const sunLightRef = useRef()
  const groupRef = useRef()
  const getDayProgress = useDayProgress()

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const angle = dayTime * Math.PI * 2

    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(angle) * 400, Math.sin(angle) * 400, -400)
    }

    if (sunLightRef.current) {
      const sunY = Math.sin(angle) * 400
      const isNight = sunY < -50
      const targetIntensity = weather === 'rainy' || isNight ? 0.0 : (weather === 'snowy' ? 0.8 : 1.5);
      sunLightRef.current.intensity = THREE.MathUtils.lerp(sunLightRef.current.intensity, targetIntensity, delta * 2)
    }
  })

  return (
    <group ref={groupRef} position={SUN_POS}>
      <mesh>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#ff9933" transparent opacity={weather === 'rainy' ? 0.1 : 1.0} />
      </mesh>
      <pointLight color="#ff8833" intensity={2} distance={800} decay={1} />
      <directionalLight ref={sunLightRef} color="#ffeedd" intensity={1.5} castShadow />
    </group>
  )
}

export function IslandMoon({ weather }) {
  const moonLightRef = useRef()
  const groupRef = useRef()
  const getDayProgress = useDayProgress()

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const angle = dayTime * Math.PI * 2 + Math.PI

    if (groupRef.current) {
      groupRef.current.position.set(Math.cos(angle) * 400, Math.sin(angle) * 400, -400)
    }

    if (moonLightRef.current) {
      const moonY = Math.sin(angle) * 400
      const isDay = moonY < -50
      const targetIntensity = weather === 'rainy' || isDay ? 0.0 : 0.5;
      moonLightRef.current.intensity = THREE.MathUtils.lerp(moonLightRef.current.intensity, targetIntensity, delta * 2)
    }
  })

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[15, 32, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={weather === 'rainy' ? 0.05 : 0.8} />
      </mesh>
      <directionalLight ref={moonLightRef} color="#aaccff" intensity={0.5} castShadow />
    </group>
  )
}

function WindLeaves() {
  const particlesCount = 200;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for(let i=0; i<particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 40
      pos[i*3+1] = Math.random() * 15 + PLATFORM_Y
      pos[i*3+2] = (Math.random() - 0.5) * 40
    }
    return pos
  }, [])

  const ref = useRef()

  useFrame((state) => {
    const time = state.clock.elapsedTime
    const pos = ref.current.geometry.attributes.position.array
    for(let i=0; i<particlesCount; i++) {
      pos[i*3] -= 0.05
      pos[i*3+1] += Math.sin(time * 2 + i) * 0.02
      if (pos[i*3] < -20) {
        pos[i*3] = 20
        pos[i*3+1] = Math.random() * 15 + PLATFORM_Y
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#a0e0a0" size={0.15} transparent opacity={0.6} />
    </points>
  )
}

function RainDrops({ active }) {
  const particlesCount = 1500;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for(let i=0; i<particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 40
      pos[i*3+1] = Math.random() * 40 + PLATFORM_Y
      pos[i*3+2] = (Math.random() - 0.5) * 40
    }
    return pos
  }, [])

  const ref = useRef()
  const matRef = useRef()

  useFrame((state, delta) => {
    if (matRef.current) {
      const targetOpacity = active ? 0.6 : 0.0
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 2)
    }

    if (active || (matRef.current && matRef.current.opacity > 0.01)) {
      const pos = ref.current.geometry.attributes.position.array
      for(let i=0; i<particlesCount; i++) {
        pos[i*3+1] -= 0.6
        pos[i*3] -= 0.08
        if (pos[i*3+1] < PLATFORM_Y) {
          pos[i*3+1] = Math.random() * 20 + 20 + PLATFORM_Y
          pos[i*3] = (Math.random() - 0.5) * 40
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
      <pointsMaterial ref={matRef} color="#aaccff" size={0.1} transparent opacity={0} sizeAttenuation={true} />
    </points>
  )
}

// ─── Snow Particles ────────────────────────────────────────────

function SnowFlakes({ active }) {
  const particlesCount = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for(let i=0; i<particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 50
      pos[i*3+1] = Math.random() * 30 + PLATFORM_Y
      pos[i*3+2] = (Math.random() - 0.5) * 50
    }
    return pos
  }, [])

  const ref = useRef()
  const matRef = useRef()

  useFrame((state, delta) => {
    if (matRef.current) {
      const targetOpacity = active ? 0.9 : 0.0
      matRef.current.opacity = THREE.MathUtils.lerp(matRef.current.opacity, targetOpacity, delta * 2)
    }

    if (active || (matRef.current && matRef.current.opacity > 0.01)) {
      const time = state.clock.elapsedTime
      const pos = ref.current.geometry.attributes.position.array
      for(let i=0; i<particlesCount; i++) {
        pos[i*3+1] -= 0.08  // slow fall
        pos[i*3] += Math.sin(time + i * 0.5) * 0.02  // gentle sway
        pos[i*3+2] += Math.cos(time * 0.7 + i * 0.3) * 0.015
        if (pos[i*3+1] < PLATFORM_Y) {
          pos[i*3+1] = Math.random() * 25 + 15 + PLATFORM_Y
          pos[i*3] = (Math.random() - 0.5) * 50
          pos[i*3+2] = (Math.random() - 0.5) * 50
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
      <pointsMaterial ref={matRef} color="#ffffff" size={0.25} transparent opacity={0} sizeAttenuation={true} />
    </points>
  )
}

// ─── Lightning Effect ──────────────────────────────────────────

function Lightning({ active }) {
  const lightRef = useRef()
  const nextFlash = useRef(0)

  useFrame((state) => {
    if (!lightRef.current) return
    const time = state.clock.elapsedTime

    if (!active) {
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.1)
      return
    }

    if (time > nextFlash.current) {
      // Random flash
      lightRef.current.intensity = 3 + Math.random() * 5
      // Schedule next flash randomly between 2-8 seconds
      nextFlash.current = time + 2 + Math.random() * 6
    } else {
      // Rapid decay after flash
      lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.15)
    }
  })

  return (
    <directionalLight
      ref={lightRef}
      position={[50, 80, 30]}
      color="#ccddff"
      intensity={0}
    />
  )
}

function CampfireGlow() {
  const lightRef = useRef()
  const fireRef = useRef()

  const particlesCount = 30
  const positions = useMemo(() => {
    const pos = new Float32Array(particlesCount * 3)
    for(let i=0; i<particlesCount; i++) {
      pos[i*3] = (Math.random() - 0.5) * 0.5
      pos[i*3+1] = Math.random() * 1.5
      pos[i*3+2] = (Math.random() - 0.5) * 0.5
    }
    return pos
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(time * 15) * 0.5 + Math.cos(time * 23) * 0.5
    }
    if (fireRef.current) {
      const pos = fireRef.current.geometry.attributes.position.array
      for(let i=0; i<particlesCount; i++) {
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
        <pointsMaterial color="#ffaa00" size={0.2} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
    </group>
  )
}

// ─── Island Environment (exported for editor reuse) ────────────

export function IslandEnvironment({ weather = 'sunny' }) {
  const ambientRef = useRef()
  const isRainy = weather === 'rainy'
  const isSnowy = weather === 'snowy'
  const getDayProgress = useDayProgress()
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    const dayTime = getDayProgress(time)
    const sunY = Math.sin(dayTime * Math.PI * 2) * 400
    if (ambientRef.current) {
       const isNight = sunY < 0;
       const target = isRainy ? 0.1 : (isSnowy ? 0.25 : (isNight ? 0.05 : 0.4))
       ambientRef.current.intensity = THREE.MathUtils.lerp(
         ambientRef.current.intensity,
         target,
         0.05
       )
    }
  })

  return (
    <>
      <BackgroundSky weather={weather} />
      <Stars weather={weather} />
      <IslandSun weather={weather} />
      <IslandMoon weather={weather} />

      <ambientLight ref={ambientRef} intensity={0.4} color="#8899aa" />
      <hemisphereLight args={['#4a1a7a', '#000000', isRainy ? 0.2 : 0.5]} />

      <WindLeaves />
      <RainDrops active={isRainy} />
      <SnowFlakes active={isSnowy} />
      <Lightning active={isRainy} />

      {/* Clouds — raised high above the island so they don't block view while walking */}
      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud 
          seed={1} segments={isRainy ? 40 : (isSnowy ? 25 : 12)} 
          bounds={[40, 3, 40]} volume={isRainy ? 20 : (isSnowy ? 12 : 6)} 
          color={isRainy ? '#2a2a35' : (isSnowy ? '#ccccdd' : '#ffffff')} 
          position={[0, 35, -10]} opacity={isRainy ? 0.85 : (isSnowy ? 0.5 : 0.25)} 
        />
        <Cloud 
          seed={2} segments={isRainy ? 40 : (isSnowy ? 25 : 12)} 
          bounds={[45, 3, 45]} volume={isRainy ? 25 : (isSnowy ? 14 : 7)} 
          color={isRainy ? '#333344' : (isSnowy ? '#bbbbcc' : '#f0f0f5')} 
          position={[25, 38, 15]} opacity={isRainy ? 0.8 : (isSnowy ? 0.45 : 0.2)} 
        />
        {isRainy && (
          <Cloud seed={3} segments={50} bounds={[60, 5, 60]} volume={35} color="#1a1a2e" position={[0, 30, 0]} opacity={0.9} />
        )}
      </Clouds>
    </>
  )
}

// ─── Data-Driven Island Tile with Physics Collider ─────────────

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

export default function FloatingIsland() {
  const [weather, setWeather] = useState('sunny')
  const alwaysClear = useGameStore(s => s.alwaysClear)

  useEffect(() => {
    let timeout;
    const scheduleNextWeather = () => {
      timeout = setTimeout(() => {
        setWeather(current => {
          const others = WEATHER_TYPES.filter(w => w !== current)
          return others[Math.floor(Math.random() * others.length)]
        })
        scheduleNextWeather()
      }, 10000 + Math.random() * 230000)
    }
    scheduleNextWeather()
    return () => clearTimeout(timeout)
  }, [])

  const effectiveWeather = alwaysClear ? 'sunny' : weather

  // Find the campfire entry to place the glow at the right spot
  const campfireEntry = islandBlueprint.find(e => e.type === 'campfire_stones')

  return (
    <>
      {/* Sky, stars, sun, wind, rain, snow, clouds */}
      <IslandEnvironment weather={effectiveWeather} />

      {/* Main Island Group */}
      <group position={[0, PLATFORM_Y, 0]}>
        {/* Render all models from blueprint data with physics colliders */}
        {islandBlueprint.map((tile, i) => (
          <IslandTile key={i} {...tile} />
        ))}

        {/* Campfire glow effect at campfire position */}
        {campfireEntry && (
          <group position={campfireEntry.position}>
            <CampfireGlow />
          </group>
        )}
      </group>
    </>
  )
}

// Preload all unique models from the blueprint
const uniqueFiles = [...new Set(islandBlueprint.map(t => t.type + '.glb'))]
uniqueFiles.forEach(f => useGLTF.preload(B + f))
