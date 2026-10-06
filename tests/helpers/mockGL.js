/**
 * Minimal fake WebGL2 context/canvas for unit tests that run in Node.
 * It records calls and tracks live GL objects so leaks can be asserted.
 * It does NOT validate GL semantics; real rendering is checked in a browser.
 */

const GL_CONSTANTS = {
	VERTEX_SHADER: 0x8b31,
	FRAGMENT_SHADER: 0x8b30,
	COMPILE_STATUS: 0x8b81,
	LINK_STATUS: 0x8b82,
	COLOR_BUFFER_BIT: 0x4000,
	DEPTH_BUFFER_BIT: 0x0100,
	STENCIL_BUFFER_BIT: 0x0400,
	VERSION: 0x1f02,
	SHADING_LANGUAGE_VERSION: 0x8b8c,
	MAX_TEXTURE_SIZE: 0x0d33,
	MAX_VERTEX_ATTRIBS: 0x8869
};

/**
 * @param {object} [options]
 * @param {string|null} [options.vertexLog]   Fail vertex compilation with this log.
 * @param {string|null} [options.fragmentLog] Fail fragment compilation with this log.
 * @param {string|null} [options.linkLog]     Fail linking with this log.
 */
export function createMockGL({ vertexLog = null, fragmentLog = null, linkLog = null } = {}) {
	const gl = {
		...GL_CONSTANTS,
		canvas: null,
		calls: [],
		liveShaders: new Set(),
		livePrograms: new Set(),
		uniformLookups: 0,

		get drawingBufferWidth() {
			return gl.canvas ? gl.canvas.width : 0;
		},
		get drawingBufferHeight() {
			return gl.canvas ? gl.canvas.height : 0;
		},

		shaderCount: 0,
		liveBuffers: new Set(),
		liveVAOs: new Set(),
		lastMatrix: null,

		createShader(type) {
			const shader = { type };
			gl.shaderCount++;
			gl.liveShaders.add(shader);
			return shader;
		},
		createBuffer() { const b = {}; gl.liveBuffers.add(b); return b; },
		deleteBuffer(b) { gl.liveBuffers.delete(b); },
		createVertexArray() { const v = {}; gl.liveVAOs.add(v); return v; },
		deleteVertexArray(v) { gl.liveVAOs.delete(v); },
		uniformMatrix4fv(loc, transpose, array) {
			gl.lastMatrix = Array.from(array);
			gl.calls.push(['uniformMatrix4fv', loc, transpose, gl.lastMatrix]);
		},
		drawElements(mode, count, type, offset) { gl.calls.push(['drawElements', mode, count, type, offset, gl.lastMatrix]); },
		drawArrays(mode, first, count) { gl.calls.push(['drawArrays', mode, first, count, gl.lastMatrix]); },
		shaderSource(shader, source) {
			shader.source = source;
		},
		compileShader() {},
		getShaderParameter(shader) {
			const log = shader.type === gl.VERTEX_SHADER ? vertexLog : fragmentLog;
			return log === null;
		},
		getShaderInfoLog(shader) {
			return shader.type === gl.VERTEX_SHADER ? vertexLog : fragmentLog;
		},
		deleteShader(shader) {
			gl.liveShaders.delete(shader);
		},

		createProgram() {
			const program = {};
			gl.livePrograms.add(program);
			return program;
		},
		attachShader() {},
		detachShader() {},
		linkProgram() {},
		getProgramParameter() {
			return linkLog === null;
		},
		getProgramInfoLog() {
			return linkLog;
		},
		deleteProgram(program) {
			gl.livePrograms.delete(program);
		},
		useProgram(program) {
			gl.calls.push(['useProgram', program]);
		},

		getUniformLocation(program, name) {
			gl.uniformLookups++;
			return name === 'uMissing' ? null : { name };
		},
		getAttribLocation(program, name) {
			return name === 'aMissing' ? -1 : 0;
		},

		getParameter(pname) {
			switch (pname) {
				case gl.VERSION: return 'WebGL 2.0 (mock)';
				case gl.SHADING_LANGUAGE_VERSION: return 'WebGL GLSL ES 3.00 (mock)';
				case gl.MAX_TEXTURE_SIZE: return 4096;
				case gl.MAX_VERTEX_ATTRIBS: return 16;
				default: return null;
			}
		},

		clearColor(...args) {
			gl.calls.push(['clearColor', ...args]);
		},
		clear(mask) {
			gl.calls.push(['clear', mask]);
		},
		viewport(...args) {
			gl.calls.push(['viewport', ...args]);
		}
	};
	return withFallbacks(gl);
}

/**
 * Unknown ALL_CAPS properties become unique constants and unknown methods become
 * recorded no-ops, so tests only define the GL functions whose results matter.
 */
function withFallbacks(gl) {
	const constants = new Map();
	const noops = new Map();
	let nextConstant = 0x9000;
	return new Proxy(gl, {
		get(target, prop, receiver) {
			if (prop in target || typeof prop === 'symbol') return Reflect.get(target, prop, receiver);
			if (/^[A-Z][A-Z0-9_]*$/.test(prop)) {
				if (!constants.has(prop)) constants.set(prop, nextConstant++);
				return constants.get(prop);
			}
			if (!noops.has(prop)) noops.set(prop, (...args) => { target.calls.push([prop, ...args]); });
			return noops.get(prop);
		}
	});
}

/**
 * @param {object} [options]
 * @param {object|null} [options.gl]       Context returned for 'webgl2' (null simulates failure).
 * @param {string} [options.creationError] statusMessage fired via webglcontextcreationerror on failure.
 */
export function createMockCanvas({ gl = createMockGL(), creationError = '', clientWidth = 0, clientHeight = 0 } = {}) {
	const listeners = new Map();

	const canvas = {
		width: 300,
		height: 150,
		clientWidth,
		clientHeight,
		style: {},
		contextRequests: [],

		getContext(type, attributes) {
			canvas.contextRequests.push({ type, attributes });
			if (type !== 'webgl2' || gl === null) {
				if (creationError) canvas.dispatch('webglcontextcreationerror', { statusMessage: creationError });
				return null;
			}
			return gl;
		},
		addEventListener(type, listener) {
			if (!listeners.has(type)) listeners.set(type, new Set());
			listeners.get(type).add(listener);
		},
		removeEventListener(type, listener) {
			listeners.get(type)?.delete(listener);
		},
		listenerCount(type) {
			return listeners.get(type)?.size ?? 0;
		},
		dispatch(type, event = {}) {
			for (const listener of [...(listeners.get(type) ?? [])]) listener(event);
		}
	};

	if (gl !== null) gl.canvas = canvas;
	return canvas;
}
