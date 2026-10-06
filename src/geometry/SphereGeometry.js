import { BufferGeometry } from './BufferGeometry.js';
import { BufferAttribute } from './BufferAttribute.js';
import { assertPositive } from './PlaneGeometry.js';

/**
 * A UV sphere. Vertices run in rings from the +Y pole (theta = 0) to the -Y
 * pole; the first and last column of each ring coincide so UVs can wrap.
 */
export class SphereGeometry extends BufferGeometry {
	constructor(radius = 1, widthSegments = 32, heightSegments = 16) {
		super();
		assertPositive('SphereGeometry', { radius });
		const cols = Math.max(3, Math.floor(widthSegments));
		const rows = Math.max(2, Math.floor(heightSegments));
		this.parameters = { radius, widthSegments: cols, heightSegments: rows };

		const vertexCount = (cols + 1) * (rows + 1);
		const position = new Float32Array(vertexCount * 3);
		const normal = new Float32Array(vertexCount * 3);
		const uv = new Float32Array(vertexCount * 2);
		const index = [];

		for (let iy = 0; iy <= rows; iy++) {
			const v = iy / rows;
			const theta = v * Math.PI;
			const sinT = Math.sin(theta), cosT = Math.cos(theta);
			for (let ix = 0; ix <= cols; ix++) {
				const u = ix / cols;
				const phi = u * Math.PI * 2;
				const nx = sinT * Math.cos(phi), ny = cosT, nz = sinT * Math.sin(phi);
				const i = iy * (cols + 1) + ix;
				position[i * 3] = nx * radius; position[i * 3 + 1] = ny * radius; position[i * 3 + 2] = nz * radius;
				normal[i * 3] = nx; normal[i * 3 + 1] = ny; normal[i * 3 + 2] = nz;
				uv[i * 2] = u; uv[i * 2 + 1] = 1 - v;
			}
		}

		for (let iy = 0; iy < rows; iy++) {
			for (let ix = 0; ix < cols; ix++) {
				const a = iy * (cols + 1) + ix, b = a + 1, d = a + cols + 1, c = d + 1;
				if (iy !== 0) index.push(a, b, d);        // top ring: a and b are the same pole point
				if (iy !== rows - 1) index.push(b, c, d); // bottom ring: c and d are the same pole point
			}
		}

		this.setAttribute('position', new BufferAttribute(position, 3));
		this.setAttribute('normal', new BufferAttribute(normal, 3));
		this.setAttribute('uv', new BufferAttribute(uv, 2));
		this.setIndex(index);
	}
}
