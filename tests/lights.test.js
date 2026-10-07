import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	AmbientLight, DirectionalLight, PointLight, Light, Object3D, Vector3, Matrix4, Color,
	Renderer, Scene, Mesh, PerspectiveCamera, SphereGeometry, BufferGeometry, BufferAttribute,
	LambertMaterial, BasicMaterial, NormalMaterial
} from '../src/index.js';
import { WebGLLights, MAX_DIRECTIONAL_LIGHTS, MAX_POINT_LIGHTS } from '../src/renderer/WebGLLights.js';
import { createMockCanvas, createMockGL } from './helpers/mockGL.js';
import { close, vecClose } from './helpers/assertions.js';

const IDENTITY_VIEW = new Matrix4();
const pack = (lights, view = IDENTITY_VIEW) => {
	const packed = new WebGLLights();
	for (const light of lights) { light.updateMatrixWorld(); packed.add(light, view); }
	return packed;
};

test('light classes have sensible defaults and validate their input', () => {
	const d = new DirectionalLight();
	assert.deepEqual([d.color.getHex(), d.intensity], [0xffffff, 1]);
	assert.deepEqual(d.position.toArray(), [0, 1, 0]);
	assert.ok(d.target instanceof Object3D);
	assert.ok(d.isLight && d.isDirectionalLight && new AmbientLight().isAmbientLight && new PointLight().isPointLight);

	const p = new PointLight('#ff0000', 2, 10, 1);
	assert.deepEqual([p.color.getHex(), p.intensity, p.distance, p.decay], [0xff0000, 2, 10, 1]);

	assert.throws(() => new AmbientLight(0xffffff, -1), /intensity/);
	assert.throws(() => new AmbientLight(0xffffff, NaN), RangeError);
	assert.throws(() => new PointLight(0xffffff, 1, -5), /distance/);
	assert.throws(() => new PointLight(0xffffff, 1, 0, -1), /decay/);
	assert.throws(() => new AmbientLight('nope'), /Unsupported color string/);
});

test('ambient lights are summed and premultiplied by intensity', () => {
	const lights = pack([new AmbientLight(0xff0000, 0.5), new AmbientLight(0x00ff00, 0.25)]);
	vecClose(lights.ambient, [0.5, 0.25, 0]);
	assert.equal(lights.count, 2);
});

test('directional light direction points from the target toward the light, in view space', () => {
	const light = new DirectionalLight(0xffffff, 1);
	light.position.set(0, 0, 10);
	vecClose(pack([light]).directionalDirection.slice(0, 3), [0, 0, 1], 1e-6);

	light.target.position.set(0, 0, 20); // target beyond the light: the direction toward the light flips to -Z
	vecClose(pack([light]).directionalDirection.slice(0, 3), [0, 0, -1], 1e-6);

	// Camera at +X looking at the origin has its right axis along -Z, so the world +Z direction
	// toward the light appears along view -X (and a light on the camera side appears along +Z).
	light.target.position.set(0, 0, 0);
	const view = new Matrix4().lookAt(new Vector3(5, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 1, 0));
	vecClose(pack([light], view).directionalDirection.slice(0, 3), [-1, 0, 0], 1e-6);
	light.position.set(10, 0, 0);
	vecClose(pack([light], view).directionalDirection.slice(0, 3), [0, 0, 1], 1e-6);
});

test('directional light follows its parent transform and a coincident target falls back to up', () => {
	const rig = new Object3D(), light = new DirectionalLight();
	rig.position.set(0, 0, 4);
	light.position.set(0, 0, 0);
	rig.add(light);
	rig.updateMatrixWorld();
	const first = new WebGLLights();
	first.add(light, IDENTITY_VIEW);
	vecClose(first.directionalDirection.slice(0, 3), [0, 0, 1], 1e-6);

	light.position.set(0, 0, -4); // world position equals target (origin)
	rig.updateMatrixWorld();
	const l = new WebGLLights();
	l.add(light, IDENTITY_VIEW);
	vecClose(l.directionalDirection.slice(0, 3), [0, 1, 0], 1e-6);
});

test('point lights are converted to view-space positions with color, range and decay', () => {
	const light = new PointLight(0x00ff00, 2, 12, 1.5);
	light.position.set(1, 2, 3);
	const view = new Matrix4().makeTranslation(0, 0, -10);
	const lights = pack([light], view);
	vecClose(lights.pointPosition.slice(0, 3), [1, 2, -7], 1e-6);
	vecClose(lights.pointColor.slice(0, 3), [0, 2, 0], 1e-6);
	vecClose(lights.pointParams.slice(0, 2), [12, 1.5], 1e-6);
	assert.equal(lights.pointCount, 1);
});

test('lights beyond the shader limit are ignored with a single warning', () => {
	const warnings = [];
	const warn = console.warn;
	console.warn = (m) => warnings.push(m);
	try {
		const many = [];
		for (let i = 0; i < MAX_DIRECTIONAL_LIGHTS + 3; i++) many.push(new DirectionalLight());
		for (let i = 0; i < MAX_POINT_LIGHTS + 2; i++) many.push(new PointLight());
		const lights = pack(many);
		assert.equal(lights.directionalCount, MAX_DIRECTIONAL_LIGHTS);
		assert.equal(lights.pointCount, MAX_POINT_LIGHTS);
		assert.equal(lights.count, MAX_DIRECTIONAL_LIGHTS + MAX_POINT_LIGHTS);
	} finally {
		console.warn = warn;
	}
	assert.equal(warnings.length, 1, 'warn once, not per light');
	assert.match(warnings[0], /Only the first 4/);
});

test('reset clears everything and unknown light types are rejected', () => {
	const lights = pack([new AmbientLight(), new DirectionalLight(), new PointLight()]);
	lights.reset();
	assert.deepEqual([lights.count, lights.directionalCount, lights.pointCount, ...lights.ambient], [0, 0, 0, 0, 0, 0]);
	assert.throws(() => pack([new Light()]), /Unsupported light type "Light"/);
});

// ---- renderer integration (mock GL) ----

function setup() {
	const gl = createMockGL();
	const renderer = new Renderer({ canvas: createMockCanvas({ gl }), pixelRatio: 1 });
	const scene = new Scene();
	const camera = new PerspectiveCamera(60, 1, 0.1, 100);
	camera.position.z = 5;
	return { gl, renderer, scene, camera };
}
const named = (gl, name) => gl.calls.filter((c) => c[0] === name);

test('LambertMaterial gets its own program; lights are uploaded once per frame, not per mesh', () => {
	const { gl, renderer, scene, camera } = setup();
	const sphere = new SphereGeometry(1, 8, 6);
	for (let i = 0; i < 3; i++) {
		const m = new Mesh(sphere, new LambertMaterial({ color: 0xff0000 }));
		m.position.x = i * 2 - 2;
		scene.add(m);
	}
	scene.add(new Mesh(sphere, new BasicMaterial()));
	scene.add(new AmbientLight(0xffffff, 0.2), new DirectionalLight(0xffffff, 1), new PointLight(0xffaa00, 1, 10));

	renderer.render(scene, camera);
	assert.equal(gl.livePrograms.size, 2);
	assert.equal(renderer.info.render.lights, 3);
	assert.equal(renderer.info.render.calls, 4);
	assert.equal(named(gl, 'uniform3fv').length, 5, 'ambient + 2 direction/color + 2 point position/color, once');

	renderer.render(scene, camera);
	assert.equal(named(gl, 'uniform3fv').length, 10);
});

test('invisible lights are ignored and lights under hidden parents are skipped', () => {
	const { renderer, scene, camera } = setup();
	scene.add(new Mesh(new SphereGeometry(1, 8, 6), new LambertMaterial()));
	const off = new DirectionalLight();
	off.visible = false;
	const hiddenGroup = new Object3D();
	hiddenGroup.visible = false;
	hiddenGroup.add(new PointLight());
	scene.add(off, hiddenGroup, new AmbientLight());
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.lights, 1);
});

test('lights can be nested under meshes and move with them', () => {
	const { renderer, scene, camera } = setup();
	const carrier = new Mesh(new SphereGeometry(1, 8, 6), new BasicMaterial());
	carrier.position.set(3, 0, 0);
	const light = new PointLight(0xffffff, 1);
	light.position.set(0, 2, 0);
	carrier.add(light);
	scene.add(carrier);
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.lights, 1);
	const view = camera.matrixWorldInverse;
	const expected = new Vector3(3, 2, 0).applyMatrix4(view);
	vecClose(renderer._lights.pointPosition.slice(0, 3), expected.toArray(), 1e-5);
});

test('materials that need normals fail clearly when the geometry has none', () => {
	const { renderer, scene, camera } = setup();
	const bare = new BufferGeometry();
	bare.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
	const mesh = new Mesh(bare, new LambertMaterial());
	scene.add(mesh);
	assert.throws(() => renderer.render(scene, camera), /LambertMaterial needs a "normal" attribute[\s\S]*computeVertexNormals/);

	mesh.material = new NormalMaterial();
	assert.throws(() => renderer.render(scene, camera), /NormalMaterial needs a "normal" attribute/);

	mesh.material = new BasicMaterial();
	renderer.render(scene, camera);
	bare.computeVertexNormals();
	mesh.material = new LambertMaterial();
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
});

test('LambertMaterial options and color handling', () => {
	const m = new LambertMaterial({ color: '#0f0', wireframe: true, opacity: 0.5 });
	assert.equal(m.type, 'LambertMaterial');
	assert.equal(m.color.getHex(), 0x00ff00);
	assert.equal(m.wireframe, true);
	assert.throws(() => new LambertMaterial({ emissive: 1 }), /"emissive" is not a property of LambertMaterial/);
});

test('light state survives a context restore (programs are recompiled, lights re-uploaded)', () => {
	const { gl, renderer, scene, camera } = setup();
	const canvas = renderer.domElement;
	scene.add(new Mesh(new SphereGeometry(1, 8, 6), new LambertMaterial()), new AmbientLight());
	renderer.render(scene, camera);
	const before = named(gl, 'uniform3fv').length;
	const warn = console.warn, info = console.info;
	console.warn = console.info = () => {};
	try {
		canvas.dispatch('webglcontextlost', { preventDefault() {} });
		canvas.dispatch('webglcontextrestored');
	} finally {
		console.warn = warn; console.info = info;
	}
	renderer.render(scene, camera);
	assert.ok(named(gl, 'uniform3fv').length > before);
});
