import { BufferGeometry } from './BufferGeometry.js';
import { BufferAttribute } from './BufferAttribute.js';
import { buildGrid } from './buildGrid.js';

/** A width x height rectangle in the XY plane facing +Z, centered on the origin. */
export class PlaneGeometry extends BufferGeometry {
	constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
		super();
		assertPositive('PlaneGeometry', { width, height });
		const sx = segments('PlaneGeometry', 'widthSegments', widthSegments);
		const sy = segments('PlaneGeometry', 'heightSegments', heightSegments);
		this.parameters = { width, height, widthSegments: sx, heightSegments: sy };

		const vertexCount = (sx + 1) * (sy + 1);
		const out = {
			position: new Float32Array(vertexCount * 3),
			normal: new Float32Array(vertexCount * 3),
			uv: new Float32Array(vertexCount * 2),
			index: [],
			vertexOffset: 0
		};
		buildGrid(out, [1, 0, 0], [0, 1, 0], [0, 0, 1], width, height, 0, sx, sy);

		this.setAttribute('position', new BufferAttribute(out.position, 3));
		this.setAttribute('normal', new BufferAttribute(out.normal, 3));
		this.setAttribute('uv', new BufferAttribute(out.uv, 2));
		this.setIndex(out.index);
	}
}

export function assertPositive(name, values) {
	for (const [key, value] of Object.entries(values)) {
		if (!(value > 0) || !Number.isFinite(value)) {
			throw new RangeError(`Prism.js: ${name} ${key} must be a positive finite number, received ${String(value)}.`);
		}
	}
}

export function segments(name, key, value) {
	if (!Number.isFinite(value) || value < 1) {
		throw new RangeError(`Prism.js: ${name} ${key} must be at least 1, received ${String(value)}.`);
	}
	return Math.floor(value);
}
