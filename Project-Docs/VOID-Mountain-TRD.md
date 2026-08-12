# V.O.I.D Mountain Interactive Portfolio — Technical Requirements Document (TRD)

## 1. Technology Stack

- **Core Framework:** React 18+ (Vite or Next.js)
- **3D Engine:** Three.js via React Three Fiber (`@react-three/fiber`)
- **Helper Libraries:** `@react-three/drei` — HTML overlays, camera controls, GLTF loading
- **State & Animation:** Zustand (managing which dimension the player is in) and Framer Motion 3D (smooth portal camera transitions)
- **Asset Pipeline:** Blender (Modeling/Baking) → GLTF/GLB formats → Draco Compression

## 2. Scene & Memory Management

Because this architecture features four separate environments, memory management is critical.

- **Lazy Loading:** The Void Islands MUST NOT be rendered until the player triggers the portal. Use React's `<Suspense>` and dynamic imports to load island assets only when needed.
- **Unmounting:** When the player enters a Void Island, the main Overworld (Mountain) mesh must be temporarily unmounted from the scene to preserve frame rate.
- **Shader Transitions:** Use a custom GLSL screen-space shader (e.g., a cosmic dissolve or white flash) lasting 0.5 seconds to mask the loading/unmounting of environments during teleportation.

## 3. Performance Budgets

| Metric | Constraint | Solution |
| --- | --- | --- |
| **Total 3D Asset Size** | Under 10 MB | Google Draco Compression for all `.glb` files |
| **Texture Maps** | Max 2048x2048 | Bake lighting/shadows directly into textures in Blender |
| **Draw Calls** | < 50 per frame | Merge geometries where possible; use `InstancedMesh` for mountain trees |
| **Target FPS** | 60 FPS (Desktop) | Fallback to a static 2D version if WebGL is disabled or device is low-power |
