import { Vector3 } from '../math/Vector3.js';
import { Quaternion } from '../math/Quaternion.js';
import { KIND_PLANE } from './shapes.js';

let _nextId = 1;
const _inertia = new Vector3();

/** Rotation matrix (row-major, columns are the body's axes in world space) from a unit quaternion. */
export function rotationFromQuaternion(q, out) {
	const x = q.x, y = q.y, z = q.z, w = q.w;
	const x2 = x + x, y2 = y + y, z2 = z + z;
	const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
	const wx = w * x2, wy = w * y2, wz = w * z2;
	out[0] = 1 - (yy + zz); out[1] = xy - wz;       out[2] = xz + wy;
	out[3] = xy + wz;       out[4] = 1 - (xx + zz); out[5] = yz - wx;
	out[6] = xz - wy;       out[7] = yz + wx;       out[8] = 1 - (xx + yy);
	return out;
}

/**
 * A rigid body: a shape with mass, a pose and velocities.
 *
 * mass > 0  : dynamic, moved by forces and collisions.
 * mass = 0  : infinite mass. It never reacts to forces or collisions, but if you give it a
 *             velocity it moves at that velocity (a kinematic platform) and pushes dynamic bodies.
 *
 * Units are up to you but must be consistent (meters, kilograms, seconds work well).
 */
export class RigidBody {
	/**
	 * @param {object} options
	 * @param {SphereShape|BoxShape|PlaneShape} options.shape
	 * @param {number} [options.mass=1]
	 * @param {Vector3} [options.position]
	 * @param {Quaternion} [options.quaternion]
	 * @param {Vector3} [options.velocity]
	 * @param {Vector3} [options.angularVelocity] radians per second, world axes
	 * @param {number} [options.restitution=0.3] 0 = no bounce, 1 = perfectly elastic
	 * @param {number} [options.friction=0.5] Coulomb coefficient
	 * @param {number} [options.linearDamping=0.01] fraction of speed lost per second
	 * @param {number} [options.angularDamping=0.01]
	 * @param {number} [options.gravityScale=1]
	 * @param {boolean} [options.allowSleep=true]
	 * @param {number} [options.collisionGroup=1] bit(s) this body belongs to
	 * @param {number} [options.collisionMask=0xffff] groups this body collides with
	 * @param {import('../core/Object3D.js').Object3D} [options.object] mesh kept in sync by the world
	 */
	constructor(options = {}) {
		const {
			shape, mass = 1, position, quaternion, velocity, angularVelocity,
			restitution = 0.3, friction = 0.5, linearDamping = 0.01, angularDamping = 0.01,
			gravityScale = 1, allowSleep = true, collisionGroup = 1, collisionMask = 0xffff, object = null, userData = {}
		} = options;
		if (!shape || typeof shape.computeInertia !== 'function') {
			throw new TypeError('Prism.js: RigidBody requires a `shape` (SphereShape, BoxShape or PlaneShape).');
		}
		for (const [name, value] of Object.entries({ restitution, friction, linearDamping, angularDamping })) {
			if (!(value >= 0) || !Number.isFinite(value)) {
				throw new RangeError(`Prism.js: RigidBody ${name} must be a finite number >= 0, received ${String(value)}.`);
			}
		}
		if (linearDamping > 1 || angularDamping > 1) throw new RangeError('Prism.js: damping is a fraction per second and must be <= 1.');

		this.id = _nextId++;
		this.shape = shape;
		this.position = position ? new Vector3().copy(position) : new Vector3();
		this.quaternion = quaternion ? new Quaternion().copy(quaternion).normalize() : new Quaternion();
		this.velocity = velocity ? new Vector3().copy(velocity) : new Vector3();
		this.angularVelocity = angularVelocity ? new Vector3().copy(angularVelocity) : new Vector3();
		this.force = new Vector3();
		this.torque = new Vector3();

		this.restitution = restitution;
		this.friction = friction;
		this.linearDamping = linearDamping;
		this.angularDamping = angularDamping;
		this.gravityScale = gravityScale;
		this.allowSleep = allowSleep;
		this.collisionGroup = collisionGroup;
		this.collisionMask = collisionMask;
		this.object = object;
		this.userData = userData;

		this.sleeping = false;
		this.sleepTimer = 0;

		// Derived state (see setMass / updateRotation)
		this.mass = 0;
		this.invMass = 0;
		this.invInertiaLocal = new Vector3();
		this.invInertiaWorld = new Float64Array(9);
		this.rotation = new Float64Array(9);
		// Pseudo velocities: position correction that must not become real momentum (split impulse)
		this._pv = new Vector3();
		this._pw = new Vector3();
		// Mass used by the solver this step (0 for sleeping bodies, which then act as static)
		this._im = 0;
		this._ii = this.invInertiaWorld;

		this.setMass(mass);
		this.updateRotation();
	}

	get isDynamic() { return this.invMass > 0; }

	setMass(mass) {
		if (!(mass >= 0) || !Number.isFinite(mass)) {
			throw new RangeError(`Prism.js: RigidBody mass must be a finite number >= 0, received ${String(mass)}.`);
		}
		if (this.shape.kind === KIND_PLANE && mass !== 0) {
			throw new RangeError('Prism.js: A body with a PlaneShape must be static (mass 0).');
		}
		this.mass = mass;
		this.invMass = mass > 0 ? 1 / mass : 0;
		if (mass > 0) {
			this.shape.computeInertia(mass, _inertia);
			this.invInertiaLocal.set(1 / _inertia.x, 1 / _inertia.y, 1 / _inertia.z);
		} else {
			this.invInertiaLocal.set(0, 0, 0);
		}
		this.updateRotation();
		return this;
	}

	/** Recomputes the rotation matrix and the world-space inverse inertia tensor from `quaternion`. */
	updateRotation() {
		const R = rotationFromQuaternion(this.quaternion, this.rotation);
		const d = this.invInertiaLocal, I = this.invInertiaWorld;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				I[i * 3 + j] = R[i * 3] * d.x * R[j * 3] + R[i * 3 + 1] * d.y * R[j * 3 + 1] + R[i * 3 + 2] * d.z * R[j * 3 + 2];
			}
		}
	}

	wakeUp() {
		this.sleeping = false;
		this.sleepTimer = 0;
		return this;
	}

	/** Adds a force (newtons) for the next step; with a world-space `point` it also adds the torque. */
	applyForce(force, point) {
		if (this.invMass === 0) return this;
		this.wakeUp();
		this.force.add(force);
		if (point) {
			this.torque.x += (point.y - this.position.y) * force.z - (point.z - this.position.z) * force.y;
			this.torque.y += (point.z - this.position.z) * force.x - (point.x - this.position.x) * force.z;
			this.torque.z += (point.x - this.position.x) * force.y - (point.y - this.position.y) * force.x;
		}
		return this;
	}

	/** Adds a torque (newton-meters, world axes) for the next step. */
	applyTorque(torque) {
		if (this.invMass === 0) return this;
		this.wakeUp();
		this.torque.add(torque);
		return this;
	}

	/** Instantly changes the velocity: dv = J / m, and with a world-space `point` also dω = I⁻¹ (r × J). */
	applyImpulse(impulse, point) {
		if (this.invMass === 0) return this;
		this.wakeUp();
		this.velocity.addScaledVector(impulse, this.invMass);
		if (point) {
			const rx = point.x - this.position.x, ry = point.y - this.position.y, rz = point.z - this.position.z;
			const tx = ry * impulse.z - rz * impulse.y, ty = rz * impulse.x - rx * impulse.z, tz = rx * impulse.y - ry * impulse.x;
			const I = this.invInertiaWorld;
			this.angularVelocity.x += I[0] * tx + I[1] * ty + I[2] * tz;
			this.angularVelocity.y += I[3] * tx + I[4] * ty + I[5] * tz;
			this.angularVelocity.z += I[6] * tx + I[7] * ty + I[8] * tz;
		}
		return this;
	}

	/** Velocity of the material point of this body that is currently at world position `point`. */
	getVelocityAtPoint(point, target = new Vector3()) {
		const rx = point.x - this.position.x, ry = point.y - this.position.y, rz = point.z - this.position.z;
		const w = this.angularVelocity;
		return target.set(
			this.velocity.x + w.y * rz - w.z * ry,
			this.velocity.y + w.z * rx - w.x * rz,
			this.velocity.z + w.x * ry - w.y * rx
		);
	}

	/** Kinetic energy: translational + rotational (computed with the world inertia tensor). */
	get kineticEnergy() {
		if (this.invMass === 0) return 0;
		const v = this.velocity, w = this.angularVelocity;
		const R = this.rotation, d = this.invInertiaLocal;
		// Rotational energy in the body frame: ½ Σ I_k (R^T ω)_k²
		const lx = R[0] * w.x + R[3] * w.y + R[6] * w.z;
		const ly = R[1] * w.x + R[4] * w.y + R[7] * w.z;
		const lz = R[2] * w.x + R[5] * w.y + R[8] * w.z;
		return 0.5 * this.mass * v.lengthSq() + 0.5 * (lx * lx / d.x + ly * ly / d.y + lz * lz / d.z);
	}
}
RigidBody.prototype.isRigidBody = true;
