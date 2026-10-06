import { Object3D } from './Object3D.js';
import { Matrix4 } from '../math/Matrix4.js';

/** Base class for cameras. A camera looks down its own -Z axis with +Y up. */
export class Camera extends Object3D {
	constructor() {
		super();
		/** World -> camera (view) matrix; refreshed by updateMatrixWorld(). */
		this.matrixWorldInverse = new Matrix4();
		this.projectionMatrix = new Matrix4();
		this._inverseSource = new Float64Array(16).fill(NaN);
	}

	updateMatrixWorld(force = false) {
		super.updateMatrixWorld(force);
		this._updateInverse();
	}

	updateWorldMatrix(updateParents = true) {
		super.updateWorldMatrix(updateParents);
		this._updateInverse();
	}

	/** Inverts the world matrix only when it actually changed since the last inversion. */
	_updateInverse() {
		const world = this.matrixWorld.elements, source = this._inverseSource;
		let changed = false;
		for (let i = 0; i < 16; i++) {
			if (source[i] !== world[i]) { changed = true; break; }
		}
		if (!changed) return;
		source.set(world);
		this.matrixWorldInverse.copy(this.matrixWorld).invert();
	}
}
Camera.prototype.isCamera = true;
