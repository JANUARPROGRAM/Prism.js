import { Camera } from './Camera.js';
import { DEG2RAD } from '../math/MathUtils.js';

export class PerspectiveCamera extends Camera {
	/**
	 * @param {number} fov Vertical field of view in DEGREES.
	 * @param {number} aspect Width / height.
	 * Call updateProjectionMatrix() after changing any of these properties.
	 */
	constructor(fov = 50, aspect = 1, near = 0.1, far = 1000) {
		super();
		this.fov = fov;
		this.aspect = aspect;
		this.near = near;
		this.far = far;
		this.updateProjectionMatrix();
	}

	updateProjectionMatrix() {
		const { fov, aspect, near, far } = this;
		if (!(fov > 0 && fov < 180)) throw new RangeError(`Prism.js: PerspectiveCamera fov must be between 0 and 180 degrees, received ${fov}.`);
		if (!(aspect > 0)) throw new RangeError(`Prism.js: PerspectiveCamera aspect must be positive, received ${aspect}.`);
		if (!(near > 0 && far > near)) throw new RangeError(`Prism.js: PerspectiveCamera requires 0 < near < far, received near=${near}, far=${far}.`);
		this.projectionMatrix.makePerspective(fov * DEG2RAD, aspect, near, far);
		this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
	}
}
PerspectiveCamera.prototype.isPerspectiveCamera = true;
