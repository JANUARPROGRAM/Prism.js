import { Camera } from './Camera.js';

export class OrthographicCamera extends Camera {
	/** Call updateProjectionMatrix() after changing any of these properties. */
	constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 1000) {
		super();
		this.left = left;
		this.right = right;
		this.top = top;
		this.bottom = bottom;
		this.near = near;
		this.far = far;
		this.updateProjectionMatrix();
	}

	updateProjectionMatrix() {
		const { left, right, top, bottom, near, far } = this;
		if (left === right || top === bottom || near === far) {
			throw new RangeError('Prism.js: OrthographicCamera needs a non-empty box (left != right, top != bottom, near != far).');
		}
		this.projectionMatrix.makeOrthographic(left, right, top, bottom, near, far);
	}
}
OrthographicCamera.prototype.isOrthographicCamera = true;
