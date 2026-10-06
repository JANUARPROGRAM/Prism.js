import assert from 'node:assert/strict';

export const EPS = 1e-9;

export function close(actual, expected, eps = EPS, message = '') {
	assert.ok(Math.abs(actual - expected) <= eps, `${message} expected ${expected}, got ${actual} (eps ${eps})`);
}

/** Compares a vector-like/array against numbers. */
export function vecClose(v, expected, eps = EPS) {
	const actual = Array.isArray(v) || ArrayBuffer.isView(v) ? Array.from(v) : [v.x, v.y, v.z, v.w].slice(0, expected.length);
	expected.forEach((e, i) => close(actual[i], e, eps, `component ${i}:`));
}

export function matClose(m, expected, eps = EPS) {
	const e = m.elements ?? m;
	assert.equal(e.length, expected.length);
	for (let i = 0; i < expected.length; i++) close(e[i], expected[i], eps, `element ${i}:`);
}

/** Deterministic PRNG so "random" tests are reproducible. */
export function createRandom(seed = 1234) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
