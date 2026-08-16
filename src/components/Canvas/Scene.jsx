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

        {/* Lighting is handled by IslandEnvironment in FloatingIsland.jsx */}
        {!isOverworld && (
          <>
            <ambientLight intensity={0.3} color="#ffeedd" />
            <directionalLight position={[15, 25, 10]} intensity={1.5} castShadow color="#ffffff" />
          </>
        )}

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
