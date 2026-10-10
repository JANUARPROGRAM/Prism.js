import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PhysicsWorld, RigidBody, SphereShape, BoxShape, CapsuleShape, PlaneShape, Vector3, Quaternion } from '../src/index.js';
import { ContactList, collide, computeAABB } from '../src/physics/collision.js';
import { close, vecClose } from './helpers/assertions.js';

const V = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
const rot = (axis, angle) => new Quaternion().setFromAxisAngle(V(...axis), angle);
const ground = () => new RigidBody({ shape: new PlaneShape(V(0, 1, 0), 0), mass: 0, restitution: 0 });
const capsule = (position, radius = 0.4, height = 1.2, options = {}) => new RigidBody({ shape: new CapsuleShape(radius, height), position, ...options });
const world = (bodies, options = {}) => { const w = new PhysicsWorld(options); bodies.forEach((b) => w.addBody(b)); return w; };
const run = (w, seconds) => { for (let i = 0, n = Math.round(seconds / w.fixedTimeStep); i < n; i++) w.step(w.fixedTimeStep); };
const contactsOf = (a, b) => {
	a.updateRotation(); b.updateRotation();
	const list = new ContactList();
	collide(a, b, list);
	return list.items.slice(0, list.count);
};
/** The body's local Y axis in world space. */
const axisOf = (body) => [body.rotation[1], body.rotation[4], body.rotation[7]];
const SIDEWAYS = rot([0, 0, 1], Math.PI / 2); // lays a capsule down along world x

test('CapsuleShape validates its input', () => {
	assert.throws(() => new CapsuleShape(0, 1), /radius/);
	assert.throws(() => new CapsuleShape(1, -1), /height/);
	assert.equal(new CapsuleShape(0.5, 0).halfHeight, 0); // a zero-length capsule is a sphere
});

test('capsule inertia matches a numerical integration over its volume', () => {
	const r = 0.4, h = 1.2, mass = 3;
	const shape = new CapsuleShape(r, h);
	const out = shape.computeInertia(mass, V());
	// brute force: a fine grid of sample points, uniform density
	const n = 90, half = h / 2 + r, step = (2 * half) / n, cell = (2 * r) / n;
	let count = 0, ix = 0, iy = 0;
	const inside = (x, y, z) => { const cy = Math.max(-h / 2, Math.min(h / 2, y)); return x * x + (y - cy) ** 2 + z * z <= r * r; };
	const pts = [];
	for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) {
		const x = -r + (i + 0.5) * cell, y = -half + (j + 0.5) * step, z = -r + (k + 0.5) * cell;
		if (inside(x, y, z)) { pts.push([x, y, z]); }
	}
	const m = mass / pts.length;
	for (const [x, y, z] of pts) { ix += m * (y * y + z * z); iy += m * (x * x + z * z); count++; }
	close(out.x, ix, ix * 0.015);   // about x
	close(out.y, iy, iy * 0.015);   // about the capsule axis
	assert.equal(out.x, out.z);
	// a zero-length capsule is a solid sphere
	vecClose(new CapsuleShape(0.5, 0).computeInertia(2, V()), [0.2, 0.2, 0.2], 1e-12);
});

test('bounding box follows the capsule orientation', () => {
	const box = new Float64Array(6);
	const upright = capsule(V(1, 2, 3));
	computeAABB(upright, box);
	vecClose(box, [0.6, 1, 2.6, 1.4, 3, 3.4], 1e-9);
	const lying = capsule(V(0, 0, 0), 0.4, 1.2, { quaternion: SIDEWAYS });
	lying.updateRotation();
	computeAABB(lying, box);
	vecClose([box[0], box[1], box[3], box[4]], [-1, -0.4, 1, 0.4], 1e-9);
});

test('capsule-plane: lying down touches at both ends, standing at one', () => {
	const lying = contactsOf(ground(), capsule(V(0, 0.35, 0), 0.4, 1.2, { quaternion: SIDEWAYS }));
	assert.equal(lying.length, 2);
	for (const c of lying) { close(c.depth, 0.05, 1e-9); vecClose([c.nx, c.ny, c.nz], [0, 1, 0]); }
	assert.deepEqual(lying.map((c) => Math.sign(c.px)).sort(), [-1, 1]);
	const standing = contactsOf(ground(), capsule(V(0, 1.0 - 0.02, 0)));   // half length 0.6 + radius 0.4 = 1.0
	assert.equal(standing.length, 1);
	close(standing[0].depth, 0.02, 1e-9);
	assert.equal(contactsOf(ground(), capsule(V(0, 1.05, 0))).length, 0);
});

test('capsule-sphere: from the side the normal is perpendicular to the axis, over a cap it follows the axis', () => {
	const [side] = contactsOf(capsule(V(0, 0, 0)), new RigidBody({ shape: new SphereShape(0.3), position: V(0.6, 0.2, 0) }));
	vecClose([side.nx, side.ny, side.nz, side.depth], [1, 0, 0, 0.1], 1e-9);
	const [cap] = contactsOf(capsule(V(0, 0, 0)), new RigidBody({ shape: new SphereShape(0.3), position: V(0, 0.6 + 0.6, 0) }));
	vecClose([cap.nx, cap.ny, cap.nz, cap.depth], [0, 1, 0, 0.1], 1e-9);
	assert.equal(contactsOf(capsule(V(0, 0, 0)), new RigidBody({ shape: new SphereShape(0.3), position: V(0.75, 0, 0) })).length, 0);
	// coincident centers never produce NaN
	const [same] = contactsOf(capsule(V(0, 0, 0)), new RigidBody({ shape: new SphereShape(0.3), position: V(0, 0, 0) }));
	assert.ok(Number.isFinite(same.nx + same.ny + same.nz));
});

test('capsule-capsule: crossing axes give one contact, parallel capsules two, end to end one', () => {
	const a = capsule(V(0, 0, 0));
	const crossing = contactsOf(a, capsule(V(0, 0, 0.75), 0.4, 1.2, { quaternion: SIDEWAYS }));
	// a's axis runs along y through the origin, b's along x through (0, 0, 0.75): the two axes are skew and 0.75 apart (< 0.8)
	assert.equal(crossing.length, 1);
	vecClose([crossing[0].nx, crossing[0].ny, crossing[0].nz, crossing[0].depth], [0, 0, 1, 0.05], 1e-9);

	const parallel = contactsOf(a, capsule(V(0.75, 0.2, 0)));
	assert.equal(parallel.length, 2, 'two support points for a stable side-by-side pose');
	for (const c of parallel) vecClose([c.nx, c.ny, c.nz, c.depth], [1, 0, 0, 0.05], 1e-9);

	// coaxial, end to end: the cap centers are at y = 0.6 and 1.95 - 0.6 = 1.35, 0.75 apart (< 0.8)
	const endToEnd = contactsOf(a, capsule(V(0, 1.95, 0)));
	assert.equal(endToEnd.length, 1);
	vecClose([endToEnd[0].nx, endToEnd[0].ny, endToEnd[0].nz, endToEnd[0].depth], [0, 1, 0, 0.05], 1e-9);
	// axes that overlap along their length are deep inside each other: depth = both radii, never NaN
	const overlapping = contactsOf(a, capsule(V(0, 1.15, 0)));
	assert.ok(overlapping.length >= 1 && overlapping.every((c) => Math.abs(c.depth - 0.8) < 1e-9 && Number.isFinite(c.nx + c.ny + c.nz)));
	assert.equal(contactsOf(a, capsule(V(2, 0, 0))).length, 0);
});

test('capsule-box: lying on a face gives support points at both ends; crossing an edge touches at the edge', () => {
	const slab = new RigidBody({ shape: new BoxShape(4, 1, 4), mass: 0 });
	const lying = contactsOf(slab, capsule(V(0, 0.5 + 0.35, 0), 0.4, 1.2, { quaternion: SIDEWAYS }));
	assert.ok(lying.length >= 2);
	for (const c of lying) { vecClose([c.nx, c.ny, c.nz], [0, 1, 0], 1e-9); close(c.depth, 0.05, 1e-9); }

	// a capsule lying along x with its middle over the box's top edge (x = 2), tilted so only the middle can touch
	const edge = contactsOf(slab, capsule(V(2, 0.5 + 0.38, 0), 0.4, 3, { quaternion: SIDEWAYS }));
	assert.ok(edge.length >= 1);
	assert.ok(edge.every((c) => c.depth > 0 && Math.abs(c.ny) > 0.9));
	assert.equal(contactsOf(slab, capsule(V(0, 3, 0))).length, 0);
});

test('a tilted capsule falls onto its side, rolls to rest at y = radius and sleeps', () => {
	const c = capsule(V(0, 2, 0), 0.4, 1.2, { quaternion: rot([1, 0, 0], 0.4).multiply(rot([0, 0, 1], 0.5)) });
	const w = world([ground(), c]);
	run(w, 6);
	close(c.position.y, 0.4, 0.02);
	assert.ok(Math.abs(axisOf(c)[1]) < 0.05, `axis should be horizontal, y component ${axisOf(c)[1]}`);
	assert.equal(c.sleeping, true);
});

test('a capsule lying on a box stays there; a ball bumping into a capsule conserves momentum', () => {
	const slab = new RigidBody({ shape: new BoxShape(6, 1, 6), position: V(0, -0.5, 0), mass: 0, restitution: 0 });
	const c = capsule(V(0.3, 0.6, 0.1), 0.4, 1.2, { quaternion: SIDEWAYS, restitution: 0 });
	const w1 = world([slab, c]);
	run(w1, 4);
	close(c.position.y, 0.4, 0.03);
	assert.ok(Math.hypot(c.position.x - 0.3, c.position.z - 0.1) < 0.1, 'did not slide away');

	const a = new RigidBody({ shape: new SphereShape(0.3), position: V(-3, 0, 0), velocity: V(5, 0, 0), restitution: 0.5, linearDamping: 0 });
	const b = capsule(V(0, 0, 0), 0.4, 1.2, { mass: 2, restitution: 0.5, linearDamping: 0, angularDamping: 0 });
	const w2 = world([a, b], { allowSleep: false });
	w2.gravity.set(0, 0, 0);
	run(w2, 1.5);
	close(a.mass * a.velocity.x + b.mass * b.velocity.x, 5, 1e-9);
	assert.ok(b.velocity.x > 1, 'the capsule was pushed');
});

test('raycast: capsule side, caps, rotated pose, misses and an origin inside', () => {
	const w = world([capsule(V(0, 0, 0))]);
	const hitSide = w.raycast(V(5, 0.3, 0), V(-1, 0, 0));
	close(hitSide.distance, 4.6, 1e-9);
	vecClose(hitSide.normal, [1, 0, 0], 1e-9);
	const hitTop = w.raycast(V(0, 5, 0), V(0, -1, 0));
	close(hitTop.distance, 5 - 1.0, 1e-9);
	vecClose(hitTop.normal, [0, 1, 0], 1e-9);
	const diagonal = w.raycast(V(3, 3, 0), V(-1, -1, 0));      // y = x reaches the cylinder at (0.4, 0.4), below the cap's center (y = 0.6)
	close(diagonal.distance, 2.6 * Math.SQRT2, 1e-9);
	vecClose(diagonal.normal, [1, 0, 0], 1e-9);
	const cap = w.raycast(V(2, 2, 0), V(0.2 - 2, 0.9 - 2, 0)); // aimed at the upper cap
	assert.ok(cap.normal.y > 0.5 && cap.normal.x > 0.3 && Math.abs(cap.normal.length() - 1) < 1e-9);
	// the hit point lies on the cap's sphere (center (0, 0.6, 0), radius 0.4)
	close(cap.point.distanceTo(V(0, 0.6, 0)), 0.4, 1e-9);
	assert.equal(w.raycast(V(5, 0, 0), V(-1, 0.5, 0)), null);  // passes above the capsule... then keeps going up
	assert.equal(w.raycast(V(0.1, 0.2, 0), V(1, 0, 0)), null, 'origin inside');

	const lying = world([capsule(V(0, 1, 0), 0.4, 1.2, { quaternion: SIDEWAYS })]);
	close(lying.raycast(V(0, 5, 0), V(0, -1, 0)).distance, 5 - 1.4, 1e-9);
	close(lying.raycast(V(-5, 1, 0), V(1, 0, 0)).distance, 5 - 1.0, 1e-9);
});
