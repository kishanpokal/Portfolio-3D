const fs = require('fs');
const files = fs.readFileSync('public/models/filelist.txt', 'utf8').split('\n').map(f => f.trim()).filter(f => f.endsWith('.glb'));

const categories = {
  Cliffs: [],
  Rocks: [],
  Trees: [],
  Nature: [],
  Paths: [],
  Bridges: [],
  Crops: [],
  Props: []
};

files.forEach(f => {
  if (f.startsWith('cliff_')) categories.Cliffs.push(f);
  else if (f.startsWith('rock_') || f.startsWith('stone_')) categories.Rocks.push(f);
  else if (f.startsWith('tree_')) categories.Trees.push(f);
  else if (f.startsWith('plant_') || f.startsWith('flower_') || f.startsWith('grass') || f.startsWith('mushroom_') || f.startsWith('stump_') || f.startsWith('lily_') || f.startsWith('hanging_moss') || f.startsWith('cactus_')) categories.Nature.push(f);
  else if (f.startsWith('ground_') || f.startsWith('path_')) categories.Paths.push(f);
  else if (f.startsWith('bridge_')) categories.Bridges.push(f);
  else if (f.startsWith('crop_') || f.startsWith('crops_')) categories.Crops.push(f);
  else categories.Props.push(f);
});

fs.mkdirSync('src/components/Editor', { recursive: true });
const output = `export const MODEL_CATEGORIES = ${JSON.stringify(categories, null, 2)};`;
fs.writeFileSync('src/components/Editor/modelList.js', output);
