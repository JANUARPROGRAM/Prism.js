import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OBJLoader, MaterialLibrary, LambertMaterial, Mesh, Group, BufferGeometry } from '../src/index.js';
import { parseOBJ } from '../src/loaders/OBJLoader.js';
import { vecClose } from './helpers/assertions.js';

const SQUARE = `
v 0 0 0
v 1 0 0
v 1 1 0
v 0 1 0
`;

test('quad is fan-triangulated and its corners are shared when normals are given', () => {
	const r = parseOBJ(`${SQUARE}vn 0 0 1\nvt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\nf 1/1/1 2/2/1 3/3/1 4/4/1`);
	assert.equal(r.objects.length, 1);
	const o = r.objects[0];
	assert.equal(o.positions.length / 3, 4);
	assert.deepEqual(o.indices, [0, 1, 2, 0, 2, 3]);
	assert.deepEqual(Array.from(o.uvs), [0, 0, 1, 0, 1, 1, 0, 1]);
	assert.equal(o.normals.length, 12);
	assert.deepEqual([r.vertexCount, r.triangleCount], [4, 2]);
});

test('supports v, v/vt, v//vn and v/vt/vn corners', () => {
	const base = `${SQUARE}vt 0 0\nvn 0 0 1\n`;
	const a = parseOBJ(`${base}f 1 2 3`).objects[0];
	assert.deepEqual([a.uvs, a.normals], [null, null]);
	const b = parseOBJ(`${base}f 1/1 2/1 3/1`).objects[0];
	assert.ok(b.uvs && b.normals === null);
	const c = parseOBJ(`${base}f 1//1 2//1 3//1`).objects[0];
	assert.ok(c.uvs === null && c.normals);
	const d = parseOBJ(`${base}f 1/1/1 2/1/1 3/1/1`).objects[0];
	assert.ok(d.uvs && d.normals);
});

test('negative indices count back from the vertices defined so far', () => {
	const r = parseOBJ(`${SQUARE}vn 0 0 1\nf -4//-1 -3//-1 -2//-1`);
	const o = r.objects[0];
	vecClose(Array.from(o.positions), [0, 0, 0, 1, 0, 0, 1, 1, 0]);
	// A later vertex line must not change what -1 meant earlier.
	const later = parseOBJ(`${SQUARE}vn 0 0 1\nf -1//-1 -2//-1 -3//-1\nv 9 9 9`);
	vecClose(Array.from(later.objects[0].positions), [0, 1, 0, 1, 1, 0, 1, 0, 0]);
});

test('polygons with more than four corners use a triangle fan', () => {
	const r = parseOBJ('v 0 0 0\nv 1 0 0\nv 2 1 0\nv 1 2 0\nv 0 1 0\nf 1 2 3 4 5');
	assert.deepEqual(r.objects[0].indices, [0, 1, 2, 0, 2, 3, 0, 3, 4]);
});

test('identical v/vt/vn corners are merged: a cube with 6 normals has 24 vertices and 12 triangles', () => {
	const faces = [
		[[1, 2, 3, 4], 1], [[5, 8, 7, 6], 2], [[1, 5, 6, 2], 3], [[4, 3, 7, 8], 4], [[1, 4, 8, 5], 5], [[2, 6, 7, 3], 6]
	];
	const cube = [
		'v 0 0 0', 'v 1 0 0', 'v 1 1 0', 'v 0 1 0', 'v 0 0 1', 'v 1 0 1', 'v 1 1 1', 'v 0 1 1',
		'vn 0 0 -1', 'vn 0 0 1', 'vn 0 -1 0', 'vn 0 1 0', 'vn -1 0 0', 'vn 1 0 0',
		...faces.map(([ids, n]) => `f ${ids.map((i) => `${i}//${n}`).join(' ')}`)
	].join('\n');
	const r = parseOBJ(cube);
	assert.equal(r.objects[0].positions.length / 3, 24);
	assert.equal(r.triangleCount, 12);
});

test('faces without normals get one vertex per corner so they shade flat', () => {
	const r = parseOBJ(`${SQUARE}f 1 2 3\nf 1 3 4`);
	const o = r.objects[0];
	assert.equal(o.positions.length / 3, 6, 'no sharing without normals');
	assert.equal(o.normals, null);
});

test('mixing faces with and without normals drops the file normals for that mesh', () => {
	const r = parseOBJ(`${SQUARE}vn 0 0 1\nf 1//1 2//1 3//1\nf 1 3 4`);
	assert.equal(r.objects[0].normals, null);
});

test('objects/groups and materials split the output; empty groups are dropped', () => {
	const r = parseOBJ(`${SQUARE}
mtllib a.mtl
o First
usemtl red
f 1 2 3
usemtl blue
f 1 3 4
g Second
usemtl red
f 1 2 4
g Empty
`);
	assert.deepEqual(r.objects.map((o) => [o.name, o.material]), [['First', 'red'], ['First', 'blue'], ['Second', 'red']]);
	assert.deepEqual(r.mtllibs, ['a.mtl']);
});

test('comments, blank lines, CRLF endings and unsupported statements are ignored', () => {
	const r = parseOBJ(`# model\r\n\r\n${SQUARE.replace(/\n/g, '\r\n')}s off\r\nl 1 2\r\np 1\r\nvp 0.5\r\nf 1 2 3\r\n`);
	assert.equal(r.triangleCount, 1);
});

test('vertex colors / w components after v are ignored', () => {
	const r = parseOBJ('v 1 2 3 1 0 0\nv 4 5 6 1.0\nv 7 8 9\nf 1 2 3');
	vecClose(Array.from(r.objects[0].positions), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('errors name the line and the problem', () => {
	assert.throws(() => parseOBJ(`${SQUARE}f 1 2 9`), /line 6: vertex index 9 is out of range \(the file defines 4 vertex entries/);
	assert.throws(() => parseOBJ(`${SQUARE}f 1 2`), /line 6: a face needs at least 3 vertices/);
	assert.throws(() => parseOBJ('v 1 2 x'), /line 1: "v 1 2 x" needs at least 3 number/);
	assert.throws(() => parseOBJ('v 1 2'), /line 1/);
	assert.throws(() => parseOBJ('vt'), /line 1: "vt " needs at least 1 number/);
	assert.throws(() => parseOBJ(`${SQUARE}f 0 1 2`), /line 6: invalid vertex index "0"/);
	assert.throws(() => parseOBJ(`${SQUARE}f 1/5 2 3`), /texture coordinate index 5 is out of range/);
	assert.throws(() => parseOBJ(`${SQUARE}f 1//2 2//2 3//2`), /normal index 2 is out of range/);
	assert.throws(() => parseOBJ(`${SQUARE}f a b c`), /invalid vertex index "a"/);
});

test('an empty file parses to no objects', () => {
	assert.deepEqual(parseOBJ('# nothing').objects, []);
});

test('meshes with more than 65534 vertices get 32-bit indices', () => {
	const lines = [];
	const triangles = 22000; // 66000 flat vertices
	for (let i = 0; i < triangles; i++) lines.push(`v ${i} 0 0`, `v ${i} 1 0`, `v ${i} 0 1`, `f ${i * 3 + 1} ${i * 3 + 2} ${i * 3 + 3}`);
	const group = new OBJLoader().parse(lines.join('\n'));
	const geometry = group.children[0].geometry;
	assert.equal(geometry.attributes.position.count, 66000);
	assert.ok(geometry.index.array instanceof Uint32Array);
});

// ---- OBJLoader.parse (builds scene objects) ----

test('OBJLoader.parse returns a Group of Meshes with geometry, names and statistics', () => {
	const group = new OBJLoader().parse(`${SQUARE}vt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\nvn 0 0 1\no Plate\nf 1/1/1 2/2/1 3/3/1 4/4/1`);
	assert.ok(group instanceof Group && group.isGroup);
	assert.equal(group.children.length, 1);
	const mesh = group.children[0];
	assert.ok(mesh instanceof Mesh && mesh.geometry instanceof BufferGeometry);
	assert.equal(mesh.name, 'Plate');
	assert.deepEqual(Object.keys(mesh.geometry.attributes).sort(), ['normal', 'position', 'uv']);
	assert.equal(mesh.geometry.index.count, 6);
	assert.deepEqual(group.userData.obj, { materialLibraries: [], vertexCount: 4, triangleCount: 2 });
});

test('missing normals are generated (flat) and uvs are only added when the file has them', () => {
	const mesh = new OBJLoader().parse(`${SQUARE}f 1 2 3 4`).children[0];
	assert.ok(!mesh.geometry.hasAttribute('uv'));
	const n = mesh.geometry.attributes.normal.array;
	for (let i = 0; i < n.length; i += 3) vecClose([n[i], n[i + 1], n[i + 2]], [0, 0, 1], 1e-6);
});

test('materials come from the library by name; unknown names fall back with one warning each', () => {
	const library = new MaterialLibrary();
	const red = new LambertMaterial({ color: 0xff0000 });
	library.materials.red = red;

	const warnings = [];
	const warn = console.warn;
	console.warn = (m) => warnings.push(m);
	let group;
	try {
		group = new OBJLoader().setMaterials(library).parse(`${SQUARE}usemtl red\nf 1 2 3\nusemtl ghost\nf 1 3 4\no Two\nusemtl ghost\nf 1 2 4`);
	} finally {
		console.warn = warn;
	}
	assert.equal(group.children[0].material, red);
	const fallback = group.children[1].material;
	assert.equal(fallback.color.getHex(), 0xcccccc);
	assert.equal(group.children[2].material, fallback, 'one shared fallback');
	assert.equal(warnings.length, 1);
	assert.match(warnings[0], /Material "ghost" is not defined/);
});

test('without any library the default material is used silently, and `side` is honoured', () => {
	const loader = new OBJLoader();
	loader.side = 2;
	const warnings = [];
	const warn = console.warn;
	console.warn = (m) => warnings.push(m);
	let mesh;
	try { mesh = loader.parse(`${SQUARE}usemtl whatever\nf 1 2 3`).children[0]; } finally { console.warn = warn; }
	assert.equal(mesh.material.side, 2);
	assert.equal(warnings.length, 0);
});
