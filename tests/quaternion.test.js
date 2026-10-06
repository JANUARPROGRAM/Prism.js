import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Quaternion, Euler, Matrix4, Vector3 } from '../src/index.js';
import { close, vecClose, matClose, createRandom } from './helpers/assertions.js';

const ORDERS = ['XYZ', 'XZY', 'YXZ', 'YZX', 'ZXY', 'ZYX'];
const rot = {
	X: (a) => new Matrix4().makeRotationX(a),
	Y: (a) => new Matrix4().makeRotationY(a),
	Z: (a) => new Matrix4().makeRotationZ(a)
};
/** Reference construction of an Euler rotation matrix: multiply axis matrices in order. */
function eulerMatrix(x, y, z, order) {
	const angle = { X: x, Y: y, Z: z };
	const m = new Matrix4();
	for (const axis of order) m.multiply(rot[axis](angle[axis]));
	return m;
}

test('Quaternion axis-angle rotates vectors and stays unit length', () => {
	const q = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
	close(q.length(), 1);
	vecClose(new Vector3(0, 0, 1).applyQuaternion(q), [1, 0, 0]);
});

test('Quaternion multiply composes rotations (right operand first) and matches matrices', () => {
	const qx = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), Math.PI / 2);
	const qy = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
	const q = qy.clone().multiply(qx); // rotate about X first, then Y
	vecClose(new Vector3(0, 1, 0).applyQuaternion(q), [1, 0, 0]);
	const viaMatrices = new Matrix4().makeRotationY(Math.PI / 2).multiply(new Matrix4().makeRotationX(Math.PI / 2));
	matClose(new Matrix4().makeRotationFromQuaternion(q), viaMatrices.elements, 1e-12);
	const pre = qx.clone().premultiply(qy);
	vecClose(pre.toArray(), q.toArray(), 1e-12);
});

test('Quaternion invert/conjugate undo a rotation', () => {
	const q = new Quaternion(0.1, 0.5, -0.3, 0.8).normalize();
	const v = new Vector3(1, 2, 3);
	vecClose(v.clone().applyQuaternion(q).applyQuaternion(q.clone().invert()), [1, 2, 3], 1e-12);
	vecClose(q.clone().conjugate().toArray(), q.clone().invert().toArray(), 1e-12);
	vecClose(q.clone().multiply(q.clone().invert()).toArray(), [0, 0, 0, 1], 1e-12);
});

test('Quaternion normalize handles zero and non-unit input', () => {
	vecClose(new Quaternion(0, 0, 0, 0).normalize().toArray(), [0, 0, 0, 1]);
	close(new Quaternion(2, 0, 0, 0).normalize().x, 1);
});

test('Quaternion slerp: endpoints, midpoint angle, shortest path', () => {
	const a = new Quaternion();
	const b = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
	vecClose(a.clone().slerp(b, 0).toArray(), a.toArray());
	vecClose(a.clone().slerp(b, 1).toArray(), b.toArray());
	const mid = a.clone().slerp(b, 0.5);
	vecClose(new Vector3(1, 0, 0).applyQuaternion(mid), [Math.SQRT1_2, Math.SQRT1_2, 0], 1e-12);
	// -b is the same rotation as b; slerp must still take the short way.
	const negB = new Quaternion(-b.x, -b.y, -b.z, -b.w);
	vecClose(new Vector3(1, 0, 0).applyQuaternion(a.clone().slerp(negB, 0.5)), [Math.SQRT1_2, Math.SQRT1_2, 0], 1e-12);
	// Nearly identical rotations take the lerp branch without producing NaN.
	const c = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), 1e-5);
	assert.ok(a.clone().slerp(c, 0.5).toArray().every(Number.isFinite));
});

test('Quaternion <-> rotation matrix round trip', () => {
	const rand = createRandom(11);
	for (let n = 0; n < 100; n++) {
		const q = new Quaternion(rand() - 0.5, rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
		const m = new Matrix4().makeRotationFromQuaternion(q);
		const q2 = new Quaternion().setFromRotationMatrix(m);
		const sign = q.dot(q2) < 0 ? -1 : 1;
		vecClose(q2.toArray().map((v) => v * sign), q.toArray(), 1e-12);
	}
});

test('Quaternion.setFromRotationMatrix covers all four branches (180deg rotations about each axis)', () => {
	for (const m of [rot.X(Math.PI), rot.Y(Math.PI), rot.Z(Math.PI), new Matrix4()]) {
		const q = new Quaternion().setFromRotationMatrix(m);
		close(q.length(), 1, 1e-12);
		matClose(new Matrix4().makeRotationFromQuaternion(q), m.elements, 1e-12);
	}
});

test('Quaternion.setFromEuler matches the reference matrix for every order', () => {
	const rand = createRandom(3);
	for (const order of ORDERS) {
		for (let n = 0; n < 20; n++) {
			const x = (rand() - 0.5) * 6, y = (rand() - 0.5) * 6, z = (rand() - 0.5) * 6;
			const q = new Quaternion().setFromEuler(new Euler(x, y, z, order));
			matClose(new Matrix4().makeRotationFromQuaternion(q), eulerMatrix(x, y, z, order).elements, 1e-12);
		}
	}
});

test('Euler.setFromRotationMatrix round trip for every order (away from gimbal lock)', () => {
	const rand = createRandom(21);
	for (const order of ORDERS) {
		for (let n = 0; n < 30; n++) {
			const x = (rand() - 0.5) * 2.8, y = (rand() - 0.5) * 2.8, z = (rand() - 0.5) * 2.8;
			const m = eulerMatrix(x, y, z, order);
			const e = new Euler().setFromRotationMatrix(m, order);
			assert.equal(e.order, order);
			matClose(eulerMatrix(e.x, e.y, e.z, order), m.elements, 1e-9);
		}
	}
});

test('Euler recovers the exact angles for simple rotations', () => {
	const e = new Euler().setFromRotationMatrix(eulerMatrix(0.3, 0.2, -0.4, 'XYZ'), 'XYZ');
	vecClose([e.x, e.y, e.z], [0.3, 0.2, -0.4], 1e-12);
	const zyx = new Euler().setFromRotationMatrix(eulerMatrix(0.3, 0.2, -0.4, 'ZYX'), 'ZYX');
	vecClose([zyx.x, zyx.y, zyx.z], [0.3, 0.2, -0.4], 1e-12);
});

test('Euler gimbal lock still reproduces the same rotation', () => {
	for (const order of ORDERS) {
		const axis = order[1]; // the middle axis is the one that locks at +-90deg
		const angles = { X: 0.4, Y: 0, Z: -0.7 };
		angles[axis] = Math.PI / 2;
		const m = eulerMatrix(angles.X, angles.Y, angles.Z, order);
		const e = new Euler().setFromRotationMatrix(m, order);
		matClose(eulerMatrix(e.x, e.y, e.z, order), m.elements, 1e-6);
	}
});

test('Euler validates its order and notifies on change', () => {
	assert.throws(() => new Euler(0, 0, 0, 'XXY'), /Invalid Euler order/);
	const e = new Euler();
	let calls = 0;
	e.onChange(() => calls++);
	e.x = 1;
	e.set(1, 2, 3);
	assert.equal(calls, 2);
	assert.throws(() => { e.order = 'bad'; }, RangeError);
});
