import { Vector3 } from '../math/Vector3.js';
import { KIND_PLANE } from './shapes.js';
import { ContactList, collide, computeAABB, raycastBody } from './collision.js';
const _sweepBox = new Float64Array(6);

const ZERO_INERTIA = new Float64Array(9);
const MANIFOLD_CAPACITY = 16;

/** Contact impulses of one body pair from the previous step (reused every step). */
class Manifold {
	constructor() {
		this.stamp = -1;
		this.count = 0;
		this.px = new Float64Array(MANIFOLD_CAPACITY); this.py = new Float64Array(MANIFOLD_CAPACITY); this.pz = new Float64Array(MANIFOLD_CAPACITY);
		this.accN = new Float64Array(MANIFOLD_CAPACITY);
		this.fx = new Float64Array(MANIFOLD_CAPACITY); this.fy = new Float64Array(MANIFOLD_CAPACITY); this.fz = new Float64Array(MANIFOLD_CAPACITY);
		this.used = new Uint8Array(MANIFOLD_CAPACITY);
	}
}
const MAX_ANGULAR_SPEED = 200; // rad/s, keeps a numerical blow-up from spreading
const _normal = new Float64Array(3);

/**
 * A rigid-body simulation.
 *
 * Each fixed step: forces and gravity -> broad phase (sweep and prune on x) -> narrow phase
 * (contacts) -> sequential-impulse solver (non-penetration with restitution, Coulomb friction)
 * -> semi-implicit Euler integration -> sleeping. `step(dt)` runs as many fixed steps as `dt`
 * allows, so the result does not depend on the frame rate.
 *
 * Known limits: no joints, no continuous collision detection (very fast thin objects can tunnel),
 * no mesh/convex colliders, no gyroscopic term (spinning asymmetric bodies do not tumble
 * physically), single-threaded.
 */
export class PhysicsWorld {
	/**
	 * @param {object} [options]
	 * @param {Vector3} [options.gravity] default (0, -9.81, 0)
	 * @param {number} [options.fixedTimeStep=1/60] seconds per simulation step
	 * @param {number} [options.maxSubSteps=5] most steps per step() call; extra time is dropped
	 * @param {number} [options.solverIterations=20]
	 * @param {boolean} [options.allowSleep=true]
	 */
	constructor(options = {}) {
		const {
			gravity = new Vector3(0, -9.81, 0), fixedTimeStep = 1 / 60, maxSubSteps = 5,
			solverIterations = 20, allowSleep = true
		} = options;
		if (!(fixedTimeStep > 0)) throw new RangeError(`Prism.js: fixedTimeStep must be > 0, received ${String(fixedTimeStep)}.`);
		if (!Number.isInteger(maxSubSteps) || maxSubSteps < 1) throw new RangeError('Prism.js: maxSubSteps must be an integer >= 1.');
		if (!Number.isInteger(solverIterations) || solverIterations < 1) throw new RangeError('Prism.js: solverIterations must be an integer >= 1.');

		this.gravity = new Vector3().copy(gravity);
		this.fixedTimeStep = fixedTimeStep;
		this.maxSubSteps = maxSubSteps;
		this.solverIterations = solverIterations;
		this.allowSleep = allowSleep;

		/** Tuning (all in the world's units). */
		this.baumgarte = 0.2;            // fraction of penetration removed per step (via pseudo velocities, adds no energy)
		this.penetrationSlop = 0.005;    // penetration tolerated before correcting
		this.maxCorrectionSpeed = 3;     // cap on the position-correction velocity
		this.restitutionThreshold = 1;   // approach speed below which collisions do not bounce
		this.sleepTime = 0.5;            // seconds below the thresholds before a body sleeps
		this.sleepLinearSpeed = 0.1;
		this.sleepAngularSpeed = 0.1;
		this.wakeSpeed = 0.25;           // speed at which a mover wakes a sleeping body it touches
		this.spinFriction = 0.02;        // torsional friction: max resisting torque = spinFriction * normal force (meters)
		this.warmStarting = true;        // reuse last step's contact impulses as the solver's first guess
		this.warmStartDistance = 0.05;   // a contact within this distance of last step's counts as the same

		/** Called once per contact after each fixed step: fn(contact). Contact: a, b, px..pz, nx..nz, depth, normalImpulse. */
		this.onContact = null;

		/** @type {import('./RigidBody.js').RigidBody[]} */
		this.bodies = [];
		this.contacts = new ContactList();
		/** Numbers from the last step() call. */
		this.stats = { bodies: 0, awake: 0, contacts: 0, joints: 0, stepMs: 0, subSteps: 0 };

		this._accumulator = 0;
		this._manifolds = new Map();
		this._stepIndex = 0;
		this._sorted = [];
		this._planes = [];
		this._active = [];
		this.joints = [];
		this._noCollide = new Set();
		this._movers = [];
		this._sweepContacts = new ContactList();
		this._tick = 0;
		this._pairKeys = new Float64Array(1024);
	}

	addBody(body) {
		if (!body || !body.isRigidBody) throw new TypeError('Prism.js: PhysicsWorld.addBody() expects a RigidBody.');
		if (this.bodies.includes(body)) throw new Error('Prism.js: This RigidBody is already in the world.');
		body._index = this.bodies.length; // creation order breaks ties in the broad-phase sort
		this.bodies.push(body);
		(body.shape.kind === KIND_PLANE ? this._planes : this._sorted).push(body);
		this._syncObject(body);
		return body;
	}

	/** Removes a body. Sleeping bodies are woken because their support may have been removed. */
	removeBody(body) {
		const index = this.bodies.indexOf(body);
		if (index === -1) return false;
		for (const joint of [...this.joints]) if (joint.bodyA === body || joint.bodyB === body) this.removeJoint(joint);
		this.bodies.splice(index, 1);
		for (let i = index; i < this.bodies.length; i++) this.bodies[i]._index = i;
		const list = body.shape.kind === KIND_PLANE ? this._planes : this._sorted;
		list.splice(list.indexOf(body), 1);
		this.wakeAll();
		return true;
	}

	/** Adds a joint. Its bodies must already be in this world (or be null for the world itself). */
	addJoint(joint) {
		if (!joint || !joint.isJoint) throw new TypeError('Prism.js: PhysicsWorld.addJoint() expects a joint (BallSocketJoint, HingeJoint or DistanceJoint).');
		if (this.joints.includes(joint)) throw new Error('Prism.js: This joint is already in the world.');
		for (const body of [joint.bodyA, joint.bodyB]) {
			if (body !== null && !this.bodies.includes(body)) throw new Error('Prism.js: Add the joint\'s bodies to the world before adding the joint.');
		}
		this.joints.push(joint);
		if (!joint.collideConnected && joint.bodyA && joint.bodyB) this._noCollide.add(pairKey(joint.bodyA, joint.bodyB));
		joint._reset();
		joint.bodyA?.wakeUp();
		joint.bodyB?.wakeUp();
		return joint;
	}

	removeJoint(joint) {
		const index = this.joints.indexOf(joint);
		if (index === -1) return false;
		this.joints.splice(index, 1);
		if (joint.bodyA && joint.bodyB) this._noCollide.delete(pairKey(joint.bodyA, joint.bodyB));
		this.wakeAll();
		return true;
	}

	wakeAll() {
		for (const body of this.bodies) body.wakeUp();
	}

	/** Advances the simulation by `deltaTime` seconds using fixed steps. */
	step(deltaTime) {
		if (!(deltaTime >= 0) || !Number.isFinite(deltaTime)) {
			throw new RangeError(`Prism.js: PhysicsWorld.step() needs a finite deltaTime >= 0, received ${String(deltaTime)}.`);
		}
		const start = typeof performance !== 'undefined' ? performance.now() : 0;
		this._accumulator += deltaTime;
		let steps = 0;
		while (this._accumulator >= this.fixedTimeStep && steps < this.maxSubSteps) {
			this._fixedStep(this.fixedTimeStep);
			this._accumulator -= this.fixedTimeStep;
			steps++;
		}
		if (steps === this.maxSubSteps) this._accumulator = 0; // too far behind: drop the backlog
		if (steps > 0) for (const body of this._movers) { body.force.set(0, 0, 0); body.torque.set(0, 0, 0); }

		let awake = 0;
		for (const body of this._movers) if (body.invMass > 0 && !body.sleeping) awake++;
		this.stats.bodies = this.bodies.length;
		this.stats.awake = awake;
		this.stats.contacts = this.contacts.count;
		this.stats.joints = this.joints.length;
		this.stats.subSteps = steps;
		this.stats.stepMs = typeof performance !== 'undefined' ? performance.now() - start : 0;
	}

	_fixedStep(dt) {
		const bodies = this.bodies, g = this.gravity, movers = this._movers;

		// A joint ties its two bodies together: if one of them moves, the other must not sleep.
		// Repeat until nothing changes so a whole sleeping chain wakes in the same step.
		for (let changed = this.joints.length > 0, guard = 0; changed && guard <= this.joints.length; guard++) {
			changed = false;
			for (let i = 0; i < this.joints.length; i++) {
				const a = this.joints[i].bodyA, b = this.joints[i].bodyB;
				if (!a || !b) continue;
				if (a.sleeping && this._isMover(b)) { a.wakeUp(); changed = true; }
				else if (b.sleeping && this._isMover(a)) { b.wakeUp(); changed = true; }
			}
		}

		// Bodies that can change this step: awake dynamic bodies and kinematic bodies with a velocity.
		// Everything else (sleeping, static, planes) is only looked at, never updated.
		movers.length = 0;
		for (let i = 0; i < bodies.length; i++) {
			const body = bodies[i];
			body.updateRotation(); // cheap when the quaternion did not change
			if (body.shape.kind !== KIND_PLANE && this._isMover(body)) movers.push(body);
		}
		this._tick++;
		for (let i = 0; i < movers.length; i++) movers[i]._moverTick = this._tick;
		if (movers.length === 0) { this.contacts.reset(); return; } // a fully settled world costs almost nothing

		// 1. forces, gravity, damping
		for (let i = 0; i < movers.length; i++) {
			const body = movers[i];
			if (body.invMass === 0) continue;
			const v = body.velocity, w = body.angularVelocity, f = body.force, t = body.torque, I = body.invInertiaWorld;
			const k = body.invMass, gs = body.gravityScale;
			v.x += (g.x * gs + f.x * k) * dt;
			v.y += (g.y * gs + f.y * k) * dt;
			v.z += (g.z * gs + f.z * k) * dt;
			w.x += (I[0] * t.x + I[1] * t.y + I[2] * t.z) * dt;
			w.y += (I[3] * t.x + I[4] * t.y + I[5] * t.z) * dt;
			w.z += (I[6] * t.x + I[7] * t.y + I[8] * t.z) * dt;
			const lin = Math.pow(1 - body.linearDamping, dt), ang = Math.pow(1 - body.angularDamping, dt);
			v.multiplyScalar(lin);
			w.multiplyScalar(ang);
			const ws = w.length();
			if (ws > MAX_ANGULAR_SPEED) w.multiplyScalar(MAX_ANGULAR_SPEED / ws);
		}

		// 2. broad + narrow phase (may wake sleepers, which are then appended to `movers`)
		this.contacts.reset();
		this._collideAll();

		// 3. solve
		this._solve(dt);
		if (this.onContact !== null) {
			for (let i = 0; i < this.contacts.count; i++) this.onContact(this.contacts.items[i]);
		}

		// 4. integrate (bodies flagged `ccd` that would jump further than their own size are swept first)
		for (let i = 0; i < movers.length; i++) {
			const body = movers[i];
			if (body.ccd && body.invMass > 0) body._ccdFraction = this._sweep(body, dt);
		}
		for (let i = 0; i < movers.length; i++) {
			const body = movers[i];
			const v = body.velocity, pv = body._pv, pw = body._pw, f = body._ccdFraction;
			body._ccdFraction = 1;
			body.position.x += (v.x + pv.x) * dt * f; body.position.y += (v.y + pv.y) * dt * f; body.position.z += (v.z + pv.z) * dt * f;
			const w = { x: body.angularVelocity.x + pw.x, y: body.angularVelocity.y + pw.y, z: body.angularVelocity.z + pw.z };
			pv.set(0, 0, 0); pw.set(0, 0, 0);
			const q = body.quaternion, h = 0.5 * dt;
			const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
			q.set(
				qx + h * (w.x * qw + w.y * qz - w.z * qy),
				qy + h * (w.y * qw + w.z * qx - w.x * qz),
				qz + h * (w.z * qw + w.x * qy - w.y * qx),
				qw + h * (-w.x * qx - w.y * qy - w.z * qz)
			).normalize();
		}

		// 5. sleeping (bodies connected by a joint only sleep when all of them are quiet)
		if (this.allowSleep) {
			const lin2 = this.sleepLinearSpeed ** 2, ang2 = this.sleepAngularSpeed ** 2;
			for (let i = 0; i < movers.length; i++) {
				const body = movers[i];
				body._quiet = body.invMass > 0 && !body.sleeping && body.allowSleep && body.velocity.lengthSq() < lin2 && body.angularVelocity.lengthSq() < ang2;
			}
			if (this.joints.length > 0) {
				for (let changed = true, guard = 0; changed && guard < 64; guard++) {
					changed = false;
					for (const joint of this.joints) {
						const a = joint.bodyA, b = joint.bodyB;
						if (!a || !b || a.invMass === 0 || b.invMass === 0) continue; // the world / static bodies never keep a body awake
						if (a._quiet !== b._quiet && a._moverTick === this._tick && b._moverTick === this._tick) { a._quiet = b._quiet = false; changed = true; }
					}
				}
			}
			for (let i = 0; i < movers.length; i++) {
				const body = movers[i];
				if (body.invMass === 0 || body.sleeping || !body.allowSleep) continue;
				if (body._quiet) {
					body.sleepTimer += dt;
					if (body.sleepTimer >= this.sleepTime) {
						body.sleeping = true;
						body.velocity.set(0, 0, 0);
						body.angularVelocity.set(0, 0, 0);
					}
				} else {
					body.sleepTimer = 0;
				}
			}
		}

		for (let i = 0; i < movers.length; i++) this._syncObject(movers[i]);
	}

	/**
	 * Time of first contact along the body's path this step, as a fraction of the step in (0, 1], or 1
	 * when nothing is hit. The body is tested at evenly spaced poses (never further apart than its
	 * smallest half-extent, so nothing thin can be stepped over) and the first overlap is refined by
	 * bisection. Other bodies are taken at their poses from the start of the step; rotation is ignored.
	 */
	_sweep(body, dt) {
		const v = body.velocity, pv = body._pv, p = body.position;
		const vx = (v.x + pv.x) * dt, vy = (v.y + pv.y) * dt, vz = (v.z + pv.z) * dt;
		const dist = Math.hypot(vx, vy, vz), size = body.shape.minExtent;
		if (!(dist > size)) return 1; // cannot jump over anything at least as thick as itself
		const x0 = p.x, y0 = p.y, z0 = p.z;
		const place = (t) => p.set(x0 + vx * t, y0 + vy * t, z0 + vz * t);
		let result = 1;
		if (!this._overlapsAnything(body)) { // a body that already touches something is left to the solver
			const steps = Math.min(256, Math.ceil(dist / size));
			let hit = -1;
			for (let s = 1; s <= steps && hit < 0; s++) {
				place(s / steps);
				if (this._overlapsAnything(body)) hit = s;
			}
			if (hit > 0) {
				let lo = (hit - 1) / steps, hi = hit / steps;
				for (let i = 0; i < 12; i++) {
					const mid = (lo + hi) / 2;
					place(mid);
					if (this._overlapsAnything(body)) hi = mid; else lo = mid;
				}
				result = hi; // the first pose that touches: it penetrates by at most dist / steps / 4096
			}
		}
		p.set(x0, y0, z0);
		return result;
	}

	_overlapsAnything(body) {
		computeAABB(body, _sweepBox);
		for (let i = 0; i < this.bodies.length; i++) {
			const other = this.bodies[i];
			if (other === body || !this._canCollide(body, other)) continue;
			if (other.shape.kind !== KIND_PLANE && other._aabb !== undefined && !this._boxesOverlap(_sweepBox, other._aabb)) continue;
			const list = this._sweepContacts;
			list.reset();
			if (collide(body, other, list) > 0) return true;
		}
		return false;
	}

	/** Adds a body that was woken during this step to the list of bodies being simulated. */
	_joinMovers(body) {
		if (body._moverTick !== this._tick && body.invMass > 0) {
			body._moverTick = this._tick;
			this._movers.push(body);
		}
	}

	_syncObject(body) {
		const o = body.object;
		if (o && body.shape.kind !== KIND_PLANE) {
			o.position.copy(body.position);
			o.quaternion.copy(body.quaternion);
		}
	}

	// ---------- broad phase ----------
	/**
	 * Sweep and prune on x, but only the pairs that involve a body that is awake (or a moving
	 * kinematic body) are enumerated: two sleeping or immobile bodies can never produce a contact,
	 * so a settled pile costs almost nothing. The pairs are then tested in the same order a full
	 * sweep would have used, so results do not depend on this shortcut.
	 */
	_collideAll() {
		const sorted = this._sorted, planes = this._planes, active = this._active;
		active.length = 0;
		for (let i = 0; i < sorted.length; i++) {
			const body = sorted[i];
			if (body._aabb === undefined) body._aabb = new Float64Array(6);
			// a sleeping body cannot have moved, so its box from the step it fell asleep is still exact
			if (!(body.sleeping && body._aabbValid)) { computeAABB(body, body._aabb); body._aabbValid = true; }
		}
		// The array persists between steps, so this insertion sort only fixes the few bodies that moved
		// past a neighbour. Ties are broken by creation order, which makes the result independent of history.
		let maxWidth = 0;
		for (let i = 1; i < sorted.length; i++) {
			const item = sorted[i], key = item._aabb[0], index = item._index;
			let j = i - 1;
			while (j >= 0) {
				const other = sorted[j], k = other._aabb[0];
				if (k > key || (k === key && other._index > index)) { sorted[j + 1] = other; j--; } else break;
			}
			sorted[j + 1] = item;
		}
		for (let i = 0; i < sorted.length; i++) {
			const box = sorted[i]._aabb;
			if (box[3] - box[0] > maxWidth) maxWidth = box[3] - box[0];
		}

		const wake2 = this.wakeSpeed * this.wakeSpeed;
		// 1. wake sleepers that a fast mover touches (a woken body has speed 0, so this cannot chain)
		let any = false;
		for (let i = 0; i < sorted.length; i++) {
			const a = sorted[i];
			if (!this._isMover(a)) continue;
			any = true;
			if (this._speedSq(a) > wake2) this._wakeOverlapping(sorted, i, maxWidth);
		}
		// 2. the active set after waking
		for (let i = 0; i < sorted.length; i++) if (this._isMover(sorted[i])) active.push(i);

		if (active.length > 0) {
			// 3. enumerate pairs (lo, hi) with at least one active body, as sort keys lo * n + hi
			const n = sorted.length;
			let keys = this._pairKeys, count = 0;
			for (let ai = 0; ai < active.length; ai++) {
				const i = active[ai], a = sorted[i], ab = a._aabb;
				for (let j = i + 1; j < n; j++) {
					const bb = sorted[j]._aabb;
					if (bb[0] > ab[3]) break;
					if (bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]) continue;
					if (count === keys.length) keys = this._growPairKeys();
					keys[count++] = i * n + j;
				}
				for (let k = i - 1; k >= 0; k--) {
					const bb = sorted[k]._aabb;
					if (bb[0] < ab[0] - maxWidth) break;
					if (bb[3] < ab[0] || bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]) continue;
					if (this._isMover(sorted[k])) continue; // found from k's own forward scan
					if (count === keys.length) keys = this._growPairKeys();
					keys[count++] = k * n + i;
				}
			}
			// 4. test them in sweep order (lexicographic by sorted position)
			const view = keys.subarray(0, count);
			view.sort();
			for (let q = 0; q < count; q++) {
				const key = view[q], lo = Math.floor(key / n);
				this._testPair(sorted[lo], sorted[key - lo * n]);
			}
		}
		if (!any && planes.every((plane) => !this._isMover(plane))) return;
		for (const plane of planes) {
			if (this._isMover(plane)) { for (const body of sorted) this._testPair(plane, body); }
			else for (let ai = 0; ai < active.length; ai++) this._testPair(plane, sorted[active[ai]]);
		}
	}

	_growPairKeys() {
		const bigger = new Float64Array(this._pairKeys.length * 2);
		bigger.set(this._pairKeys);
		this._pairKeys = bigger;
		return bigger;
	}

	/** Wakes the sleeping bodies whose box overlaps that of sorted[i] (called for fast movers). */
	_wakeOverlapping(sorted, i, maxWidth) {
		const a = sorted[i], ab = a._aabb;
		for (let j = i + 1; j < sorted.length; j++) {
			const bb = sorted[j]._aabb;
			if (bb[0] > ab[3]) break;
			if (sorted[j].sleeping && this._boxesOverlap(ab, bb) && this._canCollide(a, sorted[j])) { sorted[j].wakeUp(); this._joinMovers(sorted[j]); }
		}
		for (let k = i - 1; k >= 0; k--) {
			const bb = sorted[k]._aabb;
			if (bb[0] < ab[0] - maxWidth) break;
			if (sorted[k].sleeping && this._boxesOverlap(ab, bb) && this._canCollide(a, sorted[k])) { sorted[k].wakeUp(); this._joinMovers(sorted[k]); }
		}
	}

	_boxesOverlap(ab, bb) {
		return !(bb[0] > ab[3] || bb[3] < ab[0] || bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]);
	}

	_canCollide(a, b) {
		return !(a.invMass === 0 && b.invMass === 0) && !!((a.collisionGroup & b.collisionMask) && (b.collisionGroup & a.collisionMask));
	}

	_isMover(body) {
		return body.invMass > 0 ? !body.sleeping : (body.velocity.lengthSq() > 0 || body.angularVelocity.lengthSq() > 0);
	}

	_speedSq(body) {
		return body.velocity.lengthSq() + body.angularVelocity.lengthSq();
	}

	_testPair(a, b) {
		if (a.invMass === 0 && b.invMass === 0) return;
		if (!((a.collisionGroup & b.collisionMask) && (b.collisionGroup & a.collisionMask))) return;
		if (this._noCollide.size > 0 && this._noCollide.has(pairKey(a, b))) return;
		const aMoves = this._isMover(a), bMoves = this._isMover(b);
		if (!aMoves && !bMoves) return; // both asleep or immobile
		// A fast mover wakes the sleeper it touches; a slow one just rests against it (the sleeper acts as static).
		const wake2 = this.wakeSpeed * this.wakeSpeed;
		if (a.sleeping && bMoves && this._speedSq(b) > wake2) { a.wakeUp(); this._joinMovers(a); }
		else if (b.sleeping && aMoves && this._speedSq(a) > wake2) { b.wakeUp(); this._joinMovers(b); }
		const count = collide(a, b, this.contacts);
		// a body woken just now must take part in the solver with its real mass
		if (count > 0) {
			if (!a.sleeping) { a._im = a.invMass; a._ii = a.invInertiaWorld; }
			if (!b.sleeping) { b._im = b.invMass; b._ii = b.invInertiaWorld; }
		}
	}

	// ---------- solver ----------
	_solve(dt) {
		this._stepIndex++;
		const items = this.contacts.items, n = this.contacts.count;
		const beta = this.baumgarte / dt, slop = this.penetrationSlop;
		const maxBias = this.maxCorrectionSpeed, threshold = this.restitutionThreshold, spin = this.spinFriction;

		for (let i = 0; i < n; i++) {
			const c = items[i], A = c.a, B = c.b;
			A._im = A.sleeping ? 0 : A.invMass; A._ii = A.sleeping ? ZERO_INERTIA : A.invInertiaWorld;
			B._im = B.sleeping ? 0 : B.invMass; B._ii = B.sleeping ? ZERO_INERTIA : B.invInertiaWorld;
			c.rax = c.px - A.position.x; c.ray = c.py - A.position.y; c.raz = c.pz - A.position.z;
			c.rbx = c.px - B.position.x; c.rby = c.py - B.position.y; c.rbz = c.pz - B.position.z;

			// tangent basis
			if (Math.abs(c.nx) >= 0.57735) { c.t1x = c.ny; c.t1y = -c.nx; c.t1z = 0; } else { c.t1x = 0; c.t1y = c.nz; c.t1z = -c.ny; }
			const tl = Math.hypot(c.t1x, c.t1y, c.t1z);
			c.t1x /= tl; c.t1y /= tl; c.t1z /= tl;
			c.t2x = c.ny * c.t1z - c.nz * c.t1y;
			c.t2y = c.nz * c.t1x - c.nx * c.t1z;
			c.t2z = c.nx * c.t1y - c.ny * c.t1x;

			c.invKN = invEffectiveMass(c, c.nx, c.ny, c.nz);
			c.invKT1 = invEffectiveMass(c, c.t1x, c.t1y, c.t1z);
			c.invKT2 = invEffectiveMass(c, c.t2x, c.t2y, c.t2z);
			c.invKS = invAngularMass(c, c.nx, c.ny, c.nz);
			c.accS = 0;
			c.rollMu = Math.max(A.rollingFriction, B.rollingFriction);
			if (c.rollMu > 0) {
				c.invKR1 = invAngularMass(c, c.t1x, c.t1y, c.t1z);
				c.invKR2 = invAngularMass(c, c.t2x, c.t2y, c.t2z);
				c.accR1 = c.accR2 = 0;
			}

			const vn = relativeVelocity(c, c.nx, c.ny, c.nz);
			const e = Math.max(A.restitution, B.restitution);
			const bounce = vn < -threshold ? -e * vn : 0;
			c.target = bounce;
			c.bias = Math.min(beta * Math.max(c.depth - slop, 0), maxBias);
			c.accP = 0;
			c.mu = Math.sqrt(A.friction * B.friction);
			c.accN = c.accT1 = c.accT2 = 0;
		}

		const joints = this.joints;
		for (let i = 0; i < joints.length; i++) joints[i]._prepare(dt, this.baumgarte, this.maxCorrectionSpeed);

		// Warm start only after EVERY contact has measured its pre-solve velocity (restitution needs
		// the true approach speed, which earlier warm-start impulses would otherwise disturb).
		if (this.warmStarting) {
			for (let i = 0; i < n; i++) this._warmStart(items[i]);
			for (let i = 0; i < joints.length; i++) joints[i]._warmStart();
		} else {
			for (let i = 0; i < joints.length; i++) joints[i]._reset();
		}

		for (let it = 0; it < this.solverIterations; it++) {
			for (let i = 0; i < joints.length; i++) joints[i]._solve(false);
			for (let i = 0; i < n; i++) {
				const c = items[i];
				// normal (non-penetration)
				const vn = relativeVelocity(c, c.nx, c.ny, c.nz);
				let lambda = (c.target - vn) * c.invKN;
				const accN = Math.max(c.accN + lambda, 0);
				lambda = accN - c.accN;
				c.accN = accN;
				applyImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda);
				// friction, limited by the Coulomb cone
				const maxF = c.mu * c.accN;
				let vt = relativeVelocity(c, c.t1x, c.t1y, c.t1z);
				lambda = -vt * c.invKT1;
				let acc = Math.max(-maxF, Math.min(maxF, c.accT1 + lambda));
				lambda = acc - c.accT1;
				c.accT1 = acc;
				applyImpulse(c, c.t1x * lambda, c.t1y * lambda, c.t1z * lambda);
				vt = relativeVelocity(c, c.t2x, c.t2y, c.t2z);
				lambda = -vt * c.invKT2;
				acc = Math.max(-maxF, Math.min(maxF, c.accT2 + lambda));
				lambda = acc - c.accT2;
				c.accT2 = acc;
				applyImpulse(c, c.t2x * lambda, c.t2y * lambda, c.t2z * lambda);
				// torsional friction: resists relative spin about the contact normal
				if (spin > 0 && c.invKS > 0) {
					const wa = c.a.angularVelocity, wb = c.b.angularVelocity;
					const rel = (wb.x - wa.x) * c.nx + (wb.y - wa.y) * c.ny + (wb.z - wa.z) * c.nz;
					const maxS = spin * c.accN;
					acc = Math.max(-maxS, Math.min(maxS, c.accS - rel * c.invKS));
					lambda = acc - c.accS;
					c.accS = acc;
					applyAngularImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda);
				}
				// rolling resistance: resists relative spin about the two tangent axes
				if (c.rollMu > 0) {
					const wa = c.a.angularVelocity, wb = c.b.angularVelocity;
					const maxR = c.rollMu * c.accN;
					let rel = (wb.x - wa.x) * c.t1x + (wb.y - wa.y) * c.t1y + (wb.z - wa.z) * c.t1z;
					acc = Math.max(-maxR, Math.min(maxR, c.accR1 - rel * c.invKR1));
					lambda = acc - c.accR1;
					c.accR1 = acc;
					applyAngularImpulse(c, c.t1x * lambda, c.t1y * lambda, c.t1z * lambda);
					rel = (wb.x - wa.x) * c.t2x + (wb.y - wa.y) * c.t2y + (wb.z - wa.z) * c.t2z;
					acc = Math.max(-maxR, Math.min(maxR, c.accR2 - rel * c.invKR2));
					lambda = acc - c.accR2;
					c.accR2 = acc;
					applyAngularImpulse(c, c.t2x * lambda, c.t2y * lambda, c.t2z * lambda);
				}
			}
		}
		for (let i = 0; i < n; i++) items[i].normalImpulse = items[i].accN;
		this._storeImpulses();

		// Position correction: push overlapping bodies apart with pseudo velocities, which are used
		// for this step's position update only and never become real momentum.
		for (let it = 0; it < this.solverIterations; it++) {
			for (let i = 0; i < joints.length; i++) joints[i]._solve(true);
			for (let i = 0; i < n; i++) {
				const c = items[i];
				if (c.bias <= 0) continue;
				let lambda = (c.bias - relativePseudoVelocity(c, c.nx, c.ny, c.nz)) * c.invKN;
				const acc = Math.max(c.accP + lambda, 0);
				lambda = acc - c.accP;
				c.accP = acc;
				applyPseudoImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda);
			}
		}
	}

	/**
	 * Finds the same contact in last step's manifold (same pair, nearby point) and applies its
	 * impulses again as the starting guess. Friction impulses are cached as world vectors on the
	 * body with the higher id, so they stay valid when the pair's order or tangent basis changes.
	 */
	_warmStart(c) {
		const m = this._manifolds.get(pairKey(c.a, c.b));
		if (m === undefined || m.stamp !== this._stepIndex - 1) return;
		let best = -1, bestD = this.warmStartDistance * this.warmStartDistance;
		for (let k = 0; k < m.count; k++) {
			if (m.used[k] === 1) continue;
			const d = (m.px[k] - c.px) ** 2 + (m.py[k] - c.py) ** 2 + (m.pz[k] - c.pz) ** 2;
			if (d < bestD) { bestD = d; best = k; }
		}
		if (best < 0) return;
		m.used[best] = 1;
		const sign = c.b.id > c.a.id ? 1 : -1;
		const fx = m.fx[best] * sign, fy = m.fy[best] * sign, fz = m.fz[best] * sign;
		c.accN = m.accN[best];
		c.accT1 = fx * c.t1x + fy * c.t1y + fz * c.t1z;
		c.accT2 = fx * c.t2x + fy * c.t2y + fz * c.t2z;
		applyImpulse(
			c,
			c.nx * c.accN + c.t1x * c.accT1 + c.t2x * c.accT2,
			c.ny * c.accN + c.t1y * c.accT1 + c.t2y * c.accT2,
			c.nz * c.accN + c.t1z * c.accT1 + c.t2z * c.accT2
		);
	}

	/** Writes this step's impulses into the per-pair manifolds (reused objects, no allocation once warm). */
	_storeImpulses() {
		const items = this.contacts.items, step = this._stepIndex;
		for (let i = 0; i < this.contacts.count; i++) {
			const c = items[i];
			const key = pairKey(c.a, c.b);
			let m = this._manifolds.get(key);
			if (m === undefined) { m = new Manifold(); this._manifolds.set(key, m); }
			if (m.stamp !== step) { m.stamp = step; m.count = 0; } // first contact of this pair in this step
			const k = m.count;
			if (k >= MANIFOLD_CAPACITY) continue;
			const sign = c.b.id > c.a.id ? 1 : -1;
			m.px[k] = c.px; m.py[k] = c.py; m.pz[k] = c.pz; m.accN[k] = c.accN; m.used[k] = 0;
			m.fx[k] = (c.t1x * c.accT1 + c.t2x * c.accT2) * sign;
			m.fy[k] = (c.t1y * c.accT1 + c.t2y * c.accT2) * sign;
			m.fz[k] = (c.t1z * c.accT1 + c.t2z * c.accT2) * sign;
			m.count = k + 1;
		}
		// forget pairs that have not touched for a while so the map cannot grow without bound
		if ((step & 255) === 0) {
			for (const [key, m] of this._manifolds) if (m.stamp < step - 1) this._manifolds.delete(key);
		}
	}

	/**
	 * Nearest solid hit along a ray, or null. `direction` is normalized for you.
	 * A ray that starts inside a sphere or box does not hit it; planes block from their front side.
	 * @returns {{ body: object, distance: number, point: Vector3, normal: Vector3 } | null}
	 */
	raycast(origin, direction, maxDistance = Infinity) {
		const len = Math.hypot(direction.x, direction.y, direction.z);
		if (len === 0) throw new RangeError('Prism.js: raycast direction must not be the zero vector.');
		const dx = direction.x / len, dy = direction.y / len, dz = direction.z / len;
		let best = null, bestT = maxDistance;
		for (const body of this.bodies) {
			if (body.rotation === undefined) continue;
			const t = raycastBody(body, origin.x, origin.y, origin.z, dx, dy, dz, bestT, _normal);
			if (t >= 0 && t <= bestT) {
				bestT = t;
				best = { body, distance: t, point: new Vector3(origin.x + dx * t, origin.y + dy * t, origin.z + dz * t), normal: new Vector3(_normal[0], _normal[1], _normal[2]) };
			}
		}
		return best;
	}

	/** Total kinetic energy of all dynamic bodies (joules, if you use SI units). */
	get kineticEnergy() {
		let sum = 0;
		for (const body of this.bodies) sum += body.kineticEnergy;
		return sum;
	}
}

// ---------- solver helpers ----------
function pairKey(a, b) {
	return a.id < b.id ? a.id * 4194304 + b.id : b.id * 4194304 + a.id;
}

/** 1 / (effective mass along direction d at the contact) = 1 / (1/mA + 1/mB + (rA×d)·IA⁻¹(rA×d) + (rB×d)·IB⁻¹(rB×d)). */
function invEffectiveMass(c, dx, dy, dz) {
	const A = c.a, B = c.b;
	let k = A._im + B._im;
	let ax = c.ray * dz - c.raz * dy, ay = c.raz * dx - c.rax * dz, az = c.rax * dy - c.ray * dx;
	let I = A._ii;
	k += ax * (I[0] * ax + I[1] * ay + I[2] * az) + ay * (I[3] * ax + I[4] * ay + I[5] * az) + az * (I[6] * ax + I[7] * ay + I[8] * az);
	ax = c.rby * dz - c.rbz * dy; ay = c.rbz * dx - c.rbx * dz; az = c.rbx * dy - c.rby * dx;
	I = B._ii;
	k += ax * (I[0] * ax + I[1] * ay + I[2] * az) + ay * (I[3] * ax + I[4] * ay + I[5] * az) + az * (I[6] * ax + I[7] * ay + I[8] * az);
	return k > 0 ? 1 / k : 0;
}

/** 1 / (n·IA⁻¹n + n·IB⁻¹n): effective inertia about the contact normal. */
function invAngularMass(c, nx, ny, nz) {
	let k = 0;
	for (const I of [c.a._ii, c.b._ii]) {
		k += nx * (I[0] * nx + I[1] * ny + I[2] * nz) + ny * (I[3] * nx + I[4] * ny + I[5] * nz) + nz * (I[6] * nx + I[7] * ny + I[8] * nz);
	}
	return k > 0 ? 1 / k : 0;
}

/** Pure torque impulse about an axis: +T on B, -T on A. */
function applyAngularImpulse(c, tx, ty, tz) {
	const A = c.a, B = c.b;
	if (A._im > 0) {
		const I = A._ii, w = A.angularVelocity;
		w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
		w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
		w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
	}
	if (B._im > 0) {
		const I = B._ii, w = B.angularVelocity;
		w.x += I[0] * tx + I[1] * ty + I[2] * tz;
		w.y += I[3] * tx + I[4] * ty + I[5] * tz;
		w.z += I[6] * tx + I[7] * ty + I[8] * tz;
	}
}

/** Component along d of (velocity of B at the contact point) - (velocity of A at the contact point). */
function relativeVelocity(c, dx, dy, dz) {
	const va = c.a.velocity, wa = c.a.angularVelocity, vb = c.b.velocity, wb = c.b.angularVelocity;
	const x = vb.x + wb.y * c.rbz - wb.z * c.rby - va.x - wa.y * c.raz + wa.z * c.ray;
	const y = vb.y + wb.z * c.rbx - wb.x * c.rbz - va.y - wa.z * c.rax + wa.x * c.raz;
	const z = vb.z + wb.x * c.rby - wb.y * c.rbx - va.z - wa.x * c.ray + wa.y * c.rax;
	return x * dx + y * dy + z * dz;
}

/** Same for the pseudo velocities used by the position-correction pass. */
function relativePseudoVelocity(c, dx, dy, dz) {
	const va = c.a._pv, wa = c.a._pw, vb = c.b._pv, wb = c.b._pw;
	const x = vb.x + wb.y * c.rbz - wb.z * c.rby - va.x - wa.y * c.raz + wa.z * c.ray;
	const y = vb.y + wb.z * c.rbx - wb.x * c.rbz - va.y - wa.z * c.rax + wa.x * c.raz;
	const z = vb.z + wb.x * c.rby - wb.y * c.rbx - va.z - wa.x * c.ray + wa.y * c.rax;
	return x * dx + y * dy + z * dz;
}

/** Applies impulse P to B and -P to A at the contact point. */
function applyImpulse(c, px, py, pz) {
	const A = c.a, B = c.b;
	const imA = A._im, imB = B._im;
	if (imA > 0) {
		const va = A.velocity;
		va.x -= px * imA; va.y -= py * imA; va.z -= pz * imA;
		const tx = c.ray * pz - c.raz * py, ty = c.raz * px - c.rax * pz, tz = c.rax * py - c.ray * px;
		const I = A._ii, w = A.angularVelocity;
		w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
		w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
		w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
	}
	if (imB > 0) {
		const vb = B.velocity;
		vb.x += px * imB; vb.y += py * imB; vb.z += pz * imB;
		const tx = c.rby * pz - c.rbz * py, ty = c.rbz * px - c.rbx * pz, tz = c.rbx * py - c.rby * px;
		const I = B._ii, w = B.angularVelocity;
		w.x += I[0] * tx + I[1] * ty + I[2] * tz;
		w.y += I[3] * tx + I[4] * ty + I[5] * tz;
		w.z += I[6] * tx + I[7] * ty + I[8] * tz;
	}
}

/** Same for pseudo velocities. */
function applyPseudoImpulse(c, px, py, pz) {
	const A = c.a, B = c.b;
	const imA = A._im, imB = B._im;
	if (imA > 0) {
		const va = A._pv;
		va.x -= px * imA; va.y -= py * imA; va.z -= pz * imA;
		const tx = c.ray * pz - c.raz * py, ty = c.raz * px - c.rax * pz, tz = c.rax * py - c.ray * px;
		const I = A._ii, w = A._pw;
		w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
		w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
		w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
	}
	if (imB > 0) {
		const vb = B._pv;
		vb.x += px * imB; vb.y += py * imB; vb.z += pz * imB;
		const tx = c.rby * pz - c.rbz * py, ty = c.rbz * px - c.rbx * pz, tz = c.rbx * py - c.rby * px;
		const I = B._ii, w = B._pw;
		w.x += I[0] * tx + I[1] * ty + I[2] * tz;
		w.y += I[3] * tx + I[4] * ty + I[5] * tz;
		w.z += I[6] * tx + I[7] * ty + I[8] * tz;
	}
}
