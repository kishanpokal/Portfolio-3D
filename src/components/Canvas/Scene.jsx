import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import useGameStore from '../../store/useGameStore'
import Portals from './Portals'
import { Physics } from '@react-three/rapier'
import Player from '../Player/Player'
import FloatingIsland, { ISLAND_SPAWN, FALL_THRESHOLD } from './FloatingIsland'
import SkillGalaxy, { GALAXY_SPAWN, GALAXY_FALL_THRESHOLD } from './SkillGalaxy'
import CosmicWarpTransition from '../UI/CosmicWarpTransition'

export default function Scene() {
  const currentLocation = useGameStore((state) => state.currentLocation)
  const isOverworld = currentLocation === 'overworld'
  const isGalaxy = currentLocation === 'void-island-4'

  return (
    <>
      <Canvas
        camera={{ position: [12, 8, 10], fov: 50 }}
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        {!isOverworld && (
          <color attach="background" args={[isGalaxy ? '#020010' : '#050505']} />
        )}

        {/* Lighting is handled by IslandEnvironment or Galaxy */}
        {!isOverworld && !isGalaxy && (
          <>
            <ambientLight intensity={0.3} color="#ffeedd" />
            <directionalLight position={[15, 25, 10]} intensity={1.5} castShadow color="#ffffff" />
          </>
        )}

        <Suspense fallback={null}>
          {isOverworld && (
            <Physics gravity={[0, -9.81, 0]}>
              <FloatingIsland />
              <Player spawnPoint={ISLAND_SPAWN} fallThreshold={FALL_THRESHOLD} dropFromSky={true} />
            </Physics>
          )}
          {isGalaxy && (
            <Physics gravity={[0, -9.81, 0]}>
              <SkillGalaxy />
              <Player spawnPoint={GALAXY_SPAWN} fallThreshold={GALAXY_FALL_THRESHOLD} dropFromSky={false} />
            </Physics>
          )}
          {!isOverworld && !isGalaxy && <Portals />}
        </Suspense>
      </Canvas>

      {/* Epic Sci-Fi Hyperspace Cosmic Stargate Transition */}
      <CosmicWarpTransition />
    </>
  )
}
