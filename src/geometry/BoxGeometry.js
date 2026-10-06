import { BufferGeometry } from './BufferGeometry.js';
import { BufferAttribute } from './BufferAttribute.js';
import { buildGrid } from './buildGrid.js';
import { assertPositive, segments } from './PlaneGeometry.js';

// Each face: outward normal, then u and v axes with u x v = normal (counter-clockwise from outside).
const FACES = [
	{ normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },  // +X
	{ normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },  // -X
	{ normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },  // +Y
	{ normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },  // -Y
	{ normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },   // +Z
	{ normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }  // -Z
];

const abs = Math.abs;

/** An axis-aligned box centered on the origin. Faces have separate vertices (hard edges, per-face UVs). */
export class BoxGeometry extends BufferGeometry {
	constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
		super();
		assertPositive('BoxGeometry', { width, height, depth });
		const sx = segments('BoxGeometry', 'widthSegments', widthSegments);
		const sy = segments('BoxGeometry', 'heightSegments', heightSegments);
		const sz = segments('BoxGeometry', 'depthSegments', depthSegments);
		this.parameters = { width, height, depth, widthSegments: sx, heightSegments: sy, depthSegments: sz };

		const size = [width, height, depth];
		const grid = [sx, sy, sz];
		const pick = (axis, values) => abs(axis[0]) * values[0] + abs(axis[1]) * values[1] + abs(axis[2]) * values[2];

		let vertexCount = 0;
		for (const f of FACES) vertexCount += (pick(f.u, grid) + 1) * (pick(f.v, grid) + 1);

		const out = {
			position: new Float32Array(vertexCount * 3),
			normal: new Float32Array(vertexCount * 3),
			uv: new Float32Array(vertexCount * 2),
			index: [],
			vertexOffset: 0
		};
		for (const f of FACES) {
			buildGrid(out, f.u, f.v, f.normal, pick(f.u, size), pick(f.v, size), pick(f.normal, size), pick(f.u, grid), pick(f.v, grid));
		}

		this.setAttribute('position', new BufferAttribute(out.position, 3));
		this.setAttribute('normal', new BufferAttribute(out.normal, 3));
		this.setAttribute('uv', new BufferAttribute(out.uv, 2));
		this.setIndex(out.index);
	}
}
