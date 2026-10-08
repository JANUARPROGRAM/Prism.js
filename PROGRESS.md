# PROGRESS

## Completed
- **Phase 0 – Foundation**: ESM package, dev server, build scripts, README (Indonesian), LICENSE, tests, examples.
- **Phase 1 – Math**: Vector2/3/4 (`project` / `unproject`), Matrix3/4, Quaternion (slerp), Euler (6 orders), Color.
- **Phase 2 – Scene graph**: Object3D (lazy matrix updates, Euler<->quaternion sync, lookAt), Group, Scene, Mesh, cameras (with `projectionMatrixInverse`).
- **Phase 3 – Renderer**: `render(scene, camera)`, program / geometry / texture / state caches, sorted render list, resize, context-loss rebuild, `renderer.info`, disposal.
- **Phase 4 – Geometry**, **Phase 5 – Materials** (Basic, Normal, Lambert, `map`), **Phase 6 – Lighting** (Ambient, Directional, Point), **Phase 7 – Textures**, **Phase 8 – Loaders** (OBJ + MTL + TextureLoader).
- **Physics (new, v0.4.0)**: `PhysicsWorld`, `RigidBody`, `SphereShape` / `BoxShape` / `PlaneShape`. Fixed time step, sweep-and-prune, narrow phase for every shape pair (box-box = SAT over 15 axes + face clipping, edge-edge fallback), sequential-impulse solver with warm starting, restitution, Coulomb + torsional friction, split-impulse position correction, sleeping, collision groups/masks, kinematic platforms, forces / torques / impulses at a point, `raycast`, `onContact`, mesh sync via `body.object`.
- Examples: 01 triangle, 02 game, 03 scene, 04 lighting, 05 obj, 06 physics, cdn.
- Release packaging for jsDelivr: `dist/` committed; `assets/` (logo, preview, models).
- Browser pixel checks (`tests/browser/`): 26 checks on a real WebGL2 context.

## In Progress
- Nothing.

## Remaining
- Phase 9 performance: bounding spheres + frustum culling, per-material uniform caching, instancing, measurements on real devices (rendering AND physics).
- glTF/GLB loader (small, built on the same loader conventions).
- Physics: joints/constraints, continuous collision detection, capsule/cylinder/convex/mesh colliders, compound shapes, trigger volumes, rolling resistance, allocation-free box-box narrow phase, islands for per-group sleeping.
- Rendering: shadows, specular/PBR, environment maps, more than 4+4 lights, ShaderMaterial, WebGL1 fallback decision.
- Picking against meshes (raycaster for scene objects), camera controls, animation system, npm publish (name availability unchecked).

## Known Bugs / Limitations
- The global name `Prism` (and file names prism.js / prism.css) collide with the PrismJS highlighter on one page (README troubleshooting).
- `dist/` must be rebuilt and committed before every tag; nothing automates it.
- Physics: no joints, no CCD (fast thin bodies can tunnel), no gyroscopic term, no rolling resistance, planes only for static bodies, results not guaranteed identical across JS engines/devices, box-box narrow phase allocates temporary arrays.
- Physics wake rule: a sleeping body only wakes when touched by something moving faster than `wakeSpeed` (0.25), so a very slow push is treated as resting against a static object.
- Rendering limits as before: LambertMaterial black without lights; 4+4 lights; no frustum culling; OBJ concave polygons and specular/bump maps unsupported.
- Raw gl code mixed with `render()` must call `renderer.state.reset()` when it changes depth/cull/blend/program/VAO.

## Verification status
- VERIFIED (Node 22): full unit suite with a mock GL for rendering and direct numeric tests for physics (see the count printed by `npm test`).
- VERIFIED physics numerics: free fall within 2% (semi-implicit Euler at 1/60 s), bounce height e²h (e=0.5 -> 0.757 vs 0.75, e=0.8 -> 2.00 vs 1.92), exact momentum conservation, energy within 1% at e=1, friction stopping distance v²/(2μg), slope hold / slide acceleration, rolling at (2/7)rω0, 3-box stack drift ≈ 0.001-0.002 m over 6 s, 20:1 mass ratio, 36-body pile settles and sleeps, no energy gain on impact, deterministic results, narrow-phase contact counts/normals/depths, ray casts.
- VERIFIED physics benchmark in this sandbox only (Node/V8): 300 falling/stacking bodies ≈ 3.2 ms median per step, p95 ≈ 5.6 ms. NOT measured on phones or in browsers.
- VERIFIED (headless Chromium 141, SwiftShader): tests/browser 26/26 pixel checks; examples 01-06 run without console errors; 06-physics spawn, rain, tap-to-shoot and reset work.
- Bugs found and fixed while building the physics (kept here as a record): (1) Baumgarte position correction fed energy into real velocities (e=0 bodies popped up, inelastic collisions kept relative speed) -> replaced by split impulse; (2) warm-start impulses applied inside the preparation loop corrupted later contacts' pre-solve velocities and made 20-iteration stacks collapse -> warm start now runs after all contacts are prepared; (3) a spinning sphere never stopped spinning about the contact normal -> added torsional friction; (4) the example fed a negative first-frame dt (rAF timestamp earlier than performance.now()) -> clamped, and `step()` rejects negative dt; (5) several test expectations were wrong (restitution combines with max, contact point is midway in the gap) and were corrected only after checking the engine value against hand calculation.
- UNVERIFIED: real jsDelivr URLs (repo not pushed, no network here), `npm install` from the registry, Firefox, Safari, Edge, Android Chrome, real GPU drivers, frame-time performance on any device, any comparison with other engines or physics libraries.

## Architecture Decisions
- ES modules only, zero runtime dependencies; `src/` ships as-is, `dist/` for script tags. Only `src/index.js` is public API.
- Physics depends only on math (no renderer). Bodies are linked to scene objects through `body.object`; planes are defined in the body frame so a static body can move or tilt them.
- Fixed time step with accumulator and a sub-step cap (slow motion instead of a spiral of death).
- Restitution combines with max, friction with sqrt(μ1·μ2). Contact normals always point from body A to body B.
- Position correction uses pseudo velocities (split impulse) so it never adds momentum; warm starting caches impulses per body pair and nearby contact point, friction as a world vector on the higher-id body.
- Sleeping bodies act as static (infinite mass) for awake neighbours; only a mover faster than `wakeSpeed` wakes them.
- Rendering decisions unchanged (program per material type, fixed attribute locations, lights in view space, texture unit 0, loaders split into pure parsers and scene builders).

## Next Task
Phase 9: bounding spheres + frustum culling with tests and a browser check; then measure rendering and physics on a real phone before optimizing anything. Physics follow-up with the best value: continuous collision detection for fast bodies, then capsule colliders.
