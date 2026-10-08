import { Vector3 } from '../math/Vector3.js';
import { KIND_PLANE } from './shapes.js';
import { ContactList, collide, computeAABB, raycastBody } from './collision.js';

const ZERO_INERTIA = new Float64Array(9);
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
		this.stats = { bodies: 0, awake: 0, contacts: 0, stepMs: 0, subSteps: 0 };

		this._accumulator = 0;
		this._cache = new Map();
		this._nextCache = new Map();
		this._sorted = [];
		this._planes = [];
	}

	addBody(body) {
		if (!body || !body.isRigidBody) throw new TypeError('Prism.js: PhysicsWorld.addBody() expects a RigidBody.');
		if (this.bodies.includes(body)) throw new Error('Prism.js: This RigidBody is already in the world.');
		this.bodies.push(body);
		this._syncObject(body);
		return body;
	}

	/** Removes a body. Sleeping bodies are woken because their support may have been removed. */
	removeBody(body) {
		const index = this.bodies.indexOf(body);
		if (index === -1) return false;
		this.bodies.splice(index, 1);
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
		if (steps > 0) for (const body of this.bodies) { body.force.set(0, 0, 0); body.torque.set(0, 0, 0); }

		let awake = 0;
		for (const body of this.bodies) if (body.invMass > 0 && !body.sleeping) awake++;
		this.stats.bodies = this.bodies.length;
		this.stats.awake = awake;
		this.stats.contacts = this.contacts.count;
		this.stats.subSteps = steps;
		this.stats.stepMs = typeof performance !== 'undefined' ? performance.now() - start : 0;
	}

	_fixedStep(dt) {
		const bodies = this.bodies, g = this.gravity;

		// 1. forces, gravity, damping
		for (const body of bodies) {
			body.updateRotation();
			body._im = body.sleeping ? 0 : body.invMass;
			body._ii = body.sleeping ? ZERO_INERTIA : body.invInertiaWorld;
			if (body.invMass === 0 || body.sleeping) continue;
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

		// 2. broad + narrow phase
		this.contacts.reset();
		this._collideAll();

		// 3. solve
		this._solve(dt);
		if (this.onContact !== null) {
			for (let i = 0; i < this.contacts.count; i++) this.onContact(this.contacts.items[i]);
		}

		// 4. integrate
		for (const body of bodies) {
			if (body.shape.kind === KIND_PLANE || body.sleeping) continue;
			const v = body.velocity, pv = body._pv, pw = body._pw;
			if (body.invMass === 0 && v.lengthSq() === 0 && body.angularVelocity.lengthSq() === 0) continue;
			body.position.x += (v.x + pv.x) * dt; body.position.y += (v.y + pv.y) * dt; body.position.z += (v.z + pv.z) * dt;
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

		// 5. sleeping
		if (this.allowSleep) {
			const lin2 = this.sleepLinearSpeed ** 2, ang2 = this.sleepAngularSpeed ** 2;
			for (const body of bodies) {
				if (body.invMass === 0 || body.sleeping || !body.allowSleep) continue;
				if (body.velocity.lengthSq() < lin2 && body.angularVelocity.lengthSq() < ang2) {
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

		for (const body of bodies) this._syncObject(body);
	}

	_syncObject(body) {
		const o = body.object;
		if (o && body.shape.kind !== KIND_PLANE) {
			o.position.copy(body.position);
			o.quaternion.copy(body.quaternion);
		}
	}

	// ---------- broad phase ----------
	_collideAll() {
		const sorted = this._sorted, planes = this._planes;
		sorted.length = 0;
		planes.length = 0;
		for (const body of this.bodies) {
			if (body.shape.kind === KIND_PLANE) { planes.push(body); continue; }
			if (body._aabb === undefined) body._aabb = new Float64Array(6);
			computeAABB(body, body._aabb);
			sorted.push(body);
		}
		// insertion sort by min x: bodies move little per step, so the order is nearly sorted already
		for (let i = 1; i < sorted.length; i++) {
			const item = sorted[i], key = item._aabb[0];
			let j = i - 1;
			while (j >= 0 && sorted[j]._aabb[0] > key) { sorted[j + 1] = sorted[j]; j--; }
			sorted[j + 1] = item;
		}
		for (let i = 0; i < sorted.length; i++) {
			const a = sorted[i], ab = a._aabb;
			for (let j = i + 1; j < sorted.length; j++) {
				const b = sorted[j], bb = b._aabb;
				if (bb[0] > ab[3]) break;
				if (bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]) continue;
				this._testPair(a, b);
			}
		}
		for (const plane of planes) {
			for (const body of sorted) this._testPair(plane, body);
		}
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
		const aMoves = this._isMover(a), bMoves = this._isMover(b);
		if (!aMoves && !bMoves) return; // both asleep or immobile
		// A fast mover wakes the sleeper it touches; a slow one just rests against it (the sleeper acts as static).
		const wake2 = this.wakeSpeed * this.wakeSpeed;
		if (a.sleeping && bMoves && this._speedSq(b) > wake2) a.wakeUp();
		else if (b.sleeping && aMoves && this._speedSq(a) > wake2) b.wakeUp();
		const count = collide(a, b, this.contacts);
		// a body woken just now must take part in the solver with its real mass
		if (count > 0) {
			if (!a.sleeping) { a._im = a.invMass; a._ii = a.invInertiaWorld; }
			if (!b.sleeping) { b._im = b.invMass; b._ii = b.invInertiaWorld; }
		}
	}

	// ---------- solver ----------
	_solve(dt) {
		const items = this.contacts.items, n = this.contacts.count;
		const beta = this.baumgarte / dt, slop = this.penetrationSlop;
		const maxBias = this.maxCorrectionSpeed, threshold = this.restitutionThreshold, spin = this.spinFriction;

		for (let i = 0; i < n; i++) {
			const c = items[i], A = c.a, B = c.b;
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

			const vn = relativeVelocity(c, c.nx, c.ny, c.nz);
			const e = Math.max(A.restitution, B.restitution);
			const bounce = vn < -threshold ? -e * vn : 0;
			c.target = bounce;
			c.bias = Math.min(beta * Math.max(c.depth - slop, 0), maxBias);
			c.accP = 0;
			c.mu = Math.sqrt(A.friction * B.friction);
			c.accN = c.accT1 = c.accT2 = 0;
		}

		// Warm start only after EVERY contact has measured its pre-solve velocity (restitution needs
		// the true approach speed, which earlier warm-start impulses would otherwise disturb).
		if (this.warmStarting) for (let i = 0; i < n; i++) this._warmStart(items[i]);

		for (let it = 0; it < this.solverIterations; it++) {
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
			}
		}
		for (let i = 0; i < n; i++) items[i].normalImpulse = items[i].accN;
		this._storeImpulses();

		// Position correction: push overlapping bodies apart with pseudo velocities, which are used
		// for this step's position update only and never become real momentum.
		for (let it = 0; it < this.solverIterations; it++) {
			for (let i = 0; i < n; i++) {
				const c = items[i];
				if (c.bias <= 0) continue;
				let lambda = (c.bias - relativeVelocity(c, c.nx, c.ny, c.nz, true)) * c.invKN;
				const acc = Math.max(c.accP + lambda, 0);
				lambda = acc - c.accP;
				c.accP = acc;
				applyImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda, true);
			}
		}
	}

	/**
	 * Finds the same contact in last step's cache (same pair, nearby point) and applies its
	 * impulses again as the starting guess. Friction impulses are cached as world vectors on the
	 * body with the higher id, so they stay valid when the pair's order or tangent basis changes.
	 */
	_warmStart(c) {
		const list = this._cache.get(pairKey(c.a, c.b));
		if (list === undefined) return;
		let best = null, bestD = this.warmStartDistance * this.warmStartDistance;
		for (let k = 0; k < list.length; k++) {
			const r = list[k];
			if (r.used) continue;
			const d = (r.px - c.px) ** 2 + (r.py - c.py) ** 2 + (r.pz - c.pz) ** 2;
			if (d < bestD) { bestD = d; best = r; }
		}
		if (best === null) return;
		best.used = true;
		const sign = c.b.id > c.a.id ? 1 : -1;
		const fx = best.fx * sign, fy = best.fy * sign, fz = best.fz * sign;
		c.accN = best.accN;
		c.accT1 = fx * c.t1x + fy * c.t1y + fz * c.t1z;
		c.accT2 = fx * c.t2x + fy * c.t2y + fz * c.t2z;
		applyImpulse(
			c,
			c.nx * c.accN + c.t1x * c.accT1 + c.t2x * c.accT2,
			c.ny * c.accN + c.t1y * c.accT1 + c.t2y * c.accT2,
			c.nz * c.accN + c.t1z * c.accT1 + c.t2z * c.accT2
		);
	}

	_storeImpulses() {
		const next = this._nextCache, items = this.contacts.items;
		next.clear();
		for (let i = 0; i < this.contacts.count; i++) {
			const c = items[i];
			const sign = c.b.id > c.a.id ? 1 : -1;
			const key = pairKey(c.a, c.b);
			let list = next.get(key);
			if (list === undefined) { list = []; next.set(key, list); }
			list.push({
				px: c.px, py: c.py, pz: c.pz, accN: c.accN, used: false,
				fx: (c.t1x * c.accT1 + c.t2x * c.accT2) * sign,
				fy: (c.t1y * c.accT1 + c.t2y * c.accT2) * sign,
				fz: (c.t1z * c.accT1 + c.t2z * c.accT2) * sign
			});
		}
		this._cache = next;
		this._nextCache = new Map();
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
function relativeVelocity(c, dx, dy, dz, pseudo = false) {
	const va = pseudo ? c.a._pv : c.a.velocity, wa = pseudo ? c.a._pw : c.a.angularVelocity;
	const vb = pseudo ? c.b._pv : c.b.velocity, wb = pseudo ? c.b._pw : c.b.angularVelocity;
	const x = vb.x + wb.y * c.rbz - wb.z * c.rby - va.x - wa.y * c.raz + wa.z * c.ray;
	const y = vb.y + wb.z * c.rbx - wb.x * c.rbz - va.y - wa.z * c.rax + wa.x * c.raz;
	const z = vb.z + wb.x * c.rby - wb.y * c.rbx - va.z - wa.x * c.ray + wa.y * c.rax;
	return x * dx + y * dy + z * dz;
}

/** Applies impulse P to B and -P to A at the contact point. */
function applyImpulse(c, px, py, pz, pseudo = false) {
	const A = c.a, B = c.b;
	const imA = A._im, imB = B._im;
	if (imA > 0) {
		const va = pseudo ? A._pv : A.velocity;
		va.x -= px * imA; va.y -= py * imA; va.z -= pz * imA;
		const tx = c.ray * pz - c.raz * py, ty = c.raz * px - c.rax * pz, tz = c.rax * py - c.ray * px;
		const I = A._ii, w = pseudo ? A._pw : A.angularVelocity;
		w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
		w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
		w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
	}
	if (imB > 0) {
		const vb = pseudo ? B._pv : B.velocity;
		vb.x += px * imB; vb.y += py * imB; vb.z += pz * imB;
		const tx = c.rby * pz - c.rbz * py, ty = c.rbz * px - c.rbx * pz, tz = c.rbx * py - c.rby * px;
		const I = B._ii, w = pseudo ? B._pw : B.angularVelocity;
		w.x += I[0] * tx + I[1] * ty + I[2] * tz;
		w.y += I[3] * tx + I[4] * ty + I[5] * tz;
		w.z += I[6] * tx + I[7] * ty + I[8] * tz;
	}
}
