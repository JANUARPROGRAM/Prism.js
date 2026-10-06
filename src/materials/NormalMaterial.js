import { Material } from './Material.js';

/** Colors each pixel by its view-space normal (x, y, z -> r, g, b). Useful for inspecting geometry. */
export class NormalMaterial extends Material {
	constructor(parameters = {}) {
		super();
		this.type = 'NormalMaterial';
		this.wireframe = false;
		this.setValues(parameters);
	}
}
NormalMaterial.prototype.isNormalMaterial = true;
