import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, OrthographicCamera, Scene, Vector3, DEG2RAD } from '../src/index.js';
import { close, vecClose } from './helpers/assertions.js';

function project(camera, point) {
	return point.clone().applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
}

test('PerspectiveCamera: frustum edge projects to NDC +-1 and aspect is applied', () => {
	const camera = new PerspectiveCamera(60, 2, 0.1, 100);
	camera.updateMatrixWorld();
	const halfHeight = Math.tan(30 * DEG2RAD) * 10;
	const top = project(camera, new Vector3(0, halfHeight, -10));
	close(top.y, 1, 1e-9);
	const right = project(camera, new Vector3(halfHeight * 2, 0, -10));
	close(right.x, 1, 1e-9);

	camera.aspect = 1;
	camera.updateProjectionMatrix();
	close(project(camera, new Vector3(halfHeight, 0, -10)).x, 1, 1e-9);
});

test('camera at +Z looks down -Z: origin lands at the screen center in front of the camera', () => {
	const camera = new PerspectiveCamera(75, 1.5, 0.1, 1000);
	camera.position.z = 5;
	camera.updateMatrixWorld();
	close(camera.matrixWorldInverse.elements[14], -5, 1e-12);
	const p = project(camera, new Vector3(0, 0, 0));
	vecClose([p.x, p.y], [0, 0]);
	assert.ok(p.z > -1 && p.z < 1);
	// A point behind the camera ends up at positive camera-space z (the camera looks down -Z).
	assert.equal(new Vector3(0, 0, 10).applyMatrix4(camera.matrixWorldInverse).z > 0, true);
});

test('camera.lookAt centers the target on screen', () => {
	const camera = new PerspectiveCamera(50, 1.3, 0.1, 100);
	camera.position.set(4, 3, 8);
	camera.lookAt(-2, 1, -1);
	camera.updateMatrixWorld();
	const p = project(camera, new Vector3(-2, 1, -1));
	vecClose([p.x, p.y], [0, 0], 1e-9);
});

test('camera follows its parent (e.g. a rig that moves)', () => {
	const scene = new Scene(), rig = new Scene(), camera = new PerspectiveCamera();
	rig.position.set(0, 0, 10);
	rig.add(camera);
	scene.add(rig);
	scene.updateMatrixWorld();
	vecClose(new Vector3(0, 0, 0).applyMatrix4(camera.matrixWorldInverse), [0, 0, -10]);
});

test('matrixWorldInverse is only recomputed when the camera moved', () => {
	const camera = new PerspectiveCamera();
	let inversions = 0;
	const invert = camera.matrixWorldInverse.invert.bind(camera.matrixWorldInverse);
	camera.matrixWorldInverse.invert = () => { inversions++; return invert(); };
	camera.updateMatrixWorld();
	camera.updateMatrixWorld();
	assert.equal(inversions, 1);
	camera.position.x = 1;
	camera.updateMatrixWorld();
	assert.equal(inversions, 2);
});

test('PerspectiveCamera rejects invalid parameters', () => {
	assert.throws(() => new PerspectiveCamera(0), /fov/);
	assert.throws(() => new PerspectiveCamera(180), /fov/);
	assert.throws(() => new PerspectiveCamera(50, 0), /aspect/);
	assert.throws(() => new PerspectiveCamera(50, 1, 0, 10), /near/);
	assert.throws(() => new PerspectiveCamera(50, 1, 5, 5), /near/);
});

test('OrthographicCamera maps its box to NDC and validates it', () => {
	const camera = new OrthographicCamera(-5, 5, 2, -2, 1, 21);
	camera.updateMatrixWorld();
	vecClose(project(camera, new Vector3(5, 2, -1)), [1, 1, -1]);
	vecClose(project(camera, new Vector3(-5, -2, -21)), [-1, -1, 1]);
	assert.throws(() => new OrthographicCamera(1, 1, 1, -1), RangeError);
});
