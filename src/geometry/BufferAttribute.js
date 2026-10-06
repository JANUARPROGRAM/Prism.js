/** A typed array interpreted as `itemSize` numbers per vertex. Bump `needsUpdate` after editing `array`. */
export class BufferAttribute {
	/**
	 * @param {ArrayBufferView} array e.g. Float32Array
	 * @param {number} itemSize Components per vertex (3 for positions)
	 * @param {boolean} [normalized=false] Integer data is mapped to 0..1 / -1..1 on the GPU
	 */
	constructor(array, itemSize, normalized = false) {
		if (!ArrayBuffer.isView(array) || array instanceof DataView) {
			throw new TypeError('Prism.js: BufferAttribute requires a typed array (for example Float32Array).');
		}
		if (!Number.isInteger(itemSize) || itemSize < 1) {
			throw new RangeError(`Prism.js: BufferAttribute itemSize must be a positive integer, received ${itemSize}.`);
		}
		if (array.length % itemSize !== 0) {
			throw new RangeError(`Prism.js: BufferAttribute array length ${array.length} is not a multiple of itemSize ${itemSize}.`);
		}
		this.array = array;
		this.itemSize = itemSize;
		this.normalized = normalized;
		/** 'static' for data uploaded once, 'dynamic' for data rewritten often. */
		this.usage = 'static';
		this.version = 0;
	}

	get count() { return this.array.length / this.itemSize; }

	set needsUpdate(value) { if (value) this.version++; }
}
BufferAttribute.prototype.isBufferAttribute = true;
