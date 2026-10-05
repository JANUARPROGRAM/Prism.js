# Prism.js

A lightweight JavaScript 3D rendering engine built from scratch on top of WebGL/WebGL2.

> **Status: pre-alpha (v0.1.0).** Only the foundation exists: WebGL2 context management, shader programs and one example. There is no scene graph, math library, geometry or materials yet. See [PROGRESS.md](PROGRESS.md) for exactly what is done and what is not.

## Why

Prism.js aims to be a small, readable, modular engine with its own architecture: a simple API for beginners, clear extension points for advanced users, no dependencies and no framework requirements. It does not wrap or copy any existing 3D engine.

## Installation

Not published to npm yet. From a checkout:

```bash
npm install     # only needed for `npm run build` (installs esbuild)
npm run dev     # serves the repo at http://localhost:8080/
```

Once published:

```js
import * as Prism from "prism.js";
```

## Quick start (what works today)

```js
import { Renderer, WebGLProgram } from "prism.js";

const renderer = new Renderer({ canvas: document.querySelector("canvas") });
renderer.setClearColor(0x14161a);
renderer.setSize(window.innerWidth, window.innerHeight);

const program = new WebGLProgram(renderer.gl, {
  name: "MyProgram",
  vertexShader: `#version 300 es ...`,
  fragmentShader: `#version 300 es ...`
});

renderer.clear();
program.use();
// ...draw with renderer.gl
```

The complete, runnable version is [examples/01-triangle](examples/01-triangle/main.js).

## Basic API

**`new Renderer(options)`** – options: `canvas`, `alpha`, `antialias`, `depth`, `stencil`, `powerPreference`, `preserveDrawingBuffer`, `pixelRatio`.
Throws a descriptive error if WebGL2 is unavailable.

| Member | Purpose |
| --- | --- |
| `gl` | The `WebGL2RenderingContext` |
| `domElement` | The canvas |
| `capabilities` | Frozen object: GL version, GLSL version, max texture size, max vertex attributes |
| `setSize(w, h, updateStyle = true)` | Size in CSS pixels; drawing buffer = size × pixelRatio |
| `setPixelRatio(r)` | Change pixel ratio |
| `resizeToDisplaySize()` | For CSS-sized canvases; returns `true` if the buffer changed |
| `setClearColor(0xRRGGBB, alpha = 1)` | Clear color |
| `clear(color = true, depth = true, stencil = false)` | Clear buffers |
| `dispose()` | Remove event listeners; later calls throw |

**`new WebGLProgram(gl, { vertexShader, fragmentShader, name })`** – GLSL ES 3.00 sources. Compile and link errors include the driver log, the program name and the offending source lines. Methods: `use()`, `getUniformLocation(name)` and `getAttributeLocation(name)` (both cached), `dispose()`.

## Examples

Run `npm run dev` and open `http://localhost:8080/examples/`.

| Example | Shows |
| --- | --- |
| `01-triangle` | Context creation, shader program, one draw call, resize handling |

More examples arrive with the phases they depend on.

## Architecture

```
src/
  index.js            public API (only what is exported here is public)
  renderer/
    Renderer.js       context, size, clear state, context-loss handling
    WebGLProgram.js   shader compile/link, location caching, error reporting
scripts/serve.js      zero-dependency dev server
tests/                node:test unit tests
examples/             runnable examples (native ES modules, no build step)
```

Planned modules (math, core, geometry, materials, lights, textures, loaders) are listed in PROGRESS.md.

## Browser support

Prism.js requires **WebGL2**. WebGL1 is not supported yet; creating a renderer without WebGL2 throws an error that explains the likely causes.

Verified so far: headless Chromium (software rendering via SwiftShader). **UNVERIFIED:** Firefox, Safari, Edge, Android Chrome, and real GPUs.

## Development

```bash
npm run dev        # dev server, optional: -- --port 3000
npm test           # unit tests (Node >= 20)
npm run build      # dist/prism.module.js (ESM) and dist/prism.min.js (global `Prism`)
```

Unit tests run against a mock WebGL context. They cover argument validation, error messages, resource cleanup and caching, not actual GPU output. Rendering is checked by running the examples in a browser.

The package ships its ES-module sources (`src/`) directly; `dist/` is generated for script-tag use.

## License

MIT, see [LICENSE](LICENSE).
