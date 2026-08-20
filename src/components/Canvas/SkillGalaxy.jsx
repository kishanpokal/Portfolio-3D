import React, { useRef, useMemo, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Billboard, useGLTF, Clone } from '@react-three/drei'
import { RigidBody, CuboidCollider, CylinderCollider } from '@react-three/rapier'
import * as THREE from 'three'
import { constellations } from '../../data/skillsData'
import { createSkillTexture } from './skillIcons'
import useGameStore from '../../store/useGameStore'

const B = '/models/'

// ─── High-Performance Lightweight Galaxy Sky ──────────────────
const galaxySkyVertex = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const galaxySkyFragment = `
  varying vec3 vWorldPosition;
  uniform float uTime;

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float h = smoothstep(-0.4, 0.6, dir.y);
    
    vec3 deepVoid = vec3(0.01, 0.005, 0.03);
    vec3 celestialTop = vec3(0.008, 0.012, 0.035);
    vec3 color = mix(deepVoid, celestialTop, h);

    float t = uTime * 0.08;
    float band1 = sin(dir.x * 3.0 + dir.y * 2.0 + t) * cos(dir.z * 2.5 - t * 0.5);
    band1 = smoothstep(0.2, 0.8, band1 * 0.5 + 0.5);
    color += vec3(0.22, 0.05, 0.32) * band1 * 0.6;

    float band2 = cos(dir.x * 2.0 - dir.z * 3.0 + t * 0.7);
    band2 = smoothstep(0.3, 0.85, band2 * 0.5 + 0.5);
    color += vec3(0.02, 0.18, 0.25) * band2 * 0.5;

    gl_FragColor = vec4(color, 1.0);
  }
`

function GalaxySky() {
  const matRef = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh scale={[-450, -450, -450]}>
      <sphereGeometry args={[1, 24, 24]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={galaxySkyVertex}
        fragmentShader={galaxySkyFragment}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

// ─── 4,000 Twinkling Galaxy Stars ──────────────────────────────
const starVertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  attribute float aSpeed;
  varying vec3 vColor;
  varying float vAlpha;
  uniform float uTime;

  void main() {
    vColor = aColor;
    float tw = sin(uTime * aSpeed + aPhase) * 0.5 + 0.5;
    vAlpha = 0.4 + 0.6 * tw;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.5, 24.0);
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
    float core = smoothstep(0.5, 0.0, dist);
    gl_FragColor = vec4(vColor * 1.3, core * vAlpha);
  }
`

function GalaxyStars() {
  const count = 4000
  const matRef = useRef()

  const { positions, sizes, colors, phases, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const col = new Float32Array(count * 3)
    const ph = new Float32Array(count)
    const sp = new Float32Array(count)

    const palette = [
      [1.0, 1.0, 1.0],
      [0.75, 0.9, 1.0],
      [1.0, 0.88, 0.65],
      [0.9, 0.75, 1.0],
      [0.6, 0.85, 1.0],
    ]

    for (let i = 0; i < count; i++) {
      const isBand = Math.random() > 0.3
      const theta = 2 * Math.PI * Math.random()
      let phi = Math.acos(2 * Math.random() - 1)

      if (isBand) {
        phi = Math.PI / 2 + (Math.random() - 0.5) * 0.35
      }

      const r = 320 + Math.random() * 120
      let x = r * Math.sin(phi) * Math.cos(theta)
      let y = r * Math.sin(phi) * Math.sin(theta)
      let z = r * Math.cos(phi)

      if (isBand) {
        const tilt = 0.5
        const nx = x * Math.cos(tilt) - y * Math.sin(tilt)
        const ny = x * Math.sin(tilt) + y * Math.cos(tilt)
        x = nx
        y = ny
      }

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z

      const colorSample = palette[Math.floor(Math.random() * palette.length)]
      col[i * 3] = colorSample[0]
      col[i * 3 + 1] = colorSample[1]
      col[i * 3 + 2] = colorSample[2]

      sz[i] = Math.random() > 0.95 ? (3.5 + Math.random() * 2.0) : (1.0 + Math.random() * 1.2)
      ph[i] = Math.random() * Math.PI * 2
      sp[i] = 0.8 + Math.random() * 2.0
    }

    return { positions: pos, sizes: sz, colors: col, phases: ph, speeds: sp }
  }, [])

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-aSize" count={count} array={sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aColor" count={count} array={colors} itemSize={3} />
        <bufferAttribute attach="attributes-aPhase" count={count} array={phases} itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed" count={count} array={speeds} itemSize={1} />
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

// ─── Reusable Vectors ──────────────────────────────────────────
const _targetScale = new THREE.Vector3()
const _pedestalWorld = new THREE.Vector3()

// ─── Sleek & Compact 3D Skill Pedestal ─────────────────────────
function SkillPedestal({ skill, position, index }) {
  const cubeRef = useRef()
  const ringRef = useRef()
  const { camera } = useThree()
  const [isNear, setIsNear] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // 512x512 High-DPI Real Brand Texture
  const texture = useMemo(() => createSkillTexture(skill.icon, skill.color), [skill.icon, skill.color])

  // Single shared-material array for 6 cube faces
  const cubeMaterials = useMemo(() => {
    return Array.from({ length: 6 }, () => new THREE.MeshStandardMaterial({
      map: texture,
      metalness: 0.3,
      roughness: 0.2,
      emissive: skill.color,
      emissiveIntensity: 0.3,
    }))
  }, [texture, skill.color])

  const isActive = isNear || isHovered

  useFrame((state) => {
    const t = state.clock.elapsedTime

    // Gaze / proximity check
    _pedestalWorld.set(position[0], position[1] + 1.25, position[2])
    const dist = camera.position.distanceTo(_pedestalWorld)
    const near = dist < 3.8
    if (near !== isNear) setIsNear(near)

    if (cubeRef.current) {
      // Floating animation (lifts up slightly when glowing/active)
      const baseHeight = position[1] + (isActive ? 1.35 : 1.25)
      cubeRef.current.position.y = THREE.MathUtils.lerp(
        cubeRef.current.position.y,
        baseHeight + Math.sin(t * 2.0 + index * 0.9) * 0.08,
        0.1
      )

      const spinSpeed = isActive ? 0.022 : 0.008
      cubeRef.current.rotation.y += spinSpeed
      cubeRef.current.rotation.x = Math.sin(t * 1.5 + index) * 0.03

      const targetScale = isActive ? 1.25 : 1.0
      cubeRef.current.scale.lerp(_targetScale.set(targetScale, targetScale, targetScale), 0.12)
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * (isActive ? 3.0 : 1.5)
    }

    // Dynamic bright neon emissive glow when looking at or approaching
    const targetEmissive = isActive ? 1.8 : 0.3
    cubeMaterials.forEach(mat => {
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetEmissive, 0.12)
    })
  })

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Sleek Compact Stone Pedestal Pillar */}
      <mesh position={[0, position[1] + 0.35, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.32, 0.7, 16]} />
        <meshStandardMaterial color="#1a1c26" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, position[1] + 0.74, 0]}>
        <cylinderGeometry args={[0.34, 0.28, 0.08, 16]} />
        <meshStandardMaterial color="#222533" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Glowing Neon Energy Ring on Pillar Top */}
      <mesh ref={ringRef} position={[0, position[1] + 0.79, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.32, 24]} />
        <meshBasicMaterial
          color={skill.color}
          transparent
          opacity={isActive ? 1.0 : 0.45}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {/* 3D Floating Skill Cube with Official Brand Logo */}
      <group
        ref={cubeRef}
        position={[0, position[1] + 1.25, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setIsHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setIsHovered(false); document.body.style.cursor = 'auto' }}
      >
        <mesh material={cubeMaterials} castShadow>
          <boxGeometry args={[0.55, 0.55, 0.55]} />
        </mesh>
      </group>

      {/* Dynamic Billboard Title — Lights up in brand color when looking at skill */}
      <group position={[0, position[1] + 1.85, 0]}>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            fontSize={isActive ? 0.2 : 0.15}
            color={isActive ? skill.color : '#ffffff'}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#000000"
          >
            {skill.name}
          </Text>
        </Billboard>
      </group>
    </group>
  )
}

// ─── Balanced Symmetrical Horseshoe Sanctuary Wing ─────────────
function ConstellationWing({ constellation, center }) {
  const { name, color, glowColor, skills } = constellation

  const bridgeRotationY = Math.atan2(center[0], center[2])

  // Distribute skills along the back & side 240° arc, leaving the entrance 120° wide open
  const skillPositions = useMemo(() => {
    const radius = 4.2
    const entranceAngle = bridgeRotationY + Math.PI
    const arcSpan = Math.PI * 1.33 // 240 degrees
    const startAngle = entranceAngle + (2 * Math.PI - arcSpan) / 2

    return skills.map((_, i) => {
      const t = skills.length > 1 ? i / (skills.length - 1) : 0.5
      const currentAngle = startAngle + t * arcSpan
      return [
        center[0] + Math.sin(currentAngle) * radius,
        0,
        center[2] + Math.cos(currentAngle) * radius
      ]
    })
  }, [skills, center, bridgeRotationY])

  // ─── Clean Bridge Geometry (Strictly connects outer edges, NO overlap in center!) ───
  // Central Platform radius = 5.8m, Sanctuary Platform radius = 5.8m (at distance 18.0m)
  // Bridge spans cleanly from r = 5.6m to r = 12.4m (length = 6.8m, center at r = 9.0m)
  const bridgeSpanLength = 6.8
  const bridgeCenterDist = 9.0
  const bridgeCenterX = Math.sin(bridgeRotationY) * bridgeCenterDist
  const bridgeCenterZ = Math.cos(bridgeRotationY) * bridgeCenterDist

  return (
    <group>
      {/* ── Solid Walkway Bridge Floor Collider (Zero overlap into center circle) ── */}
      <RigidBody type="fixed" colliders={false} position={[bridgeCenterX, -0.2, bridgeCenterZ]} rotation={[0, bridgeRotationY, 0]}>
        <CuboidCollider args={[1.7, 0.2, bridgeSpanLength / 2]} friction={0.4} />
      </RigidBody>

      {/* Visual Stone Bridge Walkway (Ends right at the circle boundary) */}
      <mesh position={[bridgeCenterX, -0.08, bridgeCenterZ]} rotation={[0, bridgeRotationY, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.16, bridgeSpanLength]} />
        <meshStandardMaterial color="#181a24" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Runway Stripe (Stops cleanly before the circle touches) */}
      <mesh position={[bridgeCenterX, 0.015, bridgeCenterZ]} rotation={[0, bridgeRotationY, 0]}>
        <boxGeometry args={[0.08, 0.01, bridgeSpanLength]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.8}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {/* ── Solid Sanctuary Platform Collider ── */}
      <RigidBody type="fixed" colliders={false} position={[center[0], -0.2, center[2]]}>
        <CylinderCollider args={[0.2, 5.8]} friction={0.4} />
      </RigidBody>

      {/* Visual Circular Platform Mesh */}
      <group position={[center[0], 0, center[2]]}>
        <mesh position={[0, -0.08, 0]} receiveShadow>
          <cylinderGeometry args={[5.8, 6.0, 0.16, 32]} />
          <meshStandardMaterial color="#12141c" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Outer glowing floor ring */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.0, 5.3, 32]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.75}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* Inner center floor rune disc */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.25, 24]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* Floating Celestial Crystal above head height (Y = 2.8m) */}
        <mesh position={[0, 2.8, 0]}>
          <octahedronGeometry args={[0.35]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.0}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
        <pointLight position={[0, 2.8, 0]} color={color} intensity={2.5} distance={14} decay={2} />

        {/* Dynamic Billboard Title */}
        <group position={[0, 3.6, 0]}>
          <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
            <Text
              fontSize={0.42}
              color={color}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.04}
              outlineColor="#000000"
              letterSpacing={0.06}
            >
              {name}
            </Text>
          </Billboard>
        </group>
      </group>

      {/* Skill Pedestals Symmetrically Surrounding the Platform Arc */}
      {skills.map((skill, i) => (
        <SkillPedestal
          key={skill.name}
          skill={{ ...skill, constellation: name }}
          position={skillPositions[i]}
          index={i}
        />
      ))}
    </group>
  )
}

// ─── Dedicated Return Stargate Shrine (South Wing) ─────────────
function ReturnStargateShrine({ center = [0, 0, 18] }) {
  const vortexRef = useRef()
  const ringRef = useRef()
  const particlesRef = useRef()
  const teleportTo = useGameStore(s => s.teleportTo)
  const isTransitioning = useGameStore(s => s.isTransitioning)
  const { camera } = useThree()
  const [isNear, setIsNear] = useState(false)
  const worldPos = useMemo(() => new THREE.Vector3(center[0], 0.2, center[2]), [center])

  const ringGltf = useGLTF(B + 'statue_ring.glb')
  const columnGltf = useGLTF(B + 'statue_column.glb')

  const bridgeRotationY = Math.atan2(center[0], center[2])

  const particleCount = 30
  const particlePositions = useMemo(() => {
    const p = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      p[i * 3] = (Math.random() - 0.5) * 2.0
      p[i * 3 + 1] = Math.random() * 3.0
      p[i * 3 + 2] = (Math.random() - 0.5) * 1.5
    }
    return p
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (vortexRef.current) vortexRef.current.rotation.z = -t * 1.5
    if (ringRef.current) ringRef.current.rotation.z = t * 0.8

    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < particleCount; i++) {
        pos[i * 3 + 1] += 0.015
        pos[i * 3] += Math.sin(t * 2 + i) * 0.004
        if (pos[i * 3 + 1] > 3.5) {
          pos[i * 3 + 1] = 0.2
          pos[i * 3] = (Math.random() - 0.5) * 1.8
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }

    const dist = camera.position.distanceTo(worldPos)
    const near = dist < 3.8
    if (near !== isNear) setIsNear(near)

    if (dist < 1.8 && !isTransitioning) {
      teleportTo('overworld')
    }
  })

  // Bridge geometry strictly between r = 5.6m and r = 12.4m
  const bridgeSpanLength = 6.8
  const bridgeCenterDist = 9.0
  const bridgeCenterX = Math.sin(bridgeRotationY) * bridgeCenterDist
  const bridgeCenterZ = Math.cos(bridgeRotationY) * bridgeCenterDist

  return (
    <group>
      {/* ── Solid Walkway Bridge Floor Collider ── */}
      <RigidBody type="fixed" colliders={false} position={[bridgeCenterX, -0.2, bridgeCenterZ]} rotation={[0, bridgeRotationY, 0]}>
        <CuboidCollider args={[1.7, 0.2, bridgeSpanLength / 2]} friction={0.4} />
      </RigidBody>

      {/* Visual Stone Bridge Walkway */}
      <mesh position={[bridgeCenterX, -0.08, bridgeCenterZ]} rotation={[0, bridgeRotationY, 0]} receiveShadow>
        <boxGeometry args={[3.2, 0.16, bridgeSpanLength]} />
        <meshStandardMaterial color="#181a24" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* Cyan Runway Stripe */}
      <mesh position={[bridgeCenterX, 0.015, bridgeCenterZ]} rotation={[0, bridgeRotationY, 0]}>
        <boxGeometry args={[0.08, 0.01, bridgeSpanLength]} />
        <meshBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.8}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {/* ── Solid Platform Collider ── */}
      <RigidBody type="fixed" colliders={false} position={[center[0], -0.2, center[2]]}>
        <CylinderCollider args={[0.2, 5.8]} friction={0.4} />
      </RigidBody>

      {/* Visual Return Shrine Platform */}
      <group position={[center[0], 0, center[2]]}>
        <mesh position={[0, -0.08, 0]} receiveShadow>
          <cylinderGeometry args={[5.8, 6.0, 0.16, 32]} />
          <meshStandardMaterial color="#12141c" roughness={0.6} metalness={0.4} />
        </mesh>

        {/* Floor Rings */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.0, 5.3, 32]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.4, 1.7, 28]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
            polygonOffset
            polygonOffsetFactor={-2}
          />
        </mesh>

        {/* ── Ancient Stargate Structure facing North ── */}
        <group position={[0, 0.1, 0]}>
          <group position={[-1.7, 0, 0]} scale={1.2}>
            <Clone object={columnGltf.scene} />
            <mesh position={[0, 2.3, 0]}>
              <octahedronGeometry args={[0.25]} />
              <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2.0} />
            </mesh>
          </group>
          <group position={[1.7, 0, 0]} scale={1.2}>
            <Clone object={columnGltf.scene} />
            <mesh position={[0, 2.3, 0]}>
              <octahedronGeometry args={[0.25]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.0} />
            </mesh>
          </group>

          {/* Upright Stargate Archway Ring */}
          <group position={[0, 1.8, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.8, 1.8, 1.8]}>
            <Clone object={ringGltf.scene} />
          </group>

          {/* Swirling Cosmic Starlight Event Horizon */}
          <group position={[0, 1.8, 0]}>
            <mesh ref={vortexRef}>
              <circleGeometry args={[1.35, 32]} />
              <meshBasicMaterial
                color="#a855f7"
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            <mesh ref={ringRef}>
              <ringGeometry args={[1.3, 1.55, 32]} />
              <meshBasicMaterial
                color="#22d3ee"
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>

          {/* Stardust particles */}
          <points ref={particlesRef}>
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" count={particleCount} array={particlePositions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial color="#c084fc" size={0.16} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
          </points>

          <pointLight position={[0, 2.0, 0]} color="#22d3ee" intensity={3.5} distance={10} />

          {/* Floating Dynamic Title */}
          <group position={[0, 3.8, 0]}>
            <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
              <Text
                fontSize={0.34}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#06b6d4"
              >
                {'✦ RETURN TO BASECAMP ✦'}
              </Text>
              <Text
                position={[0, -0.3, 0]}
                fontSize={0.16}
                color="#22d3ee"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.025}
                outlineColor="#000000"
              >
                {isNear ? '✦ Step through to warp ✦' : 'Walk through portal ↗'}
              </Text>
            </Billboard>
          </group>
        </group>
      </group>
    </group>
  )
}

// ─── Grand Central Celestial Plaza ─────────────────────────────
// 100% clean circular nexus without any lines or mesh seams cutting through it!

function CentralPlaza() {
  return (
    <group position={[0, 0, 0]}>
      {/* ── Solid Central Plaza Collider ── */}
      <RigidBody type="fixed" colliders={false} position={[0, -0.2, 0]}>
        <CylinderCollider args={[0.2, 5.8]} friction={0.4} />
      </RigidBody>

      {/* Pristine Circular Stone Platform */}
      <mesh position={[0, -0.08, 0]} receiveShadow>
        <cylinderGeometry args={[5.8, 6.0, 0.16, 36]} />
        <meshStandardMaterial color="#0f1118" roughness={0.5} metalness={0.5} />
      </mesh>

      {/* Concentric Glowing Nexus Floor Rings — Pure circle design with zero line intersections */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.2, 5.5, 36]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.2, 3.45, 36]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 36]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-2}
        />
      </mesh>

      {/* Floating Center Nexus Crystal (above head height) */}
      <mesh position={[0, 3.2, 0]}>
        <octahedronGeometry args={[0.45]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#c084fc"
          emissiveIntensity={2.0}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <pointLight position={[0, 3.2, 0]} color="#c084fc" intensity={2.5} distance={16} />

      {/* Central Nexus Title */}
      <group position={[0, 4.2, 0]}>
        <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
          <Text
            fontSize={0.48}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.045}
            outlineColor="#7c3aed"
            letterSpacing={0.08}
          >
            {'✦ SKILL GALAXY ✦'}
          </Text>
          <Text
            position={[0, -0.32, 0]}
            fontSize={0.16}
            color="#22d3ee"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.025}
            outlineColor="#000000"
          >
            {'Explore the 5 Constellations & Skills ↗'}
          </Text>
        </Billboard>
      </group>
    </group>
  )
}

// ─── 6 Symmetrical Wings (Cosmic Hexagon Star Fortress) ────────
const SKILL_WING_CENTERS = [
  [0, 0, -18],        // 1. AI & ML (North)
  [15.6, 0, -9.0],    // 2. Web & 3D (North-East)
  [15.6, 0, 9.0],     // 3. Mobile & Game (South-East)
  [-15.6, 0, 9.0],    // 4. Backend & Cloud (South-West)
  [-15.6, 0, -9.0],   // 5. Tools & Creative (North-West)
]

const RETURN_SHRINE_CENTER = [0, 0, 18] // 6. Return Stargate (South)

export const GALAXY_SPAWN = [0, 0.4, 0]
export const GALAXY_FALL_THRESHOLD = -20

export default function SkillGalaxy() {
  return (
    <>
      {/* Fast, lightweight 360° cosmic sky & starfield */}
      <GalaxySky />
      <GalaxyStars />

      {/* Global Lighting */}
      <ambientLight intensity={0.55} color="#9999cc" />
      <directionalLight position={[15, 30, 10]} intensity={1.0} color="#e0e8ff" />

      {/* Grand Central Nexus Plaza (Clean circular platform with ZERO intersecting lines) */}
      <CentralPlaza />

      {/* 5 Symmetrical Constellation Sanctuary Wings */}
      {constellations.map((constellation, idx) => (
        <ConstellationWing
          key={constellation.id}
          constellation={constellation}
          center={SKILL_WING_CENTERS[idx]}
        />
      ))}

      {/* 6th Dedicated Wing: Ancient Stargate Return Shrine */}
      <ReturnStargateShrine center={RETURN_SHRINE_CENTER} />
    </>
  )
}
