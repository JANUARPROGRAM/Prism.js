import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BasicMaterial, NormalMaterial, Material, FrontSide, DoubleSide, Color } from '../src/index.js';

test('BasicMaterial defaults', () => {
	const m = new BasicMaterial();
	assert.equal(m.type, 'BasicMaterial');
	assert.equal(m.opacity, 1);
	assert.equal(m.transparent, false);
	assert.equal(m.side, FrontSide);
	assert.equal(m.depthTest, true);
	assert.equal(m.depthWrite, true);
	assert.equal(m.wireframe, false);
	assert.equal(m.color.getHex(), 0xffffff);
});

test('BasicMaterial accepts hex, string and Color for `color` and copies the value', () => {
	assert.equal(new BasicMaterial({ color: 0xff0000 }).color.getHex(), 0xff0000);
	assert.equal(new BasicMaterial({ color: '#0f0' }).color.getHex(), 0x00ff00);
	const shared = new Color(0x0000ff);
	const m = new BasicMaterial({ color: shared });
	shared.set(0xffffff);
	assert.equal(m.color.getHex(), 0x0000ff, 'material must not alias the caller\'s Color');
});

test('options are applied; unknown options throw instead of being ignored', () => {
	const m = new BasicMaterial({ opacity: 0.5, transparent: true, side: DoubleSide, wireframe: true, depthWrite: false, depthTest: false });
	assert.deepEqual([m.opacity, m.transparent, m.side, m.wireframe, m.depthWrite, m.depthTest], [0.5, true, DoubleSide, true, false, false]);
	assert.throws(() => new BasicMaterial({ colour: 0xff0000 }), /"colour" is not a property of BasicMaterial/);
	assert.throws(() => new NormalMaterial({ color: 0xff0000 }), /"color" is not a property of NormalMaterial/);
});

test('materials get unique ids and distinct types', () => {
	const a = new BasicMaterial(), b = new BasicMaterial(), n = new NormalMaterial();
	assert.notEqual(a.id, b.id);
	assert.equal(n.type, 'NormalMaterial');
	assert.ok(a.isMaterial && a instanceof Material);
});

test('invalid color input fails loudly', () => {
	assert.throws(() => new BasicMaterial({ color: 'red' }), /Unsupported color string/);
	assert.throws(() => new BasicMaterial({ color: -5 }), RangeError);
});
