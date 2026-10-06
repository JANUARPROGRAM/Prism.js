import { WebGLProgram } from './WebGLProgram.js';
import { basicShader } from './shaders/basic.js';
import { normalShader } from './shaders/normal.js';

const SHADER_LIBRARY = {
	BasicMaterial: basicShader,
	NormalMaterial: normalShader
};

/**
 * One compiled program per material type, created on first use and shared by
 * every material of that type (so shader compilation never happens per frame).
 */
export class WebGLPrograms {
	constructor(gl, info) {
		this.gl = gl;
		this.info = info;
		this._entries = new Map();
	}

	get(material) {
		let entry = this._entries.get(material.type);
		if (entry === undefined) {
			const definition = SHADER_LIBRARY[material.type];
			if (definition === undefined) {
				throw new Error(
					`Prism.js: No shader is available for material type "${material.type}".\n\n` +
						`Built-in material types: ${Object.keys(SHADER_LIBRARY).join(', ')}.`
				);
			}
			const program = new WebGLProgram(this.gl, {
				name: material.type,
				vertexShader: definition.vertexShader,
				fragmentShader: definition.fragmentShader
			});
			const locations = Object.create(null);
			for (const name of definition.uniforms) locations[name] = program.getUniformLocation(name);
			entry = { program, definition, locations, frame: -1 };
			this._entries.set(material.type, entry);
			this.info.memory.programs = this._entries.size;
		}
		return entry;
	}

	/** Forgets all programs without deleting them (their GL objects died with a lost context). */
	clear() {
		this._entries.clear();
		this.info.memory.programs = 0;
	}

	dispose() {
		for (const entry of this._entries.values()) entry.program.dispose();
		this.clear();
	}
}
