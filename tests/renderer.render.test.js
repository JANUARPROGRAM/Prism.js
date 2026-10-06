import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	Renderer, Scene, Mesh, PerspectiveCamera, BoxGeometry, SphereGeometry, BasicMaterial, NormalMaterial,
	Material, Color, DoubleSide, BackSide
} from '../src/index.js';
import { createMockCanvas, createMockGL } from './helpers/mockGL.js';

function setup() {
	const gl = createMockGL();
	const canvas = createMockCanvas({ gl });
	const renderer = new Renderer({ canvas, pixelRatio: 1 });
	const scene = new Scene();
	const camera = new PerspectiveCamera(60, 1, 0.1, 100);
	return { gl, canvas, renderer, scene, camera };
}
const named = (gl, name) => gl.calls.filter((c) => c[0] === name);
const meshAt = (geometry, material, z, x = 0) => {
	const m = new Mesh(geometry, material);
	m.position.set(x, 0, z);
	return m;
};

test('render() validates its arguments', () => {
	const { renderer, scene, camera } = setup();
	assert.throws(() => renderer.render({}, camera), /expects a Scene/);
	assert.throws(() => renderer.render(scene, {}), /expects a Camera/);
	assert.throws(() => renderer.render(scene), /expects a Camera/);
});

test('draws every visible mesh once and reports draw statistics', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	scene.add(meshAt(box, new BasicMaterial(), -5), meshAt(box, new BasicMaterial(), -8, 2));
	renderer.render(scene, camera);

	assert.equal(named(gl, 'drawElements').length, 2);
	assert.equal(renderer.info.render.calls, 2);
	assert.equal(renderer.info.render.triangles, 24);
	assert.equal(renderer.info.render.frame, 1);
	// Counters describe the last frame, not a running total.
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 2);
	assert.equal(renderer.info.render.frame, 2);
});

test('programs are compiled once per material type and never again on later frames', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	scene.add(
		meshAt(box, new BasicMaterial({ color: 0xff0000 }), -5),
		meshAt(box, new BasicMaterial({ color: 0x00ff00 }), -6),
		meshAt(box, new NormalMaterial(), -7)
	);
	renderer.render(scene, camera);
	assert.equal(gl.livePrograms.size, 2, 'one program per material type');
	assert.equal(renderer.info.memory.programs, 2);
	const compiled = gl.shaderCount;
	assert.equal(compiled, 4);

	for (let i = 0; i < 5; i++) renderer.render(scene, camera);
	assert.equal(gl.shaderCount, compiled, 'no recompilation across frames');
	assert.equal(gl.livePrograms.size, 2);
});

test('a material type without a shader fails with a useful message', () => {
	const { renderer, scene, camera } = setup();
	const material = new Material();
	scene.add(meshAt(new BoxGeometry(), material, -5));
	assert.throws(() => renderer.render(scene, camera), /No shader is available for material type "Material"[\s\S]*BasicMaterial/);
});

test('opaque draws are grouped by program so the program is bound once per frame', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	const basicA = new BasicMaterial(), basicB = new BasicMaterial(), normal = new NormalMaterial();
	// Interleaved on purpose: basic, normal, basic, normal
	scene.add(meshAt(box, basicA, -5), meshAt(box, normal, -6), meshAt(box, basicB, -7), meshAt(box, normal, -8));
	renderer.render(scene, camera);
	assert.equal(named(gl, 'useProgram').length, 2);
});

test('GL state changes are cached across draws and frames', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	for (let i = 0; i < 4; i++) scene.add(meshAt(box, new BasicMaterial(), -5 - i, i - 2));
	for (let i = 0; i < 3; i++) renderer.render(scene, camera);

	const enables = (cap) => named(gl, 'enable').filter((c) => c[1] === cap).length;
	assert.equal(enables(gl.DEPTH_TEST), 1);
	assert.equal(enables(gl.CULL_FACE), 1);
	assert.equal(named(gl, 'disable').filter((c) => c[1] === gl.BLEND).length, 0);
	assert.equal(named(gl, 'cullFace').length, 1);
	// Projection uniform: once per frame for the program, not once per mesh.
	assert.equal(named(gl, 'uniformMatrix4fv').length, 3 * (1 + 4));
});

test('geometry is uploaded once and only re-uploaded when an attribute version changes', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	scene.add(meshAt(box, new BasicMaterial(), -5), meshAt(box, new NormalMaterial(), -6, 1));
	renderer.render(scene, camera);

	const uploads = () => named(gl, 'bufferData').length;
	const first = uploads();
	// position + normal + uv + index, uploaded once for the geometry shared by both meshes
	assert.equal(first, 4);
	assert.equal(renderer.info.memory.geometries, 1);

	renderer.render(scene, camera);
	assert.equal(uploads(), first);

	box.attributes.position.array[0] += 0.1;
	box.attributes.position.needsUpdate = true;
	renderer.render(scene, camera);
	assert.equal(uploads(), first, 'same-size update uses bufferSubData');
	assert.equal(named(gl, 'bufferSubData').length, 1);
});

test('transparent objects are drawn after opaque ones, far to near', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	const ghost = (z) => new BasicMaterial({ transparent: true, depthWrite: false, opacity: 0.5 });
	scene.add(
		meshAt(box, ghost(), -5),
		meshAt(box, new BasicMaterial(), -20),
		meshAt(box, ghost(), -15),
		meshAt(box, ghost(), -10)
	);
	renderer.render(scene, camera);

	// modelView translation z (element 14) of each draw, in draw order
	const order = named(gl, 'drawElements').map((c) => c[5][14]);
	assert.deepEqual(order, [-20, -15, -10, -5]);
	assert.ok(named(gl, 'enable').some((c) => c[1] === gl.BLEND));
});

test('opaque meshes of the same material are drawn front to back', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry(), material = new BasicMaterial();
	scene.add(meshAt(box, material, -30), meshAt(box, material, -10), meshAt(box, material, -20));
	renderer.render(scene, camera);
	assert.deepEqual(named(gl, 'drawElements').map((c) => c[5][14]), [-10, -20, -30]);
});

test('depth write is restored before clearing so the depth buffer really is cleared', () => {
	const { gl, renderer, scene, camera } = setup();
	scene.add(meshAt(new BoxGeometry(), new BasicMaterial({ transparent: true, depthWrite: false }), -5));
	renderer.render(scene, camera);
	gl.calls.length = 0;
	renderer.render(scene, camera);

	const clearIndex = gl.calls.findIndex((c) => c[0] === 'clear');
	const maskBefore = gl.calls.slice(0, clearIndex).findLast((c) => c[0] === 'depthMask');
	assert.deepEqual(maskBefore, ['depthMask', true]);
});

test('material.side selects the culling mode', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	const mesh = meshAt(box, new BasicMaterial(), -5);
	scene.add(mesh);

	renderer.render(scene, camera);
	assert.deepEqual(named(gl, 'cullFace').at(-1), ['cullFace', gl.BACK]);

	mesh.material.side = BackSide;
	renderer.render(scene, camera);
	assert.deepEqual(named(gl, 'cullFace').at(-1), ['cullFace', gl.FRONT]);

	mesh.material.side = DoubleSide;
	renderer.render(scene, camera);
	assert.equal(named(gl, 'disable').filter((c) => c[1] === gl.CULL_FACE).length, 1);
});

test('wireframe draws a deduplicated line list instead of triangles', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	const mesh = meshAt(box, new BasicMaterial({ wireframe: true }), -5);
	scene.add(mesh);
	renderer.render(scene, camera);

	const draw = named(gl, 'drawElements')[0];
	assert.equal(draw[1], gl.LINES);
	assert.equal(draw[2], 60, '6 faces x 5 unique edges x 2 indices');
	assert.equal(renderer.info.render.lines, 30);
	assert.equal(renderer.info.render.triangles, 0);

	const lineBuffers = named(gl, 'bufferData').length;
	renderer.render(scene, camera);
	assert.equal(named(gl, 'bufferData').length, lineBuffers, 'line index is cached');
});

test('invisible meshes, materials and subtrees are skipped', () => {
	const { renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	const hiddenMesh = meshAt(box, new BasicMaterial(), -5);
	hiddenMesh.visible = false;
	const hiddenMaterial = meshAt(box, new BasicMaterial(), -6);
	hiddenMaterial.material.visible = false;
	const group = new Mesh(box, new BasicMaterial());
	group.visible = false;
	group.add(meshAt(box, new BasicMaterial(), -7));
	scene.add(hiddenMesh, hiddenMaterial, group, meshAt(box, new BasicMaterial(), -8));
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
});

test('scene.background overrides the clear color for the frame only', () => {
	const { gl, renderer, scene, camera } = setup();
	renderer.setClearColor(0x000000);
	scene.background = new Color(0x0000ff);
	renderer.render(scene, camera);
	assert.deepEqual(named(gl, 'clearColor').at(-1), ['clearColor', 0, 0, 1, 1]);

	scene.background = null;
	renderer.render(scene, camera);
	assert.deepEqual(named(gl, 'clearColor').at(-1), ['clearColor', 0, 0, 0, 1]);
});

test('autoClear = false leaves the framebuffer alone', () => {
	const { gl, renderer, scene, camera } = setup();
	renderer.autoClear = false;
	renderer.render(scene, camera);
	assert.equal(named(gl, 'clear').length, 0);
});

test('geometry.dispose() frees its GPU buffers; drawing again re-uploads', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry(), sphere = new SphereGeometry();
	scene.add(meshAt(box, new BasicMaterial(), -5), meshAt(sphere, new BasicMaterial(), -6, 2));
	renderer.render(scene, camera);
	const buffersBoth = gl.liveBuffers.size, vaosBoth = gl.liveVAOs.size;
	assert.equal(vaosBoth, 2);

	box.dispose();
	assert.equal(gl.liveVAOs.size, 1);
	assert.equal(gl.liveBuffers.size, buffersBoth - 4);
	assert.equal(renderer.info.memory.geometries, 1);

	renderer.render(scene, camera);
	assert.equal(gl.liveVAOs.size, 2);
	assert.equal(gl.liveBuffers.size, buffersBoth);
});

test('renderer.dispose() releases every GPU object it created', () => {
	const { gl, renderer, scene, camera } = setup();
	scene.add(
		meshAt(new BoxGeometry(), new BasicMaterial({ wireframe: true }), -5),
		meshAt(new SphereGeometry(), new NormalMaterial(), -6, 2)
	);
	renderer.render(scene, camera);
	assert.ok(gl.liveBuffers.size > 0 && gl.liveVAOs.size > 0 && gl.livePrograms.size > 0);

	renderer.dispose();
	assert.equal(gl.liveBuffers.size, 0);
	assert.equal(gl.liveVAOs.size, 0);
	assert.equal(gl.livePrograms.size, 0);
	assert.equal(gl.liveShaders.size, 0);
	assert.throws(() => renderer.render(scene, camera), /disposed/);
});

test('after a context restore programs and buffers are rebuilt automatically', () => {
	const { gl, canvas, renderer, scene, camera } = setup();
	scene.add(meshAt(new BoxGeometry(), new BasicMaterial(), -5));
	renderer.render(scene, camera);
	const shaders = gl.shaderCount, buffers = named(gl, 'bufferData').length;

	const warn = console.warn, info = console.info;
	console.warn = console.info = () => {};
	try {
		canvas.dispatch('webglcontextlost', { preventDefault() {} });
		const callsBefore = renderer.info.render.calls;
		renderer.render(scene, camera); // must be a safe no-op while lost
		assert.equal(renderer.info.render.calls, callsBefore);

		canvas.dispatch('webglcontextrestored');
		renderer.render(scene, camera);
	} finally {
		console.warn = warn;
		console.info = info;
	}
	assert.equal(gl.shaderCount, shaders + 2, 'program recompiled once');
	assert.equal(named(gl, 'bufferData').length, buffers * 2, 'geometry uploaded again');
	assert.equal(renderer.info.render.calls, 1);
});

test('a mesh whose geometry lacks positions fails with a clear error', () => {
	const { renderer, scene, camera } = setup();
	scene.add(new Mesh());
	assert.throws(() => renderer.render(scene, camera), /without a "position" attribute/);
});

test('steady-state frames reuse render items (pool does not grow)', () => {
	const { renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	for (let i = 0; i < 20; i++) scene.add(meshAt(box, new BasicMaterial(), -5 - i));
	renderer.render(scene, camera);
	const items = renderer._list._pool.length;
	for (let i = 0; i < 10; i++) renderer.render(scene, camera);
	assert.equal(renderer._list._pool.length, items);
	assert.equal(items, 20);
});
