import { Light } from './Light.js';

/**
 * Light radiating from a point. Attenuation:
 *   distance = 0 : no falloff (constant brightness at any range)
 *   distance > 0 : factor = clamp(1 - d / distance, 0, 1) ^ decay, reaching 0 at `distance`
 */
export class PointLight extends Light {
	/** @param {number} distance 0 = unlimited. @param {number} decay Falloff exponent, >= 0. */
	constructor(color, intensity, distance = 0, decay = 2) {
		super(color, intensity);
		if (!(distance >= 0) || !Number.isFinite(distance)) {
			throw new RangeError(`Vertex: PointLight distance must be a finite number >= 0, received ${String(distance)}.`);
		}
		if (!(decay >= 0) || !Number.isFinite(decay)) {
			throw new RangeError(`Vertex: PointLight decay must be a finite number >= 0, received ${String(decay)}.`);
		}
		this.distance = distance;
		this.decay = decay;
	}
}
PointLight.prototype.isPointLight = true;
