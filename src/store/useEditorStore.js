import { create } from 'zustand'
import { mapBlueprint } from '../data/mapBlueprint'
import { islandBlueprint } from '../data/islandBlueprint'
import { contactIslandBlueprint } from '../data/contactIslandBlueprint'

// Overworld uses shorthand type names that map through MODEL_MAP to actual .glb files
const MODEL_MAP = {
  cliff: 'cliff_rock.glb', cliff_large: 'cliff_large_rock.glb',
  cliff_half: 'cliff_half_rock.glb', cliff_top: 'cliff_top_rock.glb',
  cliff_corner: 'cliff_corner_rock.glb', cliff_corner_lg: 'cliff_cornerLarge_rock.glb',
  cliff_corner_in: 'cliff_cornerInner_rock.glb', cliff_steps: 'cliff_steps_rock.glb',
  cliff_slope: 'cliff_blockSlope_rock.glb', cliff_block: 'cliff_block_rock.glb',
  cliff_cave: 'cliff_cave_rock.glb', cliff_diag: 'cliff_diagonal_rock.glb',
  cliff_half_corner: 'cliff_halfCorner_rock.glb',
  cliff_waterfall: 'cliff_waterfall_rock.glb', cliff_waterfall_top: 'cliff_waterfallTop_rock.glb',
  portal1: 'statue_obelisk.glb', portal2: 'statue_column.glb', portal3: 'statue_block.glb',
  rt_a: 'rock_tallA.glb', rt_b: 'rock_tallB.glb', rt_c: 'rock_tallC.glb',
  rt_d: 'rock_tallD.glb', rt_e: 'rock_tallE.glb', rt_f: 'rock_tallF.glb',
  rt_g: 'rock_tallG.glb', rt_h: 'rock_tallH.glb',
  rl_a: 'rock_largeA.glb', rl_b: 'rock_largeB.glb', rl_c: 'rock_largeC.glb',
  rs_a: 'rock_smallA.glb', rs_b: 'rock_smallB.glb',
  tree: 'tree_pineDefaultA.glb', tree_b: 'tree_pineDefaultB.glb',
  tree_tall: 'tree_pineTallA.glb', tree_small: 'tree_pineSmallA.glb',
  tree_round: 'tree_pineRoundA.glb', tree_ground: 'tree_pineGroundA.glb',
  tree_cone: 'tree_cone.glb', tree_oak: 'tree_oak.glb',
  campfire: 'campfire_stones.glb', tent: 'tent_detailedOpen.glb',
  log_stack: 'log_stack.glb', sign: 'sign.glb', fence: 'fence_simple.glb',
  bush: 'plant_bush.glb', bush_small: 'plant_bushSmall.glb',
  flower_purple: 'flower_purpleA.glb', flower_red: 'flower_redA.glb',
  flower_yellow: 'flower_yellowA.glb', mushroom: 'mushroom_redGroup.glb',
  grass_tuft: 'grass.glb', grass_leafs: 'grass_leafs.glb',
  stump: 'stump_old.glb', hanging_moss: 'hanging_moss.glb', statue_ring: 'statue_ring.glb',
}

// Convert a blueprint array into editor model entries
function blueprintToModels(blueprint, prefix, modelMap = null) {
  return blueprint.map((m, i) => {
    let file = (m.type || '') + '.glb'
    // If a model map is provided, resolve shorthand names
    if (modelMap && modelMap[m.type]) {
      file = modelMap[m.type]
    }
    return {
      id: prefix + '_' + i,
      file,
      position: m.position || [0, 0, 0],
      rotation: m.rotation ? m.rotation.slice(0, 3).map(r => isNaN(r) ? 0 : r) : [0, 0, 0],
      scale: typeof m.scale === 'number' ? [m.scale, m.scale, m.scale] : (m.scale || [1, 1, 1])
    }
  })
}

const overworldModels = blueprintToModels(mapBlueprint, 'ow', MODEL_MAP)
const islandModelsInit = blueprintToModels(islandBlueprint, 'isl')
const contactModelsInit = blueprintToModels(contactIslandBlueprint, 'con')

// Helper to resolve scene → state key
function getSceneKey(scene) {
  if (scene === 'contact') return 'contactModels'
  if (scene === 'overworld') return 'overworldModels'
  return 'islandModels'
}

function getVarName(scene) {
  if (scene === 'contact') return 'contactIslandBlueprint'
  if (scene === 'overworld') return 'mapBlueprint'
  return 'islandBlueprint'
}

const useEditorStore = create((set, get) => ({
  // Which scene is being edited: 'overworld' | 'island' | 'contact'
  editorScene: 'island',
  
  // Models per scene (stored separately)
  overworldModels: overworldModels,
  islandModels: islandModelsInit,
  contactModels: contactModelsInit,

  selectedFile: null,
  selectedId: null,
  transformMode: 'translate',
  hoveredFile: null,
  showGround: true,

  setEditorScene: (scene) => set({ editorScene: scene, selectedId: null, selectedFile: null }),
  
  toggleGround: () => set(state => ({ showGround: !state.showGround })),
  setSelectedFile: (file) => set({ selectedFile: file, selectedId: null }),
  setSelectedId: (id) => set({ selectedId: id }),
  setTransformMode: (mode) => set({ transformMode: mode }),
  setHoveredFile: (file) => set({ hoveredFile: file }),
  clearSelection: () => set({ selectedId: null }),

  addModel: (file, position) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    const key = getSceneKey(get().editorScene)
    set(state => ({
      [key]: [...state[key], {
        id,
        file,
        position: [
          Math.round(position[0] * 4) / 4,
          Math.round(position[1] * 4) / 4,
          Math.round(position[2] * 4) / 4
        ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      }],
      selectedFile: file,
    }))
  },

  updateModel: (id, props) => {
    const key = getSceneKey(get().editorScene)
    set(state => ({
      [key]: state[key].map(m =>
        m.id === id ? { ...m, ...props } : m
      )
    }))
  },

  duplicateSelected: () => {
    const { selectedId, editorScene } = get()
    const key = getSceneKey(editorScene)
    const models = get()[key]
    const model = models.find(m => m.id === selectedId)
    if (!model) return
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    set(state => ({
      [key]: [...state[key], {
        ...model,
        id,
        position: [model.position[0] + 1, model.position[1], model.position[2]],
      }],
      selectedId: id,
    }))
  },

  removeSelected: () => {
    const key = getSceneKey(get().editorScene)
    set(state => ({
      [key]: state[key].filter(m => m.id !== state.selectedId),
      selectedId: null,
    }))
  },

  clearAll: () => {
    const key = getSceneKey(get().editorScene)
    set({ [key]: [], selectedId: null, selectedFile: null })
  },

  exportBlueprint: () => {
    const { editorScene } = get()
    const key = getSceneKey(editorScene)
    const models = get()[key]
    const varName = getVarName(editorScene)
    const lines = models.map(m => {
      const name = m.file.replace('.glb', '')
      const pos = `[${m.position.map(v => Math.round(v * 100) / 100).join(', ')}]`
      const rot = `[${m.rotation.map(v => Math.round(v * 100) / 100).join(', ')}]`
      const scaleArr = m.scale || [1, 1, 1]
      // Check if uniform scale
      const isUniform = scaleArr[0] === scaleArr[1] && scaleArr[1] === scaleArr[2]
      const s = isUniform
        ? Math.round(scaleArr[0] * 100) / 100
        : `[${scaleArr.map(v => Math.round(v * 100) / 100).join(', ')}]`
      let line = `  { type: "${name}", position: ${pos}, rotation: ${rot}`
      if (isUniform && s !== 1) {
        line += `, scale: ${s}`
      } else if (!isUniform) {
        line += `, scale: ${s}`
      }
      line += ' },'
      return line
    })
    return `export const ${varName} = [\n${lines.join('\n')}\n];`
  }
}))

export default useEditorStore
