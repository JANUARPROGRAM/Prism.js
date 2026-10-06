const _tmp = new Float64Array(9);

/** 3x3 matrix, column-major (element (row r, column c) is elements[c * 3 + r]). */
export class Matrix3 {
	constructor() {
		this.elements = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
	}
	identity() { this.elements.set([1, 0, 0, 0, 1, 0, 0, 0, 1]); return this; }
	copy(m) { this.elements.set(m.elements); return this; }
	clone() { return new Matrix3().copy(this); }
	fromArray(a, offset = 0) { for (let i = 0; i < 9; i++) this.elements[i] = a[offset + i]; return this; }
	toArray(a = [], offset = 0) { for (let i = 0; i < 9; i++) a[offset + i] = this.elements[i]; return a; }
	equals(m) { for (let i = 0; i < 9; i++) if (this.elements[i] !== m.elements[i]) return false; return true; }

	/** Takes the upper-left 3x3 block of a Matrix4. */
	setFromMatrix4(m) {
		const me = m.elements, te = this.elements;
		te[0] = me[0]; te[1] = me[1]; te[2] = me[2];
		te[3] = me[4]; te[4] = me[5]; te[5] = me[6];
		te[6] = me[8]; te[7] = me[9]; te[8] = me[10];
		return this;
	}

	/** this = this * m */
	multiply(m) { return this.multiplyMatrices(this, m); }
	multiplyMatrices(a, b) {
		const ae = a.elements, be = b.elements;
		for (let c = 0; c < 3; c++) {
			for (let r = 0; r < 3; r++) {
				_tmp[c * 3 + r] = ae[r] * be[c * 3] + ae[3 + r] * be[c * 3 + 1] + ae[6 + r] * be[c * 3 + 2];
			}
		}
		this.elements.set(_tmp);
		return this;
	}

	determinant() {
		const e = this.elements;
		return e[0] * (e[4] * e[8] - e[7] * e[5]) - e[3] * (e[1] * e[8] - e[7] * e[2]) + e[6] * (e[1] * e[5] - e[4] * e[2]);
	}

	transpose() {
		const e = this.elements;
		let t = e[1]; e[1] = e[3]; e[3] = t;
		t = e[2]; e[2] = e[6]; e[6] = t;
		t = e[5]; e[5] = e[7]; e[7] = t;
		return this;
	}

	/** Inverts in place. A singular matrix becomes the zero matrix. */
	invert() {
		const e = this.elements;
		const a00 = e[0], a10 = e[1], a20 = e[2];
		const a01 = e[3], a11 = e[4], a21 = e[5];
		const a02 = e[6], a12 = e[7], a22 = e[8];
		const det = this.determinant();
		if (det === 0) { e.fill(0); return this; }
		const id = 1 / det;
		e[0] = (a11 * a22 - a12 * a21) * id;
		e[1] = (a12 * a20 - a10 * a22) * id;
		e[2] = (a10 * a21 - a11 * a20) * id;
		e[3] = (a02 * a21 - a01 * a22) * id;
		e[4] = (a00 * a22 - a02 * a20) * id;
		e[5] = (a01 * a20 - a00 * a21) * id;
		e[6] = (a01 * a12 - a02 * a11) * id;
		e[7] = (a02 * a10 - a00 * a12) * id;
		e[8] = (a00 * a11 - a01 * a10) * id;
		return this;
	}

	/** Normal matrix = inverse-transpose of the upper 3x3 of `m4` (correct under non-uniform scale). */
	getNormalMatrix(m4) {
		return this.setFromMatrix4(m4).invert().transpose();
	}
}
Matrix3.prototype.isMatrix3 = true;
