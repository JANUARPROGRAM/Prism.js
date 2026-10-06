export class Vector3 {
	constructor(x = 0, y = 0, z = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
	setScalar(s) { this.x = s; this.y = s; this.z = s; return this; }
	copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
	clone() { return new Vector3(this.x, this.y, this.z); }

	add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
	addVectors(a, b) { this.x = a.x + b.x; this.y = a.y + b.y; this.z = a.z + b.z; return this; }
	addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
	sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
	subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
	/** Component-wise product. */
	multiply(v) { this.x *= v.x; this.y *= v.y; this.z *= v.z; return this; }
	multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
	/** Dividing by 0 yields Infinity/NaN components, as with plain JS numbers. */
	divideScalar(s) { return this.multiplyScalar(1 / s); }
	negate() { this.x = -this.x; this.y = -this.y; this.z = -this.z; return this; }

	dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
	cross(v) { return this.crossVectors(this, v); }
	crossVectors(a, b) {
		const ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;
		return this;
	}

	lengthSq() { return this.x * this.x + this.y * this.y + this.z * this.z; }
	length() { return Math.sqrt(this.lengthSq()); }
	/** A zero-length vector stays zero. */
	normalize() { return this.divideScalar(this.length() || 1); }
	setLength(length) { return this.normalize().multiplyScalar(length); }
	distanceToSquared(v) {
		const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
		return dx * dx + dy * dy + dz * dz;
	}
	distanceTo(v) { return Math.sqrt(this.distanceToSquared(v)); }
	lerp(v, t) {
		this.x += (v.x - this.x) * t;
		this.y += (v.y - this.y) * t;
		this.z += (v.z - this.z) * t;
		return this;
	}
	lerpVectors(a, b, t) { return this.copy(a).lerp(b, t); }

	/** Transforms as a point (w = 1) and divides by the resulting w, so projection matrices work. */
	applyMatrix4(m) {
		const e = m.elements, x = this.x, y = this.y, z = this.z;
		const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
		this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
		this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
		this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
		return this;
	}
	applyMatrix3(m) {
		const e = m.elements, x = this.x, y = this.y, z = this.z;
		this.x = e[0] * x + e[3] * y + e[6] * z;
		this.y = e[1] * x + e[4] * y + e[7] * z;
		this.z = e[2] * x + e[5] * y + e[8] * z;
		return this;
	}
	/** Rotates by a unit quaternion: v' = v + 2w(q×v) + 2 q×(q×v). */
	applyQuaternion(q) {
		const x = this.x, y = this.y, z = this.z, qx = q.x, qy = q.y, qz = q.z, qw = q.w;
		const tx = 2 * (qy * z - qz * y);
		const ty = 2 * (qz * x - qx * z);
		const tz = 2 * (qx * y - qy * x);
		this.x = x + qw * tx + (qy * tz - qz * ty);
		this.y = y + qw * ty + (qz * tx - qx * tz);
		this.z = z + qw * tz + (qx * ty - qy * tx);
		return this;
	}
	/** Applies the rotation/scale part of a Matrix4 (ignores translation), then normalizes. */
	transformDirection(m) {
		const e = m.elements, x = this.x, y = this.y, z = this.z;
		this.x = e[0] * x + e[4] * y + e[8] * z;
		this.y = e[1] * x + e[5] * y + e[9] * z;
		this.z = e[2] * x + e[6] * y + e[10] * z;
		return this.normalize();
	}
	setFromMatrixPosition(m) { const e = m.elements; return this.set(e[12], e[13], e[14]); }
	setFromMatrixColumn(m, index) { return this.fromArray(m.elements, index * 4); }

	equals(v) { return this.x === v.x && this.y === v.y && this.z === v.z; }
	fromArray(a, offset = 0) { this.x = a[offset]; this.y = a[offset + 1]; this.z = a[offset + 2]; return this; }
	toArray(a = [], offset = 0) { a[offset] = this.x; a[offset + 1] = this.y; a[offset + 2] = this.z; return a; }
}
Vector3.prototype.isVector3 = true;
