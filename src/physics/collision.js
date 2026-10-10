import { KIND_PLANE, KIND_BOX, KIND_CAPSULE, KIND_SPHERE } from './shapes.js';

/**
 * Narrow phase. Every function appends contacts whose normal points from body `a`
 * to body `b` (pushing `b` along +normal separates the pair) and whose `depth` is the
 * penetration distance (> 0). `point` is a world-space point between the two surfaces.
 */
export class Contact {
	constructor() {
		this.a = null; this.b = null;
		this.px = 0; this.py = 0; this.pz = 0;
		this.nx = 0; this.ny = 0; this.nz = 0;
		this.depth = 0;
		// solver state
		this.rax = 0; this.ray = 0; this.raz = 0;
		this.rbx = 0; this.rby = 0; this.rbz = 0;
		this.t1x = 0; this.t1y = 0; this.t1z = 0;
		this.t2x = 0; this.t2y = 0; this.t2z = 0;
		this.invKN = 0; this.invKT1 = 0; this.invKT2 = 0;
		this.target = 0; this.mu = 0; this.bias = 0; this.accP = 0;
		this.accN = 0; this.accT1 = 0; this.accT2 = 0;
		this.invKS = 0; this.accS = 0;
		this.rollMu = 0; this.invKR1 = 0; this.invKR2 = 0; this.accR1 = 0; this.accR2 = 0;
		/** Total normal impulse applied during the last step (available to onContact). */
		this.normalImpulse = 0;
	}
}

/** Reusable contact storage: after warm-up a step allocates no Contact objects. */
export class ContactList {
	constructor() {
		this.items = [];
		this.count = 0;
	}
	reset() { this.count = 0; }
	add(a, b, px, py, pz, nx, ny, nz, depth) {
		let c = this.items[this.count];
		if (c === undefined) c = this.items[this.count] = new Contact();
		this.count++;
		c.a = a; c.b = b;
		c.px = px; c.py = py; c.pz = pz;
		c.nx = nx; c.ny = ny; c.nz = nz;
		c.depth = depth;
		return c;
	}
}

/** World-space bounding box of a non-plane body into out = [minX, minY, minZ, maxX, maxY, maxZ]. */
export function computeAABB(body, out) {
	const p = body.position;
	let ex, ey, ez;
	if (body.shape.kind === KIND_SPHERE) {
		ex = ey = ez = body.shape.radius;
	} else if (body.shape.kind === KIND_CAPSULE) {
		const R = body.rotation, h = body.shape.halfHeight, r = body.shape.radius;
		ex = Math.abs(R[1]) * h + r; ey = Math.abs(R[4]) * h + r; ez = Math.abs(R[7]) * h + r;
	} else {
		const R = body.rotation, h = body.shape.halfExtents;
		ex = Math.abs(R[0]) * h.x + Math.abs(R[1]) * h.y + Math.abs(R[2]) * h.z;
		ey = Math.abs(R[3]) * h.x + Math.abs(R[4]) * h.y + Math.abs(R[5]) * h.z;
		ez = Math.abs(R[6]) * h.x + Math.abs(R[7]) * h.y + Math.abs(R[8]) * h.z;
	}
	out[0] = p.x - ex; out[1] = p.y - ey; out[2] = p.z - ez;
	out[3] = p.x + ex; out[4] = p.y + ey; out[5] = p.z + ez;
}

// ---------- helpers ----------
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** World-space plane (normal + offset) of a plane body: dot(n, p) = d. */
function worldPlane(body, out) {
	const R = body.rotation, n = body.shape.normal, p = body.position;
	out[0] = R[0] * n.x + R[1] * n.y + R[2] * n.z;
	out[1] = R[3] * n.x + R[4] * n.y + R[5] * n.z;
	out[2] = R[6] * n.x + R[7] * n.y + R[8] * n.z;
	out[3] = body.shape.constant + out[0] * p.x + out[1] * p.y + out[2] * p.z;
	return out;
}
const _plane = new Float64Array(4);

// ---------- plane pairs ----------
function planeSphere(plane, sphere, list) {
	const pl = worldPlane(plane, _plane), r = sphere.shape.radius, c = sphere.position;
	const dist = pl[0] * c.x + pl[1] * c.y + pl[2] * c.z - pl[3];
	const depth = r - dist;
	if (depth <= 0) return;
	const k = r - depth * 0.5;
	list.add(plane, sphere, c.x - pl[0] * k, c.y - pl[1] * k, c.z - pl[2] * k, pl[0], pl[1], pl[2], depth);
}

function planeBox(plane, box, list) {
	const pl = worldPlane(plane, _plane), R = box.rotation, h = box.shape.halfExtents, p = box.position;
	for (let sx = -1; sx <= 1; sx += 2) {
		for (let sy = -1; sy <= 1; sy += 2) {
			for (let sz = -1; sz <= 1; sz += 2) {
				const lx = sx * h.x, ly = sy * h.y, lz = sz * h.z;
				const x = p.x + R[0] * lx + R[1] * ly + R[2] * lz;
				const y = p.y + R[3] * lx + R[4] * ly + R[5] * lz;
				const z = p.z + R[6] * lx + R[7] * ly + R[8] * lz;
				const dist = pl[0] * x + pl[1] * y + pl[2] * z - pl[3];
				if (dist < 0) {
					const half = -dist * 0.5;
					list.add(plane, box, x + pl[0] * half, y + pl[1] * half, z + pl[2] * half, pl[0], pl[1], pl[2], -dist);
				}
			}
		}
	}
}

// ---------- sphere pairs ----------
function sphereSphere(a, b, list) {
	const dx = b.position.x - a.position.x, dy = b.position.y - a.position.y, dz = b.position.z - a.position.z;
	const ra = a.shape.radius, rb = b.shape.radius, sum = ra + rb;
	const d2 = dx * dx + dy * dy + dz * dz;
	if (d2 >= sum * sum) return;
	const dist = Math.sqrt(d2);
	let nx = 0, ny = 1, nz = 0;
	if (dist > 1e-9) { nx = dx / dist; ny = dy / dist; nz = dz / dist; }
	const depth = sum - dist;
	const k = ra - depth * 0.5;
	list.add(a, b, a.position.x + nx * k, a.position.y + ny * k, a.position.z + nz * k, nx, ny, nz, depth);
}

function boxSphere(box, sphere, list) {
	sphereVsBox(box, sphere, sphere.position.x, sphere.position.y, sphere.position.z, sphere.shape.radius, list);
}

/** A ball of `radius` centered at (x, y, z) that belongs to `other`, against a box. Normal: box -> other. */
function sphereVsBox(box, other, x, y, z, r, list) {
	const R = box.rotation, h = box.shape.halfExtents;
	const rx = x - box.position.x, ry = y - box.position.y, rz = z - box.position.z;
	// ball center in the box's local frame (R^T r)
	const lx = R[0] * rx + R[3] * ry + R[6] * rz;
	const ly = R[1] * rx + R[4] * ry + R[7] * rz;
	const lz = R[2] * rx + R[5] * ry + R[8] * rz;
	const cx = Math.max(-h.x, Math.min(h.x, lx));
	const cy = Math.max(-h.y, Math.min(h.y, ly));
	const cz = Math.max(-h.z, Math.min(h.z, lz));
	const dx = lx - cx, dy = ly - cy, dz = lz - cz;
	const d2 = dx * dx + dy * dy + dz * dz;
	let nx, ny, nz, depth, qx, qy, qz;
	if (d2 > 1e-18) {
		if (d2 >= r * r) return;
		const dist = Math.sqrt(d2);
		nx = dx / dist; ny = dy / dist; nz = dz / dist;
		depth = r - dist;
		qx = cx + nx * depth * 0.5; qy = cy + ny * depth * 0.5; qz = cz + nz * depth * 0.5;
	} else {
		// center inside the box: leave through the nearest face
		const gx = h.x - Math.abs(lx), gy = h.y - Math.abs(ly), gz = h.z - Math.abs(lz);
		nx = ny = nz = 0;
		if (gx <= gy && gx <= gz) { nx = lx < 0 ? -1 : 1; depth = r + gx; qx = nx * h.x; qy = ly; qz = lz; }
		else if (gy <= gz) { ny = ly < 0 ? -1 : 1; depth = r + gy; qx = lx; qy = ny * h.y; qz = lz; }
		else { nz = lz < 0 ? -1 : 1; depth = r + gz; qx = lx; qy = ly; qz = nz * h.z; }
	}
	// back to world space
	list.add(
		box, other,
		box.position.x + R[0] * qx + R[1] * qy + R[2] * qz,
		box.position.y + R[3] * qx + R[4] * qy + R[5] * qz,
		box.position.z + R[6] * qx + R[7] * qy + R[8] * qz,
		R[0] * nx + R[1] * ny + R[2] * nz, R[3] * nx + R[4] * ny + R[5] * nz, R[6] * nx + R[7] * ny + R[8] * nz,
		depth
	);
}

// ---------- capsule pairs ----------
// A capsule is the set of points within `radius` of a segment (its axis) -- so every pair reduces to
// "ball against X" at the closest point(s) of the segment.
const _seg = new Float64Array(6); // p0 (x,y,z), p1 (x,y,z)
const _seg2 = new Float64Array(6);

function capsuleSegment(body, out) {
	const R = body.rotation, h = body.shape.halfHeight, p = body.position;
	const ax = R[1] * h, ay = R[4] * h, az = R[7] * h;
	out[0] = p.x - ax; out[1] = p.y - ay; out[2] = p.z - az;
	out[3] = p.x + ax; out[4] = p.y + ay; out[5] = p.z + az;
	return out;
}

/** Parameter t in [0, 1] of the point of segment seg closest to (x, y, z). */
function closestOnSegment(seg, x, y, z) {
	const dx = seg[3] - seg[0], dy = seg[4] - seg[1], dz = seg[5] - seg[2];
	const len2 = dx * dx + dy * dy + dz * dz;
	if (len2 === 0) return 0;
	return Math.max(0, Math.min(1, ((x - seg[0]) * dx + (y - seg[1]) * dy + (z - seg[2]) * dz) / len2));
}

/** Contact between two balls (a at A, b at B) where the spheres belong to bodies `ba` and `bb`. */
function ballBall(ba, bb, ax, ay, az, ra, bx, by, bz, rb, list, fallback) {
	const dx = bx - ax, dy = by - ay, dz = bz - az;
	const sum = ra + rb, d2 = dx * dx + dy * dy + dz * dz;
	if (d2 >= sum * sum) return;
	const dist = Math.sqrt(d2);
	let nx, ny, nz;
	if (dist > 1e-9) { nx = dx / dist; ny = dy / dist; nz = dz / dist; } else { nx = fallback[0]; ny = fallback[1]; nz = fallback[2]; }
	const depth = sum - dist, k = ra - depth * 0.5;
	list.add(ba, bb, ax + nx * k, ay + ny * k, az + nz * k, nx, ny, nz, depth);
}

const _perp = new Float64Array(3);
/** Any unit vector perpendicular to the capsule axis (used when two axes intersect exactly). */
function perpendicularTo(R, out) {
	const ax = R[1], ay = R[4], az = R[7];
	if (Math.abs(ax) < 0.9) { out[0] = 0; out[1] = az; out[2] = -ay; } else { out[0] = -az; out[1] = 0; out[2] = ax; }
	const l = Math.hypot(out[0], out[1], out[2]);
	out[0] /= l; out[1] /= l; out[2] /= l;
	return out;
}

function planeCapsule(plane, cap, list) {
	const pl = worldPlane(plane, _plane), r = cap.shape.radius;
	const seg = capsuleSegment(cap, _seg);
	for (let e = 0; e < 2; e++) {
		const x = seg[e * 3], y = seg[e * 3 + 1], z = seg[e * 3 + 2];
		const depth = r - (pl[0] * x + pl[1] * y + pl[2] * z - pl[3]);
		if (depth > 0) {
			const k = r - depth * 0.5;
			list.add(plane, cap, x - pl[0] * k, y - pl[1] * k, z - pl[2] * k, pl[0], pl[1], pl[2], depth);
		}
	}
}

function capsuleSphere(cap, sphere, list) {
	const seg = capsuleSegment(cap, _seg), c = sphere.position;
	const t = closestOnSegment(seg, c.x, c.y, c.z);
	const qx = seg[0] + (seg[3] - seg[0]) * t, qy = seg[1] + (seg[4] - seg[1]) * t, qz = seg[2] + (seg[5] - seg[2]) * t;
	ballBall(cap, sphere, qx, qy, qz, cap.shape.radius, c.x, c.y, c.z, sphere.shape.radius, list, perpendicularTo(cap.rotation, _perp));
}

function capsuleCapsule(a, b, list) {
	const s1 = capsuleSegment(a, _seg), s2 = capsuleSegment(b, _seg2);
	const ra = a.shape.radius, rb = b.shape.radius;
	const d1x = s1[3] - s1[0], d1y = s1[4] - s1[1], d1z = s1[5] - s1[2];
	const d2x = s2[3] - s2[0], d2y = s2[4] - s2[1], d2z = s2[5] - s2[2];
	const rx = s1[0] - s2[0], ry = s1[1] - s2[1], rz = s1[2] - s2[2];
	const A = d1x * d1x + d1y * d1y + d1z * d1z, E = d2x * d2x + d2y * d2y + d2z * d2z;
	const fallback = perpendicularTo(a.rotation, _perp);
	if (A < 1e-18 || E < 1e-18) { // degenerate (zero-length) capsules behave like spheres
		const ta = closestOnSegment(s1, s2[0], s2[1], s2[2]), tb = closestOnSegment(s2, s1[0], s1[1], s1[2]);
		ballBall(a, b, s1[0] + d1x * ta, s1[1] + d1y * ta, s1[2] + d1z * ta, ra, s2[0] + d2x * tb, s2[1] + d2y * tb, s2[2] + d2z * tb, rb, list, fallback);
		return;
	}
	const B = d1x * d2x + d1y * d2y + d1z * d2z, C = d1x * rx + d1y * ry + d1z * rz, F = d2x * rx + d2y * ry + d2z * rz;
	const denom = A * E - B * B;
	const clamp01 = (v) => Math.max(0, Math.min(1, v));

	if (denom <= 1e-6 * A * E) {
		// (nearly) parallel axes: contact at both ends of the overlapping interval for a stable resting pose
		const len = Math.sqrt(A), ux = d1x / len, uy = d1y / len, uz = d1z / len;
		const b0 = ((s2[0] - s1[0]) * ux + (s2[1] - s1[1]) * uy + (s2[2] - s1[2]) * uz) / len;
		const b1 = ((s2[3] - s1[0]) * ux + (s2[4] - s1[1]) * uy + (s2[5] - s1[2]) * uz) / len;
		const lo = Math.max(0, Math.min(b0, b1)), hi = Math.min(1, Math.max(b0, b1));
		if (lo <= hi) {
			for (const s of lo === hi ? [lo] : [lo, hi]) {
				const px = s1[0] + d1x * s, py = s1[1] + d1y * s, pz = s1[2] + d1z * s;
				const t = closestOnSegment(s2, px, py, pz);
				ballBall(a, b, px, py, pz, ra, s2[0] + d2x * t, s2[1] + d2y * t, s2[2] + d2z * t, rb, list, fallback);
			}
			return;
		}
	}
	let s = denom > 1e-12 ? clamp01((B * F - C * E) / denom) : 0;
	let t = (B * s + F) / E;
	if (t < 0) { t = 0; s = clamp01(-C / A); } else if (t > 1) { t = 1; s = clamp01((B - C) / A); }
	ballBall(a, b, s1[0] + d1x * s, s1[1] + d1y * s, s1[2] + d1z * s, ra, s2[0] + d2x * t, s2[1] + d2y * t, s2[2] + d2z * t, rb, list, fallback);
}

/** Distance from (x, y, z) to a box (0 inside). */
function distanceToBox(box, x, y, z) {
	const R = box.rotation, h = box.shape.halfExtents;
	const rx = x - box.position.x, ry = y - box.position.y, rz = z - box.position.z;
	const lx = R[0] * rx + R[3] * ry + R[6] * rz, ly = R[1] * rx + R[4] * ry + R[7] * rz, lz = R[2] * rx + R[5] * ry + R[8] * rz;
	const dx = Math.max(Math.abs(lx) - h.x, 0), dy = Math.max(Math.abs(ly) - h.y, 0), dz = Math.max(Math.abs(lz) - h.z, 0);
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function boxCapsule(box, cap, list) {
	const seg = capsuleSegment(cap, _seg), r = cap.shape.radius;
	const px = (t) => seg[0] + (seg[3] - seg[0]) * t, py = (t) => seg[1] + (seg[4] - seg[1]) * t, pz = (t) => seg[2] + (seg[5] - seg[2]) * t;
	// distance to a convex set along a line is convex in t, so a ternary search finds the closest point
	let lo = 0, hi = 1;
	for (let i = 0; i < 40; i++) {
		const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
		if (distanceToBox(box, px(m1), py(m1), pz(m1)) < distanceToBox(box, px(m2), py(m2), pz(m2))) hi = m2; else lo = m1;
	}
	const tMin = (lo + hi) / 2;
	// both ends (so a capsule lying on a face gets two support points) and the closest point
	sphereVsBox(box, cap, seg[0], seg[1], seg[2], r, list);
	sphereVsBox(box, cap, seg[3], seg[4], seg[5], r, list);
	if (tMin > 0.02 && tMin < 0.98) sphereVsBox(box, cap, px(tMin), py(tMin), pz(tMin), r, list);
}

// ---------- box / box (separating axis test + face clipping) ----------
// All temporaries are module-level typed arrays: the narrow phase allocates nothing per call.
const AX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
const BX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
const _L = new Float64Array(3);
const _ha = new Float64Array(3), _hb = new Float64Array(3), _delta = new Float64Array(3);
const _edgeAxis = new Float64Array(3);
const _nRef = new Float64Array(3), _refCenter = new Float64Array(3), _ic = new Float64Array(3);
const POLY_CAPACITY = 16;
let _polyA = new Float64Array(POLY_CAPACITY * 3), _polyB = new Float64Array(POLY_CAPACITY * 3);
const _e = { c1: new Float64Array(3), c2: new Float64Array(3), n: new Float64Array(3), r: new Float64Array(3) };

function loadAxes(R, out) {
	for (let i = 0; i < 3; i++) { out[i][0] = R[i]; out[i][1] = R[3 + i]; out[i][2] = R[6 + i]; }
}

/**
 * Sutherland-Hodgman: copies into `dst` the part of the polygon `src` (n points, flat xyz) where
 * dot(p - center, normal) <= h, and returns the new point count.
 */
function clipPolygon(src, n, dst, center, nx, ny, nz, h) {
	let count = 0;
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const p0 = src[i * 3], p1 = src[i * 3 + 1], p2 = src[i * 3 + 2];
		const q0 = src[j * 3], q1 = src[j * 3 + 1], q2 = src[j * 3 + 2];
		const dp = (p0 - center[0]) * nx + (p1 - center[1]) * ny + (p2 - center[2]) * nz - h;
		const dq = (q0 - center[0]) * nx + (q1 - center[1]) * ny + (q2 - center[2]) * nz - h;
		if (dp <= 0) { dst[count * 3] = p0; dst[count * 3 + 1] = p1; dst[count * 3 + 2] = p2; count++; }
		if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
			const t = dp / (dp - dq);
			dst[count * 3] = p0 + (q0 - p0) * t; dst[count * 3 + 1] = p1 + (q1 - p1) * t; dst[count * 3 + 2] = p2 + (q2 - p2) * t;
			count++;
		}
	}
	return count;
}

function boxBox(A, B, list) {
	const ha = _ha, hb = _hb, delta = _delta;
	ha[0] = A.shape.halfExtents.x; ha[1] = A.shape.halfExtents.y; ha[2] = A.shape.halfExtents.z;
	hb[0] = B.shape.halfExtents.x; hb[1] = B.shape.halfExtents.y; hb[2] = B.shape.halfExtents.z;
	loadAxes(A.rotation, AX);
	loadAxes(B.rotation, BX);
	delta[0] = B.position.x - A.position.x; delta[1] = B.position.y - A.position.y; delta[2] = B.position.z - A.position.z;

	// Best (largest = shallowest) separation per category. A positive value means a gap: no collision.
	let sepA = -Infinity, iA = 0, signA = 1;
	let sepB = -Infinity, jB = 0, signB = 1;
	let sepE = -Infinity, eI = 0, eJ = 0;
	const edgeAxis = _edgeAxis;

	for (let i = 0; i < 3; i++) {
		const d = dot(delta, AX[i]);
		let rb = 0;
		for (let j = 0; j < 3; j++) rb += hb[j] * Math.abs(dot(AX[i], BX[j]));
		const sep = Math.abs(d) - (ha[i] + rb);
		if (sep > 0) return;
		if (sep > sepA) { sepA = sep; iA = i; signA = d < 0 ? -1 : 1; }
	}
	for (let j = 0; j < 3; j++) {
		const d = dot(delta, BX[j]);
		let ra = 0;
		for (let i = 0; i < 3; i++) ra += ha[i] * Math.abs(dot(BX[j], AX[i]));
		const sep = Math.abs(d) - (hb[j] + ra);
		if (sep > 0) return;
		if (sep > sepB) { sepB = sep; jB = j; signB = d < 0 ? -1 : 1; }
	}
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const a = AX[i], b = BX[j];
			_L[0] = a[1] * b[2] - a[2] * b[1];
			_L[1] = a[2] * b[0] - a[0] * b[2];
			_L[2] = a[0] * b[1] - a[1] * b[0];
			const len = Math.hypot(_L[0], _L[1], _L[2]);
			if (len < 1e-6) continue; // parallel edges: covered by the face axes
			_L[0] /= len; _L[1] /= len; _L[2] /= len;
			let ra = 0, rb = 0;
			for (let k = 0; k < 3; k++) { ra += ha[k] * Math.abs(dot(AX[k], _L)); rb += hb[k] * Math.abs(dot(BX[k], _L)); }
			const sep = Math.abs(dot(delta, _L)) - (ra + rb);
			if (sep > 0) return;
			if (sep > sepE) { sepE = sep; eI = i; eJ = j; edgeAxis[0] = _L[0]; edgeAxis[1] = _L[1]; edgeAxis[2] = _L[2]; }
		}
	}

	// Prefer face contacts (stable, multi-point) unless an edge axis is clearly shallower.
	const faceBest = Math.max(sepA, sepB);
	if (sepE > faceBest * 0.95 + 0.01) {
		edgeContact(A, B, ha, hb, delta, edgeAxis, eI, eJ, -sepE, list);
		return;
	}

	const nRef = _nRef;
	let ref, inc, refAxes, incAxes, refHalf, incHalf, axisIndex;
	if (sepB > sepA * 0.95 + 0.01) {
		ref = B; inc = A; refAxes = BX; incAxes = AX; refHalf = hb; incHalf = ha; axisIndex = jB;
		const sg = -signB; // outward normal of B's face points toward A
		nRef[0] = BX[jB][0] * sg; nRef[1] = BX[jB][1] * sg; nRef[2] = BX[jB][2] * sg;
	} else {
		ref = A; inc = B; refAxes = AX; incAxes = BX; refHalf = ha; incHalf = hb; axisIndex = iA;
		nRef[0] = AX[iA][0] * signA; nRef[1] = AX[iA][1] * signA; nRef[2] = AX[iA][2] * signA;
	}
	// contact normal, always A -> B
	const nx = ref === A ? nRef[0] : -nRef[0], ny = ref === A ? nRef[1] : -nRef[1], nz = ref === A ? nRef[2] : -nRef[2];

	// Reference face: center and its two tangent axes
	const u = (axisIndex + 1) % 3, v = (axisIndex + 2) % 3;
	const rp = ref.position, rc = _refCenter;
	rc[0] = rp.x + nRef[0] * refHalf[axisIndex]; rc[1] = rp.y + nRef[1] * refHalf[axisIndex]; rc[2] = rp.z + nRef[2] * refHalf[axisIndex];

	// Incident face: the face of `inc` most facing against nRef
	let k = 0, best = 0;
	for (let m = 0; m < 3; m++) {
		const d = dot(incAxes[m], nRef);
		if (Math.abs(d) > Math.abs(best)) { best = d; k = m; }
	}
	const sgn = best > 0 ? -1 : 1;
	const ip = inc.position, ic = _ic;
	ic[0] = ip.x + incAxes[k][0] * sgn * incHalf[k]; ic[1] = ip.y + incAxes[k][1] * sgn * incHalf[k]; ic[2] = ip.z + incAxes[k][2] * sgn * incHalf[k];
	const p = (k + 1) % 3, q = (k + 2) % 3;
	let src = _polyA, dst = _polyB, count = 0;
	for (let c = 0; c < 4; c++) {
		const sp = c < 2 ? 1 : -1, sq = c === 0 || c === 3 ? 1 : -1; // (+,+) (+,-) (-,-) (-,+)
		src[count * 3] = ic[0] + incAxes[p][0] * sp * incHalf[p] + incAxes[q][0] * sq * incHalf[q];
		src[count * 3 + 1] = ic[1] + incAxes[p][1] * sp * incHalf[p] + incAxes[q][1] * sq * incHalf[q];
		src[count * 3 + 2] = ic[2] + incAxes[p][2] * sp * incHalf[p] + incAxes[q][2] * sq * incHalf[q];
		count++;
	}

	// Clip the incident face against the four side planes of the reference face
	const un = refAxes[u], vn = refAxes[v];
	let t;
	count = clipPolygon(src, count, dst, rc, un[0], un[1], un[2], refHalf[u]); t = src; src = dst; dst = t;
	count = clipPolygon(src, count, dst, rc, -un[0], -un[1], -un[2], refHalf[u]); t = src; src = dst; dst = t;
	count = clipPolygon(src, count, dst, rc, vn[0], vn[1], vn[2], refHalf[v]); t = src; src = dst; dst = t;
	count = clipPolygon(src, count, dst, rc, -vn[0], -vn[1], -vn[2], refHalf[v]); t = src; src = dst; dst = t;

	for (let i = 0; i < count; i++) {
		const x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
		const sep = (x - rc[0]) * nRef[0] + (y - rc[1]) * nRef[1] + (z - rc[2]) * nRef[2];
		if (sep > 0) continue; // above the reference face: not touching
		const depth = -sep;
		list.add(A, B, x + nRef[0] * depth * 0.5, y + nRef[1] * depth * 0.5, z + nRef[2] * depth * 0.5, nx, ny, nz, depth);
	}
}

/** Edge-edge contact: one point halfway between the closest points of the two supporting edges. */
function edgeContact(A, B, ha, hb, delta, axis, i, j, depth, list) {
	const flip = dot(axis, delta) < 0 ? -1 : 1;
	const n = _e.n, c1 = _e.c1, c2 = _e.c2, r = _e.r;
	n[0] = axis[0] * flip; n[1] = axis[1] * flip; n[2] = axis[2] * flip; // A -> B

	c1[0] = A.position.x; c1[1] = A.position.y; c1[2] = A.position.z;
	c2[0] = B.position.x; c2[1] = B.position.y; c2[2] = B.position.z;
	for (let m = 0; m < 3; m++) {
		if (m !== i) {
			const s = dot(AX[m], n) > 0 ? 1 : -1;
			for (let c = 0; c < 3; c++) c1[c] += AX[m][c] * s * ha[m];
		}
		if (m !== j) {
			const s = dot(BX[m], n) > 0 ? -1 : 1;
			for (let c = 0; c < 3; c++) c2[c] += BX[m][c] * s * hb[m];
		}
	}
	const d1 = AX[i], d2 = BX[j];
	r[0] = c1[0] - c2[0]; r[1] = c1[1] - c2[1]; r[2] = c1[2] - c2[2];
	const b = dot(d1, d2), c = dot(d1, r), f = dot(d2, r);
	const denom = 1 - b * b; // |d1| = |d2| = 1
	let s = 0, t = 0;
	if (denom > 1e-9) {
		t = (f - b * c) / denom;
		s = (t * b - c);
	}
	s = Math.max(-ha[i], Math.min(ha[i], s));
	t = Math.max(-hb[j], Math.min(hb[j], t));
	const p10 = c1[0] + d1[0] * s, p11 = c1[1] + d1[1] * s, p12 = c1[2] + d1[2] * s;
	const p20 = c2[0] + d2[0] * t, p21 = c2[1] + d2[1] * t, p22 = c2[2] + d2[2] * t;
	list.add(A, B, (p10 + p20) * 0.5, (p11 + p21) * 0.5, (p12 + p22) * 0.5, n[0], n[1], n[2], depth);
}

/** Generates the contacts of one pair (any order) into `list`. Returns the number added. */
export function collide(a, b, list) {
	if (a.shape.kind > b.shape.kind) { const t = a; a = b; b = t; }
	const before = list.count;
	const ka = a.shape.kind, kb = b.shape.kind;
	if (ka === KIND_PLANE) {
		if (kb === KIND_BOX) planeBox(a, b, list);
		else if (kb === KIND_CAPSULE) planeCapsule(a, b, list);
		else if (kb === KIND_SPHERE) planeSphere(a, b, list);
	} else if (ka === KIND_BOX) {
		if (kb === KIND_BOX) boxBox(a, b, list);
		else if (kb === KIND_CAPSULE) boxCapsule(a, b, list);
		else boxSphere(a, b, list);
	} else if (ka === KIND_CAPSULE) {
		if (kb === KIND_CAPSULE) capsuleCapsule(a, b, list);
		else capsuleSphere(a, b, list);
	} else {
		sphereSphere(a, b, list);
	}
	return list.count - before;
}

// ---------- ray casting ----------
/**
 * Casts a ray against one body. `direction` must be unit length.
 * Returns the hit distance and writes the world normal into `normalOut`, or returns -1 on a miss.
 * A ray that starts inside a sphere/box does not hit it.
 */
export function raycastBody(body, ox, oy, oz, dx, dy, dz, maxDistance, normalOut) {
	const kind = body.shape.kind;
	const p = body.position;
	if (kind === KIND_SPHERE) {
		const r = body.shape.radius;
		const ex = ox - p.x, ey = oy - p.y, ez = oz - p.z;
		const b = ex * dx + ey * dy + ez * dz;
		const c = ex * ex + ey * ey + ez * ez - r * r;
		if (c > 0 && b > 0) return -1;
		const disc = b * b - c;
		if (disc < 0) return -1;
		const t = -b - Math.sqrt(disc);
		if (t < 0 || t > maxDistance) return -1;
		normalOut[0] = (ex + dx * t) / r; normalOut[1] = (ey + dy * t) / r; normalOut[2] = (ez + dz * t) / r;
		return t;
	}
	if (kind === KIND_PLANE) {
		const pl = worldPlane(body, _plane);
		const side = pl[0] * ox + pl[1] * oy + pl[2] * oz - pl[3];
		const denom = pl[0] * dx + pl[1] * dy + pl[2] * dz;
		if (side < 0 || denom >= 0) return -1;
		const t = -side / denom;
		if (t > maxDistance) return -1;
		normalOut[0] = pl[0]; normalOut[1] = pl[1]; normalOut[2] = pl[2];
		return t;
	}
	if (kind === KIND_CAPSULE) return raycastCapsule(body, ox, oy, oz, dx, dy, dz, maxDistance, normalOut);
	// box: slab test in local space
	const R = body.rotation, h = body.shape.halfExtents;
	const rx = ox - p.x, ry = oy - p.y, rz = oz - p.z;
	const lo = [R[0] * rx + R[3] * ry + R[6] * rz, R[1] * rx + R[4] * ry + R[7] * rz, R[2] * rx + R[5] * ry + R[8] * rz];
	const ld = [R[0] * dx + R[3] * dy + R[6] * dz, R[1] * dx + R[4] * dy + R[7] * dz, R[2] * dx + R[5] * dy + R[8] * dz];
	const half = [h.x, h.y, h.z];
	let tMin = -Infinity, tMax = Infinity, hitAxis = 0, hitSign = 1;
	for (let i = 0; i < 3; i++) {
		if (Math.abs(ld[i]) < 1e-12) {
			if (Math.abs(lo[i]) > half[i]) return -1;
			continue;
		}
		let t1 = (-half[i] - lo[i]) / ld[i], t2 = (half[i] - lo[i]) / ld[i];
		let sign = -1;
		if (t1 > t2) { const tmp = t1; t1 = t2; t2 = tmp; sign = 1; }
		if (t1 > tMin) { tMin = t1; hitAxis = i; hitSign = sign; }
		if (t2 < tMax) tMax = t2;
		if (tMin > tMax) return -1;
	}
	if (tMin < 0 || tMin > maxDistance) return -1;
	const nl = [0, 0, 0];
	nl[hitAxis] = hitSign;
	normalOut[0] = R[0] * nl[0] + R[1] * nl[1] + R[2] * nl[2];
	normalOut[1] = R[3] * nl[0] + R[4] * nl[1] + R[5] * nl[2];
	normalOut[2] = R[6] * nl[0] + R[7] * nl[1] + R[8] * nl[2];
	return tMin;
}

function raycastCapsule(body, ox, oy, oz, dx, dy, dz, maxDistance, normalOut) {
	const R = body.rotation, p = body.position, r = body.shape.radius, half = body.shape.halfHeight;
	const rx = ox - p.x, ry = oy - p.y, rz = oz - p.z;
	const lx = R[0] * rx + R[3] * ry + R[6] * rz, ly = R[1] * rx + R[4] * ry + R[7] * rz, lz = R[2] * rx + R[5] * ry + R[8] * rz;
	const vx = R[0] * dx + R[3] * dy + R[6] * dz, vy = R[1] * dx + R[4] * dy + R[7] * dz, vz = R[2] * dx + R[5] * dy + R[8] * dz;
	const cy = Math.max(-half, Math.min(half, ly));
	if (lx * lx + (ly - cy) * (ly - cy) + lz * lz < r * r) return -1; // starts inside

	let best = Infinity, nxl = 0, nyl = 0, nzl = 0;
	// side: infinite cylinder around Y, accepted where |y| <= half
	const a = vx * vx + vz * vz;
	if (a > 1e-12) {
		const b = lx * vx + lz * vz, c = lx * lx + lz * lz - r * r, disc = b * b - a * c;
		if (disc >= 0) {
			const t = (-b - Math.sqrt(disc)) / a, y = ly + vy * t;
			if (t >= 0 && Math.abs(y) <= half && t < best) { best = t; nxl = (lx + vx * t) / r; nyl = 0; nzl = (lz + vz * t) / r; }
		}
	}
	// caps: spheres at y = +-half, accepted on the outer side
	for (const sy of [half, -half]) {
		const ex = lx, ey = ly - sy, ez = lz;
		const b = ex * vx + ey * vy + ez * vz, c = ex * ex + ey * ey + ez * ez - r * r, disc = b * b - c;
		if (disc < 0) continue;
		const t = -b - Math.sqrt(disc);
		const y = ly + vy * t;
		if (t >= 0 && t < best && (sy > 0 ? y >= half : y <= -half)) {
			best = t; nxl = (lx + vx * t) / r; nyl = (y - sy) / r; nzl = (lz + vz * t) / r;
		}
	}
	if (best > maxDistance || !Number.isFinite(best)) return -1;
	normalOut[0] = R[0] * nxl + R[1] * nyl + R[2] * nzl;
	normalOut[1] = R[3] * nxl + R[4] * nyl + R[5] * nzl;
	normalOut[2] = R[6] * nxl + R[7] * nyl + R[8] * nzl;
	return best;
}
