# Prism.js

A lightweight JavaScript 3D rendering engine built from scratch on top of WebGL2.

> **Status: pre-alpha (v0.2.0).** The core pipeline works: math, scene graph, geometry, materials and `renderer.render(scene, camera)`. Lights, textures and model loaders are not implemented yet, and Prism.js is **not** feature-comparable with mature engines such as Three.js. See [PROGRESS.md](PROGRESS.md) for what exists, what is verified and what is missing.

## Why

A small, readable, modular engine with its own architecture: a simple API for beginners, clear extension points for advanced users, zero dependencies, no framework requirements. It does not wrap or copy any existing 3D engine.

## Installation

Not published to npm yet. From a checkout:

```bash
npm run dev       # serves the repo at http://localhost:8080/ (no install needed)
npm install       # only needed for `npm run build` (installs esbuild)
```

Once published: `import * as Prism from "prism.js";`

## Quick start

```js
import * as Prism from "prism.js";

const renderer = new Prism.Renderer({ canvas: document.querySelector("canvas") });
const scene = new Prism.Scene();
const camera = new Prism.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 5;

const cube = new Prism.Mesh(
  new Prism.BoxGeometry(1, 1, 1),
  new Prism.NormalMaterial()
);
scene.add(cube);

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  if (renderer.resizeToDisplaySize()) {          // canvas sized with CSS
    camera.aspect = renderer.width / renderer.height;
    camera.updateProjectionMatrix();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

A complete page is in [examples/03-scene](examples/03-scene/main.js).

## API overview

**Math** – `Vector2/3/4`, `Matrix3/4` (column-major, double precision), `Quaternion`, `Euler` (all six orders), `Color` (`0xRRGGBB`, `'#rgb'`, `'#rrggbb'`, floats; no sRGB conversion). Methods mutate and return `this`; `clone()` copies.

**Scene graph** – `Object3D` (`position`, `rotation`, `quaternion`, `scale`, `parent`, `children`, `add`, `remove`, `traverse`, `lookAt`, `updateMatrixWorld`), `Scene` (`background`), `Mesh(geometry, material)`, `PerspectiveCamera(fovDegrees, aspect, near, far)`, `OrthographicCamera`. `rotation` and `quaternion` stay in sync. Cameras and objects look down **-Z**. Matrices are only recomputed when a transform or an ancestor changed.

**Geometry** – `BufferGeometry` / `BufferAttribute`, `BoxGeometry`, `PlaneGeometry`, `SphereGeometry` (positions, normals, UVs, indices; counter-clockwise front faces). `geometry.dispose()` frees GPU buffers.

**Materials** – `BasicMaterial({ color })` and `NormalMaterial()`, sharing `opacity`, `transparent`, `side` (`FrontSide`/`BackSide`/`DoubleSide`), `depthTest`, `depthWrite`, `visible` and `wireframe`. Unknown options throw, so typos are caught.

**Renderer** – `new Renderer({ canvas, antialias, alpha, pixelRatio, ... })`, `render(scene, camera)`, `setSize`, `setPixelRatio`, `resizeToDisplaySize`, `setClearColor`, `clear`, `dispose`, `info` (draw calls, triangles, programs, geometries), `capabilities`, `gl`. Opaque meshes are grouped by material and drawn near to far, transparent ones far to near. Programs are compiled once per material type; GL state changes and buffer uploads are cached. After a lost WebGL context is restored, programs and geometry buffers are rebuilt automatically.

**Low level** – `WebGLProgram(gl, { vertexShader, fragmentShader, name })` compiles GLSL ES 3.00 with detailed errors (driver log, program name, source excerpt).

## Examples

Run `npm run dev` and open `http://localhost:8080/examples/`.

| Example | Shows |
| --- | --- |
| `01-triangle` | Raw context, shader program, one draw call |
| `02-game` | Prism Dodge: a 2D game using `Renderer` + `WebGLProgram` with a dynamic vertex buffer |
| `03-scene` | Scene graph, geometries, materials, transparency, wireframe, resize |

## Architecture

```
src/
  index.js        public API (only what is exported here is supported)
  constants.js    FrontSide / BackSide / DoubleSide
  math/           Vector2/3/4, Matrix3/4, Quaternion, Euler, Color, MathUtils
  core/           Object3D, Scene, Mesh, Camera, PerspectiveCamera, OrthographicCamera
  geometry/       BufferAttribute, BufferGeometry, Box/Plane/SphereGeometry
  materials/      Material, BasicMaterial, NormalMaterial
  renderer/       Renderer, WebGLState, WebGLPrograms, WebGLGeometries, RenderList,
                  WebGLProgram, shaders/
tests/            node:test unit tests (math, scene graph, geometry, renderer with a mock GL)
examples/         runnable examples (native ES modules, no build step)
scripts/serve.js  zero-dependency dev server
```

## Browser support

Requires **WebGL2** (no WebGL1 fallback yet). Creating a renderer without it throws an error that lists the likely causes. Verified so far: headless Chromium with software rendering (SwiftShader). **UNVERIFIED:** Firefox, Safari, Edge, Android Chrome, real GPUs.

## Development

```bash
npm run dev        # dev server (optionally: -- --port 3000)
npm test           # unit tests, Node >= 20
npm run build      # dist/prism.module.js (ESM) and dist/prism.min.js (global `Prism`)
```

Unit tests run against a mock WebGL context: they check math, scene-graph behaviour, geometry correctness, state/program/buffer management and cleanup, not GPU output. Rendering is checked by running the examples in a browser.

## License

MIT, see [LICENSE](LICENSE).
