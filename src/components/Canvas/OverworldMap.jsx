import { useGLTF, Clone } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'
import { mapBlueprint } from '../../data/mapBlueprint'

const B = '/models/'

const MODEL_MAP = {
  cliff: 'cliff_rock.glb',
  cliff_large: 'cliff_large_rock.glb',
  cliff_half: 'cliff_half_rock.glb',
  cliff_top: 'cliff_top_rock.glb',
  cliff_corner: 'cliff_corner_rock.glb',
  cliff_corner_lg: 'cliff_cornerLarge_rock.glb',
  cliff_corner_in: 'cliff_cornerInner_rock.glb',
  cliff_steps: 'cliff_steps_rock.glb',
  cliff_slope: 'cliff_blockSlope_rock.glb',
  cliff_block: 'cliff_block_rock.glb',
  cliff_cave: 'cliff_cave_rock.glb',
  cliff_diag: 'cliff_diagonal_rock.glb',
  cliff_half_corner: 'cliff_halfCorner_rock.glb',
  cliff_waterfall: 'cliff_waterfall_rock.glb',
  cliff_waterfall_top: 'cliff_waterfallTop_rock.glb',

  portal1: 'statue_obelisk.glb',
  portal2: 'statue_column.glb',
  portal3: 'statue_block.glb',

  rt_a: 'rock_tallA.glb', rt_b: 'rock_tallB.glb', rt_c: 'rock_tallC.glb',
  rt_d: 'rock_tallD.glb', rt_e: 'rock_tallE.glb', rt_f: 'rock_tallF.glb',
  rt_g: 'rock_tallG.glb', rt_h: 'rock_tallH.glb',
  rl_a: 'rock_largeA.glb', rl_b: 'rock_largeB.glb', rl_c: 'rock_largeC.glb',
  rs_a: 'rock_smallA.glb', rs_b: 'rock_smallB.glb',
  
  // Added mappings to support the user's specific exports:
  cliff_block_rock: 'cliff_block_rock.glb',
  rock_tallB: 'rock_tallB.glb',
  tent_detailedOpen: 'tent_detailedOpen.glb',
  campfire_stones: 'campfire_stones.glb',
  campfire_logs: 'campfire_logs.glb',
  log: 'log.glb',
  rock_tallA: 'rock_tallA.glb',
  rock_tallE: 'rock_tallE.glb',
  rock_smallD: 'rock_smallD.glb',
  rock_smallE: 'rock_smallE.glb',
  rock_largeB: 'rock_largeB.glb',

  tree: 'tree_pineDefaultA.glb',
  tree_b: 'tree_pineDefaultB.glb',
  tree_tall: 'tree_pineTallA.glb',
  tree_small: 'tree_pineSmallA.glb',
  tree_round: 'tree_pineRoundA.glb',
  tree_ground: 'tree_pineGroundA.glb',
  tree_cone: 'tree_cone.glb',
  tree_oak: 'tree_oak.glb',

  campfire: 'campfire_stones.glb',
  tent: 'tent_detailedOpen.glb',
  log_stack: 'log_stack.glb',
  sign: 'sign.glb',
  fence: 'fence_simple.glb',

  bush: 'plant_bush.glb',
  bush_small: 'plant_bushSmall.glb',
  flower_purple: 'flower_purpleA.glb',
  flower_red: 'flower_redA.glb',
  flower_yellow: 'flower_yellowA.glb',
  mushroom: 'mushroom_redGroup.glb',
  grass_tuft: 'grass.glb',
  grass_leafs: 'grass_leafs.glb',
  stump: 'stump_old.glb',
  hanging_moss: 'hanging_moss.glb',
  statue_ring: 'statue_ring.glb',
}

function Tile({ type, position, rotation = [0, 0, 0], scale = 1 }) {
  const file = MODEL_MAP[type]
  if (!file) return null
  const { scene } = useGLTF(B + file)
  
  // Clean up NaNs from exported rotations
  const cleanRotation = rotation.map(r => isNaN(r) ? 0 : r);

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <Clone
        object={scene}
        position={position}
        rotation={cleanRotation}
        scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      />
    </RigidBody>
  )
}



function Ground() {
  return (
    <RigidBody type="fixed">
      <mesh position={[4, -0.52, -3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4a7c3f" roughness={0.95} />
      </mesh>
    </RigidBody>
  )
}

export default function OverworldMap() {
  return (
    <group>
      <Ground />
      {mapBlueprint.map((tile, i) => (
        <Tile key={i} {...tile} />
      ))}
    </group>
  )
}

const uniqueFiles = [...new Set(Object.values(MODEL_MAP))]
uniqueFiles.forEach(f => useGLTF.preload(B + f))
