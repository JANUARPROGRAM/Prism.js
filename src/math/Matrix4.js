const _tmp = new Float64Array(16);

/**
 * 4x4 matrix, column-major like WebGL: element (row r, column c) is
 * elements[c * 4 + r]; translation lives in elements[12..14].
 * Math is done in double precision; the renderer converts to Float32 on upload.
 */
export class Matrix4 {
	constructor() {
		this.elements = new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	}
	identity() {
		this.elements.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		return this;
	}
	copy(m) { this.elements.set(m.elements); return this; }
	clone() { return new Matrix4().copy(this); }
	fromArray(a, offset = 0) { for (let i = 0; i < 16; i++) this.elements[i] = a[offset + i]; return this; }
	toArray(a = [], offset = 0) { for (let i = 0; i < 16; i++) a[offset + i] = this.elements[i]; return a; }
	equals(m) { for (let i = 0; i < 16; i++) if (this.elements[i] !== m.elements[i]) return false; return true; }

	/** this = this * m (m is applied first when transforming a vector). */
	multiply(m) { return this.multiplyMatrices(this, m); }
	/** this = m * this */
	premultiply(m) { return this.multiplyMatrices(m, this); }
	/** this = a * b. Safe when `this` is a or b. */
	multiplyMatrices(a, b) {
		const ae = a.elements, be = b.elements;
		for (let c = 0; c < 4; c++) {
			const b0 = be[c * 4], b1 = be[c * 4 + 1], b2 = be[c * 4 + 2], b3 = be[c * 4 + 3];
			for (let r = 0; r < 4; r++) {
				_tmp[c * 4 + r] = ae[r] * b0 + ae[4 + r] * b1 + ae[8 + r] * b2 + ae[12 + r] * b3;
			}
		}
		this.elements.set(_tmp);
		return this;
	}

	transpose() {
		const e = this.elements;
		let t;
		t = e[1]; e[1] = e[4]; e[4] = t;
		t = e[2]; e[2] = e[8]; e[8] = t;
		t = e[3]; e[3] = e[12]; e[12] = t;
		t = e[6]; e[6] = e[9]; e[9] = t;
		t = e[7]; e[7] = e[13]; e[13] = t;
		t = e[11]; e[11] = e[14]; e[14] = t;
		return this;
	}

	determinant() {
		const e = this.elements;
		const a00 = e[0], a10 = e[1], a20 = e[2], a30 = e[3];
		const a01 = e[4], a11 = e[5], a21 = e[6], a31 = e[7];
		const a02 = e[8], a12 = e[9], a22 = e[10], a32 = e[11];
		const a03 = e[12], a13 = e[13], a23 = e[14], a33 = e[15];
		const s0 = a00 * a11 - a10 * a01, s1 = a00 * a12 - a10 * a02, s2 = a00 * a13 - a10 * a03;
		const s3 = a01 * a12 - a11 * a02, s4 = a01 * a13 - a11 * a03, s5 = a02 * a13 - a12 * a03;
		const c5 = a22 * a33 - a32 * a23, c4 = a21 * a33 - a31 * a23, c3 = a21 * a32 - a31 * a22;
		const c2 = a20 * a33 - a30 * a23, c1 = a20 * a32 - a30 * a22, c0 = a20 * a31 - a30 * a21;
		return s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
	}

	/**
	 * Inverts in place using 2x2 sub-determinants (Laplace expansion).
	 * A singular matrix becomes the zero matrix.
	 */
	invert() {
		const e = this.elements;
		const a00 = e[0], a10 = e[1], a20 = e[2], a30 = e[3];
		const a01 = e[4], a11 = e[5], a21 = e[6], a31 = e[7];
		const a02 = e[8], a12 = e[9], a22 = e[10], a32 = e[11];
		const a03 = e[12], a13 = e[13], a23 = e[14], a33 = e[15];
		const s0 = a00 * a11 - a10 * a01, s1 = a00 * a12 - a10 * a02, s2 = a00 * a13 - a10 * a03;
		const s3 = a01 * a12 - a11 * a02, s4 = a01 * a13 - a11 * a03, s5 = a02 * a13 - a12 * a03;
		const c5 = a22 * a33 - a32 * a23, c4 = a21 * a33 - a31 * a23, c3 = a21 * a32 - a31 * a22;
		const c2 = a20 * a33 - a30 * a23, c1 = a20 * a32 - a30 * a22, c0 = a20 * a31 - a30 * a21;
		const det = s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
		if (det === 0) { e.fill(0); return this; }
		const id = 1 / det;
		e[0] = (a11 * c5 - a12 * c4 + a13 * c3) * id;
		e[1] = (-a10 * c5 + a12 * c2 - a13 * c1) * id;
		e[2] = (a10 * c4 - a11 * c2 + a13 * c0) * id;
		e[3] = (-a10 * c3 + a11 * c1 - a12 * c0) * id;
		e[4] = (-a01 * c5 + a02 * c4 - a03 * c3) * id;
		e[5] = (a00 * c5 - a02 * c2 + a03 * c1) * id;
		e[6] = (-a00 * c4 + a01 * c2 - a03 * c0) * id;
		e[7] = (a00 * c3 - a01 * c1 + a02 * c0) * id;
		e[8] = (a31 * s5 - a32 * s4 + a33 * s3) * id;
		e[9] = (-a30 * s5 + a32 * s2 - a33 * s1) * id;
		e[10] = (a30 * s4 - a31 * s2 + a33 * s0) * id;
		e[11] = (-a30 * s3 + a31 * s1 - a32 * s0) * id;
		e[12] = (-a21 * s5 + a22 * s4 - a23 * s3) * id;
		e[13] = (a20 * s5 - a22 * s2 + a23 * s1) * id;
		e[14] = (-a20 * s4 + a21 * s2 - a23 * s0) * id;
		e[15] = (a20 * s3 - a21 * s1 + a22 * s0) * id;
		return this;
	}

	makeTranslation(x, y, z) {
		this.identity();
		const e = this.elements;
		e[12] = x; e[13] = y; e[14] = z;
		return this;
	}
	makeScale(x, y, z) {
		this.identity();
		const e = this.elements;
		e[0] = x; e[5] = y; e[10] = z;
		return this;
	}
	makeRotationX(angle) {
		const c = Math.cos(angle), s = Math.sin(angle);
		this.identity();
		const e = this.elements;
		e[5] = c; e[6] = s; e[9] = -s; e[10] = c;
		return this;
	}
	makeRotationY(angle) {
		const c = Math.cos(angle), s = Math.sin(angle);
		this.identity();
		const e = this.elements;
		e[0] = c; e[2] = -s; e[8] = s; e[10] = c;
		return this;
	}
	makeRotationZ(angle) {
		const c = Math.cos(angle), s = Math.sin(angle);
		this.identity();
		const e = this.elements;
		e[0] = c; e[1] = s; e[4] = -s; e[5] = c;
		return this;
	}
	/** Rotation of `angle` radians about a unit-length axis (Rodrigues' formula). */
	makeRotationAxis(axis, angle) {
		const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
		const x = axis.x, y = axis.y, z = axis.z;
		this.identity();
		const e = this.elements;
		e[0] = t * x * x + c;     e[4] = t * x * y - s * z; e[8] = t * x * z + s * y;
		e[1] = t * x * y + s * z; e[5] = t * y * y + c;     e[9] = t * y * z - s * x;
		e[2] = t * x * z - s * y; e[6] = t * y * z + s * x; e[10] = t * z * z + c;
		return this;
	}
	makeRotationFromQuaternion(q) { return this.compose(_zero, q, _one); }
	/** Columns become the three basis vectors; translation is cleared. */
	makeBasis(xAxis, yAxis, zAxis) {
		this.identity();
		const e = this.elements;
		e[0] = xAxis.x; e[1] = xAxis.y; e[2] = xAxis.z;
		e[4] = yAxis.x; e[5] = yAxis.y; e[6] = yAxis.z;
		e[8] = zAxis.x; e[9] = zAxis.y; e[10] = zAxis.z;
		return this;
	}

	/** this = T(position) * R(quaternion) * S(scale). */
	compose(position, quaternion, scale) {
		const e = this.elements;
		const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
		const x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2;
		const yy = y * y2, yz = y * z2, zz = z * z2;
		const wx = w * x2, wy = w * y2, wz = w * z2;
		const sx = scale.x, sy = scale.y, sz = scale.z;
		e[0] = (1 - (yy + zz)) * sx; e[1] = (xy + wz) * sx;       e[2] = (xz - wy) * sx;       e[3] = 0;
		e[4] = (xy - wz) * sy;       e[5] = (1 - (xx + zz)) * sy; e[6] = (yz + wx) * sy;       e[7] = 0;
		e[8] = (xz + wy) * sz;       e[9] = (yz - wx) * sz;       e[10] = (1 - (xx + yy)) * sz; e[11] = 0;
		e[12] = position.x;          e[13] = position.y;          e[14] = position.z;           e[15] = 1;
		return this;
	}

	/** Splits an affine TRS matrix. A negative determinant is folded into scale.x. */
	decompose(position, quaternion, scale) {
		const e = this.elements;
		let sx = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
		const sy = Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6]);
		const sz = Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10]);
		if (this.determinant() < 0) sx = -sx;

		position.set(e[12], e[13], e[14]);

		const r = _rotation.elements;
		const ix = sx === 0 ? 0 : 1 / sx, iy = sy === 0 ? 0 : 1 / sy, iz = sz === 0 ? 0 : 1 / sz;
		r.set(e);
		r[0] *= ix; r[1] *= ix; r[2] *= ix;
		r[4] *= iy; r[5] *= iy; r[6] *= iy;
		r[8] *= iz; r[9] *= iz; r[10] *= iz;
		quaternion.setFromRotationMatrix(_rotation);

		scale.set(sx, sy, sz);
		return this;
	}

	/**
	 * Perspective projection for WebGL clip space (z from -1 at `near` to +1 at `far`).
	 * @param {number} fovY Vertical field of view in RADIANS.
	 */
	makePerspective(fovY, aspect, near, far) {
		const f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
		const e = this.elements;
		e.fill(0);
		e[0] = f / aspect;
		e[5] = f;
		e[10] = (far + near) * nf;
		e[11] = -1;
		e[14] = 2 * far * near * nf;
		return this;
	}

	makeOrthographic(left, right, top, bottom, near, far) {
		const w = 1 / (right - left), h = 1 / (top - bottom), d = 1 / (far - near);
		const e = this.elements;
		this.identity();
		e[0] = 2 * w;
		e[5] = 2 * h;
		e[10] = -2 * d;
		e[12] = -(right + left) * w;
		e[13] = -(top + bottom) * h;
		e[14] = -(far + near) * d;
		return this;
	}

	/**
	 * Builds a VIEW matrix (world -> camera) for a camera at `eye` looking at
	 * `target`; the camera looks down its own -Z axis.
	 */
	lookAt(eye, target, up) {
		let zx = eye.x - target.x, zy = eye.y - target.y, zz = eye.z - target.z;
		let zl = Math.sqrt(zx * zx + zy * zy + zz * zz);
		if (zl === 0) { zz = 1; zl = 1; } // eye == target: any direction is as good as another
		zx /= zl; zy /= zl; zz /= zl;

		let xx = up.y * zz - up.z * zy, xy = up.z * zx - up.x * zz, xz = up.x * zy - up.y * zx;
		let xl = Math.sqrt(xx * xx + xy * xy + xz * xz);
		if (xl < 1e-9) { // `up` is parallel to the view direction: nudge to get a valid basis
			if (Math.abs(up.z) === 1) zx += 1e-4; else zz += 1e-4;
			const l = Math.sqrt(zx * zx + zy * zy + zz * zz);
			zx /= l; zy /= l; zz /= l;
			xx = up.y * zz - up.z * zy; xy = up.z * zx - up.x * zz; xz = up.x * zy - up.y * zx;
			xl = Math.sqrt(xx * xx + xy * xy + xz * xz);
		}
		xx /= xl; xy /= xl; xz /= xl;

		const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;

		const e = this.elements;
		e[0] = xx; e[4] = xy; e[8] = xz;  e[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
		e[1] = yx; e[5] = yy; e[9] = yz;  e[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
		e[2] = zx; e[6] = zy; e[10] = zz; e[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
		e[3] = 0;  e[7] = 0;  e[11] = 0;  e[15] = 1;
		return this;
	}
}
Matrix4.prototype.isMatrix4 = true;

const _zero = { x: 0, y: 0, z: 0 };
const _one = { x: 1, y: 1, z: 1 };
const _rotation = new Matrix4();
