# PROGRESS

## Completed
- **Phase 0 – Foundation**: package, dev server, build scripts, docs, tests, examples.
- **Phase 1 – Math**: Vector2/3/4, Matrix3/4, Quaternion, Euler (6 orders), Color.
- **Phase 2 – Scene graph**: Object3D (lazy matrices, Euler<->quaternion sync, lookAt), Scene, Mesh, cameras.
- **Phase 3 – Renderer** (core): `render(scene, camera)`, program cache (per material type), `WebGLState` cache, GPU geometry cache with versioned re-upload, render list with sorting and pooling, depth/cull/blend, wireframe, context-loss recovery, disposal, `renderer.info`.
- **Phase 4 – Geometry**: BufferAttribute, BufferGeometry, Box/Plane/SphereGeometry, computeVertexNormals.
- **Phase 5 – Materials**: Material, BasicMaterial, NormalMaterial (opacity, transparent, side, wireframe, depthTest, depthWrite).
- Examples 01-triangle, 02-game, 03-scene.

## In Progress
- Nothing.

## Remaining
- Phase 6 lights: Ambient/Directional/Point + a lit material (Lambert-style)
- Phase 7 textures: Texture, TextureLoader, filtering/wrapping/mipmaps, `map` on materials
- Phase 8 loaders: OBJ first, GLTF later
- Phase 9 performance: frustum culling + bounding volumes, per-material uniform caching, instancing, benchmark harness (no performance claims exist yet)
- Phase 10 DX: docs/ folder, examples 04–10, ShaderMaterial / extension point for custom shaders
- Raycasting/picking, OrbitControls-style camera helper, WebGL1 fallback decision, vertex colors

## Known Bugs / Limitations
- No lighting: materials are unlit.
- No frustum culling: every visible mesh is drawn.
- Only attributes `position`, `normal`, `uv`, `color` are bound; others are stored but ignored. `uv`/`color` are not consumed by any built-in shader yet.
- Material uniforms are re-uploaded on every draw (cheap, but not cached).
- Non-uniform scale on a parent combined with `lookAt` on a child is not handled precisely.
- Raw `gl` calls that change depth/cull/blend/program/VAO state require `renderer.state.reset()` before the next `render()`.
- Resources created with raw `gl` calls (examples 01/02) are not rebuilt after a context restore.
- Color values are used as-is (no sRGB/linear handling).

## Verification status
- VERIFIED: 119 unit tests pass on Node 22 (math incl. random-matrix inversion and all six Euler orders, scene graph, camera projection, geometry winding/normals, renderer state/program/buffer management and disposal). Renderer tests use a mock GL.
- VERIFIED: examples 01 and 03 render correctly in headless Chromium 141 (software GL): correct perspective, depth ordering, transparency, wireframe, resize with devicePixelRatio; no console errors. `renderer.info` reported exactly the expected 6 draw calls / 2156 triangles for 03-scene.
- VERIFIED: `npm run build` bundles work (esbuild 0.27.7 found locally).
- NOT VERIFIED: example 02 was not re-checked after the Renderer rewrite beyond its unchanged public API; `npm install` from the registry; Firefox, Safari, Edge, Android Chrome; real GPUs; any performance characteristic (the fps shown in 03-scene is software rendering in a sandbox and says nothing about real devices).

## Architecture Decisions
- ES modules, no TypeScript, no dependencies; `src/` is shipped as-is, `dist/` is for script tags. Only `src/index.js` is public.
- Matrices are column-major Float64Array; converted to Float32 scratch arrays on upload.
- `rotation` (Euler) and `quaternion` are linked with change callbacks; setting a component never wraps angles.
- Object3D skips matrix work when position/quaternion/scale are unchanged; world matrices recompute only for dirty subtrees.
- Programs are shared per `material.type`; built-in attribute locations are fixed (`position`=0, `normal`=1, `uv`=2, `color`=3) so one VAO per geometry works with every program.
- Index type is Uint16 unless an index exceeds 65534 (65535 is WebGL2's primitive-restart value).
- `-Z` is forward for cameras and for `Object3D.lookAt`.
- Errors carry the driver log, program name and source excerpt; info logs are stripped of NUL terminators.
- Tests use a Proxy-based mock GL that tracks live GL objects to catch leaks.

## Next Task
Phase 6: `Light`, `AmbientLight`, `DirectionalLight`, `PointLight` and a `LambertMaterial` (per-fragment diffuse), collected per frame in the renderer without per-frame allocation; then update 03-scene to use it.
