/**
 * Owns the WebGL2 context, the drawing-buffer size and the clear state.
 *
 * Scene rendering (`render(scene, camera)`) is added with the scene graph and
 * draw-call phases; until then the renderer exposes the context (`renderer.gl`)
 * so low-level code, such as examples/01-triangle, can draw with it directly.
 */

const MAX_HEX_COLOR = 0xffffff;

function createCanvas() {
	if (typeof document === 'undefined') {
		throw new Error(
			'Prism.js: No `canvas` option was given and `document` is not available to create one.'
		);
	}
	return document.createElement('canvas');
}

function assertHexColor(value) {
	if (!Number.isInteger(value) || value < 0 || value > MAX_HEX_COLOR) {
		throw new RangeError(
			`Prism.js: Expected a color as an integer between 0x000000 and 0xffffff, received ${String(value)}.`
		);
	}
}

function assertPositive(name, value) {
	if (!Number.isFinite(value) || value <= 0) {
		throw new RangeError(`Prism.js: ${name} must be a positive finite number, received ${String(value)}.`);
	}
}

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

		/** CSS-pixel size of the canvas, as last set through `setSize`. */
		this.width = canvas.width / pixelRatio;
		this.height = canvas.height / pixelRatio;
		/** True between `webglcontextlost` and `webglcontextrestored`. */
		this.contextLost = false;

		this._pixelRatio = pixelRatio;
		this._clearColor = [0, 0, 0, 1];
		this._disposed = false;

		this._onContextLost = (event) => {
			// Without preventDefault the browser never restores the context.
			event.preventDefault();
			this.contextLost = true;
			console.warn(
				'Prism.js: WebGL context lost. GPU resources (buffers, programs, textures) ' +
					'must be recreated once the context is restored.'
			);
		};
		this._onContextRestored = () => {
			this.contextLost = false;
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
	 * @param {number} hex Color as 0xRRGGBB. (Becomes a `Color` once the math phase lands.)
	 * @param {number} [alpha=1]
	 */
	setClearColor(hex, alpha = 1) {
		this._assertAlive();
		assertHexColor(hex);
		if (!(alpha >= 0 && alpha <= 1)) {
			throw new RangeError(`Prism.js: Clear alpha must be between 0 and 1, received ${String(alpha)}.`);
		}

		const color = this._clearColor;
		color[0] = ((hex >> 16) & 0xff) / 255;
		color[1] = ((hex >> 8) & 0xff) / 255;
		color[2] = (hex & 0xff) / 255;
		color[3] = alpha;
		this.gl.clearColor(color[0], color[1], color[2], color[3]);
	}

	/** Clears the selected buffers of the current framebuffer. */
	clear(color = true, depth = true, stencil = false) {
		this._assertAlive();
		const gl = this.gl;
		let mask = 0;
		if (color) mask |= gl.COLOR_BUFFER_BIT;
		if (depth) mask |= gl.DEPTH_BUFFER_BIT;
		if (stencil) mask |= gl.STENCIL_BUFFER_BIT;
		if (mask !== 0) gl.clear(mask);
	}

	/**
	 * Stops listening to the canvas. The context itself stays usable by the
	 * browser's garbage collector; GPU resources created by the application
	 * (geometries, programs, textures) must be disposed by their owners.
	 */
	dispose() {
		if (this._disposed) return;
		this._disposed = true;
		this.domElement.removeEventListener('webglcontextlost', this._onContextLost, false);
		this.domElement.removeEventListener('webglcontextrestored', this._onContextRestored, false);
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
		const c = this._clearColor;
		this.gl.clearColor(c[0], c[1], c[2], c[3]);
		this._applyViewport();
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
