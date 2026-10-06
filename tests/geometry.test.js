import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BoxGeometry, PlaneGeometry, SphereGeometry, BufferGeometry, BufferAttribute } from '../src/index.js';
import { close } from './helpers/assertions.js';

/** Calls fn(a, b, c, indices) with each triangle's three vertex positions as [x,y,z]. */
function eachTriangle(geometry, fn) {
	const p = geometry.attributes.position.array, idx = geometry.index.array;
	const v = (i) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
	for (let t = 0; t < idx.length; t += 3) fn(v(idx[t]), v(idx[t + 1]), v(idx[t + 2]), [idx[t], idx[t + 1], idx[t + 2]]);
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.sqrt(dot(a, a));

function normalAt(geometry, i) {
	const n = geometry.attributes.normal.array;
	return [n[i * 3], n[i * 3 + 1], n[i * 3 + 2]];
}

/** Every attribute is consistent and every triangle's winding agrees with its stored normals. */
function assertWellFormed(geometry, { checkWinding = true } = {}) {
	const count = geometry.attributes.position.count;
	assert.equal(geometry.attributes.normal.count, count);
	assert.equal(geometry.attributes.uv.count, count);
	assert.equal(geometry.attributes.uv.itemSize, 2);
	assert.equal(geometry.index.count % 3, 0);

	const uv = geometry.attributes.uv.array;
	for (const value of uv) assert.ok(value >= 0 && value <= 1);
	for (const i of geometry.index.array) assert.ok(i < count, `index ${i} out of range`);
	for (let i = 0; i < count; i++) close(len(normalAt(geometry, i)), 1, 1e-6);

	if (!checkWinding) return;
	eachTriangle(geometry, (a, b, c, [ia, ib, ic]) => {
		const face = cross(sub(b, a), sub(c, a));
		assert.ok(len(face) > 1e-9, 'degenerate triangle');
		const expected = normalAt(geometry, ia);
		assert.ok(dot(face, expected) > 0, `triangle ${ia},${ib},${ic} winds against its normal`);
	});
}

test('BoxGeometry default: 24 vertices, 36 indices, unit cube, well formed', () => {
	const g = new BoxGeometry();
	assert.equal(g.attributes.position.count, 24);
	assert.equal(g.index.count, 36);
	assert.ok(g.index.array instanceof Uint16Array);
	assertWellFormed(g);
	const p = g.attributes.position.array;
	for (const value of p) close(Math.abs(value), 0.5, 1e-9);
});

test('BoxGeometry honours width/height/depth and faces point outward', () => {
	const g = new BoxGeometry(2, 4, 6);
	const p = g.attributes.position.array;
	const max = [0, 0, 0];
	for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) max[k] = Math.max(max[k], Math.abs(p[i + k]));
	assert.deepEqual(max, [1, 2, 3]);
	assertWellFormed(g);
	eachTriangle(g, (a, b, c) => {
		const centroid = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
		assert.ok(dot(cross(sub(b, a), sub(c, a)), centroid) > 0, 'face normal must point away from the center');
	});
});

test('BoxGeometry segments subdivide each face', () => {
	const g = new BoxGeometry(1, 1, 1, 2, 3, 4);
	assert.equal(g.attributes.position.count, 94);
	assert.equal(g.index.count, 312);
	assertWellFormed(g);
});

test('PlaneGeometry lies in XY facing +Z with CCW winding', () => {
	const g = new PlaneGeometry(4, 2, 3, 2);
	assert.equal(g.attributes.position.count, 12);
	assert.equal(g.index.count, 3 * 2 * 6);
	assertWellFormed(g);
	const p = g.attributes.position.array;
	for (let i = 0; i < p.length; i += 3) {
		assert.ok(Math.abs(p[i]) <= 2 + 1e-9 && Math.abs(p[i + 1]) <= 1 + 1e-9);
		close(p[i + 2], 0);
	}
	for (let i = 0; i < 12; i++) assert.deepEqual(normalAt(g, i), [0, 0, 1]);
	// UV corners
	assert.deepEqual(Array.from(g.attributes.uv.array.slice(0, 2)), [0, 0]);
});

test('SphereGeometry: vertices on the sphere, outward normals/winding, no degenerate triangles', () => {
	const g = new SphereGeometry(2, 8, 6);
	assert.equal(g.attributes.position.count, 9 * 7);
	assert.equal(g.index.count, 2 * 8 * (6 - 1) * 3);
	assertWellFormed(g);
	const p = g.attributes.position.array;
	for (let i = 0; i < g.attributes.position.count; i++) {
		const pos = [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]];
		close(len(pos), 2, 1e-6);
		const n = normalAt(g, i);
		for (let k = 0; k < 3; k++) close(n[k], pos[k] / 2, 1e-6);
	}
	close(p[1], 2, 1e-6);                                  // first vertex: north pole
	close(p[(g.attributes.position.count - 1) * 3 + 1], -2, 1e-6); // last vertex: south pole
	eachTriangle(g, (a, b, c) => {
		const centroid = [a[0] + b[0] + c[0], a[1] + b[1] + c[1], a[2] + b[2] + c[2]];
		assert.ok(dot(cross(sub(b, a), sub(c, a)), centroid) > 0);
	});
});

test('geometry constructors validate their arguments', () => {
	assert.throws(() => new BoxGeometry(0), /BoxGeometry width/);
	assert.throws(() => new BoxGeometry(1, 1, NaN), /BoxGeometry depth/);
	assert.throws(() => new BoxGeometry(1, 1, 1, 0), /widthSegments/);
	assert.throws(() => new PlaneGeometry(-1, 1), /PlaneGeometry width/);
	assert.throws(() => new SphereGeometry(0), /SphereGeometry radius/);
});

test('BufferAttribute validates its input and versions updates', () => {
	assert.throws(() => new BufferAttribute([1, 2, 3], 3), TypeError);
	assert.throws(() => new BufferAttribute(new Float32Array(4), 3), /multiple of itemSize/);
	assert.throws(() => new BufferAttribute(new Float32Array(3), 0), RangeError);
	const a = new BufferAttribute(new Float32Array(6), 3);
	assert.equal(a.count, 2);
	a.needsUpdate = true;
	a.needsUpdate = false;
	assert.equal(a.version, 1);
});

test('BufferGeometry.setIndex picks Uint16 or Uint32 (65535 is reserved for primitive restart)', () => {
	const g = new BufferGeometry();
	assert.ok(g.setIndex([0, 1, 65534]).index.array instanceof Uint16Array);
	assert.ok(g.setIndex([0, 1, 65535]).index.array instanceof Uint32Array);
	assert.ok(g.setIndex([0, 1, 70000]).index.array instanceof Uint32Array);
	assert.equal(g.setIndex(null).index, null);
	assert.throws(() => g.setAttribute('position', [1, 2, 3]), TypeError);
});

test('computeVertexNormals: flat plane gives +Z, indexed and non-indexed', () => {
	const indexed = new BufferGeometry();
	indexed.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0]), 3));
	indexed.setIndex([0, 1, 2, 1, 3, 2]);
	indexed.computeVertexNormals();
	for (let i = 0; i < 4; i++) assert.deepEqual(normalAt(indexed, i).map((v) => +v.toFixed(6)), [0, 0, 1]);

	const flat = new BufferGeometry();
	flat.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0]), 3)); // clockwise from +Z
	flat.computeVertexNormals();
	assert.deepEqual(normalAt(flat, 0), [0, 0, -1]);

	assert.throws(() => new BufferGeometry().computeVertexNormals(), /position/);
});

test('computeVertexNormals refreshes an existing normal attribute in place and bumps its version', () => {
	const g = new PlaneGeometry();
	const normal = g.attributes.normal;
	const before = normal.version;
	g.computeVertexNormals();
	assert.equal(g.attributes.normal, normal);
	assert.equal(normal.version, before + 1);
});

test('dispose notifies listeners until they are removed', () => {
	const g = new BoxGeometry();
	let calls = 0;
	const listener = () => calls++;
	g.addDisposeListener(listener);
	g.dispose();
	g.removeDisposeListener(listener);
	g.dispose();
	assert.equal(calls, 1);
});
