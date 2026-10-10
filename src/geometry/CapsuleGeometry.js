import { BufferGeometry } from './BufferGeometry.js';
import { BufferAttribute } from './BufferAttribute.js';
import { assertPositive } from './PlaneGeometry.js';

/**
 * A capsule along the Y axis: a cylinder of `length` closed by two hemispheres of `radius`
 * (total height = length + 2 radius), centered on the origin. Matches physics `CapsuleShape(radius, length)`.
 */
export class CapsuleGeometry extends BufferGeometry {
	constructor(radius = 0.5, length = 1, capSegments = 8, radialSegments = 24) {
		super();
		assertPositive('CapsuleGeometry', { radius });
		if (!(length >= 0) || !Number.isFinite(length)) throw new RangeError(`Prism.js: CapsuleGeometry length must be a finite number >= 0, received ${String(length)}.`);
		const caps = Math.max(1, Math.floor(capSegments)), cols = Math.max(3, Math.floor(radialSegments));
		this.parameters = { radius, length, capSegments: caps, radialSegments: cols };

		// Rings from the top pole down: caps + 1 rings on the upper hemisphere, then caps + 1 on the lower one.
		const rings = 2 * (caps + 1), half = length / 2;
		const vertexCount = rings * (cols + 1);
		const position = new Float32Array(vertexCount * 3), normal = new Float32Array(vertexCount * 3), uv = new Float32Array(vertexCount * 2);
		const total = Math.PI * radius + length; // arc length, for the v coordinate
		for (let ring = 0; ring < rings; ring++) {
			const upper = ring <= caps;
			const theta = upper ? (Math.PI / 2) * (ring / caps) : Math.PI / 2 + (Math.PI / 2) * ((ring - caps - 1) / caps);
			const sinT = Math.sin(theta), cosT = Math.cos(theta), cy = upper ? half : -half;
			const arc = upper ? radius * theta : radius * (Math.PI / 2) + length + radius * (theta - Math.PI / 2);
			for (let ix = 0; ix <= cols; ix++) {
				const phi = (ix / cols) * Math.PI * 2;
				const nx = sinT * Math.cos(phi), ny = cosT, nz = sinT * Math.sin(phi);
				const i = ring * (cols + 1) + ix;
				position[i * 3] = nx * radius; position[i * 3 + 1] = cy + ny * radius; position[i * 3 + 2] = nz * radius;
				normal[i * 3] = nx; normal[i * 3 + 1] = ny; normal[i * 3 + 2] = nz;
				uv[i * 2] = ix / cols; uv[i * 2 + 1] = 1 - arc / total;
			}
		}
		const index = [];
		for (let ring = 0; ring < rings - 1; ring++) {
			for (let ix = 0; ix < cols; ix++) {
				const a = ring * (cols + 1) + ix, b = a + 1, d = a + cols + 1, c = d + 1;
				if (ring !== 0) index.push(a, b, d);            // the top ring is the pole: a and b coincide
				if (ring !== rings - 2) index.push(b, c, d);    // the bottom ring is the pole: c and d coincide
			}
		}
		this.setAttribute('position', new BufferAttribute(position, 3));
		this.setAttribute('normal', new BufferAttribute(normal, 3));
		this.setAttribute('uv', new BufferAttribute(uv, 2));
		this.setIndex(index);
	}
}
