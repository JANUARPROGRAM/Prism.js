/** Fixed attribute locations shared by every built-in shader (`layout(location = N)`). */
const ATTRIBUTE_LOCATIONS = { position: 0, normal: 1, uv: 2, color: 3 };

/** Edges are deduplicated with a numeric key only while lo * n + hi stays exact. */
const MAX_DEDUP_VERTICES = 67108864;
const MAX_UINT16_INDEX = 65534;

function glTypeOf(gl, array, what) {
	if (array instanceof Float32Array) return gl.FLOAT;
	if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
	if (array instanceof Int8Array) return gl.BYTE;
	if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
	if (array instanceof Int16Array) return gl.SHORT;
	if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
	if (array instanceof Int32Array) return gl.INT;
	throw new TypeError(`Vertex: Unsupported array type ${array.constructor.name} for ${what}.`);
}

/** Line list (pairs of vertex indices) covering every unique triangle edge. */
function buildWireframeIndices(geometry) {
	const source = geometry.index ? geometry.index.array : null;
	const n = geometry.vertexCount;
	const seen = n < MAX_DEDUP_VERTICES ? new Set() : null;
	const lines = [];
	const edge = (a, b) => {
		if (seen !== null) {
			const key = (a < b ? a : b) * n + (a < b ? b : a);
			if (seen.has(key)) return;
			seen.add(key);
		}
		lines.push(a, b);
	};
	const triangles = geometry.drawCount / 3;
	for (let t = 0; t < triangles; t++) {
		const a = source ? source[t * 3] : t * 3;
		const b = source ? source[t * 3 + 1] : t * 3 + 1;
		const c = source ? source[t * 3 + 2] : t * 3 + 2;
		edge(a, b); edge(b, c); edge(c, a);
	}
	return n > MAX_UINT16_INDEX ? new Uint32Array(lines) : new Uint16Array(lines);
}

/**
 * Owns the GPU copies (VAO, vertex/index buffers) of geometries. Buffers are
 * created on first draw and re-uploaded only when an attribute's `version`
 * changes. Freed when the geometry is disposed or the renderer is disposed.
 */
export class WebGLGeometries {
	constructor(gl, state, info) {
		this.gl = gl;
		this.state = state;
		this.info = info;
		this._records = new Map();
		this._onGeometryDispose = (geometry) => this.release(geometry);
	}

	/** Returns the up-to-date GPU record for `geometry`, uploading what changed. */
	get(geometry) {
		if (!geometry.attributes.position) {
			throw new Error('Vertex: Cannot draw a geometry without a "position" attribute.');
		}
		let record = this._records.get(geometry);
		if (record === undefined) {
			record = {
				vao: this.gl.createVertexArray(),
				buffers: new Map(),
				indexBuffer: null,
				indexVersion: -1,
				indexType: 0,
				indexCount: 0,
				wire: null
			};
			this._records.set(geometry, record);
			geometry.addDisposeListener(this._onGeometryDispose);
			this.info.memory.geometries = this._records.size;
		}
		this._update(record, geometry);
		return record;
	}

	_update(record, geometry) {
		const gl = this.gl;
		this.state.bindVertexArray(record.vao);

		for (const name of Object.keys(geometry.attributes)) {
			const location = ATTRIBUTE_LOCATIONS[name];
			if (location === undefined) continue; // not consumed by any built-in shader
			const attribute = geometry.attributes[name];
			const usage = attribute.usage === 'dynamic' ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
			let entry = record.buffers.get(name);

			if (entry === undefined) {
				entry = { buffer: gl.createBuffer(), version: attribute.version, byteLength: attribute.array.byteLength, attribute };
				record.buffers.set(name, entry);
				gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
				gl.bufferData(gl.ARRAY_BUFFER, attribute.array, usage);
				this._pointAt(location, attribute);
			} else if (entry.attribute !== attribute || entry.version !== attribute.version) {
				gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
				if (entry.attribute === attribute && entry.byteLength === attribute.array.byteLength) {
					gl.bufferSubData(gl.ARRAY_BUFFER, 0, attribute.array);
				} else {
					gl.bufferData(gl.ARRAY_BUFFER, attribute.array, usage);
					entry.byteLength = attribute.array.byteLength;
				}
				if (entry.attribute !== attribute) this._pointAt(location, attribute);
				entry.attribute = attribute;
				entry.version = attribute.version;
			}
		}

		const index = geometry.index;
		if (index !== null) {
			if (record.indexBuffer === null) record.indexBuffer = gl.createBuffer();
			if (record.indexVersion !== index.version || record.indexSource !== index) {
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, record.indexBuffer); // part of the VAO's state
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW);
				record.indexType = glTypeOf(gl, index.array, 'index');
				if (record.indexType !== gl.UNSIGNED_SHORT && record.indexType !== gl.UNSIGNED_INT) {
					throw new TypeError('Vertex: Geometry index must be a Uint16Array or Uint32Array.');
				}
				record.indexCount = index.count;
				record.indexVersion = index.version;
				record.indexSource = index;
				this._releaseWireframe(record); // derived from the old index
			}
		} else if (record.indexBuffer !== null) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			gl.deleteBuffer(record.indexBuffer);
			record.indexBuffer = null;
			record.indexVersion = -1;
			record.indexSource = null;
			this._releaseWireframe(record);
		}
	}

	_pointAt(location, attribute) {
		const gl = this.gl;
		gl.enableVertexAttribArray(location);
		gl.vertexAttribPointer(location, attribute.itemSize, glTypeOf(gl, attribute.array, 'vertex attribute'), attribute.normalized, 0, 0);
	}

	/** GPU line list for wireframe drawing, rebuilt only when the index or vertex count changed. */
	getWireframe(record, geometry) {
		const n = geometry.vertexCount;
		const index = geometry.index;
		const wire = record.wire;
		if (wire !== null && wire.source === index && wire.version === (index ? index.version : -1) && wire.vertexCount === n) {
			return wire;
		}
		this._releaseWireframe(record);

		const gl = this.gl;
		const lines = buildWireframeIndices(geometry);
		const vao = gl.createVertexArray();
		this.state.bindVertexArray(vao);
		for (const [name, entry] of record.buffers) {
			gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
			this._pointAt(ATTRIBUTE_LOCATIONS[name], entry.attribute);
		}
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lines, gl.STATIC_DRAW);

		record.wire = {
			vao, buffer,
			count: lines.length,
			type: lines instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
			source: index, version: index ? index.version : -1, vertexCount: n
		};
		return record.wire;
	}

	_releaseWireframe(record) {
		if (record.wire === null) return;
		this.gl.deleteVertexArray(record.wire.vao);
		this.gl.deleteBuffer(record.wire.buffer);
		record.wire = null;
	}

	/** Frees the GPU copy of one geometry (it is re-uploaded if drawn again). */
	release(geometry) {
		const record = this._records.get(geometry);
		if (record === undefined) return;
		const gl = this.gl;
		for (const entry of record.buffers.values()) gl.deleteBuffer(entry.buffer);
		if (record.indexBuffer !== null) gl.deleteBuffer(record.indexBuffer);
		this._releaseWireframe(record);
		gl.deleteVertexArray(record.vao);
		geometry.removeDisposeListener(this._onGeometryDispose);
		this._records.delete(geometry);
		this.info.memory.geometries = this._records.size;
		// The VAO we just deleted may still be cached as bound.
		this.state.resetBindings();
	}

	/** Forgets all records without deleting GL objects (they died with a lost context). */
	clear() {
		this._records.clear();
		this.info.memory.geometries = 0;
	}

	dispose() {
		for (const geometry of [...this._records.keys()]) this.release(geometry);
	}
}
