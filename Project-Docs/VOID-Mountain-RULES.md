# V.O.I.D Mountain Interactive Portfolio — Project Rules

Hard constraints distilled from the PRD, TRD, and Art & Design Document. These are non-negotiable — deviating from them breaks the performance budget, the architecture, or the design intent. Useful as a quick-reference for any collaborator, or as steering rules for an AI coding agent working in this repo.

## 1. Stack Rules
- MUST use React 18+ (Vite or Next.js) — no framework substitutions.
- MUST use Three.js via React Three Fiber (`@react-three/fiber`) for all 3D rendering.
- MUST use `@react-three/drei` for HTML overlays, camera controls, and GLTF loading — don't hand-roll these.
- MUST use Zustand for dimension/state management — no Redux, plain Context, or other state libraries.
- MUST use Framer Motion 3D for portal camera transitions.
- Asset pipeline MUST follow: Blender → GLTF/GLB → Draco compression. No uncompressed `.glb` ships to production.

## 2. Architecture Rules
- Void Islands MUST NOT render until the player triggers the corresponding portal. Load via `<Suspense>` + dynamic imports only.
- The Overworld (Mountain) mesh MUST be unmounted while the player is inside a Void Island. Never keep both fully mounted at once.
- Every teleportation MUST pass through the 0.5s GLSL screen-space transition shader (cosmic dissolve / white flash) to mask the load/unmount.

## 3. Performance Rules
- Total 3D asset payload MUST stay under 10 MB (Draco-compressed).
- Texture maps MUST NOT exceed 2048×2048. Bake lighting/shadows into textures in Blender rather than computing at runtime.
- Draw calls MUST stay under 50 per frame. Merge static geometry; use `InstancedMesh` for repeated objects (e.g., mountain trees).
- Target 60 FPS on desktop. If WebGL is unavailable or the device is low-power, MUST fall back to the static 2D version — never let it degrade into a stuttering 3D scene.

## 4. Design Rules
- Overworld palette stays grounded and low-poly with dawn/sunrise lighting and subtle snow/fog. No neon or cosmic elements here.
- Void Dimension palette is cosmic purple/indigo as the base; cyan and magenta neon are accents only (runes, energy bridges, interactive elements) — not decorative fills.
- Typography MUST be a legible sans-serif technical font (Inter, Roboto Mono, or Space Grotesk) for all 3D floating text and 2D overlays — no serif or decorative fonts, including headers.

## 5. UX & Accessibility Rules
- The 2D Fast Travel overlay MUST stay accessible and functional regardless of 3D scene state or performance.
- The "Download Resume" button MUST always be visible in the Fast Travel overlay — never nested inside a Void Island or gated behind exploration.
- Recruiter test: resume + contact info MUST be reachable in under 5 seconds from page load using only the 2D UI, no 3D navigation required.
- Controls: WASD/arrow keys + mouse look on desktop, virtual joystick on mobile — both are required, neither platform gets a degraded scheme.
- Void Island 3 MUST support distinct video variants playing natively on the 3D smartphone model (e.g., demographic-targeted campaign variants for TrackEasy) — this is a core feature, not optional polish.

## 6. Scope Lock (Do Not Add)
- No additional Void Islands beyond the 3 specified (Identity, Journey, Creation/Projects).
- No additional Overworld checkpoints beyond the 4 specified.
- No alternate state managers, animation libraries, or 3D engines without updating the TRD first.
