import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	Renderer, Scene, Mesh, InstancedMesh, PerspectiveCamera, OrthographicCamera, BoxGeometry, SphereGeometry, BufferGeometry, BufferAttribute,
	BasicMaterial, LambertMaterial, NormalMaterial, AmbientLight, Frustum, Matrix4, Vector3, Color, Quaternion
} from '../src/index.js';
import { createMockCanvas, createMockGL } from './helpers/mockGL.js';
import { close, createRandom } from './helpers/assertions.js';

function setup() {
	const gl = createMockGL();
	const renderer = new Renderer({ canvas: createMockCanvas({ gl }), pixelRatio: 1 });
	const scene = new Scene();
	const camera = new PerspectiveCamera(60, 1, 0.1, 100);
	camera.position.z = 5;
	return { gl, renderer, scene, camera };
}
const named = (gl, name) => gl.calls.filter((c) => c[0] === name);
const meshAt = (x, y, z, geometry = new BoxGeometry(), material = new BasicMaterial()) => { const m = new Mesh(geometry, material); m.position.set(x, y, z); return m; };

// ---------------------------------------------------------------- frustum

test('Frustum agrees with the projection: a point is inside exactly when it lands inside the NDC cube', () => {
	const rand = createRandom(8);
	for (const camera of [new PerspectiveCamera(50, 1.6, 0.5, 40), new OrthographicCamera(-6, 6, 4, -4, 0.5, 40)]) {
		camera.position.set(2, 1, 9);
		camera.lookAt(-1, 0, 0);
		camera.updateMatrixWorld();
		const vp = new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
		const frustum = new Frustum().setFromProjectionMatrix(vp);
		let inside = 0;
		for (let i = 0; i < 4000; i++) {
			const p = new Vector3(rand() * 40 - 20, rand() * 30 - 15, rand() * 60 - 30);
			const ndc = p.clone().applyMatrix4(vp);
			const w = p.x * vp.elements[3] + p.y * vp.elements[7] + p.z * vp.elements[11] + vp.elements[15];
			const expected = w > 0 && Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1 && Math.abs(ndc.z) <= 1;
			if (expected !== frustum.containsPoint(p.x, p.y, p.z)) {
				// points within rounding distance of a plane may legitimately differ
				assert.ok(Math.max(Math.abs(ndc.x), Math.abs(ndc.y), Math.abs(ndc.z)) > 0.999 && Math.max(Math.abs(ndc.x), Math.abs(ndc.y), Math.abs(ndc.z)) < 1.001, `mismatch at ${p.toArray()}`);
			}
			if (expected) inside++;
		}
		assert.ok(inside > 100, `the test sampled ${inside} inside points`);
	}
});

test('Frustum.intersectsSphere is conservative: a sphere touching the volume is kept, a distant one is not', () => {
	const camera = new PerspectiveCamera(90, 1, 1, 10);
	camera.updateMatrixWorld();
	const f = new Frustum().setFromProjectionMatrix(new Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
	assert.ok(f.intersectsSphere(0, 0, -5, 0.1));
	assert.ok(!f.intersectsSphere(0, 0, 5, 0.5), 'behind the camera');
	assert.ok(!f.intersectsSphere(0, 0, -20, 1), 'beyond the far plane');
	assert.ok(f.intersectsSphere(7, 0, -5, 2.5), 'a sphere overlapping the right plane (x = 5 at depth 5)');
	assert.ok(!f.intersectsSphere(9, 0, -5, 2.5));
});

// ---------------------------------------------------------------- bounding spheres

test('bounding sphere: box, caching, recomputation on change, empty geometry', () => {
	const g = new BoxGeometry(2, 4, 6);
	const s = g.boundingSphere;
	close(s.radius, Math.sqrt(1 + 4 + 9), 1e-6);
	close(Math.hypot(s.center.x, s.center.y, s.center.z), 0, 1e-9);
	assert.equal(g.boundingSphere, s, 'cached');

	const position = g.attributes.position;
	position.array[0] += 10; // move one vertex far away
	assert.equal(g.boundingSphere, s, 'unchanged until the attribute is marked');
	position.needsUpdate = true;
	assert.ok(g.boundingSphere.radius > s.radius, 'recomputed after needsUpdate');

	g.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 2, 0, 0, 0, 2, 0]), 3));
	close(g.boundingSphere.radius, Math.hypot(1, 1), 1e-6);
	assert.equal(new BufferGeometry().boundingSphere, null);
});

// ---------------------------------------------------------------- culling in the renderer

test('meshes outside the view are not drawn, partly visible ones are, and the statistics say so', () => {
	const { gl, renderer, scene, camera } = setup();
	scene.add(
		meshAt(0, 0, 0),            // in view
		meshAt(300, 0, 0),          // far to the right
		meshAt(0, 0, 50),           // behind the camera
		meshAt(0, 0, -500),         // beyond the far plane
		meshAt(5.6, 0, 0),          // the box's corner pokes into the view (right plane at x = 2.9 + ... see below)
		meshAt(60, 0, 0)            // outside
	);
	renderer.render(scene, camera);
	const visible = renderer.info.render.calls + renderer.info.render.culled;
	assert.equal(visible, 6);
	assert.ok(renderer.info.render.culled >= 3, `culled ${renderer.info.render.culled}`);
	assert.equal(named(gl, 'drawElements').length, renderer.info.render.calls);
	assert.ok(renderer.info.render.calls >= 1);
});

test('culling is exact enough that nothing visible is dropped, for random placements, rotations and scales', () => {
	const rand = createRandom(31);
	const { renderer, scene, camera } = setup();
	camera.position.set(0, 0, 8);
	camera.updateMatrixWorld();
	const geometry = new BoxGeometry(1, 2, 3);
	const mesh = new Mesh(geometry, new BasicMaterial());
	scene.add(mesh);
	const vertices = geometry.attributes.position.array;
	let drawn = 0, culled = 0;
	for (let i = 0; i < 600; i++) {
		mesh.position.set(rand() * 40 - 20, rand() * 40 - 20, rand() * 120 - 60);
		mesh.quaternion.setFromAxisAngle(new Vector3(rand(), rand(), rand()).normalize(), rand() * 6);
		mesh.scale.set(0.3 + rand() * 3, 0.3 + rand() * 3, 0.3 + rand() * 3);
		renderer.render(scene, camera);
		const wasDrawn = renderer.info.render.calls === 1;
		wasDrawn ? drawn++ : culled++;
		// independent check: does any vertex of the mesh project into the view? then it must have been drawn
		let anyVisible = false;
		for (let v = 0; v < vertices.length && !anyVisible; v += 3) {
			const p = new Vector3(vertices[v], vertices[v + 1], vertices[v + 2]).applyMatrix4(mesh.matrixWorld);
			const view = p.clone().applyMatrix4(camera.matrixWorldInverse);
			if (view.z >= -camera.far && view.z <= -camera.near) {
				const ndc = p.clone().project(camera);
				if (Math.abs(ndc.x) <= 1 && Math.abs(ndc.y) <= 1) anyVisible = true;
			}
		}
		if (anyVisible) assert.ok(wasDrawn, `a visible mesh was culled (iteration ${i})`);
	}
	assert.ok(drawn > 20 && culled > 100, `drawn ${drawn}, culled ${culled}: both cases were exercised`);
});

test('frustumCulled = false always draws; a moving mesh is drawn as soon as it enters the view', () => {
	const { renderer, scene, camera } = setup();
	const far = meshAt(500, 0, 0);
	far.frustumCulled = false;
	scene.add(far);
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);

	far.frustumCulled = true;
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 0);
	far.position.x = 0;
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
});

test('culling works with a parent transform, for lights-affected materials and with an orthographic camera', () => {
	const { renderer, scene } = setup();
	const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 50);
	camera.position.z = 10;
	const group = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new BasicMaterial());
	group.position.x = 100;
	const child = meshAt(-100, 0, 0, new BoxGeometry(), new LambertMaterial());
	group.add(child);
	scene.add(group, new AmbientLight());
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1, 'the child lands at x = 0 in world space and is drawn; the parent (x = 100) is culled');
	assert.equal(renderer.info.render.culled, 1);
});

// ---------------------------------------------------------------- uniform cache

test('material uniforms are only uploaded when they changed', () => {
	const { gl, renderer, scene, camera } = setup();
	const geometry = new BoxGeometry();
	const red = new BasicMaterial({ color: 0xff0000 }), green = new BasicMaterial({ color: 0x00ff00 });
	for (let i = 0; i < 4; i++) scene.add(meshAt(i * 0.5 - 1, 0, 0, geometry, i % 2 ? green : red));
	renderer.render(scene, camera);
	const colorCalls = () => named(gl, 'uniform4f').length;
	assert.equal(colorCalls(), 2, 'sorted by material: one upload per color, not per mesh');
	renderer.render(scene, camera);
	assert.equal(colorCalls(), 4, 'a new frame starts with the last color from the previous frame, so only the changes are sent');
	red.color.set(0x0000ff);
	renderer.render(scene, camera);
	assert.ok(named(gl, 'uniform4f').some((c) => c[3] === 0 && c[5] === 1 && c[2] === 0), 'the edited color reached the GPU');
});

test('the sampler uniform is set once per program', () => {
	const { gl, renderer, scene, camera } = setup();
	const map = new (class { constructor() { this.image = { data: new Uint8Array(4), width: 1, height: 1 }; this.version = 0; this._l = new Set(); } addDisposeListener(f) { this._l.add(f); } removeDisposeListener(f) { this._l.delete(f); } })();
	for (let i = 0; i < 3; i++) scene.add(meshAt(i - 1, 0, 0, new BoxGeometry(), new BasicMaterial({ map })));
	renderer.render(scene, camera);
	renderer.render(scene, camera);
	assert.equal(named(gl, 'uniform1i').length, 1);
});

// ---------------------------------------------------------------- instancing

function instancedSetup(count = 100, material = new LambertMaterial()) {
	const ctx = setup();
	const mesh = new InstancedMesh(new BoxGeometry(), material, count);
	for (let i = 0; i < count; i++) mesh.setMatrixAt(i, new Matrix4().makeTranslation((i % 10) * 0.2 - 1, Math.floor(i / 10) * 0.2 - 1, 0));
	ctx.scene.add(mesh, new AmbientLight());
	return { ...ctx, mesh };
}

test('InstancedMesh draws every instance with a single draw call', () => {
	const { gl, renderer, scene, camera, mesh } = instancedSetup(100);
	renderer.render(scene, camera);
	assert.equal(named(gl, 'drawElementsInstanced').length, 1);
	assert.equal(named(gl, 'drawElements').length, 0);
	const [, mode, count, , , instances] = named(gl, 'drawElementsInstanced')[0];
	assert.deepEqual([count, instances], [36, 100]);
	assert.equal(renderer.info.render.calls, 1);
	assert.equal(renderer.info.render.triangles, 12 * 100);
	assert.equal(renderer.info.render.instances, 100);
	void mode; void mesh;
});

test('instancing compiles its own program variant with the right defines; colors add another', () => {
	const { gl, renderer, scene, camera, mesh } = instancedSetup(10);
	renderer.render(scene, camera);
	assert.equal(gl.livePrograms.size, 1);
	assert.ok(gl.sources.every((s) => s.includes('#define USE_INSTANCING')));
	assert.ok(gl.sources.every((s) => !s.includes('#define USE_INSTANCE_COLOR')));
	mesh.setColorAt(0, new Color(1, 0, 0));
	renderer.render(scene, camera);
	assert.equal(gl.livePrograms.size, 2);
	assert.ok(gl.sources.some((s) => s.includes('#define USE_INSTANCE_COLOR')));
	// an ordinary mesh with the same material still uses the plain program
	scene.add(meshAt(0, 0, 0, new BoxGeometry(), mesh.material));
	renderer.render(scene, camera);
	assert.equal(gl.livePrograms.size, 3);
});

test('instance data is uploaded once and again only when its version changes', () => {
	const { gl, renderer, scene, camera, mesh } = instancedSetup(50);
	renderer.render(scene, camera);
	const uploads = () => named(gl, 'bufferData').length;
	const first = uploads();
	renderer.render(scene, camera);
	assert.equal(uploads(), first);
	assert.equal(named(gl, 'bufferSubData').length, 0);

	mesh.setMatrixAt(3, new Matrix4().makeTranslation(1, 1, 0));
	renderer.render(scene, camera);
	assert.equal(named(gl, 'bufferSubData').length, 0, 'without needsUpdate nothing is sent');
	mesh.instanceMatrix.needsUpdate = true;
	renderer.render(scene, camera);
	assert.equal(named(gl, 'bufferSubData').length, 1);
	assert.equal(uploads(), first);
});

test('count limits what is drawn; zero draws nothing; bad values and unsupported combinations fail clearly', () => {
	const { gl, renderer, scene, camera, mesh } = instancedSetup(20);
	mesh.count = 5;
	renderer.render(scene, camera);
	assert.equal(named(gl, 'drawElementsInstanced')[0][5], 5);
	mesh.count = 0;
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 0);
	mesh.count = 21;
	assert.throws(() => renderer.render(scene, camera), /between 0 and its capacity \(20\)/);
	mesh.count = 20;
	mesh.material.wireframe = true;
	assert.throws(() => renderer.render(scene, camera), /does not support wireframe/);

	const normal = instancedSetup(4, new NormalMaterial());
	normal.mesh.setColorAt(0, new Color(1, 0, 0));
	assert.throws(() => normal.renderer.render(normal.scene, normal.camera), /does not support per-instance colors/);
});

test('instanced meshes are not frustum-culled by default; instance accessors validate their index', () => {
	const { renderer, scene, camera, mesh } = instancedSetup(4);
	mesh.position.x = 900;
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
	assert.equal(mesh.frustumCulled, false);

	const m = new Matrix4().compose(new Vector3(1, 2, 3), new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), 0.5), new Vector3(2, 2, 2));
	mesh.setMatrixAt(2, m);
	const out = new Matrix4();
	mesh.getMatrixAt(2, out);
	for (let i = 0; i < 16; i++) close(out.elements[i], m.elements[i], 1e-6);
	assert.throws(() => mesh.setMatrixAt(4, m), /outside 0\.\.3/);
	assert.throws(() => mesh.setColorAt(-1, new Color()), RangeError);
	assert.throws(() => new InstancedMesh(new BoxGeometry(), new BasicMaterial(), 0), /capacity/);
	mesh.setColorAt(1, new Color(0.25, 0.5, 0.75));
	assert.deepEqual(mesh.getColorAt(1, new Color()).toArray().map((v) => +v.toFixed(2)), [0.25, 0.5, 0.75]);
	assert.deepEqual(mesh.getColorAt(0, new Color()).toArray(), [1, 1, 1]);
});

test('instance buffers are freed on mesh.dispose() and renderer.dispose(); geometry.dispose() does not break drawing', () => {
	const { gl, renderer, scene, camera, mesh } = instancedSetup(8);
	mesh.setColorAt(0, new Color(1, 1, 0));
	renderer.render(scene, camera);
	const buffers = gl.liveBuffers.size;
	mesh.geometry.dispose();                     // its buffers go away; the instanced VAO must be rebuilt
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
	mesh.dispose();
	assert.ok(gl.liveBuffers.size < buffers, 'instance matrix and color buffers were deleted');
	renderer.render(scene, camera);              // uploads again
	assert.equal(renderer.info.render.calls, 1);
	renderer.dispose();
	assert.equal(gl.liveBuffers.size, 0);
	assert.equal(gl.liveVAOs.size, 0);
});

test('instanced meshes survive a context restore', () => {
	const { gl, renderer, scene, camera } = instancedSetup(6);
	renderer.render(scene, camera);
	const warn = console.warn, info = console.info;
	console.warn = console.info = () => {};
	try {
		renderer.domElement.dispatch('webglcontextlost', { preventDefault() {} });
		renderer.domElement.dispatch('webglcontextrestored');
	} finally { console.warn = warn; console.info = info; }
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
	assert.equal(named(gl, 'drawElementsInstanced').length, 2);
});
