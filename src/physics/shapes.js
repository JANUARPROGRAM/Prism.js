import { Vector3 } from '../math/Vector3.js';

/** Dispatch order used by the narrow phase: planes first, then boxes, then spheres. */
export const KIND_PLANE = 0;
export const KIND_BOX = 1;
export const KIND_SPHERE = 2;

function assertPositive(name, value) {
	if (!(value > 0) || !Number.isFinite(value)) {
		throw new RangeError(`Prism.js: ${name} must be a positive finite number, received ${String(value)}.`);
	}
}

/** A ball centered on the body's position. */
export class SphereShape {
	constructor(radius = 0.5) {
		assertPositive('SphereShape radius', radius);
		this.radius = radius;
		this.kind = KIND_SPHERE;
	}
	/** Principal moments of a solid sphere: 2/5 m r². */
	computeInertia(mass, out) {
		return out.setScalar(0.4 * mass * this.radius * this.radius);
	}
}

/** A solid box centered on the body's position; sizes are FULL lengths (like BoxGeometry). */
export class BoxShape {
	constructor(width = 1, height = 1, depth = 1) {
		assertPositive('BoxShape width', width);
		assertPositive('BoxShape height', height);
		assertPositive('BoxShape depth', depth);
		this.size = new Vector3(width, height, depth);
		this.halfExtents = new Vector3(width / 2, height / 2, depth / 2);
		this.kind = KIND_BOX;
	}
	/** Principal moments of a solid cuboid: m/12 (b² + c²) about each axis. */
	computeInertia(mass, out) {
		const { x: w, y: h, z: d } = this.size;
		const k = mass / 12;
		return out.set(k * (h * h + d * d), k * (w * w + d * d), k * (w * w + h * h));
	}
}

/**
 * An infinite half-space: the points where dot(normal, p) < constant are "inside" (solid).
 * Static bodies only. The plane is given in the body's local frame, so a static body
 * with the default pose places it at world `dot(normal, p) = constant`.
 */
export class PlaneShape {
	constructor(normal = new Vector3(0, 1, 0), constant = 0) {
		const n = new Vector3().copy(normal);
		if (n.lengthSq() === 0) throw new RangeError('Prism.js: PlaneShape normal must not be the zero vector.');
		this.normal = n.normalize();
		this.constant = constant;
		this.kind = KIND_PLANE;
	}
	computeInertia(mass, out) {
		return out.set(0, 0, 0);
	}
}
