import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Vector2, Vector3, Vector4, Matrix4, Quaternion } from '../src/index.js';
import { close, vecClose } from './helpers/assertions.js';

test('Vector3 arithmetic', () => {
	const a = new Vector3(1, 2, 3), b = new Vector3(4, -5, 6);
	vecClose(a.clone().add(b), [5, -3, 9]);
	vecClose(a.clone().sub(b), [-3, 7, -3]);
	vecClose(a.clone().multiply(b), [4, -10, 18]);
	vecClose(a.clone().multiplyScalar(2), [2, 4, 6]);
	vecClose(a.clone().divideScalar(2), [0.5, 1, 1.5]);
	vecClose(a.clone().negate(), [-1, -2, -3]);
	vecClose(a.clone().addScaledVector(b, 2), [9, -8, 15]);
	close(a.dot(b), 4 - 10 + 18);
});

test('Vector3 cross product is right-handed, anti-commutative and orthogonal', () => {
	const x = new Vector3(1, 0, 0), y = new Vector3(0, 1, 0);
	vecClose(new Vector3().crossVectors(x, y), [0, 0, 1]);
	vecClose(new Vector3().crossVectors(y, x), [0, 0, -1]);
	const a = new Vector3(1, 2, 3), b = new Vector3(-2, 0.5, 4);
	const c = a.clone().cross(b);
	close(c.dot(a), 0);
	close(c.dot(b), 0);
});

test('Vector3 length, normalize, distance, lerp', () => {
	const v = new Vector3(3, 4, 12);
	close(v.length(), 13);
	close(v.lengthSq(), 169);
	close(v.clone().normalize().length(), 1);
	assert.deepEqual(new Vector3().normalize().toArray(), [0, 0, 0], 'zero vector stays zero');
	close(new Vector3(1, 1, 1).distanceTo(new Vector3(4, 5, 13)), 13);
	vecClose(new Vector3(0, 0, 0).lerp(new Vector3(10, 20, 30), 0.25), [2.5, 5, 7.5]);
	vecClose(new Vector3().lerpVectors(new Vector3(2, 2, 2), new Vector3(4, 4, 4), 0.5), [3, 3, 3]);
});

test('Vector3 applyQuaternion matches axis-angle rotation', () => {
	const q = new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), Math.PI / 2);
	vecClose(new Vector3(1, 0, 0).applyQuaternion(q), [0, 1, 0]);
	vecClose(new Vector3(0, 1, 0).applyQuaternion(q), [-1, 0, 0]);
	vecClose(new Vector3(0, 0, 5).applyQuaternion(q), [0, 0, 5]);
});

test('Vector3 applyMatrix4 translates points but transformDirection ignores translation', () => {
	const m = new Matrix4().makeTranslation(1, 2, 3);
	vecClose(new Vector3(1, 1, 1).applyMatrix4(m), [2, 3, 4]);
	vecClose(new Vector3(0, 0, 2).transformDirection(m), [0, 0, 1]);
});

test('Vector3 array round trip and equality', () => {
	const v = new Vector3().fromArray([9, 1, 2, 3], 1);
	assert.deepEqual(v.toArray(), [1, 2, 3]);
	assert.ok(v.equals(new Vector3(1, 2, 3)));
	assert.ok(!v.equals(new Vector3(1, 2, 4)));
});

test('Vector2 basics', () => {
	const v = new Vector2(3, 4);
	close(v.length(), 5);
	close(v.clone().normalize().length(), 1);
	close(v.dot(new Vector2(2, 1)), 10);
	close(v.distanceTo(new Vector2(0, 0)), 5);
	assert.deepEqual(v.clone().lerp(new Vector2(5, 8), 0.5).toArray(), [4, 6]);
});

test('Vector4 basics and clip-space transform', () => {
	const v = new Vector4(1, 2, 3, 1);
	close(v.dot(new Vector4(1, 1, 1, 1)), 7);
	const t = new Vector4(1, 2, 3, 1).applyMatrix4(new Matrix4().makeTranslation(10, 20, 30));
	vecClose(t, [11, 22, 33, 1]);
	close(new Vector4(0, 3, 0, 4).length(), 5);
});
