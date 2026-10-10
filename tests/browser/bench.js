// Benchmarks that run in a real browser, so the numbers describe the device that opens this page.
// Physics numbers are pure JavaScript. For rendering, `render()` is the engine's CPU cost per frame (matrix
// work, sorting, culling, GL call submission) and "+ finish" additionally waits for the GPU with gl.finish()
// (a hint only: some mobile drivers return early from finish, so GPU time can be under-reported).
import * as Prism from '../../src/index.js';

const $ = (id) => document.getElementById(id);
const V = (x = 0, y = 0, z = 0) => new Prism.Vector3(x, y, z);
const median = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const tick = () => new Promise((r) => setTimeout(r, 0)); // let the page repaint between scenarios
const rows = [];

function report(name, value, unit = '') {
	rows.push([name, `${value}${unit ? ' ' + unit : ''}`]);
	const tr = document.createElement('tr');
	tr.innerHTML = `<td>${name}</td><td>${value}${unit ? ' ' + unit : ''}</td>`;
	$('table').tBodies[0].appendChild(tr);
	$('out').value = rows.map(([k, v]) => `${k}: ${v}`).join('\n');
}

function lcg(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

function pile(n, seed, rolling) {
	const rand = lcg(seed), half = Math.max(6, Math.sqrt(n) * 0.9);
	const world = new Prism.PhysicsWorld();
	world.addBody(new Prism.RigidBody({ shape: new Prism.PlaneShape(V(0, 1, 0), 0), mass: 0 }));
	for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) world.addBody(new Prism.RigidBody({ shape: new Prism.PlaneShape(V(nx, 0, nz), -half), mass: 0 }));
	for (let i = 0; i < n; i++) {
		const p = V((rand() * 2 - 1) * (half - 1), 0.6 + (i % 12) * 1.1 + Math.floor(i / 12) * 0.15, (rand() * 2 - 1) * (half - 1));
		world.addBody(new Prism.RigidBody({ shape: i % 3 ? new Prism.BoxShape(0.8, 0.8, 0.8) : new Prism.SphereShape(0.4), position: p, rollingFriction: rolling }));
	}
	return world;
}

async function physics(quick) {
	for (const n of quick ? [100, 300] : [100, 300, 1000]) {
		const world = pile(n, 1, 0), times = [];
		for (let i = 0; i < (quick ? 90 : 180); i++) { const t = performance.now(); world.step(world.fixedTimeStep); times.push(performance.now() - t); }
		report(`fisika ${n} benda jatuh: median per langkah`, median(times).toFixed(2), 'ms');
		await tick();
	}
	const n = quick ? 150 : 300, world = pile(n, 3, 0.03);
	for (let i = 0; i < (quick ? 600 : 1200); i++) world.step(world.fixedTimeStep);
	const times = [];
	for (let i = 0; i < 60; i++) { const t = performance.now(); world.step(world.fixedTimeStep); times.push(performance.now() - t); }
	report(`fisika ${n} benda setelah mengendap: median per langkah`, median(times).toFixed(3), 'ms');
	report(`fisika ${n} benda setelah mengendap: masih aktif`, world.stats.awake);
}

async function rendering(quick) {
	const canvas = $('canvas');
	const renderer = new Prism.Renderer({ canvas, antialias: false, pixelRatio: 1 });
	const gl = renderer.gl;
	report('GL', renderer.capabilities.glVersion);
	const camera = new Prism.PerspectiveCamera(60, canvas.width / canvas.height, 0.1, 200);
	camera.position.set(0, 0, 10);
	const geometry = new Prism.BoxGeometry(1, 1, 1);
	const materials = [0xff6b6b, 0x6bcbff, 0xffd23f].map((color) => new Prism.LambertMaterial({ color }));
	const lights = [new Prism.AmbientLight(0xffffff, 0.4), new Prism.DirectionalLight(0xffffff, 0.6)];

	const separate = (count, visible, cull) => {
		const scene = new Prism.Scene(), side = Math.ceil(Math.sqrt(count)), movers = [];
		for (let i = 0; i < count; i++) {
			const mesh = new Prism.Mesh(geometry, materials[i % 3]);
			mesh.position.set((i % side - side / 2) * 0.12 + (i < count * visible ? 0 : 400), (Math.floor(i / side) - side / 2) * 0.12, 0);
			mesh.scale.setScalar(0.08);
			mesh.frustumCulled = cull;
			scene.add(mesh);
			movers.push(mesh);
		}
		scene.add(...lights);
		return { scene, touch: (i) => { movers[i % 50].position.x += 0.0001; } };
	};
	const instanced = (count) => {
		const scene = new Prism.Scene(), mesh = new Prism.InstancedMesh(geometry, materials[0], count), m = new Prism.Matrix4(), side = Math.ceil(Math.sqrt(count));
		for (let i = 0; i < count; i++) { m.makeScale(0.08, 0.08, 0.08); m.elements[12] = (i % side - side / 2) * 0.12; m.elements[13] = (Math.floor(i / side) - side / 2) * 0.12; mesh.setMatrixAt(i, m); }
		scene.add(mesh, ...lights);
		return { scene, touch: () => { mesh.instanceMatrix.needsUpdate = true; } }; // re-upload all instance data every frame
	};
	const measure = async (label, { scene, touch }) => {
		const frames = quick ? 40 : 120;
		for (let i = 0; i < 15; i++) { touch(i); renderer.render(scene, camera); }
		const cpu = [], full = [];
		for (let i = 0; i < frames; i++) {
			touch(i);
			let t = performance.now();
			renderer.render(scene, camera);
			cpu.push(performance.now() - t);
			gl.finish();
			full.push(performance.now() - t);
		}
		report(`${label}: render()`, median(cpu).toFixed(2), 'ms');
		report(`${label}: render() + finish`, median(full).toFixed(2), 'ms');
		report(`${label}: draw calls`, renderer.info.render.calls);
		await tick();
	};
	const count = quick ? 1000 : 2000;
	await measure(`${count} mesh, semua terlihat`, separate(count, 1, true));
	await measure(`${count} mesh, 10% terlihat, culling aktif`, separate(count, 0.1, true));
	await measure(`${count} mesh, 10% terlihat, culling dimatikan`, separate(count, 0.1, false));
	await measure(`${count} kotak dalam satu InstancedMesh`, instanced(count));
}

async function run(quick) {
	$('run').disabled = $('quick').disabled = true;
	$('table').tBodies[0].innerHTML = '';
	rows.length = 0;
	report('perangkat', navigator.userAgent.slice(0, 80));
	$('status').textContent = 'Mengukur fisika…';
	await tick();
	await physics(quick);
	$('status').textContent = 'Mengukur penggambaran…';
	await tick();
	await rendering(quick);
	$('status').textContent = 'Selesai.';
	$('run').disabled = $('quick').disabled = false;
	window.__bench = { rows: [...rows] };
}

$('run').onclick = () => run(false);
$('quick').onclick = () => run(true);
if (new URLSearchParams(location.search).has('auto')) run(true);
