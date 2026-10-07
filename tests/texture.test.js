import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
	Texture, TextureLoader, Renderer, Scene, Mesh, PerspectiveCamera, BoxGeometry, BufferGeometry, BufferAttribute,
	BasicMaterial, LambertMaterial, NormalMaterial, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter,
	RepeatWrapping
} from '../src/index.js';
import { createMockCanvas, createMockGL } from './helpers/mockGL.js';

const rgba = (w, h) => ({ data: new Uint8Array(w * h * 4), width: w, height: h });

class FakeImage {
	set src(value) {
		this._src = value;
		queueMicrotask(() => (value.includes('bad') ? this.onerror?.() : this.onload?.()));
	}
	get src() { return this._src; }
}
const fakeLoader = () => {
	const loader = new TextureLoader();
	loader._createImage = () => new FakeImage();
	return loader;
};

test('Texture defaults and versioning', () => {
	const t = new Texture();
	assert.equal(t.image, null);
	assert.deepEqual([t.wrapS, t.wrapT, t.magFilter, t.minFilter], [ClampToEdgeWrapping, ClampToEdgeWrapping, LinearFilter, LinearMipmapLinearFilter]);
	assert.deepEqual([t.generateMipmaps, t.flipY, t.version], [true, true, 0]);
	t.needsUpdate = true;
	t.needsUpdate = false;
	assert.equal(t.version, 1);
	let disposed = 0;
	const listener = () => disposed++;
	t.addDisposeListener(listener);
	t.dispose();
	t.removeDisposeListener(listener);
	t.dispose();
	assert.equal(disposed, 1);
});

test('TextureLoader.load returns at once and fills the image when loading finishes', async () => {
	const loader = fakeLoader();
	loader.crossOrigin = 'use-credentials';
	let loaded;
	const t = loader.load('a/pic.png', (tex) => { loaded = tex; });
	assert.equal(t.image, null);
	assert.equal(t.version, 0);
	await Promise.resolve();
	assert.equal(loaded, t);
	assert.ok(t.image instanceof FakeImage);
	assert.equal(t.image.crossOrigin, 'use-credentials');
	assert.equal(t.image.src, 'a/pic.png');
	assert.equal(t.version, 1, 'needsUpdate was set');
});

test('TextureLoader reports failures through onError, console.error, or a rejected promise', async () => {
	const loader = fakeLoader();
	const error = await new Promise((resolve) => loader.load('bad.png', undefined, resolve));
	assert.match(error.message, /Failed to load texture "bad.png"/);
	await assert.rejects(loader.loadAsync('bad2.png'), /Failed to load texture "bad2.png"/);
	const texture = await loader.loadAsync('good.png');
	assert.ok(texture.image);

	const logged = [];
	const original = console.error;
	console.error = (e) => logged.push(e);
	try { loader.load('bad3.png'); await new Promise((r) => setTimeout(r, 0)); } finally { console.error = original; }
	assert.equal(logged.length, 1);
});

test('TextureLoader applies the URL modifier and explains a missing Image class', () => {
	const loader = fakeLoader().setURLModifier((url) => `data:fake/${url}`);
	assert.equal(loader.load('x.png').name, 'x.png');
	const plain = new TextureLoader();
	assert.throws(() => plain.load('x.png'), /needs a browser environment/);
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
const texImages = (gl) => named(gl, 'texImage2D');

test('a ready texture is uploaded once, with flipY and mipmaps, and re-uploaded only when versioned', () => {
	const { gl, renderer, scene, camera } = setup();
	const map = new Texture(rgba(4, 4));
	scene.add(new Mesh(new BoxGeometry(), new BasicMaterial({ map })));
	renderer.render(scene, camera);

	assert.equal(texImages(gl).length, 1);
	const upload = texImages(gl)[0];
	assert.deepEqual(upload.slice(4, 7), [4, 4, 0], 'width, height, border');
	assert.ok(named(gl, 'pixelStorei').some((c) => c[1] === gl.UNPACK_FLIP_Y_WEBGL && c[2] === true));
	assert.equal(named(gl, 'generateMipmap').length, 1);
	assert.equal(renderer.info.memory.textures, 1);

	renderer.render(scene, camera);
	assert.equal(texImages(gl).length, 1, 'no re-upload without needsUpdate');

	map.needsUpdate = true;
	renderer.render(scene, camera);
	assert.equal(texImages(gl).length, 2);
});

test('texture parameters come from the Texture; mipmap filters fall back when mipmaps are off', () => {
	const { gl, renderer, scene, camera } = setup();
	const map = new Texture(rgba(2, 2));
	map.wrapS = RepeatWrapping;
	map.generateMipmaps = false;
	scene.add(new Mesh(new BoxGeometry(), new BasicMaterial({ map })));
	renderer.render(scene, camera);

	const param = (name) => named(gl, 'texParameteri').find((c) => c[2] === gl[name])?.[3];
	assert.equal(param('TEXTURE_WRAP_S'), RepeatWrapping);
	assert.equal(param('TEXTURE_WRAP_T'), ClampToEdgeWrapping);
	assert.equal(param('TEXTURE_MIN_FILTER'), gl.LINEAR, 'LinearMipmapLinear without mipmaps would be incomplete');
	assert.equal(named(gl, 'generateMipmap').length, 0);
});

test('while the image is missing or loading a 1x1 white placeholder is used, then the real upload follows', () => {
	const { gl, renderer, scene, camera } = setup();
	const map = new Texture(null);
	scene.add(new Mesh(new BoxGeometry(), new BasicMaterial({ map, color: 0xff0000 })));
	renderer.render(scene, camera);
	assert.equal(texImages(gl).length, 1);
	assert.deepEqual(texImages(gl)[0].slice(4, 7), [1, 1, 0], 'placeholder');

	map.image = { complete: false, naturalWidth: 0, width: 0 }; // an <img> that is still loading
	map.needsUpdate = true;
	renderer.render(scene, camera);
	assert.equal(texImages(gl).length, 1, 'still the placeholder');

	const image = { complete: true, naturalWidth: 8, naturalHeight: 8, width: 8, height: 8 };
	map.image = image;
	map.needsUpdate = true;
	renderer.render(scene, camera);
	assert.equal(texImages(gl).length, 2);
	assert.equal(texImages(gl)[1].at(-1), image, 'element upload passes the image itself');
	assert.equal(texImages(gl)[1].length, 7);
});

test('textured materials compile a separate program with USE_MAP; untextured ones do not', () => {
	const { gl, renderer, scene, camera } = setup();
	const box = new BoxGeometry();
	scene.add(new Mesh(box, new BasicMaterial()), new Mesh(box, new BasicMaterial({ map: new Texture(rgba(2, 2)) })));
	renderer.render(scene, camera);

	assert.equal(gl.livePrograms.size, 2);
	const defined = gl.sources.filter((s) => s.startsWith('#version 300 es\n#define USE_MAP\n'));
	assert.equal(defined.length, 2, 'vertex + fragment of the textured variant');
	assert.equal(gl.sources.length, 4);

	const compiled = gl.shaderCount;
	renderer.render(scene, camera);
	assert.equal(gl.shaderCount, compiled);
});

test('LambertMaterial supports maps too and several meshes share one bind per frame', () => {
	const { gl, renderer, scene, camera } = setup();
	const map = new Texture(rgba(2, 2));
	const box = new BoxGeometry();
	for (let i = 0; i < 3; i++) scene.add(new Mesh(box, new LambertMaterial({ map })));
	renderer.render(scene, camera);
	const binds = named(gl, 'bindTexture').length;
	renderer.render(scene, camera);
	assert.equal(named(gl, 'bindTexture').length, binds + 1);
	assert.equal(renderer.info.render.calls, 3);
	assert.equal(texImages(gl).length, 1);
});

test('texture.dispose() and renderer.dispose() free GPU textures', () => {
	const { gl, renderer, scene, camera } = setup();
	const a = new Texture(rgba(2, 2)), b = new Texture(rgba(2, 2));
	const box = new BoxGeometry();
	scene.add(new Mesh(box, new BasicMaterial({ map: a })), new Mesh(box, new BasicMaterial({ map: b })));
	renderer.render(scene, camera);
	assert.equal(gl.liveTextures.size, 2);

	a.dispose();
	assert.equal(gl.liveTextures.size, 1);
	assert.equal(renderer.info.memory.textures, 1);
	renderer.render(scene, camera);
	assert.equal(gl.liveTextures.size, 2, 're-uploaded when used again');

	renderer.dispose();
	assert.equal(gl.liveTextures.size, 0);
});

test('using a map without UVs, or an oversized texture, fails with a clear message', () => {
	const { renderer, scene, camera } = setup();
	const noUv = new BufferGeometry();
	noUv.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]), 3));
	const mesh = new Mesh(noUv, new BasicMaterial({ map: new Texture(rgba(2, 2)) }));
	scene.add(mesh);
	assert.throws(() => renderer.render(scene, camera), /has a texture map but the geometry has no "uv" attribute/);

	mesh.geometry = new BoxGeometry();
	mesh.material.map = new Texture({ data: new Uint8Array(5000 * 4), width: 5000, height: 1 });
	mesh.material.map.name = 'huge.png';
	assert.throws(() => renderer.render(scene, camera), /Texture "huge.png" is 5000x1, larger than this device's maximum texture size \(4096\)/);
});

test('materials without map support ignore the property; NormalMaterial has none', () => {
	const { renderer, scene, camera } = setup();
	const normal = new NormalMaterial();
	assert.ok(!('map' in normal));
	scene.add(new Mesh(new BoxGeometry(), normal));
	renderer.render(scene, camera);
	assert.equal(renderer.info.render.calls, 1);
});

test('textures are rebuilt automatically after a context restore', () => {
	const { gl, renderer, scene, camera } = setup();
	scene.add(new Mesh(new BoxGeometry(), new BasicMaterial({ map: new Texture(rgba(2, 2)) })));
	renderer.render(scene, camera);
	const uploads = texImages(gl).length;
	const warn = console.warn, info = console.info;
	console.warn = console.info = () => {};
	try {
		renderer.domElement.dispatch('webglcontextlost', { preventDefault() {} });
		renderer.domElement.dispatch('webglcontextrestored');
	} finally { console.warn = warn; console.info = info; }
	renderer.render(scene, camera);
	assert.equal(texImages(gl).length, uploads + 1);
});
