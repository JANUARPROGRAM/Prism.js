# PROGRESS

## Completed
- **Phase 0 – Foundation**: package.json (ESM, exports map), esbuild build scripts, dev server, README, LICENSE, tests, examples, git repo.
- **Phase 3 (partial)**: `Renderer` (WebGL2 context, size/pixel ratio, resize-to-display, clear color, context lost/restored handling, dispose) and `WebGLProgram` (compile, link, cached locations, detailed errors, dispose).
- **Example** `01-triangle`.

## In Progress
- Nothing.

## Remaining
- Phase 1 math: Vector2/3/4, Matrix3/4, Quaternion, Euler, Color
- Phase 2 scene graph: Object3D, Scene, Mesh, Camera, Perspective/OrthographicCamera
- Phase 3 rest: WebGLState (cached GL state), program cache, buffers/VAOs, textures, uniform setters, `render(scene, camera)`
- Phases 4–10: geometry, materials, lights, textures, loaders (OBJ first), performance pass, DX/docs
- Examples 02–10, docs/ folder, WebGL1 fallback decision
- Replace `setClearColor(hex)` argument with `Color` once it exists

## Known Bugs / Limitations
- After a context restore, GPU resources created by the application (VAOs, buffers, programs) are invalid and must be recreated by their owner; the engine does not do this yet.
- No WebGL1 fallback.
- `Renderer.dispose()` only detaches listeners; there is no GPU resource registry yet.

## Verification status
- VERIFIED: 21 unit tests pass on Node 22 (mock GL).
- VERIFIED: triangle renders, resizes with devicePixelRatio 2, and shader/context errors are formatted correctly in headless Chromium 141 with SwiftShader (software GL).
- VERIFIED: `npm run build` produces working ESM and IIFE bundles using esbuild 0.27.7 (found locally; the sandbox has no network).
- UNVERIFIED: `npm install` from the registry, Firefox, Safari, Edge, Android Chrome, real GPU drivers, performance.

## Architecture Decisions
- ES modules only, no TypeScript, no framework, zero runtime dependencies. `src/` is shipped as-is; `dist/` is for script tags.
- Only `src/index.js` defines the public API.
- WebGL2-only for now. A single `Renderer` replaces the planned `Renderer.js` + `WebGLRenderer.js` split; split only if a WebGL1 backend is actually added.
- Errors are thrown with the driver log, program name and source excerpt (never swallowed). Info logs are stripped of NUL terminators (found with real driver).
- Unit tests use a small mock GL (`tests/helpers/mockGL.js`) that tracks live objects to catch leaks; real rendering is verified in a browser.
- Dev server serves the repo root so examples import `../../src/index.js` directly.

## Next Task
Phase 1, start with `src/math/Vector3.js` + `tests/vector3.test.js` (add/sub/multiply/divide/dot/cross/length/normalize/distance/lerp, applyMatrix4 and applyQuaternion once those exist). Then Matrix4 (multiply, compose, perspective, lookAt, invert) with numeric tests.
