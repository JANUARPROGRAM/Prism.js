import { Object3D } from '../core/Object3D.js';
import { Color } from '../math/Color.js';

/**
 * Base class for lights. A light is an Object3D: its position/parent transform
 * place it in the scene. `color` is multiplied by `intensity` when lighting.
 * Lights only affect materials that use lighting (e.g. LambertMaterial).
 */
export class Light extends Object3D {
	/** @param {number|string|Color} color @param {number} intensity Must be >= 0. */
	constructor(color = 0xffffff, intensity = 1) {
		super();
		if (!(intensity >= 0) || !Number.isFinite(intensity)) {
			throw new RangeError(`Vertex: Light intensity must be a finite number >= 0, received ${String(intensity)}.`);
		}
		this.color = new Color(color);
		this.intensity = intensity;
	}
}
Light.prototype.isLight = true;
