/**
 * A WebGL2 stand-in with plain no-op methods, for benchmarks: it measures the JavaScript cost
 * of the engine (matrix math, sorting, state handling, uniform packing) without any GPU, and
 * can count the GL calls a frame makes. Counting is exact and machine-independent.
 */
const CONSTANTS = ['ARRAY_BUFFER', 'BACK', 'BLEND', 'BYTE', 'CCW', 'COLOR_BUFFER_BIT', 'COMPILE_STATUS', 'CULL_FACE',
	'DEPTH_BUFFER_BIT', 'DEPTH_TEST', 'DYNAMIC_DRAW', 'ELEMENT_ARRAY_BUFFER', 'FLOAT', 'FRAGMENT_SHADER', 'FRONT', 'INT',
	'LEQUAL', 'LINEAR', 'LINES', 'LINK_STATUS', 'MAX_TEXTURE_SIZE', 'MAX_VERTEX_ATTRIBS', 'NEAREST', 'NONE',
	'ONE_MINUS_SRC_ALPHA', 'RGBA', 'SHADING_LANGUAGE_VERSION', 'SHORT', 'SRC_ALPHA', 'STATIC_DRAW', 'STENCIL_BUFFER_BIT',
	'TEXTURE0', 'TEXTURE_2D', 'TEXTURE_MAG_FILTER', 'TEXTURE_MIN_FILTER', 'TEXTURE_WRAP_S', 'TEXTURE_WRAP_T', 'TRIANGLES',
	'UNPACK_COLORSPACE_CONVERSION_WEBGL', 'UNPACK_FLIP_Y_WEBGL', 'UNPACK_PREMULTIPLY_ALPHA_WEBGL', 'UNSIGNED_BYTE',
	'UNSIGNED_INT', 'UNSIGNED_SHORT', 'VERSION', 'VERTEX_SHADER', 'VERTEX_ATTRIB_ARRAY_DIVISOR'];
const NOOPS = ['activeTexture', 'attachShader', 'bindBuffer', 'bindTexture', 'bindVertexArray', 'blendFunc', 'bufferData',
	'bufferSubData', 'clear', 'clearColor', 'compileShader', 'cullFace', 'deleteBuffer', 'deleteProgram', 'deleteShader',
	'deleteTexture', 'deleteVertexArray', 'disableVertexAttribArray', 'depthFunc', 'depthMask', 'detachShader', 'disable', 'drawArrays', 'drawElements',
	'drawElementsInstanced', 'drawArraysInstanced', 'enable', 'enableVertexAttribArray', 'frontFace', 'generateMipmap',
	'linkProgram', 'pixelStorei', 'shaderSource', 'texImage2D', 'texParameteri', 'uniform1f', 'uniform1i', 'uniform2fv',
	'uniform3fv', 'uniform4f', 'uniformMatrix3fv', 'uniformMatrix4fv', 'useProgram', 'vertexAttribPointer',
	'vertexAttribDivisor', 'viewport'];

/** @param {{ count?: boolean }} [options] count: tally calls per function in `gl.counts` (slightly slower). */
export function createFastGL({ count = false } = {}) {
	const gl = { canvas: null, drawingBufferWidth: 64, drawingBufferHeight: 64, counts: Object.create(null) };
	CONSTANTS.forEach((name, i) => { gl[name] = 0x9000 + i; });
	for (const name of NOOPS) {
		if (count) gl[name] = () => { gl.counts[name] = (gl.counts[name] ?? 0) + 1; };
		else gl[name] = () => {};
	}
	const make = () => ({});
	Object.assign(gl, {
		createShader: make, createProgram: make, createBuffer: make, createVertexArray: make, createTexture: make,
		getShaderParameter: () => true, getProgramParameter: () => true, getShaderInfoLog: () => '', getProgramInfoLog: () => '',
		getUniformLocation: (p, name) => ({ name }), getAttribLocation: () => 0,
		getParameter: (p) => (p === gl.MAX_TEXTURE_SIZE ? 4096 : 16)
	});
	if (count) {
		for (const name of ['getUniformLocation']) {
			const original = gl[name];
			gl[name] = (...args) => { gl.counts[name] = (gl.counts[name] ?? 0) + 1; return original(...args); };
		}
	}
	gl.totalCalls = () => Object.entries(gl.counts).reduce((sum, [k, v]) => sum + (k.startsWith('create') || k.startsWith('get') ? 0 : v), 0);
	gl.resetCounts = () => { gl.counts = Object.create(null); };
	return gl;
}

export function createFastCanvas(gl) {
	const canvas = {
		width: 64, height: 64, clientWidth: 64, clientHeight: 64, style: {},
		getContext: () => gl, addEventListener() {}, removeEventListener() {}
	};
	gl.canvas = canvas;
	return canvas;
}
