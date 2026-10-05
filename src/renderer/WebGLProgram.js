/**
 * Shader compilation, program linking and cached uniform/attribute lookups.
 *
 * Failures are never swallowed: every error carries the driver's compiler log,
 * the program name and, for compile errors, the offending source lines.
 */

const SOURCE_CONTEXT_LINES = 2;

/**
 * Builds a numbered excerpt of `source` around the line named in a GLSL
 * compiler log (format: "ERROR: <file>:<line>: ..."). Returns '' when the log
 * does not name a usable line.
 */
function describeSource(source, log) {
	const match = /ERROR:\s*\d+:(\d+)/.exec(log);
	if (match === null) return '';

	const lines = source.split('\n');
	const errorLine = Number(match[1]);
	if (errorLine < 1 || errorLine > lines.length) return '';

	const first = Math.max(1, errorLine - SOURCE_CONTEXT_LINES);
	const last = Math.min(lines.length, errorLine + SOURCE_CONTEXT_LINES);
	const numberWidth = String(last).length;

	let excerpt = '';
	for (let n = first; n <= last; n++) {
		const marker = n === errorLine ? '>' : ' ';
		excerpt += `\n${marker} ${String(n).padStart(numberWidth)} | ${lines[n - 1]}`;
	}
	return `\n\nSource:${excerpt}`;
}

function formatLog(log) {
	// Some drivers (seen in Chromium/ANGLE) terminate info logs with a NUL character.
	return (log || '').replace(/\u0000/g, '').trim() || '(the driver provided no log)';
}

/**
 * Compiles one shader stage. Deletes the shader object and throws on failure.
 */
export function compileShader(gl, type, source, programName = 'unnamed') {
	const kind = type === gl.VERTEX_SHADER ? 'vertex' : 'fragment';

	const shader = gl.createShader(type);
	if (shader === null) {
		throw new Error(
			`Prism.js: Failed to create a ${kind} shader object.\n\n` +
				`The WebGL context may have been lost.\n\nProgram:\n${programName}`
		);
	}

	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = formatLog(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		throw new Error(
			`Prism.js: Failed to compile ${kind} shader.\n\n` +
				`WebGL error:\n${log}\n\nProgram:\n${programName}${describeSource(source, log)}`
		);
	}

	return shader;
}

export class WebGLProgram {
	/**
	 * @param {WebGL2RenderingContext} gl
	 * @param {{ vertexShader: string, fragmentShader: string, name?: string }} options
	 *        Shader sources must be GLSL ES 3.00 and start with `#version 300 es`.
	 */
	constructor(gl, { vertexShader, fragmentShader, name = 'unnamed' } = {}) {
		if (typeof vertexShader !== 'string' || typeof fragmentShader !== 'string') {
			throw new TypeError(
				'Prism.js: WebGLProgram requires `vertexShader` and `fragmentShader` source strings.'
			);
		}

		this.gl = gl;
		this.name = name;
		this.program = null;

		this._uniformLocations = new Map();
		this._attributeLocations = new Map();

		const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader, name);

		let fragment;
		try {
			fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader, name);
		} catch (error) {
			gl.deleteShader(vertex);
			throw error;
		}

		const program = gl.createProgram();
		if (program === null) {
			gl.deleteShader(vertex);
			gl.deleteShader(fragment);
			throw new Error(
				`Prism.js: Failed to create a program object.\n\n` +
					`The WebGL context may have been lost.\n\nProgram:\n${name}`
			);
		}

		gl.attachShader(program, vertex);
		gl.attachShader(program, fragment);
		gl.linkProgram(program);

		const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
		const log = linked ? '' : formatLog(gl.getProgramInfoLog(program));

		// Stage objects are only needed until linking has finished.
		gl.detachShader(program, vertex);
		gl.detachShader(program, fragment);
		gl.deleteShader(vertex);
		gl.deleteShader(fragment);

		if (!linked) {
			gl.deleteProgram(program);
			throw new Error(
				`Prism.js: Failed to link shader program.\n\nWebGL error:\n${log}\n\nProgram:\n${name}`
			);
		}

		this.program = program;
	}

	/** Makes this program current. */
	use() {
		this._assertAlive();
		this.gl.useProgram(this.program);
	}

	/**
	 * Cached uniform lookup. Returns null for uniforms that do not exist or were
	 * optimised out by the driver (null results are cached too).
	 */
	getUniformLocation(name) {
		this._assertAlive();
		let location = this._uniformLocations.get(name);
		if (location === undefined) {
			location = this.gl.getUniformLocation(this.program, name);
			this._uniformLocations.set(name, location);
		}
		return location;
	}

	/** Cached attribute lookup. Returns -1 when the attribute is not active. */
	getAttributeLocation(name) {
		this._assertAlive();
		let location = this._attributeLocations.get(name);
		if (location === undefined) {
			location = this.gl.getAttribLocation(this.program, name);
			this._attributeLocations.set(name, location);
		}
		return location;
	}

	/** Releases the GPU program. Safe to call more than once. */
	dispose() {
		if (this.program === null) return;
		this.gl.deleteProgram(this.program);
		this.program = null;
		this._uniformLocations.clear();
		this._attributeLocations.clear();
	}

	_assertAlive() {
		if (this.program === null) {
			throw new Error(`Prism.js: WebGLProgram "${this.name}" has been disposed.`);
		}
	}
}
