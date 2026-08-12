import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import useGameStore from '../../store/useGameStore'
import Mountain from './Mountain'
import Portals from './Portals'
import { Physics } from '@react-three/rapier'
import Player from '../Player/Player'
import FloatingIsland, { ISLAND_SPAWN, FALL_THRESHOLD } from './FloatingIsland'

const TransitionFlash = () => {
  const isTransitioning = useGameStore((state) => state.isTransitioning)
  return (
    <div className={`transition-flash ${isTransitioning ? 'active' : ''}`} />
  )
}

export default function Scene() {
  const currentLocation = useGameStore((state) => state.currentLocation)
  const isOverworld = currentLocation === 'overworld'

  return (
    <>
      <Canvas
        camera={{ position: [12, 8, 10], fov: 50 }}
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {!isOverworld && (
          <color attach="background" args={['#050505']} />
        )}

        {/* Lighting */}
        <ambientLight intensity={0.3} color="#ffeedd" />
        <hemisphereLight args={['#4a1a7a', '#4a7c3f', 0.4]} />
        <directionalLight
          position={[15, 25, 10]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-35}
          shadow-camera-right={35}
          shadow-camera-top={35}
          shadow-camera-bottom={-35}
          shadow-camera-far={80}
          shadow-bias={-0.0005}
          color="#d0b0ff"
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} color="#4a1a7a" />

        <Suspense fallback={null}>
          {isOverworld && (
            <Physics gravity={[0, -9.81, 0]}>
              <FloatingIsland />
              <Player spawnPoint={ISLAND_SPAWN} fallThreshold={FALL_THRESHOLD} />
            </Physics>
          )}
          {!isOverworld && <Portals />}
        </Suspense>
      </Canvas>
      <TransitionFlash />
    </>
  )
}
