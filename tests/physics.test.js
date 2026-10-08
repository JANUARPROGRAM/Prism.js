import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	PhysicsWorld, RigidBody, SphereShape, BoxShape, PlaneShape, Vector3, Quaternion, Object3D
} from '../src/index.js';
import { ContactList, collide, raycastBody } from '../src/physics/collision.js';
import { close, vecClose, createRandom } from './helpers/assertions.js';

const G = 9.81;
const V = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
// Restitutions of two bodies combine with max(), so the ground gets 0 and the other body decides the bounce.
const ground = (constant = 0) => new RigidBody({ shape: new PlaneShape(V(0, 1, 0), constant), mass: 0, restitution: 0 });
const sphere = (position, options = {}) => new RigidBody({ shape: new SphereShape(options.radius ?? 0.5), position, ...options });
const box = (position, size = [1, 1, 1], options = {}) => new RigidBody({ shape: new BoxShape(...size), position, ...options });
const world = (bodies = [], options = {}) => {
	const w = new PhysicsWorld(options);
	for (const b of bodies) w.addBody(b);
	return w;
};
const run = (w, seconds, each) => {
	const steps = Math.round(seconds / w.fixedTimeStep);
	for (let i = 0; i < steps; i++) { if (each) each(i); w.step(w.fixedTimeStep); }
};
/** Angle (degrees) between a body's local axis (0=x,1=y,2=z) and a world direction. */
const axisAngle = (body, axis, world) => {
	const R = body.rotation;
	const a = [R[axis], R[3 + axis], R[6 + axis]];
	return Math.acos(Math.max(-1, Math.min(1, a[0] * world[0] + a[1] * world[1] + a[2] * world[2]))) * 180 / Math.PI;
};
const tilt = (body) => Math.min(...[0, 1, 2].map((i) => Math.min(axisAngle(body, i, [0, 1, 0]), axisAngle(body, i, [0, -1, 0]))));

// ---------------------------------------------------------------- shapes and bodies

test('shape validation and principal moments of inertia', () => {
	assert.throws(() => new SphereShape(0), /radius/);
	assert.throws(() => new BoxShape(1, -1, 1), /height/);
	assert.throws(() => new PlaneShape(V(0, 0, 0)), /zero vector/);
	const out = V();
	vecClose(new SphereShape(2).computeInertia(5, out), [8, 8, 8]);          // 2/5 * 5 * 4
	vecClose(new BoxShape(1, 2, 3).computeInertia(12, out), [13, 10, 5]);    // m/12 * (b²+c²)
	assert.equal(new PlaneShape(V(0, 3, 0), 1).normal.y, 1, 'normal is normalized');
});

test('RigidBody validates its input; planes must be static', () => {
	assert.throws(() => new RigidBody({}), /requires a `shape`/);
	assert.throws(() => sphere(V(), { mass: -1 }), /mass/);
	assert.throws(() => sphere(V(), { restitution: -0.1 }), /restitution/);
	assert.throws(() => sphere(V(), { linearDamping: 2 }), /damping/);
	assert.throws(() => new RigidBody({ shape: new PlaneShape(), mass: 1 }), /must be static/);
	const b = sphere(V(), { mass: 0 });
	assert.deepEqual([b.invMass, b.isDynamic], [0, false]);
});

test('world inertia tensor follows the rotation (a box turned 90° about z swaps its x and y inertia)', () => {
	const b = box(V(), [1, 2, 3], { mass: 12 });
	const I = b.invInertiaWorld;
	vecClose([I[0], I[4], I[8]], [1 / 13, 1 / 10, 1 / 5]);
	b.quaternion.setFromAxisAngle(V(0, 0, 1), Math.PI / 2);
	b.updateRotation();
	vecClose([I[0], I[4], I[8]], [1 / 10, 1 / 13, 1 / 5], 1e-12);
	close(I[1], 0, 1e-12);
});

test('applyImpulse: dv = J/m; an off-center impulse spins the body by I⁻¹ (r × J)', () => {
	const b = box(V(), [1, 1, 1], { mass: 2 });
	b.applyImpulse(V(0, 0, 4), V(0.5, 0, 0));
	vecClose(b.velocity, [0, 0, 2]);
	// r × J = (0.5,0,0) × (0,0,4) = (0,-2,0); I = 2/12*2 = 1/3 -> ω = 6 about -y
	vecClose(b.angularVelocity, [0, -6, 0], 1e-12);
	// the velocity of the contact point is v + ω × r
	vecClose(b.getVelocityAtPoint(V(0.5, 0, 0)), [0, 0, 2 + 3], 1e-12);
	const wall = sphere(V(), { mass: 0 });
	wall.applyImpulse(V(5, 5, 5));
	vecClose(wall.velocity, [0, 0, 0]);
});

test('kinetic energy: ½mv² + ½ ω·Iω', () => {
	const b = box(V(), [1, 2, 3], { mass: 12, velocity: V(1, 2, 2) });
	b.angularVelocity.set(0, 2, 0);
	close(b.kineticEnergy, 0.5 * 12 * 9 + 0.5 * 10 * 4, 1e-9);
});

// ---------------------------------------------------------------- free motion

test('free fall follows ½gt² (within the semi-implicit Euler error of 1/60 s steps)', () => {
	const b = sphere(V(0, 100, 0), { linearDamping: 0 });
	const w = world([b], { allowSleep: false });
	run(w, 1);
	close(b.position.y, 100 - 0.5 * G, 0.5 * G * 0.02);
	close(b.velocity.y, -G, 0.02);
	run(w, 1);
	close(b.velocity.y, -2 * G, 0.04);
});

test('projectile: horizontal velocity is constant, vertical motion is independent', () => {
	const b = sphere(V(0, 50, 0), { velocity: V(10, 5, -3), linearDamping: 0 });
	const w = world([b], { allowSleep: false });
	run(w, 1);
	close(b.velocity.x, 10, 1e-9);
	close(b.velocity.z, -3, 1e-9);
	close(b.position.x, 10, 0.1);
	close(b.position.y, 50 + 5 - 0.5 * G, 0.15);
});

test('linear damping removes a fixed fraction of speed per second', () => {
	const b = sphere(V(), { velocity: V(10, 0, 0), linearDamping: 0.5 });
	const w = world([b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	run(w, 1);
	close(b.velocity.x, 5, 0.01);
});

test('a constant force gives F/m (force is applied each step it is set for)', () => {
	const b = sphere(V(), { mass: 2, linearDamping: 0 });
	const w = world([b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	run(w, 1, () => b.applyForce(V(10, 0, 0)));
	close(b.velocity.x, 5, 1e-6);
});

test('a constant torque gives ω = τt/I (sphere, no gravity)', () => {
	const b = sphere(V(), { mass: 5, radius: 2, angularDamping: 0 }); // I = 2/5*5*4 = 8
	const w = world([b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	run(w, 2, () => b.applyTorque(V(0, 0, 16)));
	close(b.angularVelocity.z, 4, 1e-6);
	// orientation advanced by ∫ω dt = ½ α t² = 4 rad about z
	const q = new Quaternion().setFromAxisAngle(V(0, 0, 1), 4);
	assert.ok(Math.abs(b.quaternion.dot(q)) > 0.999);
});

test('a spinning sphere keeps its angular velocity and the quaternion stays normalized', () => {
	const b = sphere(V(), { angularVelocity: V(1, 2, 3), angularDamping: 0 });
	const w = world([b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	run(w, 5);
	vecClose(b.angularVelocity, [1, 2, 3], 1e-9);
	close(b.quaternion.length(), 1, 1e-9);
});

test('static bodies never move and ignore forces', () => {
	const s = box(V(1, 2, 3), [1, 1, 1], { mass: 0 });
	const w = world([s]);
	s.applyForce(V(100, 100, 100));
	run(w, 1);
	vecClose(s.position, [1, 2, 3]);
});

// ---------------------------------------------------------------- collisions with the ground

test('a sphere bounces to ≈ e²·h and e = 0 does not bounce', () => {
	const peakAfterImpact = (e) => {
		const b = sphere(V(0, 3.5, 0), { restitution: e, linearDamping: 0 });
		const w = world([ground(), b], { allowSleep: false });
		let touched = false, peak = 0;
		run(w, 3, () => {
			if (b.position.y < 0.52) touched = true;
			if (touched) peak = Math.max(peak, b.position.y);
		});
		return peak - 0.5;
	};
	close(peakAfterImpact(0.8), 0.64 * 3, 0.2);   // e² h = 1.92
	close(peakAfterImpact(0.5), 0.25 * 3, 0.15);  // 0.75
	assert.ok(peakAfterImpact(0) < 0.05);
});

test('a sphere comes to rest at its radius, does not sink, and falls asleep', () => {
	const b = sphere(V(0, 2, 0));
	const w = world([ground(), b]);
	run(w, 4);
	close(b.position.y, 0.5, 0.01);
	assert.equal(b.sleeping, true);
	assert.equal(w.stats.awake, 0);
});

test('resting contact carries the weight: the normal impulse per step is m·g·dt', () => {
	const b = sphere(V(0, 0.5, 0), { mass: 3 });
	const w = world([ground(), b], { allowSleep: false });
	run(w, 1);
	let impulse = 0;
	w.onContact = (c) => { impulse += c.normalImpulse; };
	w.step(w.fixedTimeStep);
	close(impulse, 3 * G * w.fixedTimeStep, 0.02);
});

test('a box rests flat on the ground: right height, no drift, no tilt', () => {
	const b = box(V(0, 0.5, 0), [1, 1, 1], { mass: 4 });
	const w = world([ground(), b], { allowSleep: false });
	run(w, 4);
	close(b.position.y, 0.5, 0.01);
	close(Math.hypot(b.position.x, b.position.z), 0, 0.01);
	assert.ok(tilt(b) < 0.5, `tilt ${tilt(b)}`);
});

test('a tilted box falls and settles on a face', () => {
	const q = new Quaternion().setFromAxisAngle(V(0, 0, 1), 0.5).multiply(new Quaternion().setFromAxisAngle(V(1, 0, 0), 0.35));
	const b = box(V(0, 2, 0), [1, 1, 1], { quaternion: q });
	const w = world([ground(), b]);
	run(w, 5);
	assert.ok(tilt(b) < 1, `tilt ${tilt(b)}°`);
	close(b.position.y, 0.5, 0.02);
	assert.equal(b.sleeping, true);
});

test('a box resting on a plane that is not at the origin uses the plane constant', () => {
	const b = box(V(0, 5.6, 0), [1, 1, 1]);
	const w = world([ground(5), b]);
	run(w, 3);
	close(b.position.y, 5.5, 0.02);
});

// ---------------------------------------------------------------- friction and angular coupling

test('Coulomb friction: a sliding box stops after v²/(2μg) and does not spin', () => {
	const b = box(V(0, 0.5, 0), [1, 1, 1], { velocity: V(5, 0, 0), friction: 0.5, linearDamping: 0 });
	const w = world([ground(), b], { allowSleep: false });
	run(w, 3);
	close(b.position.x, 25 / (2 * 0.5 * G), 0.3);   // 2.55 m
	close(b.velocity.x, 0, 0.02);
	assert.ok(tilt(b) < 2);
});

test('friction between two different materials uses sqrt(μ1·μ2)', () => {
	const g = ground();
	g.friction = 0.2;
	const b = box(V(0, 0.5, 0), [1, 1, 1], { velocity: V(5, 0, 0), friction: 0.8, linearDamping: 0 });
	const w = world([g, b], { allowSleep: false });
	run(w, 3);
	close(b.position.x, 25 / (2 * Math.sqrt(0.16) * G), 0.35);
});

test('inclined plane: the box holds when tan θ < μ and slides with a = g(sin θ − μ cos θ) when tan θ > μ', () => {
	const onSlope = (degrees) => {
		const th = degrees * Math.PI / 180;
		const n = V(Math.sin(th), Math.cos(th), 0);
		const slope = new RigidBody({ shape: new PlaneShape(n, 0), mass: 0 });
		const b = box(n.clone().multiplyScalar(0.5), [1, 1, 1], {
			quaternion: new Quaternion().setFromAxisAngle(V(0, 0, 1), -th), friction: 0.5, linearDamping: 0
		});
		const w = world([slope, b], { allowSleep: false });
		return { b, w, th };
	};
	const hold = onSlope(15);
	run(hold.w, 3);
	assert.ok(hold.b.position.distanceTo(V(Math.sin(hold.th) * 0.5, Math.cos(hold.th) * 0.5, 0)) < 0.05, 'stays put');

	const slide = onSlope(35);
	run(slide.w, 2.5);
	const speed = slide.b.velocity.length();
	const expected = G * (Math.sin(slide.th) - 0.5 * Math.cos(slide.th)) * 2.5; // after ~2.5 s of acceleration
	close(speed, expected, expected * 0.12);
	assert.ok(slide.b.velocity.x > 0 && slide.b.velocity.y < 0, 'moves down the slope');
});

test('a spinning sphere on the ground ends up rolling at v = (2/7)·r·ω₀ (friction couples spin and translation)', () => {
	const b = sphere(V(0, 0.5, 0), { angularVelocity: V(0, 0, -20), friction: 0.5, linearDamping: 0, angularDamping: 0, restitution: 0 });
	const w = world([ground(), b], { allowSleep: false });
	run(w, 3);
	close(b.velocity.x, (2 / 7) * 0.5 * 20, 0.15);
	close(b.angularVelocity.z, -b.velocity.x / 0.5, 0.4);  // rolling without slipping: v = -ω r
});

// ---------------------------------------------------------------- body-body collisions

test('head-on spheres, e = 1, equal masses: velocities are exchanged; momentum and energy are conserved', () => {
	const a = sphere(V(-3, 0, 0), { velocity: V(3, 0, 0), restitution: 1, linearDamping: 0 });
	const b = sphere(V(3, 0, 0), { velocity: V(-1, 0, 0), restitution: 1, linearDamping: 0 });
	const w = world([a, b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	const e0 = w.kineticEnergy;
	run(w, 3);
	close(a.velocity.x, -1, 0.05);
	close(b.velocity.x, 3, 0.05);
	close(a.velocity.x + b.velocity.x, 2, 1e-9);   // p = m1v1 + m2v2 is exact
	close(w.kineticEnergy / e0, 1, 0.01);
});

test('head-on spheres with unequal masses follow the elastic collision formulas', () => {
	const a = sphere(V(-3, 0, 0), { mass: 1, velocity: V(4, 0, 0), restitution: 1, linearDamping: 0 });
	const b = sphere(V(0, 0, 0), { mass: 3, restitution: 1, linearDamping: 0 });
	const w = world([a, b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	run(w, 3);
	close(a.velocity.x, (1 - 3) / 4 * 4, 0.05);   // -2
	close(b.velocity.x, 2 * 1 / 4 * 4, 0.05);     // +2
	close(a.velocity.x + 3 * b.velocity.x, 4, 1e-9);
});

test('perfectly inelastic collision (e = 0): both bodies leave with the common velocity', () => {
	const a = sphere(V(-3, 0, 0), { mass: 2, velocity: V(3, 0, 0), restitution: 0, linearDamping: 0 });
	const b = sphere(V(0, 0, 0), { mass: 1, restitution: 0, linearDamping: 0 });
	const w = world([a, b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	run(w, 3);
	close(a.velocity.x, 2, 0.05);
	close(b.velocity.x, 2, 0.05);
});

test('an off-center hit transfers angular momentum (total angular momentum about the origin is conserved)', () => {
	const a = sphere(V(-3, 0, 0), { velocity: V(4, 0, 0), restitution: 0.2, friction: 0.6, linearDamping: 0, angularDamping: 0 });
	const b = sphere(V(0, 0.6, 0), { restitution: 0.2, friction: 0.6, linearDamping: 0, angularDamping: 0 });
	const w = world([a, b], { allowSleep: false });
	w.gravity.set(0, 0, 0);
	const L = () => {
		let l = 0;
		for (const s of [a, b]) l += s.position.x * s.velocity.y * s.mass - s.position.y * s.velocity.x * s.mass + 0.4 * s.mass * 0.25 * s.angularVelocity.z;
		return l;
	};
	const before = L();
	run(w, 2);
	close(L(), before, Math.abs(before) * 0.02 + 0.02);
	assert.ok(Math.abs(b.angularVelocity.z) > 0.01 || Math.abs(a.angularVelocity.z) > 0.01, 'friction made them spin');
});

test('a box dropped on a box lands on it and rests', () => {
	const base = box(V(0, 0.5, 0), [2, 1, 2], { mass: 0 });
	const top = box(V(0.1, 2, 0.05), [1, 1, 1]);
	const w = world([ground(), base, top]);
	run(w, 4);
	close(top.position.y, 1.5, 0.02);
	assert.ok(tilt(top) < 1);
});

test('a stack of three boxes stays standing for 6 seconds', () => {
	const boxes = [0.5, 1.5, 2.5].map((y) => box(V(0, y, 0), [1, 1, 1]));
	const w = world([ground(), ...boxes], { allowSleep: false });
	run(w, 6);
	boxes.forEach((b, i) => {
		close(b.position.x, 0, 0.03, `box ${i} x`);
		close(b.position.z, 0, 0.03, `box ${i} z`);
		close(b.position.y, 0.5 + i, 0.04, `box ${i} y`);
		assert.ok(tilt(b) < 2, `box ${i} tilt ${tilt(b)}`);
	});
});

test('a heavy box on a light box does not make it sink or explode', () => {
	const low = box(V(0, 0.5, 0), [1, 1, 1], { mass: 1 });
	const high = box(V(0, 1.5, 0), [1, 1, 1], { mass: 20 });
	const w = world([ground(), low, high], { allowSleep: false });
	run(w, 4);
	close(low.position.y, 0.5, 0.05);
	close(high.position.y, 1.5, 0.08);
});

test('a ball knocks over a stack (the stack really moves)', () => {
	const tower = [0.5, 1.5, 2.5, 3.5].map((y) => box(V(0, y, 0), [1, 1, 1], { mass: 1 }));
	const ball = sphere(V(-6, 2, 0), { mass: 10, radius: 0.7, velocity: V(14, 0, 0) });
	const w = world([ground(), ...tower, ball]);
	run(w, 4);
	assert.ok(tower.some((b) => Math.abs(b.position.x) > 1), 'at least one box was pushed away');
	assert.ok(tower.every((b) => Number.isFinite(b.position.x) && b.position.y > 0.3));
});

test('a kinematic platform drags a box with friction, and is itself unaffected', () => {
	const platform = box(V(0, -0.25, 0), [40, 0.5, 4], { mass: 0, velocity: V(1, 0, 0), friction: 0.9 });
	const b = box(V(0, 0.5, 0), [1, 1, 1], { friction: 0.9 });
	const w = world([platform, b], { allowSleep: false });
	run(w, 2.5);
	close(b.velocity.x, 1, 0.1);
	close(platform.position.x, 2.5, 0.05);
	close(platform.velocity.x, 1, 1e-12);
	close(b.position.y, 0.5, 0.03);
});

test('collision groups and masks decide who collides', () => {
	const mk = (group, mask) => sphere(V(0, 0.5, 0), { collisionGroup: group, collisionMask: mask });
	const solid = new RigidBody({ shape: new PlaneShape(), mass: 0, collisionGroup: 1, collisionMask: 0xffff });
	const ghost = mk(2, 2);                       // collides only with group 2
	const w = world([solid, ghost], { allowSleep: false });
	run(w, 1);
	assert.ok(ghost.position.y < -3, 'fell through the ground it does not collide with');
	const real = mk(2, 0xffff);
	const w2 = world([solid, real]);
	run(w2, 2);
	close(real.position.y, 0.5, 0.02);
});

// ---------------------------------------------------------------- sleeping, stepping, API

test('sleeping: a settled body sleeps; an impulse wakes it; a fast hit wakes it; allowSleep=false prevents it', () => {
	const b = sphere(V(0, 0.5, 0));
	const w = world([ground(), b]);
	run(w, 2);
	assert.equal(b.sleeping, true);
	b.applyImpulse(V(0, 5, 0));
	assert.equal(b.sleeping, false);
	run(w, 4);
	assert.equal(b.sleeping, true);

	const rock = box(V(0, 0.5, 0), [1, 1, 1], { mass: 1 });
	const w2 = world([ground(), rock]);
	run(w2, 2);
	assert.equal(rock.sleeping, true);
	const bullet = sphere(V(-4, 0.5, 0), { velocity: V(8, 0, 0) });
	w2.addBody(bullet);
	run(w2, 1);
	assert.ok(rock.position.x > 0.1, 'the sleeping box was woken and pushed');

	const insomniac = sphere(V(0, 0.5, 0), { allowSleep: false });
	const w3 = world([ground(), insomniac]);
	run(w3, 4);
	assert.equal(insomniac.sleeping, false);
	const w4 = world([ground(), sphere(V(0, 0.5, 0))], { allowSleep: false });
	run(w4, 4);
	assert.equal(w4.stats.awake, 1);
});

test('a sleeping body acts as static support for an awake one, and removing the support wakes everything', () => {
	const base = box(V(0, 0.5, 0), [2, 1, 2]);
	const w = world([ground(), base]);
	run(w, 2);
	assert.equal(base.sleeping, true);
	const top = box(V(0, 2, 0), [1, 1, 1]);
	w.addBody(top);
	run(w, 3);
	close(top.position.y, 1.5, 0.03);
	assert.equal(w.removeBody(base), true);
	assert.equal(top.sleeping, false);
	run(w, 2);
	close(top.position.y, 0.5, 0.03);
});

test('step() uses fixed sub-steps, caps the backlog, and the frame split does not change the outcome much', () => {
	const w = world([sphere(V(0, 10, 0))], { allowSleep: false });
	w.step(0.5);
	assert.equal(w.stats.subSteps, 5, 'capped at maxSubSteps');
	w.step(1 / 120);
	assert.equal(w.stats.subSteps, 0, 'not enough time for a step');
	w.step(1 / 120);
	assert.equal(w.stats.subSteps, 1);
	assert.throws(() => w.step(-1), /deltaTime/);
	assert.throws(() => w.step(NaN), RangeError);

	const fall = (frame) => {
		const b = sphere(V(0, 100, 0), { linearDamping: 0 });
		const world1 = world([b], { allowSleep: false, maxSubSteps: 10 });
		for (let t = 0; t < 1 - 1e-9; t += frame) world1.step(frame);
		return b.position.y;
	};
	close(fall(1 / 60), fall(1 / 30), 0.2);
	close(fall(1 / 60), fall(1 / 20), 0.3);
});

test('the simulation is deterministic: the same setup gives bit-identical results', () => {
	const build = () => {
		const rand = createRandom(5);
		const bodies = [ground()];
		for (let i = 0; i < 12; i++) {
			const p = V(rand() * 4 - 2, 1 + i * 0.9, rand() * 4 - 2);
			bodies.push(i % 2 ? box(p, [0.8, 0.8, 0.8]) : sphere(p, { radius: 0.4 }));
		}
		return world(bodies);
	};
	const a = build(), b = build();
	run(a, 3);
	run(b, 3);
	a.bodies.forEach((body, i) => {
		assert.ok(body.position.equals(b.bodies[i].position));
		assert.ok(body.quaternion.equals(b.bodies[i].quaternion));
	});
});

test('bodies are written to their Object3D after each step; API misuse fails clearly', () => {
	const mesh = new Object3D();
	const b = sphere(V(0, 5, 0), { object: mesh });
	const w = world([b]);
	vecClose(mesh.position, [0, 5, 0]);
	run(w, 0.5);
	close(mesh.position.y, b.position.y, 1e-12);
	assert.ok(mesh.position.y < 5);
	assert.ok(mesh.quaternion.equals(b.quaternion));
	assert.throws(() => w.addBody({}), /expects a RigidBody/);
	assert.throws(() => w.addBody(b), /already in the world/);
	assert.equal(w.removeBody(sphere(V())), false);
	assert.throws(() => new PhysicsWorld({ fixedTimeStep: 0 }), /fixedTimeStep/);
	assert.throws(() => new PhysicsWorld({ maxSubSteps: 0 }), /maxSubSteps/);
	assert.throws(() => new PhysicsWorld({ solverIterations: 1.5 }), /solverIterations/);
});

// ---------------------------------------------------------------- robustness

test('a pile of 36 mixed bodies in a closed container stays inside, stays finite and calms down', () => {
	const rand = createRandom(2024);
	const bodies = [
		ground(),
		new RigidBody({ shape: new PlaneShape(V(1, 0, 0), -4), mass: 0 }),
		new RigidBody({ shape: new PlaneShape(V(-1, 0, 0), -4), mass: 0 }),
		new RigidBody({ shape: new PlaneShape(V(0, 0, 1), -4), mass: 0 }),
		new RigidBody({ shape: new PlaneShape(V(0, 0, -1), -4), mass: 0 })
	];
	for (let i = 0; i < 36; i++) {
		const p = V(rand() * 6 - 3, 1 + i * 0.7, rand() * 6 - 3);
		const q = new Quaternion().setFromAxisAngle(V(rand(), rand(), rand()).normalize(), rand() * 6);
		const size = 0.5 + rand() * 0.6;
		bodies.push(i % 3 === 0 ? sphere(p, { radius: size / 2 + 0.1 }) : box(p, [size, size * (0.6 + rand()), size], { quaternion: q }));
	}
	const w = world(bodies);
	let worst = 0;
	run(w, 14, () => { for (const b of w.bodies) worst = Math.max(worst, b.velocity.length()); });
	for (const b of w.bodies.slice(5)) {
		assert.ok([b.position.x, b.position.y, b.position.z, b.velocity.x, b.quaternion.w].every(Number.isFinite), 'finite');
		assert.ok(Math.abs(b.position.x) < 4.2 && Math.abs(b.position.z) < 4.2 && b.position.y > -0.05, `inside the container: ${b.position.toArray()}`);
	}
	assert.ok(worst < 40, `no body ever exceeded 40 m/s (max ${worst.toFixed(1)})`);
	assert.ok(w.stats.awake <= 4, `the pile settled (${w.stats.awake} bodies still awake)`);
});

test('dropping a body never gains energy: peak kinetic energy ≤ m·g·h', () => {
	const b = box(V(0, 5.5, 0), [1, 1, 1], { mass: 2, restitution: 0.4, linearDamping: 0, angularDamping: 0 });
	const w = world([ground(), b], { allowSleep: false });
	let peak = 0;
	run(w, 3, () => { peak = Math.max(peak, b.kineticEnergy); });
	assert.ok(peak <= 2 * G * 5 * 1.03, `peak ${peak.toFixed(1)} J vs ${(2 * G * 5).toFixed(1)} J`);
});

// ---------------------------------------------------------------- narrow phase in isolation

const pair = (a, b) => {
	for (const body of [a, b]) body.updateRotation();
	const list = new ContactList();
	collide(a, b, list);
	return list.items.slice(0, list.count);
};
const rot = (axis, angle) => new Quaternion().setFromAxisAngle(V(...axis), angle);

test('box-box face contact: four points, normal along the face, depth = overlap', () => {
	const contacts = pair(box(V(0, 0, 0)), box(V(0, 0.9, 0)));
	assert.equal(contacts.length, 4);
	for (const c of contacts) {
		vecClose([c.nx, c.ny, c.nz], [0, 1, 0], 1e-9);
		close(c.depth, 0.1, 1e-9);
		close(c.py, 0.45, 1e-9);
	}
	const xs = contacts.map((c) => c.px.toFixed(2)).sort();
	assert.deepEqual(xs, ['-0.50', '-0.50', '0.50', '0.50']);
	assert.equal(pair(box(V(0, 0, 0)), box(V(0, 1.01, 0))).length, 0, 'a gap means no contact');
	// swapping the arguments flips the normal, keeping it pointing from the first body to the second
	vecClose(((c) => [c.nx, c.ny, c.nz])(pair(box(V(0, 0.9, 0)), box(V(0, 0, 0)))[0]), [0, -1, 0], 1e-9);
});

test('box-box with a offset top box clips the contact patch to the overlap', () => {
	const contacts = pair(box(V(0, 0, 0)), box(V(0.7, 0.95, 0)));
	assert.equal(contacts.length, 4);
	for (const c of contacts) assert.ok(c.px >= 0.2 - 1e-9 && c.px <= 0.5 + 1e-9, `x ${c.px}`);
});

test('box-box: a box turned 45° still produces face contacts, and edge-edge crossings give one contact', () => {
	const turned = pair(box(V(0, 0, 0)), box(V(0, 0.95, 0), [1, 1, 1], { quaternion: rot([0, 1, 0], Math.PI / 4) }));
	assert.ok(turned.length >= 2);
	for (const c of turned) vecClose([c.nx, c.ny, c.nz], [0, 1, 0], 1e-6);

	const s = Math.SQRT1_2;
	const lower = box(V(0, 0, 0), [1, 1, 1], { quaternion: rot([0, 0, 1], Math.PI / 4) });   // ridge along z at y = 0.7071
	const upper = box(V(0, 2 * s - 0.01, 0), [1, 1, 1], { quaternion: rot([1, 0, 0], Math.PI / 4) }); // ridge along x
	const edge = pair(lower, upper);
	assert.equal(edge.length, 1);
	vecClose([edge[0].nx, edge[0].ny, edge[0].nz], [0, 1, 0], 1e-6);
	close(edge[0].depth, 0.01, 1e-6);
	close(edge[0].py, s - 0.005, 1e-6);
	close(Math.hypot(edge[0].px, edge[0].pz), 0, 1e-6);
});

test('sphere-sphere, sphere-plane, plane-box contacts', () => {
	const [c] = pair(sphere(V(0, 0, 0)), sphere(V(0.8, 0, 0)));
	vecClose([c.nx, c.ny, c.nz, c.depth, c.px], [1, 0, 0, 0.2, 0.4], 1e-9);
	assert.equal(pair(sphere(V(0, 0, 0)), sphere(V(1.01, 0, 0))).length, 0);
	const [same] = pair(sphere(V(0, 0, 0)), sphere(V(0, 0, 0)));
	vecClose([same.nx, same.ny, same.nz], [0, 1, 0], 1e-9);   // coincident centers: any direction, never NaN

	const [p] = pair(ground(), sphere(V(0, 0.3, 0)));
	vecClose([p.ny, p.depth, p.py], [1, 0.2, -0.1], 1e-9);   // midway between the sphere's lowest point (-0.2) and the plane (0)
	assert.equal(pair(ground(), sphere(V(0, 0.6, 0))).length, 0);

	assert.equal(pair(ground(), box(V(0, 0.45, 0))).length, 4);
	const corner = pair(ground(), box(V(0, 0.8, 0), [1, 1, 1], { quaternion: rot([0, 0, 1], Math.PI / 4).multiply(rot([1, 0, 0], Math.atan(Math.SQRT1_2))) }));
	assert.equal(corner.length, 1, 'a cube balanced on a corner touches at one vertex');
});

test('sphere-box: face, corner and inside cases, also with a rotated box', () => {
	const [face] = pair(box(V(0, 0, 0)), sphere(V(0, 0.9, 0)));
	vecClose([face.nx, face.ny, face.nz, face.depth], [0, 1, 0, 0.1], 1e-9);
	const s3 = Math.sqrt(3);
	const [corner] = pair(box(V(0, 0, 0)), sphere(V(0.7, 0.7, 0.7)));
	vecClose([corner.nx, corner.ny, corner.nz], [1 / s3, 1 / s3, 1 / s3], 1e-9);
	close(corner.depth, 0.5 - 0.2 * s3, 1e-9);
	assert.equal(pair(box(V(0, 0, 0)), sphere(V(0.8, 0.8, 0.8))).length, 0, 'beyond the corner: no contact');

	const [inside] = pair(box(V(0, 0, 0)), sphere(V(0.3, 0.1, 0.05)));
	vecClose([inside.nx, inside.ny, inside.nz], [1, 0, 0], 1e-9);   // leaves through the nearest face
	close(inside.depth, 0.5 + 0.2, 1e-9);

	const turned = box(V(0, 0, 0), [1, 1, 1], { quaternion: rot([0, 1, 0], Math.PI / 4) });
	const [side] = pair(turned, sphere(V(Math.SQRT1_2 + 0.4, 0, 0)));  // a point beyond the ridge pointing along +x
	vecClose([side.nx, side.ny, side.nz], [1, 0, 0], 1e-9);
	close(side.depth, 0.1, 1e-9);
});

// ---------------------------------------------------------------- ray casting

test('raycast hits spheres, rotated boxes and planes, returns the nearest, and respects maxDistance', () => {
	const near = sphere(V(0, 0, 5), { radius: 1 });
	const far = box(V(0, 0, 10), [2, 2, 2], { quaternion: rot([0, 1, 0], Math.PI / 4) });
	const floor = ground(-3);
	const w = world([far, near, floor]);
	const hit = w.raycast(V(0, 0, 0), V(0, 0, 1));
	assert.equal(hit.body, near);
	close(hit.distance, 4, 1e-9);
	vecClose(hit.point, [0, 0, 4], 1e-9);
	vecClose(hit.normal, [0, 0, -1], 1e-9);

	w.removeBody(near);
	const boxHit = w.raycast(V(0, 0, 0), V(0, 0, 3));  // direction is normalized for you
	assert.equal(boxHit.body, far);
	close(boxHit.distance, 10 - Math.SQRT2, 1e-9);   // a 45° box presents an edge at 10 - √2
	assert.equal(w.raycast(V(0, 0, 0), V(0, 0, 1), 5), null);

	const down = w.raycast(V(1, 4, 1), V(0, -1, 0));
	assert.equal(down.body, floor);
	close(down.distance, 7, 1e-9);
	vecClose(down.normal, [0, 1, 0]);
	assert.equal(w.raycast(V(0, -10, 0), V(0, -1, 0)), null, 'behind the plane');
	assert.equal(w.raycast(V(0, 0, 0), V(1, 0, 0)), null);
	assert.throws(() => w.raycast(V(), V()), /zero vector/);
});

test('raycast box faces and normals; a ray starting inside does not hit', () => {
	const b = box(V(0, 0, 0), [2, 2, 2]);
	const out = new Float64Array(3);
	for (const [origin, dir, normal] of [
		[[5, 0, 0], [-1, 0, 0], [1, 0, 0]], [[-5, 0, 0], [1, 0, 0], [-1, 0, 0]],
		[[0, 5, 0], [0, -1, 0], [0, 1, 0]], [[0, 0, -5], [0, 0, 1], [0, 0, -1]]
	]) {
		close(raycastBody(b, ...origin, ...dir, Infinity, out), 4, 1e-9);
		vecClose(out, normal, 1e-9);
	}
	assert.equal(raycastBody(b, 0, 0, 0, 1, 0, 0, Infinity, out), -1);
	assert.equal(raycastBody(b, 5, 3, 0, -1, 0, 0, Infinity, out), -1, 'passes beside the box');
	assert.equal(raycastBody(b, 5, 0, 0, 1, 0, 0, Infinity, out), -1, 'pointing away');
});
