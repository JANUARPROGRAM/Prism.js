import { LambertMaterial } from '../materials/LambertMaterial.js';
import { TextureLoader } from './TextureLoader.js';
import { RepeatWrapping, FrontSide } from '../constants.js';
import { resolveURL } from './resolveURL.js';
import { fetchText } from './fetchText.js';

/** Map options that take up to N numbers, and options that take exactly one word. */
const NUMERIC_OPTIONS = { '-s': 3, '-o': 3, '-t': 3, '-mm': 2, '-bm': 1, '-blendu': 1, '-blendv': 1, '-texres': 1 };
const WORD_OPTIONS = new Set(['-cc', '-clamp', '-imfchan', '-type']);

const DEFAULT_DIFFUSE = [0.8, 0.8, 0.8];

/** The materials (and textures) read from one or more .mtl files, by material name. */
export class MaterialLibrary {
	constructor() {
		this.materials = Object.create(null);
		this.textures = [];
	}
	get(name) { return this.materials[name]; }
	get names() { return Object.keys(this.materials); }
	/** Copies the entries of another library into this one (later names win). */
	add(other) {
		Object.assign(this.materials, other.materials);
		this.textures.push(...other.textures);
		return this;
	}
	/** Disposes every material and texture of the library. */
	dispose() {
		for (const material of Object.values(this.materials)) material.dispose();
		for (const texture of this.textures) texture.dispose();
	}
}

function fail(line, message) {
	return new Error(`Prism.js: MTL parse error at line ${line}: ${message}`);
}

function numbers(rest, count, line, keyword) {
	// Number('') is 0, so empty tokens must be removed or a missing value would pass as 0.
	const values = rest.split(/\s+/).filter((t) => t !== '').slice(0, count).map(Number);
	if (values.length === 0 || values.some((v) => !Number.isFinite(v))) {
		throw fail(line, `"${keyword} ${rest}" must be followed by ${count} number(s).`);
	}
	return values;
}

/** Returns the file name of a `map_*` statement, skipping its options (-s, -o, -bm ...). */
function mapFileName(rest) {
	const tokens = rest.split(/\s+/);
	let i = 0;
	while (i < tokens.length && tokens[i].startsWith('-')) {
		const option = tokens[i].toLowerCase();
		if (option in NUMERIC_OPTIONS) {
			let taken = 0;
			i++;
			while (taken < NUMERIC_OPTIONS[option] && i < tokens.length && tokens[i] !== '' && Number.isFinite(Number(tokens[i]))) { i++; taken++; }
		} else if (WORD_OPTIONS.has(option)) {
			i += 2;
		} else {
			break; // not an option we know: treat the rest as the file name
		}
	}
	return tokens.slice(i).join(' ');
}

/**
 * Reads Wavefront .mtl files into LambertMaterials.
 *
 * Supported: newmtl, Kd (color), d / Tr (opacity), map_Kd (texture, options skipped).
 * Everything else (Ka, Ks, Ns, Ke, illum, bump maps ...) is ignored, so models look matte.
 */
export class MTLLoader {
	constructor() {
		/** Faces drawn by the created materials. Many exported models need DoubleSide. */
		this.side = FrontSide;
		/** Set false to skip texture loading (materials keep only their color). */
		this.loadTextures = true;
		this.textureLoader = new TextureLoader();
		this._urlModifier = null;
	}

	/** `fn(url) => url` is applied to every URL this loader (and its textures) fetches. */
	setURLModifier(fn) {
		this._urlModifier = fn;
		this.textureLoader.setURLModifier(fn);
		return this;
	}

	async loadAsync(url) {
		const text = await fetchText(this._urlModifier ? this._urlModifier(url) : url, 'MTL file');
		return this.parse(text, url);
	}

	load(url, onLoad, onError) {
		this.loadAsync(url).then(onLoad, (error) => { if (onError) onError(error); else console.error(error); });
	}

	/**
	 * @param {string} text Contents of the .mtl file.
	 * @param {string} [basePath] URL of the .mtl file; texture names are resolved against it.
	 * @returns {MaterialLibrary}
	 */
	parse(text, basePath = '') {
		const definitions = [];
		let current = null;
		const lines = text.split(/\r?\n/);

		for (let n = 0; n < lines.length; n++) {
			const line = lines[n].trim();
			if (line === '' || line[0] === '#') continue;
			const split = line.search(/\s/);
			const keyword = (split === -1 ? line : line.slice(0, split)).toLowerCase();
			const rest = split === -1 ? '' : line.slice(split).trim();

			if (keyword === 'newmtl') {
				current = { name: rest, diffuse: DEFAULT_DIFFUSE, opacity: 1, opacityFromD: false, map: null };
				definitions.push(current);
				continue;
			}
			if (current === null) continue; // statements before the first newmtl have no owner
			if (keyword === 'kd') {
				if (/^(spectral|xyz)\b/i.test(rest)) continue; // unsupported color forms
				const v = numbers(rest, 3, n + 1, 'Kd');
				current.diffuse = v.length === 1 ? [v[0], v[0], v[0]] : v;
			} else if (keyword === 'd') {
				const [d] = numbers(rest.replace(/^-halo\s+/i, ''), 1, n + 1, 'd');
				current.opacity = d;
				current.opacityFromD = true;
			} else if (keyword === 'tr') {
				const [tr] = numbers(rest, 1, n + 1, 'Tr');
				if (!current.opacityFromD) current.opacity = 1 - tr;
			} else if (keyword === 'map_kd') {
				const file = mapFileName(rest);
				if (file !== '') current.map = file;
			}
		}

		const library = new MaterialLibrary();
		for (const def of definitions) {
			const [r, g, b] = def.diffuse;
			const opacity = Math.min(1, Math.max(0, def.opacity));
			const material = new LambertMaterial({ opacity, transparent: opacity < 1, side: this.side });
			material.color.setRGB(r, g, b);
			material.name = def.name;

			if (def.map !== null && this.loadTextures) {
				const url = resolveURL(basePath, def.map);
				const texture = this.textureLoader.load(url, undefined, () => {
					console.warn(`Prism.js: Texture "${url}" of material "${def.name}" failed to load; its color is used instead.`);
				});
				texture.wrapS = texture.wrapT = RepeatWrapping;
				material.map = texture;
				library.textures.push(texture);
			}
			library.materials[def.name] = material;
		}
		return library;
	}
}
