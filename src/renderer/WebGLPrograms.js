import { WebGLProgram } from './WebGLProgram.js';
import { basicShader } from './shaders/basic.js';
import { normalShader } from './shaders/normal.js';
import { lambertShader } from './shaders/lambert.js';

const SHADER_LIBRARY = {
	BasicMaterial: basicShader,
	NormalMaterial: normalShader,
	LambertMaterial: lambertShader
};

/** Inserts `#define` lines right after the mandatory first `#version` line. */
function withDefines(source, defines) {
	if (defines.length === 0) return source;
	const newline = source.indexOf('\n');
	return `${source.slice(0, newline + 1)}${defines.map((d) => `#define ${d}\n`).join('')}${source.slice(newline + 1)}`;
}

/**
 * One compiled program per material type created on first use and shared by
 * every material of that type (so shader compilation never happens per frame).
 */
export class WebGLPrograms {
	constructor(gl, info) {
		this.gl = gl;
		this.info = info;
		this._entries = new Map();
	}

	/** @param {{ instanced?: boolean, instanceColor?: boolean }} [flags] set for InstancedMesh draws */
	get(material, flags = {}) {
		const definition = SHADER_LIBRARY[material.type];
		const useMap = definition !== undefined && definition.supportsMap === true && Boolean(material.map);
		const instanced = flags.instanced === true, instanceColor = instanced && flags.instanceColor === true;
		if (definition !== undefined) {
			if (instanced && !definition.supportsInstancing) throw new Error(`Prism.js: ${material.type} cannot be used with an InstancedMesh.`);
			if (instanceColor && !definition.supportsInstanceColor) throw new Error(`Prism.js: ${material.type} does not support per-instance colors; use BasicMaterial or LambertMaterial.`);
		}
		const key = material.type + (useMap ? ':map' : '') + (instanced ? ':inst' : '') + (instanceColor ? ':icol' : '');
		let entry = this._entries.get(key);
		if (entry === undefined) {
			if (definition === undefined) {
				throw new Error(
					`Prism.js: No shader is available for material type "${material.type}".\n\n` +
						`Built-in material types: ${Object.keys(SHADER_LIBRARY).join(', ')}.`
				);
			}
			const defines = [];
			if (useMap) defines.push('USE_MAP');
			if (instanced) defines.push('USE_INSTANCING');
			if (instanceColor) defines.push('USE_INSTANCE_COLOR');
			const program = new WebGLProgram(this.gl, {
				name: key,
				vertexShader: withDefines(definition.vertexShader, defines),
				fragmentShader: withDefines(definition.fragmentShader, defines)
			});
			const locations = Object.create(null);
			for (const name of definition.uniforms) locations[name] = program.getUniformLocation(name);
			entry = { program, definition, locations, frame: -1, lightsFrame: -1, cache: {}, samplerSet: false };
			this._entries.set(key, entry);
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
