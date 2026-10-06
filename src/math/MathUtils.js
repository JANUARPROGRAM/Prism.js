export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

export function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export function lerp(a, b, t) {
	return a + (b - a) * t;
}
