import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Renderer } from '../src/index.js';
import { createMockCanvas, createMockGL } from './helpers/mockGL.js';

function lastCall(gl, name) {
	return gl.calls.findLast((call) => call[0] === name);
}

test('requests a WebGL2 context with the configured attributes', () => {
	const canvas = createMockCanvas();
	new Renderer({ canvas, antialias: false, alpha: true, pixelRatio: 1 });

	assert.equal(canvas.contextRequests.length, 1);
	assert.equal(canvas.contextRequests[0].type, 'webgl2');
	assert.deepEqual(canvas.contextRequests[0].attributes, {
		alpha: true,
		antialias: false,
		depth: true,
		stencil: false,
		powerPreference: 'default',
		preserveDrawingBuffer: false
	});
});

test('throws a descriptive error when WebGL2 is unavailable', () => {
	const canvas = createMockCanvas({ gl: null, creationError: 'blocklisted GPU' });

	assert.throws(
		() => new Renderer({ canvas }),
		(error) => {
			assert.match(error.message, /^Prism\.js: Failed to create a WebGL2 context\./);
			assert.match(error.message, /Browser message:\nblocklisted GPU/);
			return true;
		}
	);
	assert.equal(canvas.listenerCount('webglcontextcreationerror'), 0, 'probe listener must be removed');
});

test('rejects a missing or invalid canvas', () => {
	assert.throws(() => new Renderer({ canvas: null }), /must be an HTMLCanvasElement/);
	assert.throws(() => new Renderer({ canvas: {} }), /must be an HTMLCanvasElement/);
	// With no `canvas` option and no DOM (Node), the error must say so.
	assert.throws(() => new Renderer(), /`document` is not available/);
});

test('exposes context capabilities for debugging', () => {
	const renderer = new Renderer({ canvas: createMockCanvas(), pixelRatio: 1 });
	assert.equal(renderer.capabilities.maxTextureSize, 4096);
	assert.equal(renderer.capabilities.maxVertexAttributes, 16);
	assert.ok(Object.isFrozen(renderer.capabilities));
});

test('setSize scales the drawing buffer by pixelRatio and updates viewport and style', () => {
	const gl = createMockGL();
	const canvas = createMockCanvas({ gl });
	const renderer = new Renderer({ canvas, pixelRatio: 2 });

	renderer.setSize(100, 50);
	assert.equal(canvas.width, 200);
	assert.equal(canvas.height, 100);
	assert.equal(canvas.style.width, '100px');
	assert.equal(canvas.style.height, '50px');
	assert.deepEqual(lastCall(gl, 'viewport'), ['viewport', 0, 0, 200, 100]);

	renderer.setPixelRatio(1);
	assert.equal(canvas.width, 100);
	assert.deepEqual(lastCall(gl, 'viewport'), ['viewport', 0, 0, 100, 50]);
});

test('setSize validates its arguments', () => {
	const renderer = new Renderer({ canvas: createMockCanvas(), pixelRatio: 1 });
	assert.throws(() => renderer.setSize(0, 10), RangeError);
	assert.throws(() => renderer.setSize(10, NaN), RangeError);
	assert.throws(() => renderer.setPixelRatio(-1), RangeError);
});

test('resizeToDisplaySize follows the CSS size once and then reports no change', () => {
	const canvas = createMockCanvas({ clientWidth: 400, clientHeight: 300 });
	const renderer = new Renderer({ canvas, pixelRatio: 1.5 });

	assert.equal(renderer.resizeToDisplaySize(), true);
	assert.equal(canvas.width, 600);
	assert.equal(canvas.height, 450);
	assert.equal(canvas.style.width, undefined, 'must not override CSS sizing');
	assert.equal(renderer.resizeToDisplaySize(), false);
});

test('resizeToDisplaySize ignores hidden (zero-sized) canvases', () => {
	const canvas = createMockCanvas({ clientWidth: 0, clientHeight: 0 });
	const renderer = new Renderer({ canvas, pixelRatio: 1 });
	assert.equal(renderer.resizeToDisplaySize(), false);
	assert.equal(canvas.width, 300);
});

test('setClearColor converts 0xRRGGBB to floats and clear() uses the requested buffers', () => {
	const gl = createMockGL();
	const renderer = new Renderer({ canvas: createMockCanvas({ gl }), pixelRatio: 1 });

	renderer.setClearColor(0xff8000, 0.5);
	assert.deepEqual(lastCall(gl, 'clearColor'), ['clearColor', 1, 128 / 255, 0, 0.5]);

	renderer.clear();
	assert.deepEqual(lastCall(gl, 'clear'), ['clear', gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT]);
	renderer.clear(true, false, true);
	assert.deepEqual(lastCall(gl, 'clear'), ['clear', gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT]);

	const clearsBefore = gl.calls.filter((c) => c[0] === 'clear').length;
	renderer.clear(false, false, false);
	assert.equal(gl.calls.filter((c) => c[0] === 'clear').length, clearsBefore, 'empty mask must not call gl.clear');
});

test('setClearColor rejects values that are not 24-bit integers', () => {
	const renderer = new Renderer({ canvas: createMockCanvas(), pixelRatio: 1 });
	assert.throws(() => renderer.setClearColor(-1), RangeError);
	assert.throws(() => renderer.setClearColor(0x1000000), RangeError);
	assert.throws(() => renderer.setClearColor(1.5), RangeError);
	assert.throws(() => renderer.setClearColor('#ff0000'), RangeError);
	assert.throws(() => renderer.setClearColor(0xffffff, 2), RangeError);
});

test('context loss is prevented from being final and state is reapplied on restore', () => {
	const gl = createMockGL();
	const canvas = createMockCanvas({ gl });
	const renderer = new Renderer({ canvas, pixelRatio: 1 });
	renderer.setClearColor(0x0000ff);

	const warn = console.warn;
	const info = console.info;
	console.warn = console.info = () => {};
	try {
		let prevented = false;
		canvas.dispatch('webglcontextlost', { preventDefault: () => (prevented = true) });
		assert.equal(prevented, true);
		assert.equal(renderer.contextLost, true);

		gl.calls.length = 0;
		canvas.dispatch('webglcontextrestored');
		assert.equal(renderer.contextLost, false);
		assert.deepEqual(lastCall(gl, 'clearColor'), ['clearColor', 0, 0, 1, 1]);
		assert.ok(lastCall(gl, 'viewport'));
	} finally {
		console.warn = warn;
		console.info = info;
	}
});

test('dispose removes listeners and blocks further use', () => {
	const canvas = createMockCanvas();
	const renderer = new Renderer({ canvas, pixelRatio: 1 });
	assert.equal(canvas.listenerCount('webglcontextlost'), 1);

	renderer.dispose();
	renderer.dispose();
	assert.equal(canvas.listenerCount('webglcontextlost'), 0);
	assert.equal(canvas.listenerCount('webglcontextrestored'), 0);
	assert.throws(() => renderer.clear(), /Renderer has been disposed/);
	assert.throws(() => renderer.setSize(10, 10), /Renderer has been disposed/);
});
