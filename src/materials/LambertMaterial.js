import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/**
 * Diffuse (matte) lit material: color x (ambient + sum of N.L x light color), per pixel.
 * Needs a "normal" attribute and at least one light, otherwise it renders black.
 * Lighting is computed on raw color values (no sRGB/gamma handling).
 */
export class LambertMaterial extends Material {
	constructor(parameters = {}) {
		super();
		this.type = 'LambertMaterial';
		this.color = new Color(1, 1, 1);
		this.wireframe = false;
		/** Texture multiplied with `color`. Geometry needs a "uv" attribute. Use `transparent: true` if it has alpha. */
		this.map = null;
		this.setValues(parameters);
	}

	setValues(values = {}) {
		const { color, ...rest } = values;
		if (color !== undefined) this.color.set(color);
		return super.setValues(rest);
	}
}
LambertMaterial.prototype.isLambertMaterial = true;
