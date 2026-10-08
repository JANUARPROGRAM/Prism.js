import { KIND_PLANE, KIND_BOX, KIND_SPHERE } from './shapes.js';

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
	const R = box.rotation, h = box.shape.halfExtents, r = sphere.shape.radius;
	const rx = sphere.position.x - box.position.x, ry = sphere.position.y - box.position.y, rz = sphere.position.z - box.position.z;
	// sphere center in the box's local frame (R^T r)
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
		box, sphere,
		box.position.x + R[0] * qx + R[1] * qy + R[2] * qz,
		box.position.y + R[3] * qx + R[4] * qy + R[5] * qz,
		box.position.z + R[6] * qx + R[7] * qy + R[8] * qz,
		R[0] * nx + R[1] * ny + R[2] * nz, R[3] * nx + R[4] * ny + R[5] * nz, R[6] * nx + R[7] * ny + R[8] * nz,
		depth
	);
}

// ---------- box / box (separating axis test + face clipping) ----------
const AX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
const BX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
const _L = new Float64Array(3);

function loadAxes(R, out) {
	for (let i = 0; i < 3; i++) { out[i][0] = R[i]; out[i][1] = R[3 + i]; out[i][2] = R[6 + i]; }
}

/** Sutherland-Hodgman: keep the part of `polygon` where dot(p - center, n) <= h. */
function clipPolygon(polygon, center, n, h) {
	const out = [];
	for (let i = 0; i < polygon.length; i++) {
		const p = polygon[i], q = polygon[(i + 1) % polygon.length];
		const dp = (p[0] - center[0]) * n[0] + (p[1] - center[1]) * n[1] + (p[2] - center[2]) * n[2] - h;
		const dq = (q[0] - center[0]) * n[0] + (q[1] - center[1]) * n[1] + (q[2] - center[2]) * n[2] - h;
		if (dp <= 0) out.push(p);
		if ((dp < 0 && dq > 0) || (dp > 0 && dq < 0)) {
			const t = dp / (dp - dq);
			out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]);
		}
	}
	return out;
}

function boxBox(A, B, list) {
	const ha = [A.shape.halfExtents.x, A.shape.halfExtents.y, A.shape.halfExtents.z];
	const hb = [B.shape.halfExtents.x, B.shape.halfExtents.y, B.shape.halfExtents.z];
	loadAxes(A.rotation, AX);
	loadAxes(B.rotation, BX);
	const delta = [B.position.x - A.position.x, B.position.y - A.position.y, B.position.z - A.position.z];

	// Best (largest = shallowest) separation per category. A positive value means a gap: no collision.
	let sepA = -Infinity, iA = 0, signA = 1;
	let sepB = -Infinity, jB = 0, signB = 1;
	let sepE = -Infinity, eI = 0, eJ = 0;
	const edgeAxis = new Float64Array(3);

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
			if (sep > sepE) { sepE = sep; eI = i; eJ = j; edgeAxis.set(_L); }
		}
	}

	// Prefer face contacts (stable, multi-point) unless an edge axis is clearly shallower.
	const faceBest = Math.max(sepA, sepB);
	if (sepE > faceBest * 0.95 + 0.01) {
		edgeContact(A, B, ha, hb, delta, edgeAxis, eI, eJ, -sepE, list);
		return;
	}

	let ref, inc, refAxes, incAxes, refHalf, incHalf, axisIndex, nRef;
	if (sepB > sepA * 0.95 + 0.01) {
		ref = B; inc = A; refAxes = BX; incAxes = AX; refHalf = hb; incHalf = ha; axisIndex = jB;
		const s = -signB; // outward normal of B's face points toward A
		nRef = [BX[jB][0] * s, BX[jB][1] * s, BX[jB][2] * s];
	} else {
		ref = A; inc = B; refAxes = AX; incAxes = BX; refHalf = ha; incHalf = hb; axisIndex = iA;
		nRef = [AX[iA][0] * signA, AX[iA][1] * signA, AX[iA][2] * signA];
	}
	const normal = ref === A ? nRef : [-nRef[0], -nRef[1], -nRef[2]]; // always A -> B

	// Reference face: center and its two tangent axes
	const u = (axisIndex + 1) % 3, v = (axisIndex + 2) % 3;
	const rp = ref.position;
	const refCenter = [rp.x + nRef[0] * refHalf[axisIndex], rp.y + nRef[1] * refHalf[axisIndex], rp.z + nRef[2] * refHalf[axisIndex]];

	// Incident face: the face of `inc` most facing against nRef
	let k = 0, best = 0;
	for (let m = 0; m < 3; m++) {
		const d = dot(incAxes[m], nRef);
		if (Math.abs(d) > Math.abs(best)) { best = d; k = m; }
	}
	const sgn = best > 0 ? -1 : 1;
	const ip = inc.position;
	const ic = [ip.x + incAxes[k][0] * sgn * incHalf[k], ip.y + incAxes[k][1] * sgn * incHalf[k], ip.z + incAxes[k][2] * sgn * incHalf[k]];
	const p = (k + 1) % 3, q = (k + 2) % 3;
	let polygon = [];
	for (const [sp, sq] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
		polygon.push([
			ic[0] + incAxes[p][0] * sp * incHalf[p] + incAxes[q][0] * sq * incHalf[q],
			ic[1] + incAxes[p][1] * sp * incHalf[p] + incAxes[q][1] * sq * incHalf[q],
			ic[2] + incAxes[p][2] * sp * incHalf[p] + incAxes[q][2] * sq * incHalf[q]
		]);
	}

	// Clip the incident face against the four side planes of the reference face
	const un = refAxes[u], vn = refAxes[v];
	polygon = clipPolygon(polygon, refCenter, un, refHalf[u]);
	polygon = clipPolygon(polygon, refCenter, [-un[0], -un[1], -un[2]], refHalf[u]);
	polygon = clipPolygon(polygon, refCenter, vn, refHalf[v]);
	polygon = clipPolygon(polygon, refCenter, [-vn[0], -vn[1], -vn[2]], refHalf[v]);

	for (const pt of polygon) {
		const sep = (pt[0] - refCenter[0]) * nRef[0] + (pt[1] - refCenter[1]) * nRef[1] + (pt[2] - refCenter[2]) * nRef[2];
		if (sep > 0) continue; // above the reference face: not touching
		const depth = -sep;
		list.add(A, B, pt[0] + nRef[0] * depth * 0.5, pt[1] + nRef[1] * depth * 0.5, pt[2] + nRef[2] * depth * 0.5,
			normal[0], normal[1], normal[2], depth);
	}
}

/** Edge-edge contact: one point halfway between the closest points of the two supporting edges. */
function edgeContact(A, B, ha, hb, delta, axis, i, j, depth, list) {
	const flip = dot(axis, delta) < 0 ? -1 : 1;
	const n = [axis[0] * flip, axis[1] * flip, axis[2] * flip]; // A -> B

	const c1 = [A.position.x, A.position.y, A.position.z];
	const c2 = [B.position.x, B.position.y, B.position.z];
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
	const r = [c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]];
	const b = dot(d1, d2), c = dot(d1, r), f = dot(d2, r);
	const denom = 1 - b * b; // |d1| = |d2| = 1
	let s = 0, t = 0;
	if (denom > 1e-9) {
		t = (f - b * c) / denom;
		s = (t * b - c);
	}
	s = Math.max(-ha[i], Math.min(ha[i], s));
	t = Math.max(-hb[j], Math.min(hb[j], t));
	const p1 = [c1[0] + d1[0] * s, c1[1] + d1[1] * s, c1[2] + d1[2] * s];
	const p2 = [c2[0] + d2[0] * t, c2[1] + d2[1] * t, c2[2] + d2[2] * t];
	list.add(A, B, (p1[0] + p2[0]) * 0.5, (p1[1] + p2[1]) * 0.5, (p1[2] + p2[2]) * 0.5, n[0], n[1], n[2], depth);
}

/** Generates the contacts of one pair (any order) into `list`. Returns the number added. */
export function collide(a, b, list) {
	if (a.shape.kind > b.shape.kind) { const t = a; a = b; b = t; }
	const before = list.count;
	const ka = a.shape.kind, kb = b.shape.kind;
	if (ka === KIND_PLANE) {
		if (kb === KIND_BOX) planeBox(a, b, list);
		else if (kb === KIND_SPHERE) planeSphere(a, b, list);
	} else if (ka === KIND_BOX) {
		if (kb === KIND_BOX) boxBox(a, b, list);
		else boxSphere(a, b, list);
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
