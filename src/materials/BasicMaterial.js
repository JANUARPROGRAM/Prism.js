import { Material } from './Material.js';
import { Color } from '../math/Color.js';

/** Unlit, single-color material. `color` accepts 0xRRGGBB, '#rrggbb' or a Color. */
export class BasicMaterial extends Material {
	constructor(parameters = {}) {
		super();
		this.type = 'BasicMaterial';
		this.color = new Color(1, 1, 1);
		/** Draw triangle edges as lines instead of filled triangles. */
		this.wireframe = false;
		this.setValues(parameters);
	}

	setValues(values = {}) {
		const { color, ...rest } = values;
		if (color !== undefined) this.color.set(color);
		return super.setValues(rest);
	}
}
BasicMaterial.prototype.isBasicMaterial = true;
