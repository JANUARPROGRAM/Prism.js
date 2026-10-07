import { Light } from './Light.js';
import { Object3D } from '../core/Object3D.js';

/**
 * Parallel light rays (like the sun) travelling from the light's position
 * toward `target`. Only the direction matters, not the distance.
 * `target` defaults to the world origin; it does not have to be in the scene.
 */
export class DirectionalLight extends Light {
	constructor(color, intensity) {
		super(color, intensity);
		this.position.set(0, 1, 0);
		this.target = new Object3D();
	}
}
DirectionalLight.prototype.isDirectionalLight = true;
