import { BackSide, DoubleSide } from '../constants.js';

/**
 * Caches the GL state the renderer changes per draw so redundant calls are
 * skipped. Anything else that touches the same state (raw gl calls in user
 * code) must call reset() afterwards.
 */
export class WebGLState {
	constructor(gl) {
		this.gl = gl;
		this.reset();
	}

	/** Re-establishes the baseline; also used after a context is restored. */
	reset() {
		const gl = this.gl;
		// Defaults of a fresh WebGL context...
		this._depthTest = false;
		this._depthMask = true;
		this._cullMode = 0; // 0 = culling disabled, otherwise gl.BACK / gl.FRONT
		this._blend = false;
		// ...plus the constant configuration Prism.js relies on.
		gl.depthFunc(gl.LEQUAL);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.frontFace(gl.CCW);
		this.resetBindings();
	}

	/** Forgets the bound program/VAO (call at the start of a frame; other code may have changed them). */
	resetBindings() {
		this._program = null;
		this._vao = null;
	}

	setDepthTest(enabled) {
		if (enabled === this._depthTest) return;
		if (enabled) this.gl.enable(this.gl.DEPTH_TEST); else this.gl.disable(this.gl.DEPTH_TEST);
		this._depthTest = enabled;
	}

	setDepthMask(enabled) {
		if (enabled === this._depthMask) return;
		this.gl.depthMask(enabled);
		this._depthMask = enabled;
	}

	setBlending(enabled) {
		if (enabled === this._blend) return;
		if (enabled) this.gl.enable(this.gl.BLEND); else this.gl.disable(this.gl.BLEND);
		this._blend = enabled;
	}

	/** FrontSide culls back faces, BackSide culls front faces, DoubleSide disables culling. */
	setSide(side) {
		const gl = this.gl;
		const mode = side === DoubleSide ? 0 : side === BackSide ? gl.FRONT : gl.BACK;
		if (mode === this._cullMode) return;
		if (mode === 0) {
			gl.disable(gl.CULL_FACE);
		} else {
			if (this._cullMode === 0) gl.enable(gl.CULL_FACE);
			gl.cullFace(mode);
		}
		this._cullMode = mode;
	}

	useProgram(program) {
		if (program === this._program) return;
		this.gl.useProgram(program);
		this._program = program;
	}

	bindVertexArray(vao) {
		if (vao === this._vao) return;
		this.gl.bindVertexArray(vao);
		this._vao = vao;
	}
}
