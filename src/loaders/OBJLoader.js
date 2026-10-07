import { Group } from '../core/Group.js';
import { Mesh } from '../core/Mesh.js';
import { BufferGeometry } from '../geometry/BufferGeometry.js';
import { BufferAttribute } from '../geometry/BufferAttribute.js';
import { LambertMaterial } from '../materials/LambertMaterial.js';
import { FrontSide } from '../constants.js';
import { MTLLoader, MaterialLibrary } from './MTLLoader.js';
import { resolveURL } from './resolveURL.js';
import { fetchText } from './fetchText.js';

const DEFAULT_COLOR = 0xcccccc;

function fail(line, message) {
	return new Error(`Prism.js: OBJ parse error at line ${line}: ${message}`);
}

function floats(rest, min, line, keyword) {
	// Number('') is 0, so empty tokens must be removed or a missing value would pass as 0.
	const values = rest.split(/\s+/).filter((t) => t !== '').map(Number);
	if (values.length < min || values.slice(0, min).some((v) => !Number.isFinite(v))) {
		throw fail(line, `"${keyword} ${rest}" needs at least ${min} number(s).`);
	}
	return values;
}

/**
 * Turns the text of a Wavefront .obj file into plain typed arrays, one entry per
 * (object/group name, material) pair. No GPU or scene classes are involved.
 *
 * Supports v, vt, vn, f (v, v/vt, v//vn, v/vt/vn, negative indices, any polygon
 * size, fan-triangulated: concave polygons are not handled), o, g, usemtl, mtllib.
 * Lines like s, l, p and anything unknown are ignored.
 * Faces without normals get one vertex per corner, so they shade flat.
 */
export function parseOBJ(text) {
	const positions = [], uvs = [], normals = [];
	const mtllibs = [];
	const builders = new Map();
	let objectName = '', materialName = '', builder = null;

	const currentBuilder = () => {
		if (builder === null) {
			const key = `${objectName}\u0000${materialName}`;
			builder = builders.get(key);
			if (builder === undefined) {
				builder = {
					name: objectName, material: materialName,
					positions: [], uvs: [], normals: [], indices: [],
					lookup: new Map(), vertexCount: 0, uvCorners: 0, missingNormals: false
				};
				builders.set(key, builder);
			}
		}
		return builder;
	};

	const resolve = (token, count, line, what) => {
		const raw = parseInt(token, 10);
		if (!Number.isInteger(raw) || raw === 0) throw fail(line, `invalid ${what} index "${token}".`);
		const index = raw > 0 ? raw - 1 : count + raw;
		if (index < 0 || index >= count) {
			throw fail(line, `${what} index ${raw} is out of range (the file defines ${count} ${what} entries before this line).`);
		}
		return index;
	};

	const lines = text.split(/\r?\n/);
	for (let n = 0; n < lines.length; n++) {
		const line = lines[n].trim();
		if (line === '' || line[0] === '#') continue;
		const split = line.search(/\s/);
		const keyword = split === -1 ? line : line.slice(0, split);
		const rest = split === -1 ? '' : line.slice(split).trim();

		switch (keyword) {
			case 'v': { const v = floats(rest, 3, n + 1, 'v'); positions.push(v[0], v[1], v[2]); break; }
			case 'vt': { const v = floats(rest, 1, n + 1, 'vt'); uvs.push(v[0], v[1] ?? 0); break; }
			case 'vn': { const v = floats(rest, 3, n + 1, 'vn'); normals.push(v[0], v[1], v[2]); break; }
			case 'o': case 'g': objectName = rest; builder = null; break;
			case 'usemtl': materialName = rest; builder = null; break;
			case 'mtllib': if (rest !== '') mtllibs.push(rest); break;
			case 'f': {
				const corners = rest.split(/\s+/);
				if (corners.length < 3) throw fail(n + 1, `a face needs at least 3 vertices, found ${corners.length}.`);
				const b = currentBuilder();
				const face = [];
				for (const corner of corners) {
					const parts = corner.split('/');
					const vi = resolve(parts[0], positions.length / 3, n + 1, 'vertex');
					const ti = parts.length > 1 && parts[1] !== '' ? resolve(parts[1], uvs.length / 2, n + 1, 'texture coordinate') : -1;
					const ni = parts.length > 2 && parts[2] !== '' ? resolve(parts[2], normals.length / 3, n + 1, 'normal') : -1;

					// Corners with the same v/vt/vn share one vertex; corners without a normal never do (flat shading).
					let output;
					const key = ni === -1 ? null : `${vi}/${ti}/${ni}`;
					if (key !== null) output = b.lookup.get(key);
					if (output === undefined) {
						output = b.vertexCount++;
						if (key !== null) b.lookup.set(key, output);
						b.positions.push(positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]);
						if (ti === -1) b.uvs.push(0, 0); else { b.uvs.push(uvs[ti * 2], uvs[ti * 2 + 1]); b.uvCorners++; }
						if (ni === -1) { b.missingNormals = true; b.normals.push(0, 0, 0); }
						else b.normals.push(normals[ni * 3], normals[ni * 3 + 1], normals[ni * 3 + 2]);
					}
					face.push(output);
				}
				for (let i = 1; i < face.length - 1; i++) b.indices.push(face[0], face[i], face[i + 1]);
				break;
			}
			default: break; // s, l, p, vp, curves ... are not supported and are skipped
		}
	}

	const objects = [];
	let vertexCount = 0, triangleCount = 0;
	for (const b of builders.values()) {
		if (b.indices.length === 0) continue;
		vertexCount += b.vertexCount;
		triangleCount += b.indices.length / 3;
		objects.push({
			name: b.name,
			material: b.material,
			positions: new Float32Array(b.positions),
			normals: b.missingNormals ? null : new Float32Array(b.normals),
			uvs: b.uvCorners > 0 ? new Float32Array(b.uvs) : null,
			indices: b.indices
		});
	}
	return { objects, mtllibs, vertexCount, triangleCount };
}

/**
 * Loads Wavefront .obj models as a Group of Meshes (one per object/group and material).
 *
 *   const model = await new OBJLoader().loadAsync('assets/models/ship.obj');
 *
 * `loadAsync` also loads the `mtllib` file(s) next to the .obj (and their textures)
 * unless `autoLoadMaterials` is false. Meshes get a LambertMaterial, so add lights.
 * Missing materials fall back to a light-gray LambertMaterial.
 */
export class OBJLoader {
	constructor() {
		/** Use these materials instead of loading the `mtllib`. Set with setMaterials(). */
		this.materials = null;
		this.autoLoadMaterials = true;
		/** Faces drawn by fallback and auto-loaded materials. */
		this.side = FrontSide;
		this.mtlLoader = new MTLLoader();
		this._urlModifier = null;
	}

	setMaterials(library) {
		this.materials = library;
		return this;
	}

	/** `fn(url) => url` is applied to every URL fetched (obj, mtl, textures). */
	setURLModifier(fn) {
		this._urlModifier = fn;
		this.mtlLoader.setURLModifier(fn);
		return this;
	}

	async loadAsync(url) {
		const text = await fetchText(this._urlModifier ? this._urlModifier(url) : url, 'OBJ file');
		let library = this.materials;
		if (library === null && this.autoLoadMaterials) library = await this._loadMaterialLibraries(text, url);
		return this.parse(text, library);
	}

	load(url, onLoad, onError) {
		this.loadAsync(url).then(onLoad, (error) => { if (onError) onError(error); else console.error(error); });
	}

	async _loadMaterialLibraries(text, objUrl) {
		const names = [...text.matchAll(/^[ \t]*mtllib[ \t]+(.+?)[ \t]*$/gm)].map((m) => m[1]);
		if (names.length === 0) return null;
		this.mtlLoader.side = this.side;
		const merged = new MaterialLibrary();
		for (const name of names) {
			try {
				merged.add(await this.mtlLoader.loadAsync(resolveURL(objUrl, name)));
			} catch (error) {
				console.warn(`Prism.js: Could not load material library "${name}" (${error.message}); default materials are used.`);
			}
		}
		return merged;
	}

	/**
	 * @param {string} text Contents of the .obj file.
	 * @param {MaterialLibrary|null} [materials] Defaults to the library set with setMaterials().
	 * @returns {Group}
	 */
	parse(text, materials = this.materials) {
		const parsed = parseOBJ(text);
		const group = new Group();
		group.userData.obj = {
			materialLibraries: parsed.mtllibs,
			vertexCount: parsed.vertexCount,
			triangleCount: parsed.triangleCount
		};

		let fallback = null;
		const warned = new Set();
		const materialFor = (name) => {
			const found = name === '' || !materials ? undefined : materials.get(name);
			if (found !== undefined) return found;
			if (name !== '' && materials && !warned.has(name)) {
				warned.add(name);
				console.warn(`Prism.js: Material "${name}" is not defined in the loaded MTL; a default gray material is used.`);
			}
			if (fallback === null) fallback = new LambertMaterial({ color: DEFAULT_COLOR, side: this.side });
			return fallback;
		};

		for (const o of parsed.objects) {
			const geometry = new BufferGeometry();
			geometry.setAttribute('position', new BufferAttribute(o.positions, 3));
			geometry.setIndex(o.indices);
			if (o.uvs) geometry.setAttribute('uv', new BufferAttribute(o.uvs, 2));
			if (o.normals) geometry.setAttribute('normal', new BufferAttribute(o.normals, 3));
			else geometry.computeVertexNormals();

			const mesh = new Mesh(geometry, materialFor(o.material));
			mesh.name = o.name;
			group.add(mesh);
		}
		return group;
	}
}
