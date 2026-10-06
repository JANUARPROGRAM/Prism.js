/**
 * Appends one rectangular grid of vertices to `out`.
 *
 * The grid spans `uAxis` (width) and `vAxis` (height) and sits `depth / 2` away
 * from the origin along `normal`. Callers pass axes with uAxis x vAxis = normal
 * so triangles (a, b, d) and (b, c, d) are counter-clockwise seen from outside.
 *
 * @param {{position: Float32Array, normal: Float32Array, uv: Float32Array, index: number[], vertexOffset: number}} out
 */
export function buildGrid(out, uAxis, vAxis, normal, width, height, depth, gridX, gridY) {
	const base = out.vertexOffset;
	const columns = gridX + 1;

	for (let iy = 0; iy <= gridY; iy++) {
		const t = iy / gridY;
		for (let ix = 0; ix <= gridX; ix++) {
			const s = ix / gridX;
			const v = base + iy * columns + ix;
			for (let k = 0; k < 3; k++) {
				out.position[v * 3 + k] =
					normal[k] * depth * 0.5 + uAxis[k] * (s - 0.5) * width + vAxis[k] * (t - 0.5) * height;
				out.normal[v * 3 + k] = normal[k];
			}
			out.uv[v * 2] = s;
			out.uv[v * 2 + 1] = t;
		}
	}

	for (let iy = 0; iy < gridY; iy++) {
		for (let ix = 0; ix < gridX; ix++) {
			const a = base + iy * columns + ix;
			const b = a + 1;
			const d = a + columns;
			const c = d + 1;
			out.index.push(a, b, d, b, c, d);
		}
	}
	out.vertexOffset = base + columns * (gridY + 1);
}
