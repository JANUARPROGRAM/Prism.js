import { Object3D } from './Object3D.js';

/** Root of a scene graph. */
export class Scene extends Object3D {
	constructor() {
		super();
		/** @type {import('../math/Color.js').Color|null} Replaces the renderer's clear color when set. */
		this.background = null;
	}
}
Scene.prototype.isScene = true;
