# Prism.js

A lightweight JavaScript 3D rendering engine built from scratch on top of WebGL2.

> **Status: pre-alpha (v0.2.0).** The core pipeline works end to end: math, scene graph, cameras, geometry, materials and `renderer.render(scene, camera)`. There are **no lights, textures, loaders, shadows, picking or animation system yet**, so it is not feature-comparable with mature engines such as Three.js. See [PROGRESS.md](PROGRESS.md) for exactly what exists, what is verified and what is missing.

## Why

A small, readable engine with its own architecture: a simple API for beginners, clear extension points for advanced users, zero dependencies, no framework. It does not wrap or copy another 3D engine.

## Installation

Not on npm yet. From a checkout:

```bash
npm run dev       # serves the repo at http://localhost:8080/ (no install needed)
npm install       # only needed for `npm run build` (installs esbuild)
```

Once published: `import * as Prism from "prism.js";`

## Quick start

```js
import * as Prism from "prism.js";

const canvas = document.querySelector("canvas");
const renderer = new Prism.Renderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new Prism.Scene();
const camera = new Prism.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
camera.position.z = 5;

const cube = new Prism.Mesh(
  new Prism.BoxGeometry(1, 1, 1),
  new Prism.NormalMaterial()
);
scene.add(cube);

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

Materials are unlit for now (`BasicMaterial` = flat color, `NormalMaterial` = shaded by normal). A runnable, responsive version is [examples/03-scene](examples/03-scene/main.js).

## API overview

| Area | Classes |
| --- | --- |
| Math | `Vector2/3/4`, `Matrix3/4`, `Quaternion`, `Euler`, `Color` |
| Scene graph | `Object3D`, `Scene`, `Mesh` |
| Cameras | `PerspectiveCamera` (fov in degrees), `OrthographicCamera` |
| Geometry | `BufferGeometry`, `BufferAttribute`, `BoxGeometry`, `PlaneGeometry`, `SphereGeometry` |
| Materials | `Material`, `BasicMaterial`, `NormalMaterial` (options: `opacity`, `transparent`, `side`, `wireframe`, `depthTest`, `depthWrite`) |
| Rendering | `Renderer`, `WebGLProgram` (low level) |

Conventions: right-handed, +Y up, cameras and `lookAt()` look down **-Z**; matrices are column-major; angles are radians (camera `fov` is the exception, in degrees); triangles are front-facing when counter-clockwise; a `Color` is read from `0xRRGGBB`, `'#rgb'`, `'#rrggbb'` or another `Color` and is used as-is (no sRGB conversion).

**Renderer** options: `canvas`, `alpha`, `antialias`, `depth`, `stencil`, `powerPreference`, `preserveDrawingBuffer`, `pixelRatio`. Main methods: `render(scene, camera)`, `setSize`, `setPixelRatio`, `resizeToDisplaySize()`, `setClearColor`, `clear`, `dispose`. `renderer.info` reports draw calls, triangles, lines, frame number and cached geometry/program counts.

**Scene graph**: `add()` / `remove()` re-parent safely and reject cycles. `position`, `rotation` (Euler) and `quaternion` stay in sync. Local matrices are recomposed only when the transform changed, and world matrices only when the object or an ancestor changed.

**Rendering order**: opaque meshes are grouped by material type/material and drawn near to far; transparent meshes (`transparent: true` or `opacity < 1`) are drawn afterwards, far to near. Shader programs are compiled once per material type; GL state changes are cached.

**Memory**: GPU buffers are created on first draw. `geometry.dispose()` frees one geometry's buffers (it is re-uploaded if drawn again); `renderer.dispose()` frees everything the renderer created. After a lost WebGL context is restored, programs and buffers are rebuilt automatically.

**Errors** are thrown with context, e.g. shader failures include the driver log, the program name and the offending source lines; unknown material options throw instead of being ignored.

## Examples

Run `npm run dev` and open `http://localhost:8080/examples/`.

| Example | Shows |
| --- | --- |
| `01-triangle` | Raw WebGL2 through `Renderer` + `WebGLProgram` |
| `02-game` | Prism Dodge, a small 2D game with a dynamic vertex buffer and touch input |
| `03-scene` | Scene graph, geometries, materials, transparency, wireframe, resize |

## Architecture

```
src/
  index.js        public API (only what is exported here is supported)
  constants.js    FrontSide / BackSide / DoubleSide
  math/           Vector2/3/4, Matrix3/4, Quaternion, Euler, Color
  core/           Object3D, Scene, Mesh, Camera, PerspectiveCamera, OrthographicCamera
  geometry/       BufferAttribute, BufferGeometry, Box/Plane/SphereGeometry
  materials/      Material, BasicMaterial, NormalMaterial
  renderer/       Renderer, WebGLState (state cache), WebGLPrograms (program cache),
                  WebGLGeometries (GPU buffers), RenderList, WebGLProgram, shaders/
scripts/serve.js  zero-dependency dev server
tests/            node:test unit tests (mock WebGL context)
examples/         runnable examples (native ES modules, no build step)
```

## Browser support

Requires **WebGL2**; creating a renderer without it throws an error that lists likely causes. There is no WebGL1 fallback yet.

Verified: headless Chromium 141 with software rendering (SwiftShader). **UNVERIFIED:** Firefox, Safari, Edge, Android Chrome, real GPUs, and performance on any device.

## Development

```bash
npm run dev      # dev server (-- --port 3000 to change the port)
npm test         # unit tests, Node >= 20
npm run build    # dist/prism.module.js (ESM) and dist/prism.min.js (global `Prism`)
```

The unit tests run against a mock WebGL context: they check logic, argument validation, error messages, state caching, sort order and that GPU objects are freed. They do not check pixels; rendering is verified by running the examples in a browser.

The package ships its ES-module sources (`src/`); `dist/` is generated for script-tag use.

## License

MIT, see [LICENSE](LICENSE).
