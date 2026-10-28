# PROGRESS

## Completed
- **Phase 0 – Foundation**: ESM package, dev server, build scripts, README (Indonesian), LICENSE, tests, examples.
- **Phase 1 – Math**: Vector2/3/4, Matrix3/4, Quaternion (slerp), Euler (6 orders, gimbal handling), Color.
- **Phase 2 – Scene graph**: Object3D (lazy matrix updates, Euler<->quaternion sync, lookAt, traverse), Group, Scene, Mesh, Camera, Perspective/OrthographicCamera.
- **Phase 3 – Renderer**: `render(scene, camera)`, program cache (per material type + textured variant), GPU geometry cache, texture cache, GL state cache, sorted render list, resize/pixel ratio, context loss with automatic rebuild, `renderer.info`, disposal.
- **Phase 4 – Geometry**: BufferAttribute, BufferGeometry (computeVertexNormals), Box/Plane/SphereGeometry.
- **Phase 5 – Materials**: Material, BasicMaterial, NormalMaterial, LambertMaterial; opacity, transparent, side, wireframe, depthTest, depthWrite, `map`.
- **Phase 6 – Lighting**: Light, AmbientLight, DirectionalLight, PointLight (range + decay); per-pixel Lambert shader; lights packed in view space and uploaded once per program per frame; limits 4 directional + 4 point.
- **Phase 7 – Textures**: Texture (image / canvas / ImageBitmap / raw RGBA), TextureLoader (Image based, CORS aware), filtering, wrapping, mipmaps, flipY, 1x1 white placeholder while loading, dispose.
- **Phase 8 – Loaders**: OBJLoader (v/vt/vn/f in all four forms, negative indices, polygons, o/g/usemtl/mtllib, flat normals when missing, line-numbered errors), MTLLoader (Kd, d/Tr, map_Kd with options), MaterialLibrary, automatic mtllib + texture loading relative to each file, URL modifier for user-picked files.
- Examples: 01 triangle, 02 game, 03 scene, 04 lighting, 05 obj (viewer with file picker), cdn (script tag + CSS).
- Release packaging for jsDelivr: `dist/` committed (Vertex IIFE global `Prism`, prism.min.js, prism.module.js, vertex.css, prism.min.css + maps); `assets/` (logo, preview, models/crate, models/house); `npm run assets` regenerates the models.
- **Browser pixel checks** (`tests/browser/`): 26 checks against a real WebGL2 context.

## In Progress
- Nothing.

## Remaining
- Phase 9 performance: frustum culling (needs bounding spheres), per-material uniform caching, instancing, real-GPU measurements.
- glTF/GLB loader (only after the OBJ architecture proved stable; do not write a giant parser).
- Specular/PBR, shadows, environment maps; more than 4+4 lights (or a defines-based variant).
- Custom shaders/attributes (`ShaderMaterial`); today only attributes position/normal/uv/color are bound and `color` has no built-in shader yet.
- MTL: specular, bump and opacity maps, `illum`; OBJ: concave polygon triangulation, smoothing groups.
- Picking/raycaster, camera controls, animation system.
- WebGL1 fallback decision; npm publish (name availability unchecked).
- Examples 06-10 in the original plan are covered by 03-05; docs/ folder with an API reference.

## Known Bugs / Limitations
- The global name `Prism` (and file names Vertex / vertex.css) collide with the PrismJS syntax highlighter on the same page (documented in the README).
- `dist/` must be rebuilt (`npm run build`) and committed before every tag; nothing automates it.
- LambertMaterial renders black without lights; lit materials need a `normal` attribute (clear error otherwise).
- OBJ: concave polygons are fan-triangulated incorrectly; normals are flat when the file has none; the whole model's normals are recomputed if only some faces have `vn`.
- Material uniforms are re-uploaded on every draw (cheap, not cached); no frustum culling; wireframe line indices are built on the CPU on first use.
- Object3D.lookAt with a non-uniform-scaled parent is approximate.
- Raw gl code mixed with `render()` must call `renderer.state.reset()` when it changes depth/cull/blend/program/VAO; raw-gl resources of user code are not rebuilt after a context restore.
- Large OBJ models (hundreds of thousands of triangles): parsing uses string keys per vertex; not measured.

## Verification status
- VERIFIED (Node 22): 180 unit tests with a mock GL: logic, validation, error messages, state/program/texture/geometry caching, sort order, GPU-object cleanup, numerics (random-matrix inverse, Euler round trips, projection mapping, geometry winding), light packing in view space, OBJ/MTL parsing and loading with a stubbed `fetch`.
- VERIFIED (headless Chromium 141, SwiftShader software GL): `tests/browser/` 26 of 26 pixel checks pass with unchanged tolerances (±3 levels): lighting N·L for many directions, view-space lights with moved cameras, point-light range/decay, transparent sorting, culling, wireframe, texture orientation through raw data and a real PNG decoded by the browser, texture x color, OBJ+MTL from text, and the real `assets/models` loaded over HTTP (crate texture, house materials).
  - Two checks first failed by 6 and 4 levels; cause: an even-sized canvas puts the camera axis on a pixel boundary, so the "center pixel" sampled half a pixel off-axis. The checks now use a 65x65 canvas and pass exactly. No shader change was needed.
- VERIFIED: examples 04 and 05 run without errors; 05's file picker loads obj+mtl+png and reports readable errors for a broken .obj and for a selection without .obj.
- VERIFIED: `npm run build` (esbuild 0.27.7 found locally) and the bundle exports.
- UNVERIFIED: the real jsDelivr URLs (repo not pushed / tag not created; sandbox has no network), `npm install` from the registry, Firefox, Safari, Edge, Android Chrome, real GPU drivers, any frame-time performance (the 23-60 fps seen is software rendering), any comparison with other engines.

## Architecture Decisions
- ES modules only, no TypeScript/framework, zero runtime dependencies. `src/` ships as-is; `dist/` is for script tags and is committed.
- Only `src/index.js` is public API. Renderer internals (WebGLState/Programs/Geometries/Textures/Lights, RenderList) are not exported.
- WebGL2 only; one `Renderer` class until a second backend exists.
- Math in Float64 on the CPU; converted to Float32 into reused scratch arrays on upload.
- Matrices column-major, right-handed, -Z forward; Euler "XYZ" means R = Rx*Ry*Rz; Euler and quaternion linked by change callbacks, Euler angles never re-wrapped.
- Programs keyed by `material.type` (+ `:map` variant compiled with `#define USE_MAP`). Fixed attribute locations (position 0, normal 1, uv 2, color 3) so one VAO per geometry serves every program.
- Lights are collected during the scene traversal into flat arrays in view space; shader constants MAX_DIR/MAX_POINT come from WebGLLights.js so JS and GLSL cannot disagree.
- Textures use unit 0 only (one map per material); a not-yet-loaded image uploads a 1x1 white texel so the material color shows.
- Loaders: a pure `parseOBJ` returns typed arrays (testable without GPU classes); `OBJLoader.parse` builds scene objects; URLs are resolved by plain string joining against the file that mentioned them; `setURLModifier` is the single hook for custom sources (blob/data URLs, embedded files).
- Index buffers use Uint16 only when max index <= 65534 (65535 is WebGL2's primitive-restart value).
- Disposal via listener sets (geometry/material/texture) so core classes never depend on the renderer.
- Unknown material options throw; `Color` is not color-managed.

## Next Task
Phase 9: bounding spheres + frustum culling (with tests and a browser check that culled objects do not draw), then measure draw-call and upload costs on a real device before changing anything else. After that: glTF (minimal, mesh + material + texture) built on the same loader conventions.
