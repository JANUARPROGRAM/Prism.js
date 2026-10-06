export class Vector4 {
	constructor(x = 0, y = 0, z = 0, w = 1) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}
	set(x, y, z, w) { this.x = x; this.y = y; this.z = z; this.w = w; return this; }
	copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w; return this; }
	clone() { return new Vector4(this.x, this.y, this.z, this.w); }
	add(v) { this.x += v.x; this.y += v.y; this.z += v.z; this.w += v.w; return this; }
	sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; this.w -= v.w; return this; }
	multiplyScalar(s) { this.x *= s; this.y *= s; this.z *= s; this.w *= s; return this; }
	divideScalar(s) { return this.multiplyScalar(1 / s); }
	dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w; }
	lengthSq() { return this.dot(this); }
	length() { return Math.sqrt(this.lengthSq()); }
	normalize() { return this.divideScalar(this.length() || 1); }
	lerp(v, t) {
		this.x += (v.x - this.x) * t;
		this.y += (v.y - this.y) * t;
		this.z += (v.z - this.z) * t;
		this.w += (v.w - this.w) * t;
		return this;
	}
	/** Full 4x4 transform with no perspective divide (clip-space result). */
	applyMatrix4(m) {
		const e = m.elements, x = this.x, y = this.y, z = this.z, w = this.w;
		this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
		this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
		this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
		this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
		return this;
	}
	equals(v) { return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w; }
	fromArray(a, offset = 0) { this.x = a[offset]; this.y = a[offset + 1]; this.z = a[offset + 2]; this.w = a[offset + 3]; return this; }
	toArray(a = [], offset = 0) { a[offset] = this.x; a[offset + 1] = this.y; a[offset + 2] = this.z; a[offset + 3] = this.w; return a; }
}
Vector4.prototype.isVector4 = true;
