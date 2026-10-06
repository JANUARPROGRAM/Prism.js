import { Matrix4 } from './Matrix4.js';
import { clamp } from './MathUtils.js';

const ORDERS = /^(?:XYZ|XZY|YXZ|YZX|ZXY|ZYX)$/;
const GIMBAL_LIMIT = 0.9999999;
const _matrix = new Matrix4();

function assertOrder(order) {
	if (!ORDERS.test(order)) {
		throw new RangeError(`Prism.js: Invalid Euler order "${String(order)}". Use one of XYZ, XZY, YXZ, YZX, ZXY, ZYX.`);
	}
}

/**
 * Rotation as three angles (radians). Order "XYZ" means R = Rx * Ry * Rz,
 * so a vector is rotated about Z first, then Y, then X (about fixed world axes).
 */
export class Euler {
	constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
		assertOrder(order);
		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order;
		this._onChangeCallback = noop;
	}

	get x() { return this._x; }
	set x(v) { this._x = v; this._onChangeCallback(); }
	get y() { return this._y; }
	set y(v) { this._y = v; this._onChangeCallback(); }
	get z() { return this._z; }
	set z(v) { this._z = v; this._onChangeCallback(); }
	get order() { return this._order; }
	set order(v) { assertOrder(v); this._order = v; this._onChangeCallback(); }

	/** Registers the single listener used by Object3D to keep `quaternion` in sync. */
	onChange(callback) { this._onChangeCallback = callback; return this; }

	set(x, y, z, order = this._order) {
		assertOrder(order);
		this._x = x; this._y = y; this._z = z; this._order = order;
		this._onChangeCallback();
		return this;
	}
	copy(e) { return this.set(e.x, e.y, e.z, e.order); }
	clone() { return new Euler(this._x, this._y, this._z, this._order); }
	equals(e) { return this._x === e.x && this._y === e.y && this._z === e.z && this._order === e.order; }

	/**
	 * Decomposes the rotation part of `m` into three angles for `order`.
	 * For order axes (i, j, k): R[i][k] = ±sin(angle_j); the sign is + for even
	 * permutations of XYZ (XYZ, YZX, ZXY) and - for odd ones. Near gimbal lock
	 * (|sin| ~ 1) the third angle is set to 0 and the first absorbs the rest.
	 */
	setFromRotationMatrix(m, order = this._order, update = true) {
		assertOrder(order);
		const e = m.elements;
		const i = order.charCodeAt(0) - 88, j = order.charCodeAt(1) - 88, k = order.charCodeAt(2) - 88;
		const sign = (j - i + 3) % 3 === 1 ? 1 : -1;
		const at = (row, col) => e[col * 4 + row];

		const sinJ = clamp(sign * at(i, k), -1, 1);
		const b = Math.asin(sinJ);
		let a, c;
		if (Math.abs(sinJ) < GIMBAL_LIMIT) {
			a = Math.atan2(-sign * at(j, k), at(k, k));
			c = Math.atan2(-sign * at(i, j), at(i, i));
		} else {
			a = Math.atan2(sign * at(k, j), at(j, j));
			c = 0;
		}

		this._x = i === 0 ? a : j === 0 ? b : c;
		this._y = i === 1 ? a : j === 1 ? b : c;
		this._z = i === 2 ? a : j === 2 ? b : c;
		this._order = order;
		if (update) this._onChangeCallback();
		return this;
	}

	setFromQuaternion(q, order = this._order, update = true) {
		_matrix.makeRotationFromQuaternion(q);
		return this.setFromRotationMatrix(_matrix, order, update);
	}

	fromArray(a, offset = 0) { return this.set(a[offset], a[offset + 1], a[offset + 2], a[offset + 3] ?? this._order); }
	toArray(a = [], offset = 0) { a[offset] = this._x; a[offset + 1] = this._y; a[offset + 2] = this._z; a[offset + 3] = this._order; return a; }
}
Euler.prototype.isEuler = true;

function noop() {}
