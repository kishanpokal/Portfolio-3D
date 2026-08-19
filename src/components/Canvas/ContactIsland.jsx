import { useGLTF } from '@react-three/drei'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { contactIslandBlueprint } from '../../data/contactIslandBlueprint'
import { IslandTile } from './FloatingIsland'
import SocialCubesGroup from './FloatingSocialCube'

// ─── Contact Island ────────────────────────────────────────────
// Renders the Contact & Socials island: platform, bridge, pedestals,
// vegetation, and interactive floating social cubes.
// Lives inside the same <group position={[0, PLATFORM_Y, 0]}> as BaseCamp
// so they share coordinate space, physics, and environment.

export default function ContactIsland() {
  return (
    <group>
      {/* ── Continuous Solid Bridge Walkway Collider ──
          Lowered to Y=0.45 so it sits flush with the grass ground
          Spans from BaseCamp edge (X=12.0) all the way to Contact Island (X=30.5) */}
      <RigidBody type="fixed" colliders={false} position={[21.25, 0.45, 0]}>
        {/* Solid floor deck: [halfX, halfY, halfZ] */}
        <CuboidCollider args={[9.25, 0.1, 1.3]} friction={0.4} />

        {/* Invisible side barriers to prevent falling off the bridge edges */}
        <CuboidCollider args={[9.25, 0.8, 0.1]} position={[0, 0.6, 1.3]} />
        <CuboidCollider args={[9.25, 0.8, 0.1]} position={[0, 0.6, -1.3]} />
      </RigidBody>

      {/* Render all blueprint tiles — platform, visual bridge meshes, pedestals, trees, etc. */}
      {contactIslandBlueprint.map((tile, i) => (
        <IslandTile key={`contact-${i}`} {...tile} />
      ))}

      {/* Interactive floating social cubes above the pedestals */}
      <SocialCubesGroup islandCenter={[38, 0, 0]} />
    </group>
  )
}

// Preload all unique models used by this island
const B = '/models/'
const uniqueContactFiles = [...new Set(contactIslandBlueprint.map(t => t.type + '.glb'))]
uniqueContactFiles.forEach(f => useGLTF.preload(B + f))
