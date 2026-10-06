import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Object3D, Scene, Mesh, Vector3, Matrix4, Quaternion } from '../src/index.js';
import { close, vecClose, matClose } from './helpers/assertions.js';

test('add / remove maintain parent and children, and reparenting detaches from the old parent', () => {
	const a = new Object3D(), b = new Object3D(), c = new Object3D();
	a.add(c);
	assert.equal(c.parent, a);
	assert.deepEqual(a.children, [c]);

	b.add(c);
	assert.equal(c.parent, b);
	assert.deepEqual(a.children, []);
	assert.deepEqual(b.children, [c]);

	b.remove(c);
	assert.equal(c.parent, null);
	assert.deepEqual(b.children, []);
	b.remove(c); // removing a non-child is a no-op
});

test('add rejects invalid input, self-parenting and cycles', () => {
	const a = new Object3D(), b = new Object3D(), c = new Object3D();
	assert.throws(() => a.add({}), TypeError);
	assert.throws(() => a.add(a), /itself/);
	a.add(b);
	b.add(c);
	assert.throws(() => c.add(a), /cycle/);
	assert.throws(() => b.add(a), /cycle/);
});

test('world matrices compose hierarchically (parent translation + rotation, child offset)', () => {
	const parent = new Object3D(), child = new Object3D();
	parent.position.set(10, 0, 0);
	parent.rotation.z = Math.PI / 2;
	child.position.set(1, 0, 0);
	parent.add(child);
	parent.updateMatrixWorld();

	vecClose(child.getWorldPosition(new Vector3()), [10, 1, 0]);
	// Same result computed by hand: T(parent) * R(parent) * T(child)
	const expected = new Matrix4().makeTranslation(10, 0, 0)
		.multiply(new Matrix4().makeRotationZ(Math.PI / 2))
		.multiply(new Matrix4().makeTranslation(1, 0, 0));
	matClose(child.matrixWorld, expected.elements, 1e-12);
});

test('parent scale affects child world position', () => {
	const parent = new Object3D(), child = new Object3D();
	parent.scale.set(2, 3, 4);
	child.position.set(1, 1, 1);
	parent.add(child);
	parent.updateMatrixWorld();
	vecClose(new Vector3().setFromMatrixPosition(child.matrixWorld), [2, 3, 4]);
});

test('matrices are only recomputed when something changed', () => {
	const parent = new Object3D(), child = new Object3D();
	parent.add(child);
	let composes = 0, multiplies = 0;
	for (const o of [parent, child]) {
		const compose = o.matrix.compose.bind(o.matrix);
		o.matrix.compose = (...args) => { composes++; return compose(...args); };
		const multiply = o.matrixWorld.multiplyMatrices.bind(o.matrixWorld);
		o.matrixWorld.multiplyMatrices = (...args) => { multiplies++; return multiply(...args); };
	}

	parent.updateMatrixWorld();
	assert.equal(composes, 2);
	assert.equal(multiplies, 1, 'only the child multiplies by its parent');

	composes = multiplies = 0;
	parent.updateMatrixWorld();
	assert.deepEqual([composes, multiplies], [0, 0], 'static scene does no work');

	parent.position.x = 5;
	parent.updateMatrixWorld();
	assert.deepEqual([composes, multiplies], [1, 1], 'child is re-multiplied but not re-composed');
	vecClose(new Vector3().setFromMatrixPosition(child.matrixWorld), [5, 0, 0]);

	composes = multiplies = 0;
	child.rotation.y = 1;
	parent.updateMatrixWorld();
	assert.deepEqual([composes, multiplies], [1, 1], 'moving the child leaves the parent alone');
});

test('rotation (Euler) and quaternion stay in sync in both directions', () => {
	const o = new Object3D();
	o.rotation.set(0.3, -0.2, 0.5);
	const q = new Quaternion().setFromEuler(o.rotation);
	vecClose(o.quaternion.toArray(), q.toArray(), 1e-12);

	o.quaternion.setFromAxisAngle(new Vector3(0, 1, 0), 0.8);
	vecClose([o.rotation.x, o.rotation.y, o.rotation.z], [0, 0.8, 0], 1e-12);

	o.rotation.x += 0.1; // component write must update the quaternion too
	matClose(
		new Matrix4().makeRotationFromQuaternion(o.quaternion),
		new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(o.rotation)).elements,
		1e-12
	);
});

test('repeated rotation increments do not wrap the Euler angle', () => {
	const o = new Object3D();
	for (let i = 0; i < 1000; i++) o.rotation.x += 0.01;
	close(o.rotation.x, 10, 1e-9);
	matClose(new Matrix4().makeRotationFromQuaternion(o.quaternion), new Matrix4().makeRotationX(10).elements, 1e-9);
});

test('lookAt points the -Z axis at the target', () => {
	const o = new Object3D();
	o.position.set(1, 2, 3);
	o.lookAt(1, 2, -7);
	vecClose(new Vector3(0, 0, -1).applyQuaternion(o.quaternion), [0, 0, -1], 1e-12);

	o.lookAt(new Vector3(6, 2, 3));
	vecClose(new Vector3(0, 0, -1).applyQuaternion(o.quaternion), [1, 0, 0], 1e-12);
	vecClose(new Vector3(0, 1, 0).applyQuaternion(o.quaternion), [0, 1, 0], 1e-12); // up stays up
	// The Euler angles were kept in sync by lookAt.
	matClose(new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromEuler(o.rotation)),
		new Matrix4().makeRotationFromQuaternion(o.quaternion).elements, 1e-9);
});

test('lookAt accounts for a rotated parent', () => {
	const parent = new Object3D(), child = new Object3D();
	parent.rotation.y = 1.1;
	parent.position.set(5, 0, 0);
	child.position.set(0, 0, 2);
	parent.add(child);
	child.lookAt(0, 0, 0);

	parent.updateMatrixWorld(true);
	const childWorld = child.getWorldPosition(new Vector3());
	const forward = new Vector3(0, 0, -1).transformDirection(child.matrixWorld);
	const toTarget = new Vector3(0, 0, 0).sub(childWorld).normalize();
	vecClose(forward, toTarget.toArray(), 1e-9);
});

test('traverse visits parents before children; traverseVisible prunes hidden subtrees', () => {
	const root = new Object3D(), a = new Object3D(), b = new Object3D(), a1 = new Object3D();
	root.add(a, b);
	a.add(a1);
	a.name = 'a'; b.name = 'b'; a1.name = 'a1'; root.name = 'root';

	const all = [];
	root.traverse((o) => all.push(o.name));
	assert.deepEqual(all, ['root', 'a', 'a1', 'b']);

	a.visible = false;
	const visible = [];
	root.traverseVisible((o) => visible.push(o.name));
	assert.deepEqual(visible, ['root', 'b']);
});

test('removing an object makes its world matrix local again', () => {
	const parent = new Object3D(), child = new Object3D();
	parent.position.set(9, 9, 9);
	child.position.set(1, 0, 0);
	parent.add(child);
	parent.updateMatrixWorld();
	parent.remove(child);
	child.updateMatrixWorld();
	vecClose(new Vector3().setFromMatrixPosition(child.matrixWorld), [1, 0, 0]);
});

test('Scene and Mesh basics', () => {
	const scene = new Scene();
	assert.equal(scene.background, null);
	assert.ok(scene.isScene && scene.isObject3D);
	const mesh = new Mesh();
	assert.ok(mesh.isMesh);
	assert.equal(mesh.material.type, 'BasicMaterial');
	scene.add(mesh);
	assert.equal(mesh.parent, scene);
});
