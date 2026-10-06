import { clamp } from './MathUtils.js';

const HEX_STYLE = /^#(?:([0-9a-f])([0-9a-f])([0-9a-f])|([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/i;
const toByte = (v) => Math.round(clamp(v, 0, 1) * 255);

/**
 * RGB color with float channels in 0..1. No sRGB/linear conversion is applied:
 * values are used by shaders exactly as stored.
 */
export class Color {
	/** `new Color()` is white; `new Color(0xff8800)`, `new Color('#f80')`, `new Color(1, 0.5, 0)` also work. */
	constructor(r, g, b) {
		this.r = 1;
		this.g = 1;
		this.b = 1;
		if (r === undefined) return;
		if (g === undefined) this.set(r);
		else this.setRGB(r, g, b);
	}

	/** @param {number|string|Color} value 0xRRGGBB, '#rgb' / '#rrggbb', or a Color. */
	set(value) {
		if (typeof value === 'number') return this.setHex(value);
		if (typeof value === 'string') return this.setStyle(value);
		if (value && value.isColor) return this.copy(value);
		throw new TypeError(`Prism.js: Cannot make a Color from ${String(value)}. Use 0xRRGGBB, '#rrggbb' or a Color.`);
	}
	setHex(hex) {
		if (!Number.isInteger(hex) || hex < 0 || hex > 0xffffff) {
			throw new RangeError(`Prism.js: Expected a color as an integer between 0x000000 and 0xffffff, received ${String(hex)}.`);
		}
		this.r = ((hex >> 16) & 255) / 255;
		this.g = ((hex >> 8) & 255) / 255;
		this.b = (hex & 255) / 255;
		return this;
	}
	setStyle(style) {
		const m = HEX_STYLE.exec(style);
		if (m === null) {
			throw new RangeError(`Prism.js: Unsupported color string "${style}". Use '#rgb' or '#rrggbb'.`);
		}
		if (m[1] !== undefined) {
			return this.setHex(parseInt(m[1] + m[1] + m[2] + m[2] + m[3] + m[3], 16));
		}
		return this.setHex(parseInt(m[4] + m[5] + m[6], 16));
	}
	setRGB(r, g, b) { this.r = r; this.g = g; this.b = b; return this; }
	copy(c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; }
	clone() { return new Color(this.r, this.g, this.b); }

	getHex() { return (toByte(this.r) << 16) | (toByte(this.g) << 8) | toByte(this.b); }
	getHexString() { return '#' + this.getHex().toString(16).padStart(6, '0'); }

	multiplyScalar(s) { this.r *= s; this.g *= s; this.b *= s; return this; }
	lerp(c, t) {
		this.r += (c.r - this.r) * t;
		this.g += (c.g - this.g) * t;
		this.b += (c.b - this.b) * t;
		return this;
	}
	equals(c) { return this.r === c.r && this.g === c.g && this.b === c.b; }
	fromArray(a, offset = 0) { this.r = a[offset]; this.g = a[offset + 1]; this.b = a[offset + 2]; return this; }
	toArray(a = [], offset = 0) { a[offset] = this.r; a[offset + 1] = this.g; a[offset + 2] = this.b; return a; }
}
Color.prototype.isColor = true;
