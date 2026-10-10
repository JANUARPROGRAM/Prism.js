import { Color } from '../math/Color.js';
import { Matrix3 } from '../math/Matrix3.js';
import { Matrix4 } from '../math/Matrix4.js';
import { Frustum } from '../math/Frustum.js';
import { WebGLState } from './WebGLState.js';
import { WebGLPrograms } from './WebGLPrograms.js';
import { WebGLGeometries } from './WebGLGeometries.js';
import { RenderList } from './RenderList.js';
import { WebGLLights } from './WebGLLights.js';
import { WebGLTextures } from './WebGLTextures.js';

function createCanvas() {
	if (typeof document === 'undefined') {
		throw new Error(
			'Prism.js: No `canvas` option was given and `document` is not available to create one.'
		);
	}
	return document.createElement('canvas');
}

function assertPositive(name, value) {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError(`Prism.js: ${name} must be a positive finite number, received ${String(value)}.`);
	}
}

/**
 * Owns the WebGL2 context, the drawing-buffer size and the clear state, and
 * draws scenes with `render(scene, camera)`.
 *
 * `renderer.gl` stays available for low-level code (see examples/01-triangle).
 * Raw gl calls that change depth/cull/blend state or the bound program/VAO
 * should be followed by `renderer.state.reset()` before the next `render()`.
 */
export class Renderer {
	/**
	 * @param {object} [options]
	 * @param {HTMLCanvasElement} [options.canvas] Created when omitted; see `domElement`.
	 * @param {boolean} [options.alpha=false] Canvas has an alpha channel (page shows through).
	 * @param {boolean} [options.antialias=true]
	 * @param {boolean} [options.depth=true]
	 * @param {boolean} [options.stencil=false]
	 * @param {'default'|'low-power'|'high-performance'} [options.powerPreference='default']
	 * @param {boolean} [options.preserveDrawingBuffer=false]
	 * @param {number} [options.pixelRatio=devicePixelRatio] Drawing-buffer pixels per CSS pixel.
	 */
	constructor(options = {}) {
		const {
			canvas = createCanvas(),
			alpha = false,
			antialias = true,
			depth = true,
			stencil = false,
			powerPreference = 'default',
			preserveDrawingBuffer = false,
			pixelRatio = globalThis.devicePixelRatio ?? 1
		} = options;

		if (canvas === null || typeof canvas !== 'object' || typeof canvas.getContext !== 'function') {
			throw new TypeError('Prism.js: The `canvas` option must be an HTMLCanvasElement.');
		}
		assertPositive('pixelRatio', pixelRatio);

		this.domElement = canvas;
		this.gl = this._createContext(canvas, {
			alpha,
			antialias,
			depth,
			stencil,
			powerPreference,
			preserveDrawingBuffer
		});

		const gl = this.gl;
		this.capabilities = Object.freeze({
			glVersion: gl.getParameter(gl.VERSION),
			shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
			maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
			maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
		});

		/** Counters for debugging and profiling; `render` values describe the last render() call. */
		this.info = {
			render: { frame: 0, calls: 0, triangles: 0, lines: 0, lights: 0, culled: 0, instances: 0 },
			memory: { geometries: 0, programs: 0, textures: 0 }
		};

		/** Clear the framebuffer at the start of render(). */
		this.autoClear = true;
		/** CSS-pixel size of the canvas, as last set through `setSize`. */
		this.width = canvas.width / pixelRatio;
		this.height = canvas.height / pixelRatio;
		/** True between `webglcontextlost` and `webglcontextrestored`. */
		this.contextLost = false;

		this._pixelRatio = pixelRatio;
		this._clearColor = [0, 0, 0, 1];
		this._appliedClear = [NaN, NaN, NaN, NaN];
		this._disposed = false;

		this.state = new WebGLState(gl);
		this._programs = new WebGLPrograms(gl, this.info);
		this._geometries = new WebGLGeometries(gl, this.state, this.info);
		this._list = new RenderList();
		this._lights = new WebGLLights();
		this._textures = new WebGLTextures(gl, this.info);

		// Scratch objects reused every frame (no per-frame allocation).
		this._colorScratch = new Color();
		this._normalMatrix = new Matrix3();
		this._viewProjection = new Matrix4();
		this._frustum = new Frustum();
		this._projectionArray = new Float32Array(16);
		this._modelViewArray = new Float32Array(16);
		this._normalArray = new Float32Array(9);

		this._onContextLost = (event) => {
			// Without preventDefault the browser never restores the context.
			event.preventDefault();
			this.contextLost = true;
			console.warn(
				'Prism.js: WebGL context lost. Engine-managed GPU resources are rebuilt automatically ' +
					'on restore; resources you created with raw gl calls must be recreated by you.'
			);
		};
		this._onContextRestored = () => {
			this.contextLost = false;
			// All GL objects died with the old context: drop caches so they are recreated on demand.
			this._programs.clear();
			this._geometries.clear();
			this._textures.clear();
			this.state.reset();
			this._applyState();
			console.info('Prism.js: WebGL context restored.');
		};
		canvas.addEventListener('webglcontextlost', this._onContextLost, false);
		canvas.addEventListener('webglcontextrestored', this._onContextRestored, false);

		this._applyState();
	}

	get pixelRatio() {
		return this._pixelRatio;
	}

	/** Changes drawing-buffer pixels per CSS pixel and resizes the buffer to match. */
	setPixelRatio(pixelRatio) {
		this._assertAlive();
		assertPositive('pixelRatio', pixelRatio);
		this._pixelRatio = pixelRatio;
		this.setSize(this.width, this.height, false);
	}

	/**
	 * Sets the canvas size in CSS pixels and updates the viewport.
	 * @param {boolean} [updateStyle=true] Also set `canvas.style.width/height`.
	 */
	setSize(width, height, updateStyle = true) {
		this._assertAlive();
		assertPositive('width', width);
		assertPositive('height', height);

		const canvas = this.domElement;
		this.width = width;
		this.height = height;
		canvas.width = Math.floor(width * this._pixelRatio);
		canvas.height = Math.floor(height * this._pixelRatio);

		if (updateStyle && canvas.style) {
			canvas.style.width = `${width}px`;
			canvas.style.height = `${height}px`;
		}

		this._applyViewport();
	}

	/**
	 * For CSS-sized canvases: matches the drawing buffer to the canvas's displayed
	 * size. Cheap when nothing changed, so it is safe to call every frame.
	 * @returns {boolean} true if the drawing buffer was resized.
	 */
	resizeToDisplaySize() {
		this._assertAlive();
		const canvas = this.domElement;
		const cssWidth = canvas.clientWidth ?? 0;
		const cssHeight = canvas.clientHeight ?? 0;
		if (cssWidth === 0 || cssHeight === 0) return false;

		const bufferWidth = Math.floor(cssWidth * this._pixelRatio);
		const bufferHeight = Math.floor(cssHeight * this._pixelRatio);
		if (canvas.width === bufferWidth && canvas.height === bufferHeight) return false;

		this.setSize(cssWidth, cssHeight, false);
		return true;
	}

	/**
	 * @param {number|string|Color} color 0xRRGGBB, '#rrggbb' or a Color.
	 * @param {number} [alpha=1]
	 */
	setClearColor(color, alpha = 1) {
		this._assertAlive();
		this._colorScratch.set(color);
		if (!(alpha >= 0 && alpha <= 1)) {
			throw new RangeError(`Prism.js: Clear alpha must be between 0 and 1, received ${String(alpha)}.`);
		}
		const c = this._clearColor;
		c[0] = this._colorScratch.r;
		c[1] = this._colorScratch.g;
		c[2] = this._colorScratch.b;
		c[3] = alpha;
		this._applyClearColor(c[0], c[1], c[2], c[3]);
	}

	/** Clears the selected buffers of the current framebuffer using the renderer's clear color. */
	clear(color = true, depth = true, stencil = false) {
		this._assertAlive();
		const gl = this.gl;
		const c = this._clearColor;
		this._applyClearColor(c[0], c[1], c[2], c[3]);
		let mask = 0;
		if (color) mask |= gl.COLOR_BUFFER_BIT;
		if (depth) {
			mask |= gl.DEPTH_BUFFER_BIT;
			this.state.setDepthMask(true); // gl.clear honours the depth write mask
		}
		if (stencil) mask |= gl.STENCIL_BUFFER_BIT;
		if (mask !== 0) gl.clear(mask);
	}

	/**
	 * Draws every visible Mesh in `scene` as seen by `camera`.
	 * Opaque objects are grouped by material and drawn near to far; transparent
	 * ones are drawn afterwards, far to near. World matrices are updated first.
	 */
	render(scene, camera) {
		this._assertAlive();
		if (!scene || !scene.isScene) {
			throw new TypeError('Prism.js: Renderer.render(scene, camera) expects a Scene as its first argument.');
		}
		if (!camera || !camera.isCamera) {
			throw new TypeError('Prism.js: Renderer.render(scene, camera) expects a Camera as its second argument.');
		}
		if (this.contextLost) return;

		const gl = this.gl;
		const stats = this.info.render;
		stats.frame++;
		stats.calls = 0;
		stats.triangles = 0;
		stats.lines = 0;
		stats.culled = 0;
		stats.instances = 0;

		scene.updateMatrixWorld();
		if (camera.parent === null) camera.updateMatrixWorld();

		this._viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		this._frustum.setFromProjectionMatrix(this._viewProjection);
		this.state.resetBindings();
		this._textures.resetBindings();
		this._list.reset();
		this._lights.reset();
		this._collect(scene, camera);
		this._list.sort();
		stats.lights = this._lights.count;

		if (this.autoClear) {
			const bg = scene.background;
			if (bg) this._applyClearColor(bg.r, bg.g, bg.b, 1);
			else this._applyClearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], this._clearColor[3]);
			this.state.setDepthMask(true);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}

		this._projectionArray.set(camera.projectionMatrix.elements);
		this._drawItems(this._list.opaque);
		this._drawItems(this._list.transparent);
	}

	/**
	 * Releases everything the renderer created on the GPU (programs, geometry
	 * buffers) and stops listening to the canvas. Geometries/materials you made
	 * are not destroyed; they are re-uploaded if rendered by another renderer.
	 */
	dispose() {
		if (this._disposed) return;
		this._disposed = true;
		this._geometries.dispose();
		this._textures.dispose();
		this._programs.dispose();
		this.domElement.removeEventListener('webglcontextlost', this._onContextLost, false);
		this.domElement.removeEventListener('webglcontextrestored', this._onContextRestored, false);
	}

	_collect(object, camera) {
		if (!object.visible) return;
		if (object.isLight) this._lights.add(object, camera.matrixWorldInverse);
		if (object.isMesh) {
			const material = object.material;
			if (!material || !material.isMaterial) {
				throw new TypeError(`Prism.js: Mesh "${object.name || object.id}" has no valid material.`);
			}
			if (!material.visible) {
				// not drawn
			} else if (object.frustumCulled && !this._inFrustum(object)) {
				this.info.render.culled++;
			} else {
				const item = this._list.push(object, object.geometry, material);
				item.modelView.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
				item.depth = -item.modelView.elements[14];
			}
		}
		const children = object.children;
		for (let i = 0; i < children.length; i++) this._collect(children[i], camera);
	}

	/** Conservative visibility test of a mesh's world-space bounding sphere against the camera frustum. */
	_inFrustum(mesh) {
		const sphere = mesh.geometry.boundingSphere;
		if (sphere === null) return true; // nothing to measure: let the draw path report the problem
		const e = mesh.matrixWorld.elements, c = sphere.center;
		return this._frustum.intersectsSphere(
			e[0] * c.x + e[4] * c.y + e[8] * c.z + e[12],
			e[1] * c.x + e[5] * c.y + e[9] * c.z + e[13],
			e[2] * c.x + e[6] * c.y + e[10] * c.z + e[14],
			sphere.radius * mesh.matrixWorld.getMaxScaleOnAxis()
		);
	}

	_drawItems(items) {
		const gl = this.gl, state = this.state, stats = this.info.render;
		const frame = stats.frame;

		for (let i = 0; i < items.length; i++) {
			const { geometry, material, modelView, mesh } = items[i];
			const instanced = mesh.isInstancedMesh === true;

			state.setDepthTest(material.depthTest);
			state.setDepthMask(material.depthWrite);
			state.setSide(material.side);
			state.setBlending(material.transparent || material.opacity < 1);

			const entry = this._programs.get(material, instanced ? { instanced: true, instanceColor: mesh.instanceColor !== null } : undefined);
			const locations = entry.locations;
			state.useProgram(entry.program.program);

			if (entry.frame !== frame) { // projection is identical for every draw of this frame
				gl.uniformMatrix4fv(locations.uProjectionMatrix, false, this._projectionArray);
				entry.frame = frame;
			}
			if (entry.definition.usesLights && entry.lightsFrame !== frame) { // lights too
				this._lights.upload(gl, locations);
				entry.lightsFrame = frame;
			}
			if (entry.definition.requiresNormals && geometry.attributes.normal === undefined) {
				throw new Error(
					`Prism.js: ${material.type} needs a "normal" attribute but the geometry has none.\n\n` +
						'Call geometry.computeVertexNormals() or use a built-in geometry.'
				);
			}
			this._modelViewArray.set(modelView.elements);
			gl.uniformMatrix4fv(locations.uModelViewMatrix, false, this._modelViewArray);
			if (entry.definition.usesNormalMatrix && !instanced) { // instanced draws derive it per instance in the shader
				this._normalMatrix.getNormalMatrix(modelView);
				this._normalArray.set(this._normalMatrix.elements);
				gl.uniformMatrix3fv(locations.uNormalMatrix, false, this._normalArray);
			}
			entry.definition.uploadMaterial(gl, locations, material, entry.cache);
			if (material.map && entry.definition.supportsMap) {
				if (geometry.attributes.uv === undefined) {
					throw new Error(
						`Prism.js: ${material.type} has a texture map but the geometry has no "uv" attribute.`
					);
				}
				this._textures.bind(material.map);
				if (!entry.samplerSet) { gl.uniform1i(locations.uMap, 0); entry.samplerSet = true; } // always unit 0
			}

			const record = this._geometries.get(geometry);
			if (instanced) {
				if (material.wireframe) throw new Error('Prism.js: InstancedMesh does not support wireframe materials.');
				const count = mesh.count;
				if (!Number.isInteger(count) || count < 0 || count > mesh.capacity) {
					throw new RangeError(`Prism.js: InstancedMesh.count must be an integer between 0 and its capacity (${mesh.capacity}), received ${String(count)}.`);
				}
				if (count === 0) continue;
				state.bindVertexArray(this._geometries.getInstanced(mesh, record).vao);
				if (record.indexBuffer !== null) {
					gl.drawElementsInstanced(gl.TRIANGLES, record.indexCount, record.indexType, 0, count);
					stats.triangles += (record.indexCount / 3) * count;
				} else {
					gl.drawArraysInstanced(gl.TRIANGLES, 0, geometry.vertexCount, count);
					stats.triangles += (geometry.vertexCount / 3) * count;
				}
				stats.instances += count;
				stats.calls++;
				continue;
			}
			if (material.wireframe) {
				const wire = this._geometries.getWireframe(record, geometry);
				state.bindVertexArray(wire.vao);
				gl.drawElements(gl.LINES, wire.count, wire.type, 0);
				stats.lines += wire.count / 2;
			} else {
				state.bindVertexArray(record.vao);
				if (record.indexBuffer !== null) {
					gl.drawElements(gl.TRIANGLES, record.indexCount, record.indexType, 0);
					stats.triangles += record.indexCount / 3;
				} else {
					gl.drawArrays(gl.TRIANGLES, 0, geometry.vertexCount);
					stats.triangles += geometry.vertexCount / 3;
				}
			}
			stats.calls++;
		}
	}

	_createContext(canvas, attributes) {
		let statusMessage = '';
		const onCreationError = (event) => {
			statusMessage = event.statusMessage || '';
		};

		canvas.addEventListener('webglcontextcreationerror', onCreationError, false);
		const gl = canvas.getContext('webgl2', attributes);
		canvas.removeEventListener('webglcontextcreationerror', onCreationError, false);

		if (gl === null) {
			throw new Error(
				'Prism.js: Failed to create a WebGL2 context.\n\n' +
					'Possible causes: the browser or device does not support WebGL2, hardware ' +
					'acceleration is disabled, or the canvas already has a different context type ' +
					'(for example "2d").' +
					(statusMessage ? `\n\nBrowser message:\n${statusMessage}` : '')
			);
		}
		return gl;
	}

	/** (Re)applies state that a fresh or restored context starts without. */
	_applyState() {
		this._appliedClear.fill(NaN);
		const c = this._clearColor;
		this._applyClearColor(c[0], c[1], c[2], c[3]);
		this._applyViewport();
	}

	_applyClearColor(r, g, b, a) {
		const applied = this._appliedClear;
		if (applied[0] === r && applied[1] === g && applied[2] === b && applied[3] === a) return;
		this.gl.clearColor(r, g, b, a);
		applied[0] = r; applied[1] = g; applied[2] = b; applied[3] = a;
	}

	_applyViewport() {
		const gl = this.gl;
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	}

	_assertAlive() {
		if (this._disposed) {
			throw new Error('Prism.js: Renderer has been disposed.');
		}
	}
}
