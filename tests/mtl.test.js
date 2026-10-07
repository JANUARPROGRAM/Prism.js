import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MTLLoader, MaterialLibrary, RepeatWrapping, DoubleSide, LambertMaterial, Texture } from '../src/index.js';
import { resolveURL } from '../src/loaders/resolveURL.js';
import { close } from './helpers/assertions.js';

/** Stand-in for TextureLoader that records requests and never touches the network. */
function fakeTextureLoader() {
	const loader = {
		urls: [], failures: [], modifier: null,
		setURLModifier(fn) { loader.modifier = fn; },
		load(url, onLoad, onError) {
			loader.urls.push(url);
			const texture = new Texture();
			texture.name = url;
			if (loader.failures.includes(url)) onError(new Error('boom'));
			return texture;
		}
	};
	return loader;
}
const makeLoader = () => {
	const loader = new MTLLoader();
	loader.textureLoader = fakeTextureLoader();
	return loader;
};

test('parses color, opacity and names into LambertMaterials', () => {
	const lib = makeLoader().parse(`
# comment
newmtl Wall
Ka 1 1 1
Kd 0.5 0.25 1
Ks 0.9 0.9 0.9
Ns 50
illum 2

newmtl Glass
Kd 0 1 0
d 0.4

newmtl Fog
Kd 1 1 1
Tr 0.75
`);
	assert.deepEqual(lib.names, ['Wall', 'Glass', 'Fog']);
	const wall = lib.get('Wall');
	assert.ok(wall instanceof LambertMaterial);
	assert.deepEqual(wall.color.toArray(), [0.5, 0.25, 1]);
	assert.deepEqual([wall.opacity, wall.transparent, wall.name], [1, false, 'Wall']);
	assert.deepEqual([lib.get('Glass').opacity, lib.get('Glass').transparent], [0.4, true]);
	close(lib.get('Fog').opacity, 0.25);
	assert.equal(lib.get('Fog').transparent, true);
});

test('defaults: Kd 0.8 gray, a single Kd value is gray, d wins over Tr, bad d is clamped', () => {
	const lib = makeLoader().parse('newmtl A\nnewmtl B\nKd 0.2\nnewmtl C\nTr 0.5\nd 0.9\nnewmtl D\nd 3');
	assert.deepEqual(lib.get('A').color.toArray(), [0.8, 0.8, 0.8]);
	assert.deepEqual(lib.get('B').color.toArray(), [0.2, 0.2, 0.2]);
	assert.equal(lib.get('C').opacity, 0.9);
	assert.equal(lib.get('D').opacity, 1);
});

test('statements before the first newmtl and unsupported ones are ignored; CRLF and spaces in names work', () => {
	const lib = makeLoader().parse('Kd 1 0 0\r\nnewmtl Shiny Metal\r\nKd 1 1 0\r\nKd spectral file.rfl\r\nbump b.png\r\nKe 1 1 1\r\n');
	assert.deepEqual(lib.names, ['Shiny Metal']);
	assert.deepEqual(lib.get('Shiny Metal').color.toArray(), [1, 1, 0]);
});

test('map_Kd: file name is resolved against the mtl URL; options are skipped; textures repeat', () => {
	const loader = makeLoader();
	const lib = loader.parse([
		'newmtl Plain', 'map_Kd wood.png',
		'newmtl Scaled', 'map_Kd -s 2 2 -o 0.5 tiles/floor.jpg',
		'newmtl Clamped', 'map_Kd -clamp on -bm 0.8 my picture.png',
		'newmtl Win', 'map_Kd textures\\brick.png',
		'newmtl Abs', 'map_Kd https://example.com/a.png',
		'newmtl OptionalArgs', 'map_Kd -s 3 side.png'
	].join('\n'), 'https://site.test/models/ship.mtl');

	assert.deepEqual(loader.textureLoader.urls, [
		'https://site.test/models/wood.png',
		'https://site.test/models/tiles/floor.jpg',
		'https://site.test/models/my picture.png',
		'https://site.test/models/textures/brick.png',
		'https://example.com/a.png',
		'https://site.test/models/side.png'
	]);
	const map = lib.get('Plain').map;
	assert.ok(map instanceof Texture);
	assert.deepEqual([map.wrapS, map.wrapT], [RepeatWrapping, RepeatWrapping]);
	assert.equal(lib.textures.length, 6);
});

test('loadTextures = false keeps materials untextured; side is applied', () => {
	const loader = makeLoader();
	loader.loadTextures = false;
	loader.side = DoubleSide;
	const lib = loader.parse('newmtl A\nmap_Kd a.png', 'x/y.mtl');
	assert.equal(lib.get('A').map, null);
	assert.equal(loader.textureLoader.urls.length, 0);
	assert.equal(lib.get('A').side, DoubleSide);
});

test('a texture that fails to load only produces a warning naming the material', () => {
	const loader = makeLoader();
	loader.textureLoader.failures.push('dir/bad.png');
	const warnings = [];
	const warn = console.warn;
	console.warn = (m) => warnings.push(m);
	try { loader.parse('newmtl Crate\nmap_Kd bad.png', 'dir/c.mtl'); } finally { console.warn = warn; }
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /"dir\/bad.png" of material "Crate" failed to load/);
});

test('malformed numbers throw with the line number', () => {
	assert.throws(() => makeLoader().parse('newmtl A\nKd red green blue'), /MTL parse error at line 2: "Kd red green blue"/);
	assert.throws(() => makeLoader().parse('newmtl A\nd'), /line 2/);
});

test('MaterialLibrary add / dispose', () => {
	const loader = makeLoader();
	const a = loader.parse('newmtl A\nmap_Kd a.png', 'p/');
	const b = loader.parse('newmtl B', 'p/');
	const merged = new MaterialLibrary().add(a).add(b);
	assert.deepEqual(merged.names, ['A', 'B']);
	let disposedTextures = 0;
	merged.textures[0].addDisposeListener(() => disposedTextures++);
	merged.dispose();
	assert.equal(disposedTextures, 1);
});

test('setURLModifier reaches the texture loader', () => {
	const loader = makeLoader();
	const fn = (u) => u;
	loader.setURLModifier(fn);
	assert.equal(loader.textureLoader.modifier, fn);
});

test('resolveURL handles relative, absolute, query strings and Windows paths', () => {
	assert.equal(resolveURL('a/b/c.obj', 'x.mtl'), 'a/b/x.mtl');
	assert.equal(resolveURL('c.obj', 'x.mtl'), 'x.mtl');
	assert.equal(resolveURL('https://h/m/c.obj?v=1#f', 'tex/x.png'), 'https://h/m/tex/x.png');
	assert.equal(resolveURL('a/c.obj', '..\\img\\x.png'), 'a/../img/x.png');
	assert.equal(resolveURL('a/c.obj', 'data:image/png;base64,AAA'), 'data:image/png;base64,AAA');
	assert.equal(resolveURL('a/c.obj', '/root/x.png'), '/root/x.png');
	assert.equal(resolveURL('a/c.obj', '//cdn/x.png'), '//cdn/x.png');
	assert.equal(resolveURL('a/c.obj', '  spaced.png  '), 'a/spaced.png');
});
