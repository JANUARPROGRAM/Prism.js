# PROGRESS

## Completed
- **Phases 0-8** (foundation, math, scene graph, renderer, geometry incl. `CapsuleGeometry`, materials, lighting, textures, OBJ + MTL loaders): see the README. All covered by unit tests and 30 pixel checks in a real WebGL2 context.
- **Physics (v0.4.0 -> v0.5.0)**: rigid bodies; sphere / box / **capsule** / plane shapes; SAT box-box with face clipping; sequential impulses with warm starting, split-impulse position correction, Coulomb + torsional + **rolling** friction; sleeping; raycast; kinematic platforms; **joints** (`BallSocketJoint`, `HingeJoint` with motor, `DistanceJoint` rod / rope / stop); **CCD** (`ccd: true`).
- **Optimization (v0.5.0)**: frustum culling (bounding spheres + `Frustum`), uniform caching, `InstancedMesh` (+ per-instance color), physics broad phase that only enumerates pairs involving awake bodies with a persistent sort order, mover list (settled world costs ~0), allocation-free box-box narrow phase and warm-start manifolds.
- Examples 01-07 and `cdn`; benchmark script (`npm run benchmark`) and a browser benchmark page (`tests/browser/bench.html`).
- Release packaging for jsDelivr: committed `dist/`, `assets/`, Indonesian README.

## In Progress
- Nothing.

## Remaining
- Measure on real devices (phones, GPUs): rendering and physics. A browser benchmark page exists; no device results have been collected yet.
- glTF/GLB loader; shadows; specular/PBR; environment maps; `ShaderMaterial`; more than 4+4 lights; WebGL1 decision.
- Physics: joint angle limits / springs / prismatic joints; compound, cylinder, convex and mesh colliders; trigger volumes; two-sided CCD (both bodies swept) and rotation-aware sweeps; soft bodies; islands for per-group sleeping; multithreading.
- Picking against meshes (raycaster for scene objects), camera controls, animation system, npm publish (name availability unchecked).

## Known Bugs / Limitations
- The global name `Prism` (and file names prism.js / prism.css) collide with the PrismJS highlighter on one page (README troubleshooting).
- `dist/` must be rebuilt and committed before every tag; nothing automates it.
- Physics micro-optimizations (specialised helpers, allocation-free narrow phase, reused manifolds) gave **no measurable speed-up** for falling piles (solver-bound: 1000 bodies ~ 4.5 ms/step in the sandbox); they only removed garbage.
- Joints: discretisation error is real (a fast chain can stretch by centimetres for a moment); no angle limits.
- CCD sweeps one body against the others' start-of-step poses and ignores rotation; capsule-vs-box uses three support points, not a full manifold.
- Render benchmark uses a stub GL: it measures JS cost and exact GL call counts, not GPU/driver time or instance-buffer upload cost.
- Everything under "Verification status" that says UNVERIFIED.

## Verification status
- VERIFIED (Node 22): full unit suite (run `npm test`; the count is printed there). Physics: 76 numeric tests (49 world + 10 capsule + 5 CCD + 12 joints), including: free fall, bounce heights, momentum/energy, friction stopping distance, slopes, rolling to (2/7) r w0, rolling resistance a = mu_r g / (1.4 r), stacks, a pile that settles and sleeps, capsule inertia against numerical integration of its volume, pendulum period within 1%, joint energy behaviour (loss first order in dt), hinge motor limits, CCD vs tunnelling.
- VERIFIED determinism: with sleeping off, the 120-body x 400-step checksum is bit-identical between v0.4.0 and now (d75e0e1a); with sleeping on, max position difference 3.03e-8 m (a body that wakes now gets contacts with sleeping neighbours in the same step). Default-behaviour checksum afc798f4 unchanged by all later optimizations.
- VERIFIED (headless Chromium 141, SwiftShader): 30/30 pixel checks (including: culling changes zero pixels; InstancedMesh == separate meshes with Lambert, non-uniform scale and per-instance colors); examples 01-07 run with no console problems; the benchmark page runs; built `dist/prism.js` global exposes the new classes.
- VERIFIED measurements (sandbox, Node/V8, best of 5): see README "Optimizacion dan kinerja" for the full before/after table. Highlights: settled pile 1.80 -> 0.58 ms, fully asleep 1.33 -> 0.010 ms, 1000 meshes with 10% visible: 4013 -> 316 GL calls and 0.67 -> 0.15 ms, 4000 meshes -> 1 InstancedMesh: 12013 -> 17 GL calls.
- INCIDENT (recorded for honesty): while adding joints I overwrote an uncommitted `src/physics/joints.js` from earlier work whose copy existed nowhere else, and the world code ended up with duplicated joint integration. Recovery: the earlier 11 joint tests were treated as the specification, `PhysicsWorld.js` was cleaned back to one integration (old protocol: `isJoint`, `_prepare`, `_warmStart`, `_reset`, `_solve`), and `joints.js` was rewritten to that protocol; all 11 tests passed on the first run, then a 12th (whole sleeping chain wakes in one step) was added. Lesson: commit working states before editing.
- UNVERIFIED: the real jsDelivr URLs (repo not pushed, no network here), `npm install` from the registry, Firefox, Safari, Edge, Android Chrome, real GPU drivers, any timing on a phone, any comparison with other engines or physics libraries.

## Architecture Decisions
- ES modules only, zero runtime dependencies; `src/` ships as-is, `dist/` for script tags. Only `src/index.js` is public API.
- Physics depends only on math. Bodies link to scene objects through `body.object`; planes live in the body frame.
- Joint protocol between world and joint (internal): `isJoint`, `_prepare(dt, beta, maxBias)`, `_warmStart()`, `_reset()`, `_solve(pseudo)`, `_error`. Joints attached to "the world" use a hidden immovable body.
- Position correction (contacts AND joints) uses pseudo velocities so it never adds energy; warm starting caches impulses per body pair (contacts) or per joint.
- Broad phase keeps its sorted array between steps with creation order as the tie-break, so contact order (and therefore results) does not depend on history.
- Culling is conservative (bounding sphere vs 6 planes); instancing compiles its own program variants (defines), keeps instance data in its own buffers/VAO, and does not cull per instance.
- Rendering decisions unchanged (program per material type, fixed attribute locations, lights in view space, texture unit 0, loaders split into pure parsers and scene builders).

## Next Task
Collect real-device numbers with `tests/browser/bench.html` and use them to decide what to optimize next. Candidate features with the best value: glTF loader, joint angle limits, and a rotation-aware / two-sided CCD.
