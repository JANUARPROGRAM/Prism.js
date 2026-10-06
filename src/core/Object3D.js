import { Vector3 } from '../math/Vector3.js';
import { Euler } from '../math/Euler.js';
import { Quaternion } from '../math/Quaternion.js';
import { Matrix4 } from '../math/Matrix4.js';

let _nextId = 1;

const _target = new Vector3();
const _position = new Vector3();
const _parentPosition = new Vector3();
const _parentScale = new Vector3();
const _parentQuaternion = new Quaternion();
const _lookQuaternion = new Quaternion();
const _lookMatrix = new Matrix4();

/**
 * A node in the scene graph with a local transform (position, rotation/quaternion,
 * scale) and a list of children. `rotation` (Euler) and `quaternion` always
 * describe the same orientation; change either one.
 *
 * Matrices are recomputed lazily: updateMatrix() skips composing when the
 * transform is unchanged, and a world matrix is only recomputed when the local
 * matrix or an ancestor changed. If you set `matrixAutoUpdate = false` and edit
 * `matrix` yourself, also set `matrixWorldNeedsUpdate = true`.
 */
export class Object3D {
	constructor() {
		this.id = _nextId++;
		this.name = '';
		this.parent = null;
		this.children = [];
		this.visible = true;
		this.userData = {};

		this.position = new Vector3();
		this.rotation = new Euler();
		this.quaternion = new Quaternion();
		this.scale = new Vector3(1, 1, 1);
		/** World-space direction treated as "up" by lookAt(). */
		this.up = new Vector3(0, 1, 0);

		this.rotation.onChange(() => this.quaternion.setFromEuler(this.rotation, false));
		this.quaternion.onChange(() => this.rotation.setFromQuaternion(this.quaternion, undefined, false));

		this.matrix = new Matrix4();
		this.matrixWorld = new Matrix4();
		this.matrixAutoUpdate = true;
		this.matrixWorldNeedsUpdate = true;

		// position(3) + quaternion(4) + scale(3) used for the last compose; NaN forces the first one.
		this._composed = new Float64Array(10).fill(NaN);
	}

	/** Adds children, removing each from its previous parent first. */
	add(...objects) {
		for (const object of objects) {
			if (!object || !object.isObject3D) {
				throw new TypeError(`Prism.js: Object3D.add() expects Object3D instances, received ${String(object)}.`);
			}
			if (object === this) throw new Error('Prism.js: An object cannot be added as a child of itself.');
			for (let ancestor = this.parent; ancestor !== null; ancestor = ancestor.parent) {
				if (ancestor === object) throw new Error('Prism.js: Cannot add an ancestor as a child (it would create a cycle).');
			}
			if (object.parent !== null) object.parent.remove(object);
			object.parent = this;
			object.matrixWorldNeedsUpdate = true;
			this.children.push(object);
		}
		return this;
	}

	/** Removes children; objects that are not children are ignored. */
	remove(...objects) {
		for (const object of objects) {
			const index = this.children.indexOf(object);
			if (index === -1) continue;
			this.children.splice(index, 1);
			object.parent = null;
			object.matrixWorldNeedsUpdate = true;
		}
		return this;
	}

	removeFromParent() {
		if (this.parent !== null) this.parent.remove(this);
		return this;
	}

	/** Calls `callback(object)` for this object and all descendants (depth-first). */
	traverse(callback) {
		callback(this);
		for (let i = 0; i < this.children.length; i++) this.children[i].traverse(callback);
	}

	/** Like traverse(), but skips invisible objects together with their subtrees. */
	traverseVisible(callback) {
		if (!this.visible) return;
		callback(this);
		for (let i = 0; i < this.children.length; i++) this.children[i].traverseVisible(callback);
	}

	/** Recomposes the local matrix if position, quaternion or scale changed. Returns true if it did. */
	updateMatrix() {
		const c = this._composed, p = this.position, q = this.quaternion, s = this.scale;
		const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		if (
			c[0] === p.x && c[1] === p.y && c[2] === p.z &&
			c[3] === qx && c[4] === qy && c[5] === qz && c[6] === qw &&
			c[7] === s.x && c[8] === s.y && c[9] === s.z
		) {
			return false;
		}
		c[0] = p.x; c[1] = p.y; c[2] = p.z;
		c[3] = qx; c[4] = qy; c[5] = qz; c[6] = qw;
		c[7] = s.x; c[8] = s.y; c[9] = s.z;
		this.matrix.compose(p, q, s);
		this.matrixWorldNeedsUpdate = true;
		return true;
	}

	/** Updates this object's world matrix and its descendants'. Pass force = true to ignore dirty flags. */
	updateMatrixWorld(force = false) {
		if (this.matrixAutoUpdate) this.updateMatrix();
		if (this.matrixWorldNeedsUpdate || force) {
			if (this.parent === null) this.matrixWorld.copy(this.matrix);
			else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
			this.matrixWorldNeedsUpdate = false;
			force = true; // children depend on this matrix
		}
		const children = this.children;
		for (let i = 0; i < children.length; i++) children[i].updateMatrixWorld(force);
	}

	/** Brings only this object's world matrix (and optionally its ancestors') up to date. */
	updateWorldMatrix(updateParents = true) {
		if (updateParents && this.parent !== null) this.parent.updateWorldMatrix(true);
		if (this.matrixAutoUpdate) this.updateMatrix();
		if (this.parent === null) this.matrixWorld.copy(this.matrix);
		else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
		this.matrixWorldNeedsUpdate = false;
	}

	getWorldPosition(target) {
		this.updateWorldMatrix(true);
		return target.setFromMatrixPosition(this.matrixWorld);
	}

	/**
	 * Rotates the object so its -Z axis points at a world-space point
	 * (the same convention cameras use). Accepts (Vector3) or (x, y, z).
	 */
	lookAt(x, y, z) {
		if (x.isVector3) _target.copy(x);
		else _target.set(x, y, z);

		this.updateWorldMatrix(true);
		_position.setFromMatrixPosition(this.matrixWorld);

		// lookAt() yields a view matrix; its rotation block is the inverse (transpose) of the orientation we want.
		_lookMatrix.lookAt(_position, _target, this.up).transpose();
		_lookQuaternion.setFromRotationMatrix(_lookMatrix);

		if (this.parent !== null) {
			this.parent.matrixWorld.decompose(_parentPosition, _parentQuaternion, _parentScale);
			_lookQuaternion.premultiply(_parentQuaternion.invert());
		}
		this.quaternion.copy(_lookQuaternion);
		return this;
	}
}
Object3D.prototype.isObject3D = true;
