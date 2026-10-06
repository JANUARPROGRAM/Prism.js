# PROGRESS

## Completed
- **Phase 0 – Foundation**: ESM package, dev server, build scripts, README, LICENSE, tests, examples.
- **Phase 1 – Math**: Vector2/3/4, Matrix3/4 (multiply, invert, compose/decompose, perspective, orthographic, lookAt), Quaternion (slerp), Euler (all 6 orders, gimbal handling), Color.
- **Phase 2 – Scene graph**: Object3D (lazy matrix updates, Euler<->quaternion sync, lookAt, traverse), Scene, Mesh, Camera, PerspectiveCamera, OrthographicCamera.
- **Phase 3 – Renderer** (core): `render(scene, camera)`, program cache, GPU geometry cache (VAO/VBO/IBO, version-based re-upload), GL state cache, sorted render list, resize/pixel ratio, context loss + automatic rebuild, `renderer.info`, disposal.
- **Phase 4 – Geometry**: BufferAttribute, BufferGeometry (computeVertexNormals), Box/Plane/SphereGeometry with position/normal/uv/index.
- **Phase 5 – Materials**: Material, BasicMaterial, NormalMaterial; opacity, transparent, side, wireframe, depthTest, depthWrite.
- Examples 01 triangle, 02 game (Prism Dodge), 03 scene.

## In Progress
- Nothing.

## Remaining
- Phase 6 lights: AmbientLight, DirectionalLight, PointLight + a lit material (Lambert-style) and its GLSL
- Phase 7 textures: Texture, TextureLoader, filtering/wrapping/mipmaps, `map` on materials
- Phase 8 loaders: OBJ first, then (maybe) glTF
- Phase 9 performance: frustum culling (needs bounding spheres), per-material uniform caching, instancing, measure with real GPUs
- Phase 10 DX: docs/ folder, API reference, examples 04-10 (material, texture, light, multiple objects, OBJ, animation)
- Custom shaders/attributes (`ShaderMaterial`); today only attributes position/normal/uv/color are bound, and `color` has no built-in shader yet
- WebGL1 fallback decision; raycaster/picking; camera controls
- Replace the example-only 2D batch in 02-game with engine primitives if a sprite/2D layer is added

## Known Bugs / Limitations
- No lights or textures: scenes are flat-colored or normal-shaded.
- No frustum culling: every visible mesh is drawn.
- Material uniforms are re-uploaded on every draw (cheap but not cached).
- Wireframe line indices are built on the CPU the first time a geometry is drawn as wireframe (a hitch for very large meshes).
- Object3D.lookAt with a non-uniform-scaled parent is approximate (parent scale is ignored).
- `Renderer.clear()` + raw gl code share state with the engine: call `renderer.state.reset()` after raw calls that change depth/cull/blend/program/VAO.
- Raw-gl resources created by user code (examples 01/02) are not rebuilt after a context restore.

## Verification status
- VERIFIED (Node 22): 119 unit tests pass. They use a mock GL, so they cover logic, validation, state caching, sorting, resource cleanup and numerics (random-matrix inverse, Euler round trips for all six orders, projection near/far mapping, geometry winding/normals), not pixels.
- VERIFIED (headless Chromium 141, SwiftShader software GL): examples 01, 02 and 03 render with no console errors/warnings; 03 reports 6 draw calls / 2156 triangles, matching the hand-computed value; resize and portrait framing checked; shader and context-creation errors format correctly on a real driver.
- VERIFIED: `npm run build` bundles (esbuild 0.27.7, found locally) and the example bundle runs.
- UNVERIFIED: `npm install` from the registry, Firefox, Safari, Edge, Android Chrome, real GPU drivers, frame-time performance (the ~50-60 fps seen is software rendering), any comparison with other engines.

## Architecture Decisions
- ES modules only, no TypeScript/framework, zero runtime dependencies. `src/` ships as-is; `dist/` is for script tags.
- Only `src/index.js` is public API. Renderer internals (WebGLState/Programs/Geometries/RenderList) are not exported.
- WebGL2 only for now; one `Renderer` class (no separate WebGLRenderer) until a second backend exists.
- Math in Float64 on the CPU; converted to Float32 into reused scratch arrays on upload.
- Matrices column-major, right-handed, -Z forward; Euler order XYZ means R = Rx*Ry*Rz; Euler and quaternion are linked by change callbacks, and Euler angles are never re-wrapped by the engine.
- Programs are keyed by `material.type` (one compile per type). Built-in shaders use fixed attribute locations (position 0, normal 1, uv 2, color 3), so one VAO per geometry works for every program.
- Index buffers use Uint16 only when max index <= 65534 (65535 is WebGL2's primitive-restart value).
- Geometry/material disposal uses listener sets so the renderer can free GPU objects without the core classes depending on the renderer.
- Unknown material options throw (typo protection); `Color` is not color-managed (no sRGB conversion).

## Next Task
Phase 6: `Light` base + AmbientLight/DirectionalLight/PointLight, a `LambertMaterial` with per-fragment diffuse lighting (uniform arrays for a small fixed number of lights), tests for light collection and uniform packing, and example `06-light`. After that, Phase 7 textures.
