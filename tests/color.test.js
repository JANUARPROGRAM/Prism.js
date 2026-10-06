import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Color } from '../src/index.js';
import { close } from './helpers/assertions.js';

test('Color parses hex numbers and strings', () => {
	const c = new Color(0xff8000);
	close(c.r, 1);
	close(c.g, 128 / 255);
	close(c.b, 0);
	assert.equal(c.getHex(), 0xff8000);
	assert.equal(c.getHexString(), '#ff8000');
	assert.equal(new Color('#f80').getHex(), 0xff8800);
	assert.equal(new Color('#00FF7f').getHex(), 0x00ff7f);
});

test('Color defaults to white and accepts RGB floats', () => {
	assert.equal(new Color().getHex(), 0xffffff);
	const c = new Color(0.5, 0.25, 1);
	assert.deepEqual(c.toArray(), [0.5, 0.25, 1]);
});

test('Color rejects bad input with a helpful error', () => {
	assert.throws(() => new Color(-1), /between 0x000000 and 0xffffff/);
	assert.throws(() => new Color(0x1000000), RangeError);
	assert.throws(() => new Color(1.5), RangeError);
	assert.throws(() => new Color('red'), /Unsupported color string "red"/);
	assert.throws(() => new Color(null), TypeError);
});

test('Color lerp, multiplyScalar, copy, equals', () => {
	const c = new Color(0, 0, 0).lerp(new Color(1, 0.5, 0.25), 0.5);
	assert.deepEqual(c.toArray(), [0.5, 0.25, 0.125]);
	assert.deepEqual(new Color(1, 1, 1).multiplyScalar(0.5).toArray(), [0.5, 0.5, 0.5]);
	assert.ok(new Color(0x123456).equals(new Color(0x123456).clone()));
	assert.ok(new Color().copy(new Color(0x00ff00)).equals(new Color('#0f0')));
});

test('Color getHex clamps out-of-range channels', () => {
	assert.equal(new Color(2, -1, 0.5).getHex(), 0xff0080);
});
