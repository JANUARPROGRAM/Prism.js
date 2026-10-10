import { Mesh } from './Mesh.js';
import { BufferAttribute } from '../geometry/BufferAttribute.js';

const IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

/**
 * Draws one geometry many times with ONE draw call, each instance with its own transform (and
 * optionally its own color). Thousands of identical objects (bricks, bullets, leaves, physics debris)
 * cost about as little as one.
 *
 *   const boxes = new InstancedMesh(new BoxGeometry(), new LambertMaterial(), 1000);
 *   boxes.setMatrixAt(i, matrix);    // then boxes.instanceMatrix.needsUpdate = true
 *
 * Matrices are in the mesh's local space (the mesh itself can still be moved). `count` is how many
 * instances are drawn (at most the capacity given to the constructor). Instances are not culled
 * individually and the mesh is not frustum-culled by default; transparency is sorted per mesh, not per instance.
 */
export class InstancedMesh extends Mesh {
	constructor(geometry, material, capacity) {
		super(geometry, material);
		if (!Number.isInteger(capacity) || capacity < 1) {
			throw new RangeError(`Prism.js: InstancedMesh capacity must be a positive integer, received ${String(capacity)}.`);
		}
		this.capacity = capacity;
		this.count = capacity;
		this.instanceMatrix = new BufferAttribute(new Float32Array(capacity * 16), 16);
		this.instanceMatrix.usage = 'dynamic';
		for (let i = 0; i < capacity; i++) this.instanceMatrix.array.set(IDENTITY, i * 16);
		/** @type {BufferAttribute|null} created by the first setColorAt() */
		this.instanceColor = null;
		this.frustumCulled = false;
		this._disposeListeners = new Set();
	}

	/** Stores a Matrix4 for instance `index`. Set `instanceMatrix.needsUpdate = true` afterwards. */
	setMatrixAt(index, matrix) {
		this._check(index);
		this.instanceMatrix.array.set(matrix.elements, index * 16);
	}

	getMatrixAt(index, target) {
		this._check(index);
		const a = this.instanceMatrix.array, o = index * 16;
		for (let i = 0; i < 16; i++) target.elements[i] = a[o + i];
		return target;
	}

	/** Per-instance color, multiplied with the material color. Set `instanceColor.needsUpdate = true` afterwards. */
	setColorAt(index, color) {
		this._check(index);
		if (this.instanceColor === null) {
			this.instanceColor = new BufferAttribute(new Float32Array(this.capacity * 3).fill(1), 3);
			this.instanceColor.usage = 'dynamic';
		}
		const a = this.instanceColor.array;
		a[index * 3] = color.r; a[index * 3 + 1] = color.g; a[index * 3 + 2] = color.b;
	}

	getColorAt(index, target) {
		this._check(index);
		if (this.instanceColor === null) return target.setRGB(1, 1, 1);
		const a = this.instanceColor.array;
		return target.setRGB(a[index * 3], a[index * 3 + 1], a[index * 3 + 2]);
	}

	_check(index) {
		if (!Number.isInteger(index) || index < 0 || index >= this.capacity) {
			throw new RangeError(`Prism.js: Instance index ${String(index)} is outside 0..${this.capacity - 1}.`);
		}
	}

	addDisposeListener(listener) { this._disposeListeners.add(listener); }
	removeDisposeListener(listener) { this._disposeListeners.delete(listener); }

	/** Frees the GPU copy of the instance data (the geometry and material are not touched). */
	dispose() {
		for (const listener of [...this._disposeListeners]) listener(this);
	}
}
InstancedMesh.prototype.isInstancedMesh = true;
