import { Vector3 } from '../math/Vector3.js';

export const MAX_DIRECTIONAL_LIGHTS = 4;
export const MAX_POINT_LIGHTS = 4;

const _a = new Vector3();
const _b = new Vector3();

/**
 * Collects the lights of a frame into flat Float32Arrays in VIEW space (so the
 * shader never needs the camera) and uploads them once per program per frame.
 * Colors are premultiplied by intensity; ambient lights are summed.
 */
export class WebGLLights {
	constructor() {
		this.ambient = new Float32Array(3);
		this.directionalCount = 0;
		this.directionalDirection = new Float32Array(MAX_DIRECTIONAL_LIGHTS * 3);
		this.directionalColor = new Float32Array(MAX_DIRECTIONAL_LIGHTS * 3);
		this.pointCount = 0;
		this.pointPosition = new Float32Array(MAX_POINT_LIGHTS * 3);
		this.pointColor = new Float32Array(MAX_POINT_LIGHTS * 3);
		this.pointParams = new Float32Array(MAX_POINT_LIGHTS * 2); // (distance, decay)
		/** Number of lights actually used this frame. */
		this.count = 0;
		this._warned = false;
	}

	reset() {
		this.ambient.fill(0);
		this.directionalCount = 0;
		this.pointCount = 0;
		this.count = 0;
	}

	/** @param {Matrix4} view The camera's world -> view matrix. */
	add(light, view) {
		const color = light.color, k = light.intensity;

		if (light.isAmbientLight) {
			this.ambient[0] += color.r * k;
			this.ambient[1] += color.g * k;
			this.ambient[2] += color.b * k;
		} else if (light.isDirectionalLight) {
			const i = this.directionalCount;
			if (i >= MAX_DIRECTIONAL_LIGHTS) return this._overflow('DirectionalLights', MAX_DIRECTIONAL_LIGHTS);
			// Direction from the target toward the light, rotated into view space.
			_a.setFromMatrixPosition(light.matrixWorld);
			light.target.updateWorldMatrix(true);
			_b.setFromMatrixPosition(light.target.matrixWorld);
			_a.sub(_b);
			if (_a.lengthSq() === 0) _a.set(0, 1, 0);
			_a.normalize().transformDirection(view).toArray(this.directionalDirection, i * 3);
			this.directionalColor[i * 3] = color.r * k;
			this.directionalColor[i * 3 + 1] = color.g * k;
			this.directionalColor[i * 3 + 2] = color.b * k;
			this.directionalCount++;
		} else if (light.isPointLight) {
			const i = this.pointCount;
			if (i >= MAX_POINT_LIGHTS) return this._overflow('PointLights', MAX_POINT_LIGHTS);
			_a.setFromMatrixPosition(light.matrixWorld).applyMatrix4(view).toArray(this.pointPosition, i * 3);
			this.pointColor[i * 3] = color.r * k;
			this.pointColor[i * 3 + 1] = color.g * k;
			this.pointColor[i * 3 + 2] = color.b * k;
			this.pointParams[i * 2] = light.distance;
			this.pointParams[i * 2 + 1] = light.decay;
			this.pointCount++;
		} else {
			throw new TypeError(
				`Vertex: Unsupported light type "${light.constructor.name}". ` +
					'Use AmbientLight, DirectionalLight or PointLight.'
			);
		}
		this.count++;
	}

	upload(gl, locations) {
		gl.uniform3fv(locations.uAmbientColor, this.ambient);
		gl.uniform1i(locations.uDirCount, this.directionalCount);
		gl.uniform3fv(locations.uDirDirection, this.directionalDirection);
		gl.uniform3fv(locations.uDirColor, this.directionalColor);
		gl.uniform1i(locations.uPointCount, this.pointCount);
		gl.uniform3fv(locations.uPointPosition, this.pointPosition);
		gl.uniform3fv(locations.uPointColor, this.pointColor);
		gl.uniform2fv(locations.uPointParams, this.pointParams);
	}

	_overflow(name, max) {
		if (!this._warned) {
			this._warned = true;
			console.warn(`Vertex: Only the first ${max} ${name} are used; additional ones are ignored.`);
		}
	}
}
