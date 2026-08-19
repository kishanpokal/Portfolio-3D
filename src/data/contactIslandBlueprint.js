// Contact Island Blueprint — updated with new platform scale and pillar positions
// Each entry: { type, position, rotation, scale, signText? }

export const contactIslandBlueprint = [
  { type: "platform_grass", position: [38, 0.45, 0], rotation: [0, 0, 0], scale: [22.95, 11.6, 23.11] },
  
  // ─── Bridge Segments ───
  { type: "bridge_wood", position: [13.02, 0.45, 0], rotation: [0, -0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [15.09, 0.45, 0], rotation: [0, -0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [17.11, 0.45, 0], rotation: [0, -0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [19.14, 0.45, 0], rotation: [0, -0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [21.13, 0.45, 0], rotation: [0, -0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [23.07, 0.45, 0], rotation: [0, 0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [25.07, 0.45, 0], rotation: [0, 0, 0], scale: 2.5 },
  { type: "bridge_wood", position: [27.13, 0.45, 0.02], rotation: [0, 0.01, 0], scale: 2.5 },
  { type: "bridge_wood", position: [29.09, 0.45, 0], rotation: [0, -0.02, 0], scale: 2.5 },

  // ─── Stone Pedestals for Social Cubes ───
  { type: "statue_column", position: [34, 0.66, -2.59], rotation: [0, 0, 0], scale: [1.3, 1.13, 1.3] },   // GitHub
  { type: "statue_column", position: [43.04, 0.65, -1.55], rotation: [0, 0, 0], scale: 1.3 },             // LinkedIn
  { type: "statue_column", position: [38, 0.66, -2.9], rotation: [0, 0, 0], scale: [1.3, 1.16, 1.3] },     // Instagram
  { type: "statue_column", position: [40.87, 0.65, 1.86], rotation: [0, 0, 0], scale: 1.3 },             // Email
  { type: "statue_column", position: [34.77, 0.65, 2.33], rotation: [0, 0, 0], scale: [1.3, 1.12, 1.3] }, // Resume

  // ─── Sign & Vegetation ───
  { type: "sign", position: [32, 1.03, 1.47], rotation: [0, 0.4, 0], scale: 1.65, signText: "Contact &\nSocials" },
  { type: "tree_oak_fall", position: [34.49, 0.35, -7.11], rotation: [0, 0, 0], scale: 2.77 },
  { type: "tree_oak_fall", position: [45, 0.44, 2.71], rotation: [0, 1.5, 0], scale: 4.48 },
  { type: "tree_default_fall", position: [44, 0.7, -3], rotation: [0, 0, 0], scale: 2 },
  { type: "tree_pineTallA", position: [33.67, 0.06, 5.5], rotation: [0, 0, 0], scale: 3.16 },
  { type: "tree_pineRoundC", position: [44, 0.9, 1], rotation: [0, 0, 0], scale: 2.29 },
  { type: "plant_bushDetailed", position: [35, 0.87, 3.5], rotation: [0, 0, 0], scale: 1.8 },
  { type: "plant_bush", position: [41, 0.77, -3.57], rotation: [0, 0, 0], scale: 1.5 },
  { type: "flower_purpleA", position: [40, 1.14, -3.7], rotation: [0, 0, 0], scale: 1.7 },
  { type: "flower_purpleC", position: [36.74, 1.14, 2], rotation: [0, 0, 0], scale: 1.5 },
  { type: "flower_yellowB", position: [42.43, 1.14, 1], rotation: [0, 0, 0], scale: 1.6 },
  { type: "flower_yellowA", position: [33.68, 1.14, 1.11], rotation: [0, 0, 0], scale: 1.4 },
  { type: "grass", position: [37, 1.1, -2.22], rotation: [0, 0, 0], scale: 1.4 },
  { type: "grass", position: [39, 1.1, 2], rotation: [0, 0, 0], scale: 1.4 },
  { type: "grass", position: [36, 1.1, -4], rotation: [0, 0, 0], scale: 1.4 },
  { type: "grass", position: [41, 0.36, 4.99], rotation: [0, 0, 0], scale: 1.4 },
  { type: "mushroom_redGroup", position: [35, 1.1, -3.01], rotation: [0, 0.8, 0], scale: 1.2 },
  { type: "stone_smallF", position: [41.84, 0.85, -3.17], rotation: [0, 0, 0], scale: 3 },
  { type: "rock_smallA", position: [33, 0.82, 2.27], rotation: [0, 1.2, 0], scale: 2 },
];
