import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	PhysicsWorld, RigidBody, SphereShape, BoxShape, PlaneShape, Vector3, Quaternion,
	BallSocketJoint, HingeJoint, DistanceJoint
} from '../src/index.js';
import { close } from './helpers/assertions.js';

const G = 9.81;
const V = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
const world = (options = {}) => new PhysicsWorld({ allowSleep: false, ...options });
const ball = (position, options = {}) => new RigidBody({ shape: new SphereShape(options.radius ?? 0.1), position, linearDamping: 0, angularDamping: 0, ...options });
const run = (w, seconds, each) => { for (let i = 0, n = Math.round(seconds / w.fixedTimeStep); i < n; i++) { w.step(w.fixedTimeStep); if (each) each(i, (i + 1) * w.fixedTimeStep); } };
/** Where the body's local point (given in world space at creation) is now. */
const anchorOf = (body, local) => {
	body.updateRotation(); // the matrix is refreshed at the start of each step, so catch up with the last integration
	const R = body.rotation;
	return V(body.position.x + R[0] * local[0] + R[1] * local[1] + R[2] * local[2],
		body.position.y + R[3] * local[0] + R[4] * local[1] + R[5] * local[2],
		body.position.z + R[6] * local[0] + R[7] * local[1] + R[8] * local[2]);
};

test('a ball-socket pendulum swings with the physical-pendulum period and keeps its length', () => {
	const L = 2, r = 0.1, theta0 = 0.15, pivot = V(0, 5, 0);
	const b = ball(V(L * Math.sin(theta0), 5 - L * Math.cos(theta0), 0), { radius: r });
	const w = world();
	w.addBody(b);
	const joint = w.addJoint(new BallSocketJoint(b, null, { anchor: pivot }));
	let worst = 0, previous = b.position.x, previousT = 0;
	const crossings = [];
	run(w, 12, (i, t) => {
		worst = Math.max(worst, Math.abs(b.position.distanceTo(pivot) - Math.hypot(L * Math.sin(theta0), L * Math.cos(theta0))));
		if (previous > 0 && b.position.x <= 0) crossings.push(previousT + (t - previousT) * previous / (previous - b.position.x)); // moving to -x
		previous = b.position.x; previousT = t;
	});
	assert.ok(crossings.length >= 3, `crossings: ${crossings.length}`);
	const period = crossings[1] - crossings[0];
	const T0 = 2 * Math.PI * Math.sqrt((L * L + 0.4 * r * r) / (G * L));
	const expected = T0 * (1 + theta0 * theta0 / 16); // finite-amplitude correction
	close(period, expected, expected * 0.01, 'period');
	assert.ok(worst < 0.004, `the center stayed within ${worst.toFixed(4)} m of its circle`);
	close(joint._error, 0, 0.01);
});

test('pendulum energy: no systematic gain; the small loss is first-order in the time step', () => {
	const L = 2, pivot = V(0, 5, 0), theta0 = 0.5;
	const measure = (dt, seconds) => {
		const b = ball(V(L * Math.sin(theta0), 5 - L * Math.cos(theta0), 0));
		const w = world({ fixedTimeStep: dt, maxSubSteps: 100 });
		w.addBody(b);
		w.addJoint(new BallSocketJoint(b, null, { anchor: pivot }));
		const energy = () => b.kineticEnergy + b.mass * G * b.position.y;
		const e0 = energy(), swing = b.mass * G * L * (1 - Math.cos(theta0));
		let peak = e0;
		for (let i = 0, n = Math.round(seconds / dt); i < n; i++) { w.step(dt); peak = Math.max(peak, energy()); }
		return { loss: (e0 - energy()) / swing, gain: (peak - e0) / swing };
	};
	const coarse = measure(1 / 60, 6), fine = measure(1 / 120, 6);
	assert.ok(coarse.gain < 0.005 && fine.gain < 0.005, `energy never rose by more than ${(100 * Math.max(coarse.gain, fine.gain)).toFixed(2)}%`);
	assert.ok(coarse.loss > 0 && coarse.loss < 0.08, `loss at 60 Hz ${(100 * coarse.loss).toFixed(2)}%`);
	// halving the step halves the loss: it is discretisation error of the constraint, not a bug that adds friction
	const ratio = coarse.loss / fine.loss;
	assert.ok(ratio > 1.7 && ratio < 2.3, `loss ratio ${ratio.toFixed(2)}`);
});

function buildChain(w, degreesFromDown) {
	const t = degreesFromDown * Math.PI / 180, dir = V(Math.sin(t), -Math.cos(t), 0), pivot = V(0, 5, 0);
	const bodies = [];
	for (let i = 0; i < 6; i++) { const b = ball(pivot.clone().addScaledVector(dir, 0.25 + 0.5 * i)); bodies.push(b); w.addBody(b); }
	const joints = [w.addJoint(new BallSocketJoint(null, bodies[0], { anchor: pivot }))];
	for (let i = 0; i < 5; i++) joints.push(w.addJoint(new BallSocketJoint(bodies[i], bodies[i + 1], { anchor: pivot.clone().addScaledVector(dir, 0.5 * (i + 1)) })));
	return { bodies, joints, pivot };
}

test('a chain of ball-socket joints stays connected; the error grows with speed (discretisation), not with sloppiness', () => {
	const gapsFor = (degrees) => {
		const w = world();
		const { bodies, joints, pivot } = buildChain(w, degrees);
		let worst = 0, sum = 0, count = 0, top = 0;
		run(w, 6, () => {
			for (const j of joints) { worst = Math.max(worst, j._error); sum += j._error; count++; }
			for (const b of bodies) { top = Math.max(top, b.velocity.length()); assert.ok(Number.isFinite(b.position.y) && Math.abs(b.position.z) < 0.01 && b.position.distanceTo(pivot) < 3.1); }
		});
		return { worst, mean: sum / count, top };
	};
	const gentle = gapsFor(20), moderate = gapsFor(40), stress = gapsFor(90);
	assert.ok(gentle.worst < 0.004, `20°: worst gap ${gentle.worst.toFixed(4)} m at ${gentle.top.toFixed(1)} m/s`);
	assert.ok(moderate.worst < 0.012, `40°: worst gap ${moderate.worst.toFixed(4)} m at ${moderate.top.toFixed(1)} m/s`);
	assert.ok(gentle.worst < moderate.worst && moderate.worst < stress.worst, 'error rises with speed');
	// released horizontally the links whip around at >10 m/s (0.67 rad per step): large spikes, small on average
	assert.ok(stress.mean < 0.006 && stress.worst < 0.12, `90°: mean ${stress.mean.toFixed(4)} m, worst ${stress.worst.toFixed(4)} m`);
});

test('a rope is slack until it is taut; a rigid rod keeps its length both ways', () => {
	const pivot = V(0, 5, 0);
	const rope = ball(V(1.5, 5, 0));
	const w1 = world();
	w1.addBody(rope);
	w1.addJoint(new DistanceJoint(rope, null, { anchorB: pivot, maxLength: 2 }));
	const free = ball(V(1.5, 5, 0));
	const wf = world();
	wf.addBody(free);
	run(w1, 0.15);
	run(wf, 0.15);
	close(rope.position.x, 1.5, 1e-9, 'no sideways pull while slack');
	close(rope.position.y, free.position.y, 1e-9, 'identical to a free-falling ball while slack');
	let longest = 0;
	run(w1, 4, () => { longest = Math.max(longest, rope.position.distanceTo(pivot)); });
	assert.ok(longest < 2.02, `rope stretched to ${longest.toFixed(3)} m`);

	// the same ball above the pivot: a rope lets it fall through, a rod does not
	const fallsThrough = (rigid) => {
		const b = ball(V(0, 7, 0));
		const w = world();
		w.addBody(b);
		w.addJoint(new DistanceJoint(b, null, rigid ? { anchorB: pivot, length: 2 } : { anchorB: pivot, maxLength: 2 }));
		let nearest = Infinity, farthest = 0;
		run(w, 2, () => { const d = b.position.distanceTo(pivot); nearest = Math.min(nearest, d); farthest = Math.max(farthest, d); });
		return { nearest, farthest };
	};
	const rod = fallsThrough(true), slackRope = fallsThrough(false);
	close(rod.nearest, 2, 0.02);
	close(rod.farthest, 2, 0.02);
	assert.ok(slackRope.nearest < 0.5, 'the rope let the ball come close to the pivot');
});

test('minLength keeps two bodies from coming closer', () => {
	const a = ball(V(0, 5, 0), { mass: 0 });
	const b = ball(V(0, 5.5, 0), { velocity: V(0, -3, 0) });
	const w = world();
	w.gravity.set(0, 0, 0);
	[a, b].forEach((x) => w.addBody(x));
	w.addJoint(new DistanceJoint(a, b, { minLength: 0.5 }));
	let nearest = Infinity;
	run(w, 1, () => { nearest = Math.min(nearest, b.position.distanceTo(a.position)); });
	assert.ok(nearest > 0.49, `came to ${nearest.toFixed(3)} m`);
});

test('a hinged door on a vertical axis rotates only about that axis and its hinge stays put', () => {
	const spin = (dt) => {
		const door = new RigidBody({ shape: new BoxShape(1, 2, 0.1), mass: 2, position: V(0.5, 1, 0), linearDamping: 0, angularDamping: 0 });
		door.angularVelocity.set(0, 2, 0);
		door.velocity.set(0, 0, -1); // v = ω × r for the door's center, half a meter from the hinge
		const w = world({ fixedTimeStep: dt, maxSubSteps: 20 });
		w.addBody(door);
		const joint = w.addJoint(new HingeJoint(door, null, { anchor: V(0, 1, 0), axis: V(0, 1, 0) }));
		let off = 0, drift = 0;
		for (let i = 0, n = Math.round(2 / dt); i < n; i++) {
			w.step(dt);
			off = Math.max(off, Math.abs(door.angularVelocity.x), Math.abs(door.angularVelocity.z));
			drift = Math.max(drift, anchorOf(door, joint.localAnchorA).distanceTo(V(0, 1, 0)));
		}
		return { door, off, drift };
	};
	const coarse = spin(1 / 60), fine = spin(1 / 120);
	assert.ok(coarse.off < 0.02, `spin about other axes ${coarse.off}`);
	assert.ok(coarse.drift < 0.005, `hinge point drifted ${coarse.drift} m`);
	close(coarse.door.position.y, 1, 0.01);
	close(Math.hypot(coarse.door.position.x, coarse.door.position.z), 0.5, 0.01, 'still half a meter from the hinge');
	// The spin decays slightly (cos(ω·dt) per step, first order in dt); it never speeds up, and half the step halves the loss.
	const lossCoarse = 2 - coarse.door.angularVelocity.y, lossFine = 2 - fine.door.angularVelocity.y;
	assert.ok(lossCoarse > 0 && lossCoarse < 0.12, `spin lost ${lossCoarse.toFixed(3)} rad/s in 2 s at 60 Hz`);
	assert.ok(lossCoarse / lossFine > 1.7 && lossCoarse / lossFine < 2.4, `loss ratio ${(lossCoarse / lossFine).toFixed(2)}`);
});

test('a door hanging from a horizontal hinge swings like a physical pendulum, in its plane', () => {
	// box 1 x 2 x 0.1, hinge along z at the top edge; the center is d = 1 below the hinge
	const m = 2, d = 1, Izz = m / 12 * (1 + 4), theta0 = 0.2;
	const door = new RigidBody({ shape: new BoxShape(1, 2, 0.1), mass: m, position: V(d * Math.sin(theta0), 5 - d * Math.cos(theta0), 0),
		quaternion: new Quaternion().setFromAxisAngle(V(0, 0, 1), theta0), linearDamping: 0, angularDamping: 0 });
	const w = world();
	w.addBody(door);
	w.addJoint(new HingeJoint(door, null, { anchor: V(0, 5, 0), axis: V(0, 0, 1) }));
	let previous = door.position.x, previousT = 0, outOfPlane = 0;
	const crossings = [];
	run(w, 10, (i, t) => {
		if (previous > 0 && door.position.x <= 0) crossings.push(previousT + (t - previousT) * previous / (previous - door.position.x));
		previous = door.position.x; previousT = t;
		outOfPlane = Math.max(outOfPlane, Math.abs(door.angularVelocity.x), Math.abs(door.angularVelocity.y), Math.abs(door.position.z));
	});
	const T = 2 * Math.PI * Math.sqrt((Izz + m * d * d) / (m * G * d)) * (1 + theta0 * theta0 / 16);
	assert.ok(crossings.length >= 3);
	close(crossings[1] - crossings[0], T, T * 0.012, 'period');
	assert.ok(outOfPlane < 0.01, `left its plane by ${outOfPlane}`);
});

test('a hinge motor reaches its target speed, limited by the maximum torque', () => {
	const make = () => {
		const wheel = new RigidBody({ shape: new BoxShape(1, 1, 0.2), mass: 1, position: V(0, 2, 0), linearDamping: 0, angularDamping: 0 });
		const w = world();
		w.gravity.set(0, 0, 0);
		w.addBody(wheel);
		const hinge = w.addJoint(new HingeJoint(null, wheel, { anchor: V(0, 2, 0), axis: V(0, 0, 1) })); // motorSpeed: B relative to A
		return { wheel, w, hinge };
	};
	const strong = make();
	strong.hinge.motorSpeed = 3; strong.hinge.maxMotorTorque = 100;
	run(strong.w, 1.5);
	close(strong.wheel.angularVelocity.z, 3, 0.06);
	close(strong.wheel.angularVelocity.x, 0, 0.01);

	const weak = make();                       // I = m/12 (1² + 1²) = 1/6, so τ = 0.5 gives α = 3 rad/s²
	weak.hinge.motorSpeed = 10; weak.hinge.maxMotorTorque = 0.5;
	run(weak.w, 0.5);
	close(weak.wheel.angularVelocity.z, 1.5, 0.1);
});

test('jointed bodies do not collide unless asked to', () => {
	const make = (collideConnected) => {
		const a = new RigidBody({ shape: new BoxShape(1, 1, 1), position: V(0, 5, 0), mass: 0 });
		const b = new RigidBody({ shape: new BoxShape(1, 1, 1), position: V(0.3, 5, 0), linearDamping: 0 });
		const w = world();
		w.gravity.set(0, 0, 0);
		[a, b].forEach((x) => w.addBody(x));
		w.addJoint(new DistanceJoint(a, b, { minLength: 0, maxLength: 3, collideConnected }));
		run(w, 1);
		return b.position.x;
	};
	close(make(false), 0.3, 1e-9);
	assert.ok(make(true) > 0.9, 'with collideConnected the overlapping boxes were pushed apart');
});

test('joints keep their bodies awake together and wake the chain when one end is kicked', () => {
	const w = new PhysicsWorld();   // sleeping enabled
	const bodies = [0, 1, 2].map((i) => { const b = ball(V(0, 4.5 - i, 0), { allowSleep: true }); w.addBody(b); return b; });
	w.addJoint(new BallSocketJoint(null, bodies[0], { anchor: V(0, 5, 0) }));
	w.addJoint(new BallSocketJoint(bodies[0], bodies[1], { anchor: V(0, 4, 0) }));
	w.addJoint(new BallSocketJoint(bodies[1], bodies[2], { anchor: V(0, 3, 0) }));
	run(w, 4);
	assert.ok(bodies.every((b) => b.sleeping), 'a chain hanging at rest falls asleep');
	bodies[2].applyImpulse(V(2, 0, 0));
	run(w, 0.2);
	assert.ok(bodies.every((b) => !b.sleeping), 'kicking one end woke the whole chain');
	assert.ok(bodies[0].velocity.length() > 1e-3, 'and the motion travelled up the chain');
});

test('removing a body or a joint releases it; misuse fails clearly', () => {
	const w = world();
	const a = ball(V(0, 5, 0)), b = ball(V(1, 5, 0));
	[a, b].forEach((x) => w.addBody(x));
	const joint = w.addJoint(new DistanceJoint(a, b));
	assert.throws(() => w.addJoint(joint), /already in the world/);
	assert.equal(w.removeBody(b), true);
	assert.equal(w.joints.length, 0, 'the joint went away with its body');
	assert.equal(w.removeJoint(joint), false);

	assert.throws(() => new BallSocketJoint(a, b), /anchor/);
	assert.throws(() => new HingeJoint(a, b, { anchor: V() }), /axis/);
	assert.throws(() => new DistanceJoint(null, null), /at least one body/);
	assert.throws(() => new DistanceJoint(a, {}), /RigidBody/);
	assert.throws(() => new DistanceJoint(a, b, { minLength: 3, maxLength: 1 }), /minLength/);
	const stranger = ball(V());
	assert.throws(() => w.addJoint(new DistanceJoint(a, stranger)), /Add the joint's bodies/);
	assert.throws(() => w.addJoint({}), /expects a joint/);
});

test('a sleeping chain wakes completely in the very next step, not one link per step', () => {
	const w = new PhysicsWorld();
	const bodies = [0, 1, 2, 3, 4, 5].map((i) => { const b = ball(V(0, 4.5 - i, 0), { allowSleep: true }); w.addBody(b); return b; });
	w.addJoint(new BallSocketJoint(null, bodies[0], { anchor: V(0, 5, 0) }));
	for (let i = 1; i < bodies.length; i++) w.addJoint(new BallSocketJoint(bodies[i - 1], bodies[i], { anchor: V(0, 5 - i, 0) }));
	run(w, 4);
	assert.ok(bodies.every((b) => b.sleeping));
	bodies[5].applyImpulse(V(1, 0, 0));
	w.step(w.fixedTimeStep);
	assert.ok(bodies.every((b) => !b.sleeping), 'every link awake after one step');
	assert.equal(w.stats.joints, 6);
});
