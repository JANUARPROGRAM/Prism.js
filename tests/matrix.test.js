import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Matrix3, Matrix4, Vector3, Quaternion } from '../src/index.js';
import { close, vecClose, matClose, createRandom } from './helpers/assertions.js';

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function randomTRS(rand) {
	const q = new Quaternion(rand() - 0.5, rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
	const p = new Vector3(rand() * 10 - 5, rand() * 10 - 5, rand() * 10 - 5);
	const s = new Vector3(0.5 + rand() * 2, 0.5 + rand() * 2, 0.5 + rand() * 2);
	return { q, p, s, m: new Matrix4().compose(p, q, s) };
}

test('Matrix4 identity and translation layout (column-major, translation in 12..14)', () => {
	matClose(new Matrix4(), IDENTITY);
	const t = new Matrix4().makeTranslation(1, 2, 3);
	assert.deepEqual(Array.from(t.elements.slice(12, 15)), [1, 2, 3]);
});

test('Matrix4 multiply applies the right operand first', () => {
	const translate = new Matrix4().makeTranslation(10, 0, 0);
	const scale = new Matrix4().makeScale(2, 2, 2);
	// T * S: scale first, then translate.
	vecClose(new Vector3(1, 0, 0).applyMatrix4(translate.clone().multiply(scale)), [12, 0, 0]);
	// S * T: translate first, then scale.
	vecClose(new Vector3(1, 0, 0).applyMatrix4(scale.clone().multiply(translate)), [22, 0, 0]);
	// premultiply is the mirror image.
	matClose(scale.clone().premultiply(translate), translate.clone().multiply(scale).elements);
});

test('Matrix4 multiplication is associative and safe when aliasing', () => {
	const rand = createRandom(7);
	const a = randomTRS(rand).m, b = randomTRS(rand).m, c = randomTRS(rand).m;
	const left = a.clone().multiply(b).multiply(c);
	const right = a.clone().multiply(b.clone().multiply(c));
	matClose(left, right.elements, 1e-9);
	const squared = a.clone().multiply(a);
	matClose(squared, new Matrix4().multiplyMatrices(a, a).elements);
});

test('Matrix4 rotations rotate counter-clockwise (right-handed)', () => {
	vecClose(new Vector3(0, 1, 0).applyMatrix4(new Matrix4().makeRotationX(Math.PI / 2)), [0, 0, 1]);
	vecClose(new Vector3(0, 0, 1).applyMatrix4(new Matrix4().makeRotationY(Math.PI / 2)), [1, 0, 0]);
	vecClose(new Vector3(1, 0, 0).applyMatrix4(new Matrix4().makeRotationZ(Math.PI / 2)), [0, 1, 0]);
});

test('Matrix4 makeRotationAxis agrees with the quaternion rotation', () => {
	const axis = new Vector3(1, 2, 3).normalize();
	const angle = 1.234;
	const viaMatrix = new Matrix4().makeRotationAxis(axis, angle);
	const viaQuat = new Matrix4().makeRotationFromQuaternion(new Quaternion().setFromAxisAngle(axis, angle));
	matClose(viaMatrix, viaQuat.elements, 1e-12);
});

test('Matrix4 determinant and invert (M * M^-1 = I for random affine matrices)', () => {
	const rand = createRandom(99);
	close(new Matrix4().makeScale(2, 3, 4).determinant(), 24);
	for (let n = 0; n < 50; n++) {
		const { m, s } = randomTRS(rand);
		close(m.determinant(), s.x * s.y * s.z, 1e-9);
		matClose(m.clone().invert().multiply(m), IDENTITY, 1e-9);
		matClose(m.clone().multiply(m.clone().invert()), IDENTITY, 1e-9);
	}
});

test('Matrix4 invert also works on a perspective (non-affine) matrix', () => {
	const p = new Matrix4().makePerspective(1, 1.5, 0.1, 100);
	matClose(p.clone().invert().multiply(p), IDENTITY, 1e-9);
});

test('Matrix4 singular matrix inverts to zeros instead of NaN', () => {
	const m = new Matrix4().makeScale(1, 0, 1).invert();
	assert.ok(Array.from(m.elements).every((v) => v === 0));
});

test('Matrix4 transpose twice is identity operation', () => {
	const m = randomTRS(createRandom(5)).m;
	matClose(m.clone().transpose().transpose(), m.elements);
});

test('Matrix4 compose / decompose round trip', () => {
	const rand = createRandom(42);
	for (let n = 0; n < 50; n++) {
		const { q, p, s, m } = randomTRS(rand);
		const p2 = new Vector3(), q2 = new Quaternion(), s2 = new Vector3();
		m.decompose(p2, q2, s2);
		vecClose(p2, p.toArray(), 1e-9);
		vecClose(s2, s.toArray(), 1e-9);
		// q and -q are the same rotation.
		const sign = q.dot(q2) < 0 ? -1 : 1;
		vecClose([q2.x * sign, q2.y * sign, q2.z * sign, q2.w * sign], [q.x, q.y, q.z, q.w], 1e-9);
	}
});

test('Matrix4 decompose folds a mirrored (negative-determinant) matrix into scale.x', () => {
	const m = new Matrix4().makeScale(-2, 3, 4);
	const p = new Vector3(), q = new Quaternion(), s = new Vector3();
	m.decompose(p, q, s);
	close(s.x * s.y * s.z, -24, 1e-9);
	matClose(new Matrix4().compose(p, q, s), m.elements, 1e-9);
});

test('Matrix4 perspective maps near/far planes to NDC z = -1 / +1 and keeps the frustum edge', () => {
	const near = 0.5, far = 50, fov = Math.PI / 2, aspect = 2;
	const p = new Matrix4().makePerspective(fov, aspect, near, far);
	close(new Vector3(0, 0, -near).applyMatrix4(p).z, -1, 1e-9);
	close(new Vector3(0, 0, -far).applyMatrix4(p).z, 1, 1e-9);
	// With 90deg vertical fov the top edge at distance d is y = d; right edge is x = d * aspect.
	const edge = new Vector3(2 * 10, 10, -10).applyMatrix4(p);
	close(edge.x, 1, 1e-9);
	close(edge.y, 1, 1e-9);
	close(new Vector3(0, 0, -5).applyMatrix4(p).x, 0);
});

test('Matrix4 orthographic maps the box corners to the NDC cube', () => {
	const o = new Matrix4().makeOrthographic(-4, 6, 3, -1, 1, 11);
	vecClose(new Vector3(-4, -1, -1).applyMatrix4(o), [-1, -1, -1]);
	vecClose(new Vector3(6, 3, -11).applyMatrix4(o), [1, 1, 1]);
	vecClose(new Vector3(1, 1, -6).applyMatrix4(o), [0, 0, 0]);
});

test('Matrix4 lookAt builds a view matrix: eye -> origin, target on -Z', () => {
	const eye = new Vector3(3, 4, 5), target = new Vector3(-1, 2, 0.5);
	const view = new Matrix4().lookAt(eye, target, new Vector3(0, 1, 0));
	vecClose(eye.clone().applyMatrix4(view), [0, 0, 0]);
	const t = target.clone().applyMatrix4(view);
	close(t.x, 0, 1e-9);
	close(t.y, 0, 1e-9);
	close(t.z, -eye.distanceTo(target), 1e-9);
	// Rotation part must be orthonormal.
	close(view.determinant(), 1, 1e-9);
});

test('Matrix4 lookAt survives an `up` vector parallel to the view direction', () => {
	const view = new Matrix4().lookAt(new Vector3(0, 5, 0), new Vector3(0, 0, 0), new Vector3(0, 1, 0));
	assert.ok(Array.from(view.elements).every(Number.isFinite));
	close(view.determinant(), 1, 1e-6);
	close(new Vector3(0, 0, 0).applyMatrix4(view).z, -5, 1e-6);
});

test('Matrix3 determinant, invert and transpose', () => {
	const m = new Matrix3().fromArray([2, 0, 0, 1, 3, 0, 4, 5, 6]);
	close(m.determinant(), 36);
	const inv = m.clone().invert();
	const product = new Matrix3().multiplyMatrices(m, inv);
	matClose(product, [1, 0, 0, 0, 1, 0, 0, 0, 1], 1e-12);
	matClose(m.clone().transpose().transpose(), m.elements);
	assert.ok(Array.from(new Matrix3().fromArray([1, 2, 3, 2, 4, 6, 0, 0, 1]).invert().elements).every((v) => v === 0));
});

test('Matrix3 normal matrix keeps normals perpendicular under non-uniform scale', () => {
	const model = new Matrix4().compose(new Vector3(5, 5, 5), new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), 0.7), new Vector3(1, 4, 1));
	const normalMatrix = new Matrix3().getNormalMatrix(model);
	// A surface tangent and its normal (perpendicular in model space).
	const tangent = new Vector3(1, 1, 0), normal = new Vector3(1, -1, 0);
	const worldTangent = tangent.clone().applyMatrix3(new Matrix3().setFromMatrix4(model));
	const worldNormal = normal.clone().applyMatrix3(normalMatrix);
	close(worldTangent.dot(worldNormal), 0, 1e-9);
	// Transforming the normal with the model matrix instead would break this.
	const wrong = normal.clone().applyMatrix3(new Matrix3().setFromMatrix4(model));
	assert.ok(Math.abs(worldTangent.dot(wrong)) > 0.1);
});
