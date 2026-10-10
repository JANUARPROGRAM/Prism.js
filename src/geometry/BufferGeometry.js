import { BufferAttribute } from './BufferAttribute.js';

let _nextId = 1;

/** Largest index that fits Uint16 without hitting WebGL2's primitive-restart value 0xFFFF. */
const MAX_UINT16_INDEX = 65534;

/**
 * Vertex data as named attributes ('position', 'normal', 'uv', 'color') plus an
 * optional triangle index. GPU copies are owned by the renderer; call dispose()
 * to free them (the geometry stays usable and is re-uploaded if drawn again).
 */
export class BufferGeometry {
	constructor() {
		this.id = _nextId++;
		this.attributes = {};
		/** @type {BufferAttribute|null} */
		this.index = null;
		this._disposeListeners = new Set();
	}

	setAttribute(name, attribute) {
		if (!attribute || !attribute.isBufferAttribute) {
			throw new TypeError(`Prism.js: setAttribute("${name}") expects a BufferAttribute.`);
		}
		this.attributes[name] = attribute;
		return this;
	}
	getAttribute(name) { return this.attributes[name]; }
	hasAttribute(name) { return this.attributes[name] !== undefined; }

	/** Accepts a BufferAttribute or a plain number[]/typed array (Uint16 or Uint32 is chosen automatically). */
	setIndex(index) {
		if (index === null) { this.index = null; return this; }
		if (index.isBufferAttribute) { this.index = index; return this; }
		let max = 0;
		for (let i = 0; i < index.length; i++) if (index[i] > max) max = index[i];
		const array = max > MAX_UINT16_INDEX ? new Uint32Array(index) : new Uint16Array(index);
		this.index = new BufferAttribute(array, 1);
		return this;
	}

	/**
	 * A sphere that contains every vertex ({ center: Vector3, radius }), or null without positions.
	 * Computed on first use and again whenever the position attribute is replaced or its `version` changes.
	 */
	get boundingSphere() {
		const position = this.attributes.position;
		if (!position) return null;
		let sphere = this._boundingSphere;
		if (sphere === undefined || sphere.source !== position || sphere.version !== position.version) {
			sphere = this._boundingSphere = computeBoundingSphere(position);
		}
		return sphere;
	}

	/** Number of vertices (from the position attribute). */
	get vertexCount() {
		const position = this.attributes.position;
		return position ? position.count : 0;
	}

	/** Number of indices if indexed, otherwise the number of vertices. */
	get drawCount() {
		return this.index ? this.index.count : this.vertexCount;
	}

	/**
	 * Smooth per-vertex normals: each triangle's (area-weighted) normal is
	 * accumulated into its three vertices, then normalized. Vertices shared
	 * between triangles are smoothed; duplicate vertices stay faceted.
	 */
	computeVertexNormals() {
		const position = this.attributes.position;
		if (!position || position.itemSize !== 3) {
			throw new Error('Prism.js: computeVertexNormals() needs a 3-component "position" attribute.');
		}
		const p = position.array;
		const normals = new Float32Array(p.length);
		const idx = this.index ? this.index.array : null;
		const triangleCount = this.drawCount / 3;

		for (let t = 0; t < triangleCount; t++) {
			const a = (idx ? idx[t * 3] : t * 3) * 3;
			const b = (idx ? idx[t * 3 + 1] : t * 3 + 1) * 3;
			const c = (idx ? idx[t * 3 + 2] : t * 3 + 2) * 3;
			const e1x = p[b] - p[a], e1y = p[b + 1] - p[a + 1], e1z = p[b + 2] - p[a + 2];
			const e2x = p[c] - p[a], e2y = p[c + 1] - p[a + 1], e2z = p[c + 2] - p[a + 2];
			const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
			for (const v of [a, b, c]) {
				normals[v] += nx; normals[v + 1] += ny; normals[v + 2] += nz;
			}
		}
		for (let i = 0; i < normals.length; i += 3) {
			const l = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2) || 1;
			normals[i] /= l; normals[i + 1] /= l; normals[i + 2] /= l;
		}

		const existing = this.attributes.normal;
		if (existing && existing.array.length === normals.length && existing.array instanceof Float32Array) {
			existing.array.set(normals);
			existing.needsUpdate = true;
		} else {
			this.setAttribute('normal', new BufferAttribute(normals, 3));
		}
		return this;
	}

	/** Used by the renderer to learn when to free GPU buffers. */
	addDisposeListener(listener) { this._disposeListeners.add(listener); }
	removeDisposeListener(listener) { this._disposeListeners.delete(listener); }

	/** Frees GPU resources held for this geometry. */
	dispose() {
		for (const listener of [...this._disposeListeners]) listener(this);
	}
}
BufferGeometry.prototype.isBufferGeometry = true;

/** Center of the axis-aligned box and the distance to the farthest vertex: simple, cheap and never too small. */
function computeBoundingSphere(position) {
	const a = position.array, n = position.itemSize;
	const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
	for (let i = 0; i < a.length; i += n) {
		for (let k = 0; k < 3; k++) {
			const v = a[i + k];
			if (v < min[k]) min[k] = v;
			if (v > max[k]) max[k] = v;
		}
	}
	const cx = (min[0] + max[0]) / 2, cy = (min[1] + max[1]) / 2, cz = (min[2] + max[2]) / 2;
	let r2 = 0;
	for (let i = 0; i < a.length; i += n) {
		const dx = a[i] - cx, dy = a[i + 1] - cy, dz = a[i + 2] - cz;
		const d = dx * dx + dy * dy + dz * dz;
		if (d > r2) r2 = d;
	}
	return { center: { x: cx, y: cy, z: cz }, radius: Math.sqrt(r2), source: position, version: position.version };
}
