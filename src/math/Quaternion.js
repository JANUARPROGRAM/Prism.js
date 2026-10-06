/** Rotation as a quaternion (x, y, z, w). Methods assume unit length unless stated. */
export class Quaternion {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;
		this._onChangeCallback = noop;
	}

	get x() { return this._x; }
	set x(v) { this._x = v; this._onChangeCallback(); }
	get y() { return this._y; }
	set y(v) { this._y = v; this._onChangeCallback(); }
	get z() { return this._z; }
	set z(v) { this._z = v; this._onChangeCallback(); }
	get w() { return this._w; }
	set w(v) { this._w = v; this._onChangeCallback(); }

	/** Registers the single listener used by Object3D to keep `rotation` in sync. */
	onChange(callback) { this._onChangeCallback = callback; return this; }

	set(x, y, z, w) {
		this._x = x; this._y = y; this._z = z; this._w = w;
		this._onChangeCallback();
		return this;
	}
	copy(q) { return this.set(q.x, q.y, q.z, q.w); }
	clone() { return new Quaternion(this._x, this._y, this._z, this._w); }
	identity() { return this.set(0, 0, 0, 1); }

	/** @param {{x:number,y:number,z:number}} axis Must be unit length. */
	setFromAxisAngle(axis, angle) {
		const s = Math.sin(angle / 2);
		return this.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(angle / 2));
	}

	/** Composes the three axis rotations in the Euler's order (R = Ra * Rb * Rc for order "ABC"). */
	setFromEuler(euler, update = true) {
		this._x = 0; this._y = 0; this._z = 0; this._w = 1;
		const order = euler.order;
		for (let i = 0; i < 3; i++) {
			const axis = order.charCodeAt(i) - 88; // 'X' = 0, 'Y' = 1, 'Z' = 2
			const angle = axis === 0 ? euler.x : axis === 1 ? euler.y : euler.z;
			this._multiplyAxisAngle(axis, angle);
		}
		if (update) this._onChangeCallback();
		return this;
	}

	/** this = this * (rotation of `angle` about the given axis index), no callback. */
	_multiplyAxisAngle(axis, angle) {
		const s = Math.sin(angle / 2), bw = Math.cos(angle / 2);
		const bx = axis === 0 ? s : 0, by = axis === 1 ? s : 0, bz = axis === 2 ? s : 0;
		const ax = this._x, ay = this._y, az = this._z, aw = this._w;
		this._x = ax * bw + aw * bx + ay * bz - az * by;
		this._y = ay * bw + aw * by + az * bx - ax * bz;
		this._z = az * bw + aw * bz + ax * by - ay * bx;
		this._w = aw * bw - ax * bx - ay * by - az * bz;
	}

	/** Reads the rotation part of a Matrix4 (must be a pure rotation, no scale). */
	setFromRotationMatrix(m) {
		const e = m.elements;
		const m11 = e[0], m12 = e[4], m13 = e[8];
		const m21 = e[1], m22 = e[5], m23 = e[9];
		const m31 = e[2], m32 = e[6], m33 = e[10];
		const trace = m11 + m22 + m33;
		if (trace > 0) {
			const s = 0.5 / Math.sqrt(trace + 1);
			this._w = 0.25 / s;
			this._x = (m32 - m23) * s;
			this._y = (m13 - m31) * s;
			this._z = (m21 - m12) * s;
		} else if (m11 > m22 && m11 > m33) {
			const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
			this._w = (m32 - m23) / s;
			this._x = 0.25 * s;
			this._y = (m12 + m21) / s;
			this._z = (m13 + m31) / s;
		} else if (m22 > m33) {
			const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
			this._w = (m13 - m31) / s;
			this._x = (m12 + m21) / s;
			this._y = 0.25 * s;
			this._z = (m23 + m32) / s;
		} else {
			const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
			this._w = (m21 - m12) / s;
			this._x = (m13 + m31) / s;
			this._y = (m23 + m32) / s;
			this._z = 0.25 * s;
		}
		this._onChangeCallback();
		return this;
	}

	dot(q) { return this._x * q.x + this._y * q.y + this._z * q.z + this._w * q.w; }
	lengthSq() { return this.dot(this); }
	length() { return Math.sqrt(this.lengthSq()); }
	/** A zero quaternion becomes the identity. */
	normalize() {
		const l = this.length();
		if (l === 0) return this.set(0, 0, 0, 1);
		return this.set(this._x / l, this._y / l, this._z / l, this._w / l);
	}
	conjugate() { return this.set(-this._x, -this._y, -this._z, this._w); }
	/** Inverse rotation (conjugate divided by squared length, so it is exact for non-unit input too). */
	invert() {
		const l = this.lengthSq() || 1;
		return this.set(-this._x / l, -this._y / l, -this._z / l, this._w / l);
	}

	/** this = this * q (q is applied first). */
	multiply(q) { return this.multiplyQuaternions(this, q); }
	/** this = q * this */
	premultiply(q) { return this.multiplyQuaternions(q, this); }
	multiplyQuaternions(a, b) {
		const ax = a.x, ay = a.y, az = a.z, aw = a.w, bx = b.x, by = b.y, bz = b.z, bw = b.w;
		return this.set(
			ax * bw + aw * bx + ay * bz - az * by,
			ay * bw + aw * by + az * bx - ax * bz,
			az * bw + aw * bz + ax * by - ay * bx,
			aw * bw - ax * bx - ay * by - az * bz
		);
	}

	/** Spherical interpolation toward `q` along the shortest arc. */
	slerp(q, t) {
		if (t === 0) return this;
		if (t === 1) return this.copy(q);
		let bx = q.x, by = q.y, bz = q.z, bw = q.w;
		let cos = this.dot(q);
		if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw; }
		let s0, s1;
		if (cos > 0.9995) { // nearly parallel: lerp (then normalize) avoids dividing by ~0
			s0 = 1 - t; s1 = t;
		} else {
			const theta = Math.acos(cos), sin = Math.sin(theta);
			s0 = Math.sin((1 - t) * theta) / sin;
			s1 = Math.sin(t * theta) / sin;
		}
		this._x = s0 * this._x + s1 * bx;
		this._y = s0 * this._y + s1 * by;
		this._z = s0 * this._z + s1 * bz;
		this._w = s0 * this._w + s1 * bw;
		return this.normalize();
	}

	equals(q) { return this._x === q.x && this._y === q.y && this._z === q.z && this._w === q.w; }
	fromArray(a, offset = 0) { return this.set(a[offset], a[offset + 1], a[offset + 2], a[offset + 3]); }
	toArray(a = [], offset = 0) { a[offset] = this._x; a[offset + 1] = this._y; a[offset + 2] = this._z; a[offset + 3] = this._w; return a; }
}
Quaternion.prototype.isQuaternion = true;

function noop() {}
