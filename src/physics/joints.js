import { Vector3 } from '../math/Vector3.js';
import { RigidBody } from './RigidBody.js';
import { SphereShape } from './shapes.js';

/**
 * Joints are constraints between two bodies, solved together with the contacts by the same
 * sequential-impulse iterations. Velocity rows remove relative motion; position drift is removed
 * with pseudo velocities (the "split impulse" used for contacts) so joints never add energy.
 *
 * Passing `null` as a body attaches that end to the world (an immovable body at the origin).
 *
 * Protocol used by PhysicsWorld (underscore methods are internal):
 *   _prepare(dt, beta, maxBias)  compute offsets, effective masses and the position error
 *   _warmStart()                 re-apply last step's accumulated impulses
 *   _reset()                     forget accumulated impulses
 *   _solve(pseudo)               one solver iteration; pseudo = false: velocities, true: position correction
 */
const ZERO9 = new Float64Array(9);
const WORLD = new RigidBody({ shape: new SphereShape(0.001), mass: 0 }); // the fixed end of joints attached to "the world"
const _t = new Float64Array(3);
const _va = new Float64Array(3), _vb = new Float64Array(3);

/** body-local point -> world offset from the body's center: R * local */
function rotate(R, x, y, z, out) {
	out[0] = R[0] * x + R[1] * y + R[2] * z;
	out[1] = R[3] * x + R[4] * y + R[5] * z;
	out[2] = R[6] * x + R[7] * y + R[8] * z;
}
/** world vector -> body-local: R^T * v */
function unrotate(R, x, y, z, out) {
	out[0] = R[0] * x + R[3] * y + R[6] * z;
	out[1] = R[1] * x + R[4] * y + R[7] * z;
	out[2] = R[2] * x + R[5] * y + R[8] * z;
}

/** K += S I S^T where S is the cross-product matrix of r (the angular part of the effective mass). */
function addSandwich(K, rx, ry, rz, I) {
	const S = [0, -rz, ry, rz, 0, -rx, -ry, rx, 0];
	for (let i = 0; i < 3; i++) {
		const t0 = S[i * 3] * I[0] + S[i * 3 + 1] * I[3] + S[i * 3 + 2] * I[6];
		const t1 = S[i * 3] * I[1] + S[i * 3 + 1] * I[4] + S[i * 3 + 2] * I[7];
		const t2 = S[i * 3] * I[2] + S[i * 3 + 1] * I[5] + S[i * 3 + 2] * I[8];
		for (let j = 0; j < 3; j++) K[i * 3 + j] += t0 * S[j * 3] + t1 * S[j * 3 + 1] + t2 * S[j * 3 + 2];
	}
}

function invert3(m, out) {
	const a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5], g = m[6], h = m[7], i = m[8];
	const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
	if (Math.abs(det) < 1e-30) { out.fill(0); return false; }
	const k = 1 / det;
	out[0] = (e * i - f * h) * k; out[1] = (c * h - b * i) * k; out[2] = (b * f - c * e) * k;
	out[3] = (f * g - d * i) * k; out[4] = (a * i - c * g) * k; out[5] = (c * d - a * f) * k;
	out[6] = (d * h - e * g) * k; out[7] = (b * g - a * h) * k; out[8] = (a * e - b * d) * k;
	return true;
}

/** Velocity of the material point at offset r of a body, from a (linear, angular) velocity pair. */
function pointVelocity(v, w, rx, ry, rz, out) {
	out[0] = v.x + w.y * rz - w.z * ry;
	out[1] = v.y + w.z * rx - w.x * rz;
	out[2] = v.z + w.x * ry - w.y * rx;
}

/** Linear impulse P at offset r on a body (sign +1 for B, -1 for A), into real or pseudo velocities. */
function applyLinear(body, rx, ry, rz, px, py, pz, sign, pseudo) {
	const im = body._im;
	if (im === 0) return;
	const v = pseudo ? body._pv : body.velocity, w = pseudo ? body._pw : body.angularVelocity, I = body._ii;
	v.x += sign * px * im; v.y += sign * py * im; v.z += sign * pz * im;
	const tx = ry * pz - rz * py, ty = rz * px - rx * pz, tz = rx * py - ry * px;
	w.x += sign * (I[0] * tx + I[1] * ty + I[2] * tz);
	w.y += sign * (I[3] * tx + I[4] * ty + I[5] * tz);
	w.z += sign * (I[6] * tx + I[7] * ty + I[8] * tz);
}

/** Pure torque impulse on a body. */
function applyAngular(body, tx, ty, tz, sign, pseudo) {
	if (body._im === 0) return;
	const w = pseudo ? body._pw : body.angularVelocity, I = body._ii;
	w.x += sign * (I[0] * tx + I[1] * ty + I[2] * tz);
	w.y += sign * (I[3] * tx + I[4] * ty + I[5] * tz);
	w.z += sign * (I[6] * tx + I[7] * ty + I[8] * tz);
}

/** Common base: two bodies, local anchors, bookkeeping. */
export class Joint {
	constructor(bodyA, bodyB, options = {}, anchorRequired = false) {
		if (!bodyA && !bodyB) throw new Error('Prism.js: A joint needs at least one body (the other end may be null for the world).');
		for (const body of [bodyA, bodyB]) {
			if (body && !body.isRigidBody) throw new TypeError('Prism.js: Joint bodies must be RigidBody instances (or null for the world).');
		}
		if (bodyA === bodyB) throw new Error('Prism.js: A joint cannot connect a body to itself.');
		this.bodyA = bodyA;
		this.bodyB = bodyB;
		/** When false (default) the two bodies do not collide with each other. */
		this.collideConnected = options.collideConnected ?? false;
		this._a = bodyA ?? WORLD;
		this._b = bodyB ?? WORLD;
		/** Anchor points in each body's local frame (for the world: world coordinates). */
		this.localAnchorA = new Float64Array(3);
		this.localAnchorB = new Float64Array(3);
		/** Distance between the two anchors at the start of the last step (0 when the joint is satisfied). */
		this._error = 0;
		this._dt = 1 / 60; this._beta = 0.2; this._maxBias = 3;
		this._setAnchors(options, anchorRequired);
	}

	_setAnchors({ anchor, anchorA, anchorB }, required) {
		const local = (body, world, out) => {
			if (!body) { out[0] = world.x; out[1] = world.y; out[2] = world.z; return; }
			body.updateRotation();
			unrotate(body.rotation, world.x - body.position.x, world.y - body.position.y, world.z - body.position.z, out);
		};
		if (anchor) {
			local(this.bodyA, anchor, this.localAnchorA);
			local(this.bodyB, anchor, this.localAnchorB);
		} else if (anchorA || anchorB) {
			if (required && !(anchorA && anchorB)) throw new Error('Prism.js: Give the joint an `anchor` (a world point), or both `anchorA` and `anchorB`.');
			if (anchorA) this.localAnchorA.set([anchorA.x, anchorA.y, anchorA.z]);
			if (anchorB) this.localAnchorB.set([anchorB.x, anchorB.y, anchorB.z]);
		} else if (required) {
			throw new Error('Prism.js: A joint needs an `anchor` (a world point), or both `anchorA` and `anchorB` (body-local points).');
		}
	}

	/** World position of an anchor right now. */
	_anchorPoint(body, local) {
		const b = body ?? WORLD;
		b.updateRotation();
		rotate(b.rotation, local[0], local[1], local[2], _t);
		return new Vector3(b.position.x + _t[0], b.position.y + _t[1], b.position.z + _t[2]);
	}

	/** Effective inverse masses for this step: sleeping bodies act like static ones. */
	_loadBodies() {
		const A = this._a, B = this._b;
		A._im = A.sleeping ? 0 : A.invMass; A._ii = A.sleeping ? ZERO9 : A.invInertiaWorld;
		B._im = B.sleeping ? 0 : B.invMass; B._ii = B.sleeping ? ZERO9 : B.invInertiaWorld;
	}

	/** Pseudo-velocity bias per unit of position error, capped so a large error is corrected gently. */
	_biasScale(errorLength) {
		const rate = this._beta / this._dt;
		return errorLength * rate > this._maxBias ? this._maxBias / errorLength : rate;
	}
}
Joint.prototype.isJoint = true;

/** Keeps one point of each body together: a ball-and-socket (translations locked, rotation free). */
export class BallSocketJoint extends Joint {
	/** @param {{ anchor?: Vector3, anchorA?: Vector3, anchorB?: Vector3, collideConnected?: boolean }} options */
	constructor(bodyA, bodyB, options = {}) {
		super(bodyA, bodyB, options, true);
		this._rA = new Float64Array(3); this._rB = new Float64Array(3);
		this._K = new Float64Array(9); this._invK = new Float64Array(9);
		this._acc = new Float64Array(3);
		this._e = new Float64Array(3);
		this._active = false;
	}

	_prepare(dt, beta, maxBias) {
		this._dt = dt; this._beta = beta; this._maxBias = maxBias;
		this._loadBodies();
		const A = this._a, B = this._b, rA = this._rA, rB = this._rB, K = this._K;
		rotate(A.rotation, this.localAnchorA[0], this.localAnchorA[1], this.localAnchorA[2], rA);
		rotate(B.rotation, this.localAnchorB[0], this.localAnchorB[1], this.localAnchorB[2], rB);
		K.fill(0);
		K[0] = K[4] = K[8] = A._im + B._im;
		addSandwich(K, rA[0], rA[1], rA[2], A._ii);
		addSandwich(K, rB[0], rB[1], rB[2], B._ii);
		this._active = invert3(K, this._invK);
		const e = this._e;
		e[0] = B.position.x + rB[0] - A.position.x - rA[0];
		e[1] = B.position.y + rB[1] - A.position.y - rA[1];
		e[2] = B.position.z + rB[2] - A.position.z - rA[2];
		this._error = Math.hypot(e[0], e[1], e[2]);
	}

	_warmStart() {
		if (this._active) this._applyBall(this._acc[0], this._acc[1], this._acc[2], false);
	}

	_reset() { this._acc.fill(0); }

	_applyBall(px, py, pz, pseudo) {
		const A = this._a, B = this._b, rA = this._rA, rB = this._rB;
		applyLinear(A, rA[0], rA[1], rA[2], px, py, pz, -1, pseudo);
		applyLinear(B, rB[0], rB[1], rB[2], px, py, pz, 1, pseudo);
	}

	_solveBall(pseudo, tx, ty, tz) {
		const A = this._a, B = this._b, rA = this._rA, rB = this._rB;
		pointVelocity(pseudo ? A._pv : A.velocity, pseudo ? A._pw : A.angularVelocity, rA[0], rA[1], rA[2], _va);
		pointVelocity(pseudo ? B._pv : B.velocity, pseudo ? B._pw : B.angularVelocity, rB[0], rB[1], rB[2], _vb);
		const bx = tx - (_vb[0] - _va[0]), by = ty - (_vb[1] - _va[1]), bz = tz - (_vb[2] - _va[2]);
		const k = this._invK;
		const px = k[0] * bx + k[1] * by + k[2] * bz, py = k[3] * bx + k[4] * by + k[5] * bz, pz = k[6] * bx + k[7] * by + k[8] * bz;
		this._applyBall(px, py, pz, pseudo);
		if (!pseudo) { this._acc[0] += px; this._acc[1] += py; this._acc[2] += pz; }
	}

	_solve(pseudo) {
		if (!this._active) return;
		if (!pseudo) { this._solveBall(false, 0, 0, 0); return; }
		const e = this._e, s = -this._biasScale(this._error);
		this._solveBall(true, s * e[0], s * e[1], s * e[2]);
	}
}

/**
 * A hinge: the anchors coincide and the bodies may only rotate about `axis` (a world direction at
 * creation time). Optional motor: spins B relative to A at `motorSpeed` (rad/s) using at most
 * `maxMotorTorque`; both can be changed at any time.
 */
export class HingeJoint extends BallSocketJoint {
	/** @param {{ anchor?: Vector3, axis: Vector3, motorSpeed?: number, maxMotorTorque?: number, collideConnected?: boolean }} options */
	constructor(bodyA, bodyB, options = {}) {
		super(bodyA, bodyB, options);
		const axis = options.axis;
		if (!axis || !(axis.lengthSq() > 0)) throw new Error('Prism.js: HingeJoint needs a non-zero `axis` direction.');
		const n = new Vector3().copy(axis).normalize();
		const local = (body) => {
			if (!body) return [n.x, n.y, n.z];
			body.updateRotation();
			unrotate(body.rotation, n.x, n.y, n.z, _t);
			return [_t[0], _t[1], _t[2]];
		};
		this.localAxisA = new Float64Array(local(bodyA));
		this.localAxisB = new Float64Array(local(bodyB));
		this.motorSpeed = options.motorSpeed ?? 0;
		this.maxMotorTorque = options.maxMotorTorque ?? 0;
		this._aW = new Float64Array(3); this._bW = new Float64Array(3);
		this._t1 = new Float64Array(3); this._t2 = new Float64Array(3);
		this._k = new Float64Array(3); // inverse effective inertia of the two alignment rows and of the motor row
		this._m = new Float64Array(3); // misalignment: the rotation that would bring B's axis onto A's
		this._motorAcc = 0;
	}

	_prepare(dt, beta, maxBias) {
		super._prepare(dt, beta, maxBias);
		const A = this._a, B = this._b, a = this._aW, b = this._bW, t1 = this._t1, t2 = this._t2;
		rotate(A.rotation, this.localAxisA[0], this.localAxisA[1], this.localAxisA[2], a);
		rotate(B.rotation, this.localAxisB[0], this.localAxisB[1], this.localAxisB[2], b);
		if (Math.abs(a[0]) >= 0.57735) { t1[0] = a[1]; t1[1] = -a[0]; t1[2] = 0; } else { t1[0] = 0; t1[1] = a[2]; t1[2] = -a[1]; }
		const l = Math.hypot(t1[0], t1[1], t1[2]);
		t1[0] /= l; t1[1] /= l; t1[2] /= l;
		t2[0] = a[1] * t1[2] - a[2] * t1[1]; t2[1] = a[2] * t1[0] - a[0] * t1[2]; t2[2] = a[0] * t1[1] - a[1] * t1[0];
		this._k[0] = this._angularInv(t1); this._k[1] = this._angularInv(t2); this._k[2] = this._angularInv(a);
		this._m[0] = b[1] * a[2] - b[2] * a[1]; this._m[1] = b[2] * a[0] - b[0] * a[2]; this._m[2] = b[0] * a[1] - b[1] * a[0];
		this._motorAcc = 0;
	}

	_angularInv(d) {
		let k = 0;
		for (const I of [this._a._ii, this._b._ii]) {
			k += d[0] * (I[0] * d[0] + I[1] * d[1] + I[2] * d[2]) + d[1] * (I[3] * d[0] + I[4] * d[1] + I[5] * d[2]) + d[2] * (I[6] * d[0] + I[7] * d[1] + I[8] * d[2]);
		}
		return k > 0 ? 1 / k : 0;
	}

	_spinRate(d, pseudo) {
		const wa = pseudo ? this._a._pw : this._a.angularVelocity, wb = pseudo ? this._b._pw : this._b.angularVelocity;
		return (wb.x - wa.x) * d[0] + (wb.y - wa.y) * d[1] + (wb.z - wa.z) * d[2];
	}

	_spin(d, lambda, pseudo) {
		applyAngular(this._a, d[0] * lambda, d[1] * lambda, d[2] * lambda, -1, pseudo);
		applyAngular(this._b, d[0] * lambda, d[1] * lambda, d[2] * lambda, 1, pseudo);
	}

	_reset() { super._reset(); this._motorAcc = 0; }

	_solve(pseudo) {
		super._solve(pseudo);
		if (!pseudo) {
			for (let r = 0; r < 2; r++) { // keep the two axes from drifting apart
				const d = r === 0 ? this._t1 : this._t2;
				this._spin(d, -this._spinRate(d, false) * this._k[r], false);
			}
			if (this.maxMotorTorque > 0) {
				const limit = this.maxMotorTorque * this._dt;
				const lambda = (this.motorSpeed - this._spinRate(this._aW, false)) * this._k[2];
				const acc = Math.max(-limit, Math.min(limit, this._motorAcc + lambda));
				this._spin(this._aW, acc - this._motorAcc, false);
				this._motorAcc = acc;
			}
		} else {
			const mag = Math.hypot(this._m[0], this._m[1], this._m[2]);
			const s = mag > 0 ? Math.min(this._beta / this._dt, this._maxBias / mag) : 0;
			for (let r = 0; r < 2; r++) {
				const d = r === 0 ? this._t1 : this._t2;
				const target = s * (this._m[0] * d[0] + this._m[1] * d[1] + this._m[2] * d[2]);
				this._spin(d, (target - this._spinRate(d, true)) * this._k[r], true);
			}
		}
	}
}

/**
 * Keeps the distance between two anchor points. With `length` (or with no limits at all: the
 * distance at creation) it is a rigid rod; with `maxLength` / `minLength` it is a rope or a stop that
 * only acts at the limit. Anchors default to the body centers.
 */
export class DistanceJoint extends Joint {
	/** @param {{ anchor?: Vector3, anchorA?: Vector3, anchorB?: Vector3, length?: number, minLength?: number, maxLength?: number, collideConnected?: boolean }} options */
	constructor(bodyA, bodyB, options = {}) {
		super(bodyA, bodyB, options, false);
		const { length, minLength, maxLength } = options;
		if (length !== undefined) {
			this.minLength = this.maxLength = length;
		} else if (minLength === undefined && maxLength === undefined) {
			this.minLength = this.maxLength = this._anchorPoint(bodyA, this.localAnchorA).distanceTo(this._anchorPoint(bodyB, this.localAnchorB));
		} else {
			this.minLength = minLength ?? 0;
			this.maxLength = maxLength ?? Infinity;
		}
		if (!(this.minLength >= 0) || !(this.maxLength >= this.minLength)) {
			throw new RangeError(`Prism.js: DistanceJoint needs 0 <= minLength <= maxLength, received minLength ${this.minLength}, maxLength ${this.maxLength}.`);
		}
		this._rA = new Float64Array(3); this._rB = new Float64Array(3); this._u = new Float64Array(3);
		this._rows = [{ acc: 0, kind: 'upper', on: false, slack: 0, rod: false }, { acc: 0, kind: 'lower', on: false, slack: 0, rod: false }];
		this._invK = 0;
		this._length = 0;
	}

	_prepare(dt, beta, maxBias) {
		this._dt = dt; this._beta = beta; this._maxBias = maxBias;
		this._loadBodies();
		const A = this._a, B = this._b, rA = this._rA, rB = this._rB, u = this._u;
		rotate(A.rotation, this.localAnchorA[0], this.localAnchorA[1], this.localAnchorA[2], rA);
		rotate(B.rotation, this.localAnchorB[0], this.localAnchorB[1], this.localAnchorB[2], rB);
		const dx = B.position.x + rB[0] - A.position.x - rA[0], dy = B.position.y + rB[1] - A.position.y - rA[1], dz = B.position.z + rB[2] - A.position.z - rA[2];
		this._length = Math.hypot(dx, dy, dz);
		if (this._length > 1e-9) { u[0] = dx / this._length; u[1] = dy / this._length; u[2] = dz / this._length; } else { u[0] = 0; u[1] = 1; u[2] = 0; }
		let k = A._im + B._im;
		for (const [body, r] of [[A, rA], [B, rB]]) {
			const cx = r[1] * u[2] - r[2] * u[1], cy = r[2] * u[0] - r[0] * u[2], cz = r[0] * u[1] - r[1] * u[0], I = body._ii;
			k += cx * (I[0] * cx + I[1] * cy + I[2] * cz) + cy * (I[3] * cx + I[4] * cy + I[5] * cz) + cz * (I[6] * cx + I[7] * cy + I[8] * cz);
		}
		this._invK = k > 0 ? 1 / k : 0;
		const rod = this.minLength === this.maxLength;
		const [upper, lower] = this._rows;
		upper.on = rod || this.maxLength < Infinity;
		lower.on = !rod && this.minLength > 0;
		upper.rod = lower.rod = rod;
		upper.slack = this.maxLength - this._length; // room left before the maximum
		lower.slack = this._length - this.minLength; // room left before the minimum
		this._error = rod ? Math.abs(this._length - this.maxLength) : Math.max(this._length - this.maxLength, this.minLength - this._length, 0);
	}

	_warmStart() {
		for (const row of this._rows) {
			if (row.on && row.acc !== 0) this._apply(row.acc, false);
			else row.acc = 0;
		}
	}

	_reset() { for (const row of this._rows) row.acc = 0; }

	_apply(lambda, pseudo) {
		const u = this._u, rA = this._rA, rB = this._rB;
		applyLinear(this._a, rA[0], rA[1], rA[2], u[0] * lambda, u[1] * lambda, u[2] * lambda, -1, pseudo);
		applyLinear(this._b, rB[0], rB[1], rB[2], u[0] * lambda, u[1] * lambda, u[2] * lambda, 1, pseudo);
	}

	_cdot(pseudo) {
		const A = this._a, B = this._b, u = this._u;
		pointVelocity(pseudo ? A._pv : A.velocity, pseudo ? A._pw : A.angularVelocity, this._rA[0], this._rA[1], this._rA[2], _va);
		pointVelocity(pseudo ? B._pv : B.velocity, pseudo ? B._pw : B.angularVelocity, this._rB[0], this._rB[1], this._rB[2], _vb);
		return (_vb[0] - _va[0]) * u[0] + (_vb[1] - _va[1]) * u[1] + (_vb[2] - _va[2]) * u[2];
	}

	_solve(pseudo) {
		for (const row of this._rows) {
			if (!row.on) continue;
			if (!pseudo) {
				const cdot = this._cdot(false);
				let lambda;
				if (row.rod) {
					lambda = -cdot * this._invK;
					row.acc += lambda;
				} else if (row.kind === 'upper') {
					// separating faster than slack / dt would overshoot the limit: the impulse can only pull
					lambda = -(cdot - Math.max(row.slack, 0) / this._dt) * this._invK;
					const acc = Math.min(row.acc + lambda, 0);
					lambda = acc - row.acc; row.acc = acc;
				} else {
					lambda = -(cdot + Math.max(row.slack, 0) / this._dt) * this._invK;
					const acc = Math.max(row.acc + lambda, 0);
					lambda = acc - row.acc; row.acc = acc;
				}
				this._apply(lambda, false);
			} else {
				const c = row.kind === 'upper' ? this._length - this.maxLength : this._length - this.minLength;
				if (!row.rod && ((row.kind === 'upper' && c <= 0) || (row.kind === 'lower' && c >= 0))) continue; // within the limits
				const target = -this._biasScale(Math.abs(c)) * c;
				this._apply((target - this._cdot(true)) * this._invK, true);
			}
		}
	}
}
