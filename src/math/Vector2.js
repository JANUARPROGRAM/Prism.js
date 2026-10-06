export class Vector2 {
	constructor(x = 0, y = 0) {
		this.x = x;
		this.y = y;
	}
	set(x, y) { this.x = x; this.y = y; return this; }
	copy(v) { this.x = v.x; this.y = v.y; return this; }
	clone() { return new Vector2(this.x, this.y); }
	add(v) { this.x += v.x; this.y += v.y; return this; }
	sub(v) { this.x -= v.x; this.y -= v.y; return this; }
	multiplyScalar(s) { this.x *= s; this.y *= s; return this; }
	/** Dividing by 0 yields Infinity/NaN components, as with plain JS numbers. */
	divideScalar(s) { return this.multiplyScalar(1 / s); }
	dot(v) { return this.x * v.x + this.y * v.y; }
	lengthSq() { return this.x * this.x + this.y * this.y; }
	length() { return Math.sqrt(this.lengthSq()); }
	/** A zero-length vector stays zero. */
	normalize() { return this.divideScalar(this.length() || 1); }
	distanceTo(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
	lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; return this; }
	equals(v) { return this.x === v.x && this.y === v.y; }
	fromArray(a, offset = 0) { this.x = a[offset]; this.y = a[offset + 1]; return this; }
	toArray(a = [], offset = 0) { a[offset] = this.x; a[offset + 1] = this.y; return a; }
}
Vector2.prototype.isVector2 = true;
