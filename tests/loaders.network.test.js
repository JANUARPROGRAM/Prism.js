import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { OBJLoader, MTLLoader, MaterialLibrary, Texture } from '../src/index.js';

const files = new Map();
const requested = [];
const realFetch = globalThis.fetch;

beforeEach(() => {
	files.clear();
	requested.length = 0;
	globalThis.fetch = async (url) => {
		requested.push(url);
		if (!files.has(url)) return { ok: false, status: 404, statusText: 'Not Found', text: async () => '' };
		return { ok: true, status: 200, statusText: 'OK', text: async () => files.get(url) };
	};
});
afterEach(() => { globalThis.fetch = realFetch; });

function fakeTextures(loader) {
	const urls = [];
	loader.mtlLoader.textureLoader = {
		setURLModifier() {},
		load(url) { urls.push(url); const t = new Texture(); t.name = url; return t; }
	};
	return urls;
}

const OBJ = 'mtllib ship.mtl\nv 0 0 0\nv 1 0 0\nv 0 1 0\nvt 0 0\nvt 1 0\nvt 0 1\nvn 0 0 1\nusemtl Hull\nf 1/1/1 2/2/1 3/3/1\n';
const MTL = 'newmtl Hull\nKd 1 0 0\nmap_Kd skin.png\n';

test('loadAsync loads the obj, then its mtllib and textures next to it', async () => {
	files.set('https://h/models/ship.obj', OBJ);
	files.set('https://h/models/ship.mtl', MTL);
	const loader = new OBJLoader();
	const textureUrls = fakeTextures(loader);

	const group = await loader.loadAsync('https://h/models/ship.obj');
	assert.deepEqual(requested, ['https://h/models/ship.obj', 'https://h/models/ship.mtl']);
	assert.deepEqual(textureUrls, ['https://h/models/skin.png']);
	const material = group.children[0].material;
	assert.equal(material.name, 'Hull');
	assert.deepEqual(material.color.toArray(), [1, 0, 0]);
	assert.ok(material.map instanceof Texture);
});

test('a missing mtl file only warns; the model still loads with default materials', async () => {
	files.set('m/a.obj', OBJ);
	const warnings = [];
	const warn = console.warn;
	console.warn = (m) => warnings.push(m);
	let group;
	try { group = await new OBJLoader().loadAsync('m/a.obj'); } finally { console.warn = warn; }
	assert.equal(group.children.length, 1);
	assert.equal(group.children[0].material.color.getHex(), 0xcccccc);
	assert.ok(warnings.some((w) => /Could not load material library "ship.mtl".*HTTP 404/.test(w)));
});

test('several mtllib lines are all loaded and merged', async () => {
	files.set('a.obj', 'mtllib one.mtl\nmtllib two.mtl\nv 0 0 0\nv 1 0 0\nv 0 1 0\nusemtl A\nf 1 2 3\nusemtl B\nf 1 2 3');
	files.set('one.mtl', 'newmtl A\nKd 1 0 0');
	files.set('two.mtl', 'newmtl B\nKd 0 0 1');
	const group = await new OBJLoader().loadAsync('a.obj');
	assert.deepEqual(group.children.map((m) => m.material.name), ['A', 'B']);
});

test('autoLoadMaterials = false and setMaterials() do not fetch the mtl', async () => {
	files.set('a.obj', OBJ);
	await new OBJLoader().loadAsync('a.obj').catch(() => {});
	requested.length = 0;

	const off = new OBJLoader();
	off.autoLoadMaterials = false;
	await off.loadAsync('a.obj');
	assert.deepEqual(requested, ['a.obj']);

	requested.length = 0;
	const library = new MaterialLibrary();
	await new OBJLoader().setMaterials(library).loadAsync('a.obj');
	assert.deepEqual(requested, ['a.obj']);
});

test('HTTP and network failures say what failed', async () => {
	await assert.rejects(new OBJLoader().loadAsync('nope.obj'), /Failed to load OBJ file "nope.obj" \(HTTP 404 Not Found\)/);
	globalThis.fetch = async () => { throw new TypeError('offline'); };
	await assert.rejects(new OBJLoader().loadAsync('x.obj'), /Failed to load OBJ file "x.obj": offline/);
	await assert.rejects(new MTLLoader().loadAsync('x.mtl'), /Failed to load MTL file "x.mtl": offline/);
});

test('a malformed obj rejects with the parse error', async () => {
	files.set('bad.obj', 'v 0 0 0\nf 1 2 3');
	await assert.rejects(new OBJLoader().loadAsync('bad.obj'), /OBJ parse error at line 2/);
});

test('setURLModifier rewrites every fetched URL (e.g. to point at files the user picked)', async () => {
	files.set('mapped/ship.obj', OBJ);
	files.set('mapped/ship.mtl', MTL);
	const loader = new OBJLoader();
	fakeTextures(loader);
	loader.setURLModifier((url) => `mapped/${url.split('/').pop()}`);
	await loader.loadAsync('https://elsewhere/any/ship.obj');
	assert.deepEqual(requested, ['mapped/ship.obj', 'mapped/ship.mtl']);
});

test('load() callback style works and reports errors through onError', async () => {
	files.set('a.obj', 'v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3');
	const group = await new Promise((resolve, reject) => new OBJLoader().load('a.obj', resolve, reject));
	assert.equal(group.children.length, 1);
	const error = await new Promise((resolve) => new OBJLoader().load('missing.obj', undefined, resolve));
	assert.match(error.message, /HTTP 404/);
});
