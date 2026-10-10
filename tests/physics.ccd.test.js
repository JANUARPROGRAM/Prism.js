import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PhysicsWorld, RigidBody, SphereShape, BoxShape, CapsuleShape, PlaneShape, Vector3 } from '../src/index.js';
import { close } from './helpers/assertions.js';

const V = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
const run = (w, seconds, each) => { for (let i = 0, n = Math.round(seconds / w.fixedTimeStep); i < n; i++) { w.step(w.fixedTimeStep); if (each) each(i); } };
const wall = (x, thickness = 0.05, extra = {}) => new RigidBody({ shape: new BoxShape(thickness, 20, 20), position: V(x, 0, 0), mass: 0, ...extra });
const bullet = (speed, options = {}) => new RigidBody({ shape: new SphereShape(0.1), position: V(0, 0, 0), velocity: V(speed, 0, 0), linearDamping: 0, ...options });
const make = (bodies) => { const w = new PhysicsWorld({ allowSleep: false }); w.gravity.set(0, 0, 0); bodies.forEach((b) => w.addBody(b)); return w; };

test('without ccd a fast ball tunnels through a thin wall; with ccd it does not', () => {
	for (const [ccd, expectTunnel] of [[false, true], [true, false]]) {
		const b = bullet(400, { ccd, restitution: 0 });
		const w = make([wall(5), b]);
		run(w, 0.5);
		assert.equal(b.position.x > 5, expectTunnel, `ccd=${ccd}: x = ${b.position.x.toFixed(2)}`);
	}
});

test('ccd keeps restitution exact: a 100 m/s ball hitting a wall (e = 0.5) leaves at about 50 m/s', () => {
	const b = bullet(100, { ccd: true, restitution: 0.5 });
	const w = make([wall(5, 0.05, { restitution: 0.5 }), b]);
	let maxX = 0;
	run(w, 0.4, () => { maxX = Math.max(maxX, b.position.x); });
	assert.ok(maxX < 5, `never passed the wall (max x ${maxX.toFixed(3)})`);
	close(b.velocity.x, -50, 3);
});

test('ccd also stops fast boxes and capsules, and works against planes and other bodies', () => {
	const fastBox = new RigidBody({ shape: new BoxShape(0.2, 0.2, 0.2), position: V(0, 0, 0), velocity: V(300, 0, 0), ccd: true, restitution: 0, linearDamping: 0 });
	const w1 = make([wall(5), fastBox]);
	run(w1, 0.5);
	assert.ok(fastBox.position.x < 5);

	const fastCapsule = new RigidBody({ shape: new CapsuleShape(0.1, 0.6), position: V(0, 0, 0), velocity: V(300, 0, 0), ccd: true, restitution: 0, linearDamping: 0 });
	const w2 = make([wall(5), fastCapsule]);
	run(w2, 0.5);
	assert.ok(fastCapsule.position.x < 5);

	// a thin box moving fast into a ball that has ccd: the ball is the one swept
	const target = new RigidBody({ shape: new SphereShape(0.05), position: V(5, 0, 0), mass: 0 });
	const shot = bullet(500, { ccd: true, restitution: 0 });
	const w3 = make([target, shot]);
	run(w3, 0.3);
	assert.ok(shot.position.x < 5.0, `x = ${shot.position.x}`);

	const floor = new RigidBody({ shape: new PlaneShape(V(0, 1, 0), 0), mass: 0 });
	const dive = new RigidBody({ shape: new SphereShape(0.1), position: V(0, 3, 0), velocity: V(0, -800, 0), ccd: true, restitution: 0, linearDamping: 0 });
	const w4 = new PhysicsWorld({ allowSleep: false });
	[floor, dive].forEach((b) => w4.addBody(b));
	run(w4, 0.3);
	assert.ok(dive.position.y > 0.05, `y = ${dive.position.y}`);
});

test('ccd only acts on bodies that move further than their own size per step: slow scenes are unchanged', () => {
	const build = (ccd) => {
		const bodies = [new RigidBody({ shape: new PlaneShape(V(0, 1, 0), 0), mass: 0 })];
		for (let i = 0; i < 20; i++) bodies.push(new RigidBody({ shape: i % 2 ? new BoxShape(0.8, 0.8, 0.8) : new SphereShape(0.4), position: V((i % 5) * 0.9, 0.5 + i * 0.9, ((i * 7) % 3) * 0.3), ccd }));
		const w = new PhysicsWorld();
		bodies.forEach((b) => w.addBody(b));
		return w;
	};
	const a = build(false), b = build(true);
	run(a, 3);
	run(b, 3);
	a.bodies.forEach((body, i) => { assert.ok(body.position.equals(b.bodies[i].position), `body ${i} differs`); });
});

test('a ball already touching a surface is not frozen by ccd', () => {
	const floor = new RigidBody({ shape: new PlaneShape(V(0, 1, 0), 0), mass: 0 });
	const slider = new RigidBody({ shape: new SphereShape(0.1), position: V(0, 0.1, 0), velocity: V(60, 0, 0), ccd: true, restitution: 0, friction: 0, linearDamping: 0 });
	const w = new PhysicsWorld({ allowSleep: false });
	[floor, slider].forEach((b) => w.addBody(b));
	run(w, 0.5);
	assert.ok(slider.position.x > 25, `slid to x = ${slider.position.x}`);
});
