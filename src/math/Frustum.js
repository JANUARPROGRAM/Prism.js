/**
 * The six planes of a camera's view volume, for visibility tests. Plane i is stored as
 * (nx, ny, nz, d) with the normal pointing INTO the volume: a point p is inside plane i when
 * n·p + d >= 0.
 */
export class Frustum {
	constructor() {
		this.planes = new Float64Array(24);
	}

	/**
	 * @param {import('./Matrix4.js').Matrix4} m projectionMatrix × matrixWorldInverse (world -> clip),
	 *        for WebGL clip space (z from -1 to 1).
	 */
	setFromProjectionMatrix(m) {
		const e = m.elements, p = this.planes;
		// row r of the matrix is (e[r], e[4 + r], e[8 + r], e[12 + r]); the planes are row3 ± row0/1/2
		const set = (i, sign, row) => {
			const nx = e[3] + sign * e[row], ny = e[7] + sign * e[4 + row], nz = e[11] + sign * e[8 + row], d = e[15] + sign * e[12 + row];
			const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
			p[i * 4] = nx / length; p[i * 4 + 1] = ny / length; p[i * 4 + 2] = nz / length; p[i * 4 + 3] = d / length;
		};
		set(0, 1, 0);  // left
		set(1, -1, 0); // right
		set(2, 1, 1);  // bottom
		set(3, -1, 1); // top
		set(4, 1, 2);  // near
		set(5, -1, 2); // far
		return this;
	}

	/** True unless the sphere lies entirely outside one of the planes (so it is conservative: never wrong in the "visible" direction). */
	intersectsSphere(x, y, z, radius) {
		const p = this.planes;
		for (let i = 0; i < 24; i += 4) {
			if (p[i] * x + p[i + 1] * y + p[i + 2] * z + p[i + 3] < -radius) return false;
		}
		return true;
	}

	containsPoint(x, y, z) {
		return this.intersectsSphere(x, y, z, 0);
	}
}
Frustum.prototype.isFrustum = true;
