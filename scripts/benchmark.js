#!/usr/bin/env node
/**
 * Micro-benchmarks for the parts of Prism.js that run on the CPU.
 *   node scripts/benchmark.js            all benchmarks
 *   node scripts/benchmark.js physics    only physics
 *   node scripts/benchmark.js render     only render-loop overhead (no GPU: a stub WebGL context)
 *
 * Numbers describe THIS machine and JavaScript engine only. The render benchmark measures the engine's
 * JavaScript work per frame, not GPU time; the GL-call counts are exact and machine independent.
 */
import { createFastGL, createFastCanvas } from '../tests/helpers/fastGL.js';
import * as Prism from '../src/index.js';

const which = process.argv[2] ?? 'all';
const V = (x = 0, y = 0, z = 0) => new Prism.Vector3(x, y, z);
const median = (a) => [...a].sort((x, y) => x - y)[a.length >> 1];
const pct = (a, p) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(a.length * p))];
const rows = [];
const report = (name, value, unit = '') => { rows.push([name, value, unit]); console.log(`${name.padEnd(54)} ${String(value).padStart(10)} ${unit}`); };

function lcg(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

function physicsPile(n, seed = 1, rolling = 0) {
	const rand = lcg(seed);
	const world = new Prism.PhysicsWorld();
	world.addBody(new Prism.RigidBody({ shape: new Prism.PlaneShape(V(0, 1, 0), 0), mass: 0 }));
	const half = Math.max(6, Math.sqrt(n) * 0.9);
	for (const [nx, nz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
		world.addBody(new Prism.RigidBody({ shape: new Prism.PlaneShape(V(nx, 0, nz), -half), mass: 0 }));
	}
	for (let i = 0; i < n; i++) {
		const p = V((rand() * 2 - 1) * (half - 1), 0.6 + (i % 12) * 1.1 + Math.floor(i / 12) * 0.15, (rand() * 2 - 1) * (half - 1));
		world.addBody(new Prism.RigidBody({ shape: i % 3 ? new Prism.BoxShape(0.8, 0.8, 0.8) : new Prism.SphereShape(0.4), position: p, rollingFriction: rolling }));
	}
	return world;
}

function stateHash(world) {
	// order-sensitive checksum of every position/orientation: equal hashes mean identical simulations
	let h = 0;
	const buf = new Float64Array(1), words = new Uint32Array(buf.buffer);
	for (const b of world.bodies) {
		for (const v of [b.position.x, b.position.y, b.position.z, b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w]) {
			buf[0] = v;
			h = (Math.imul(h ^ words[0], 16777619) ^ words[1]) >>> 0;
		}
	}
	return h.toString(16);
}

const REPEATS = 5; // each scenario is rebuilt and timed this many times; the best median is reported

function timeSteps(build, warmupSteps, measuredSteps) {
	let bestMedian = Infinity, bestP95 = Infinity, peakContacts = 0, awake = 0;
	for (let repeat = 0; repeat < REPEATS; repeat++) {
		const world = build();
		for (let i = 0; i < warmupSteps; i++) world.step(world.fixedTimeStep);
		const times = [];
		for (let i = 0; i < measuredSteps; i++) {
			const t = performance.now();
			world.step(world.fixedTimeStep);
			times.push(performance.now() - t);
			peakContacts = Math.max(peakContacts, world.contacts.count);
		}
		const m = median(times);
		if (m < bestMedian) { bestMedian = m; bestP95 = pct(times, 0.95); awake = world.stats.awake; }
	}
	return { median: bestMedian, p95: bestP95, peakContacts, awake };
}

function benchPhysics() {
	console.log(`--- physics: fixed step (1/60 s), planes + 4 walls, best of ${REPEATS} runs`);
	for (const n of [100, 300, 1000]) {
		const r = timeSteps(() => physicsPile(n), 0, n >= 1000 ? 240 : 300);
		report(`physics ${n} bodies, falling: median step`, r.median.toFixed(2), 'ms');
		report(`physics ${n} bodies, falling: p95 step`, r.p95.toFixed(2), 'ms');
		report(`physics ${n} bodies, falling: peak contacts`, r.peakContacts);
	}
	const settled = timeSteps(() => physicsPile(1000, 3), 1800, 120);
	report('physics 1000 bodies, after settling: median step', settled.median.toFixed(3), 'ms');
	report('physics 1000 bodies, after settling: still awake', settled.awake);
	const settledRolling = timeSteps(() => physicsPile(1000, 3, 0.03), 1800, 120);
	report('physics 1000 bodies + rolling resistance, settled: median step', settledRolling.median.toFixed(3), 'ms');
	report('physics 1000 bodies + rolling resistance, settled: still awake', settledRolling.awake);
	const world = physicsPile(120, 7);
	for (let i = 0; i < 400; i++) world.step(world.fixedTimeStep);
	report('physics determinism hash (120 bodies, 400 steps)', stateHash(world));
}

function benchRender() {
	console.log('--- render: JavaScript cost per frame with a stub GL (no GPU), 5 lights');
	const build = (count, visibleFraction) => {
		const gl = createFastGL();
		const renderer = new Prism.Renderer({ canvas: createFastCanvas(gl), pixelRatio: 1 });
		const scene = new Prism.Scene();
		const camera = new Prism.PerspectiveCamera(60, 1, 0.1, 200);
		camera.position.set(0, 0, 10);
		const geometry = new Prism.BoxGeometry(1, 1, 1);
		const materials = [0xff6b6b, 0x6bcbff, 0xffd23f].map((color) => new Prism.LambertMaterial({ color }));
		const side = Math.ceil(Math.sqrt(count));
		for (let i = 0; i < count; i++) {
			const mesh = new Prism.Mesh(geometry, materials[i % 3]);
			const inView = i < count * visibleFraction;
			// meshes that are not "in view" sit far to the right of the camera's frustum
			mesh.position.set((i % side - side / 2) * 0.12 + (inView ? 0 : 400), (Math.floor(i / side) - side / 2) * 0.12, 0);
			mesh.scale.setScalar(0.08);
			scene.add(mesh);
		}
		scene.add(new Prism.AmbientLight(0xffffff, 0.4), new Prism.DirectionalLight(0xffffff, 0.6));
		for (let i = 0; i < 3; i++) { const l = new Prism.PointLight(0xffffff, 0.5, 20); l.position.set(i, 2, 5); scene.add(l); }
		return { gl, renderer, scene, camera };
	};
	for (const [count, fraction, label] of [[1000, 1, '1000 meshes, all in view'], [1000, 0.1, '1000 meshes, 10% in view'], [4000, 1, '4000 meshes, all in view']]) {
		const { gl, renderer, scene, camera } = build(count, fraction);
		for (let i = 0; i < 30; i++) { scene.children[i % 50].position.x += 0.001; renderer.render(scene, camera); } // warm up
		const times = [];
		for (let i = 0; i < 200; i++) {
			scene.children[i % 50].position.x += 0.0001; // something moves every frame, like a real scene
			const t = performance.now();
			renderer.render(scene, camera);
			times.push(performance.now() - t);
		}
		report(`render ${label}: median`, median(times).toFixed(2), 'ms/frame');
		const counted = createFastGL({ count: true });
		const r2 = new Prism.Renderer({ canvas: createFastCanvas(counted), pixelRatio: 1 });
		r2.render(scene, camera);
		counted.resetCounts();
		r2.render(scene, camera);
		report(`render ${label}: GL calls`, counted.totalCalls());
		report(`render ${label}: draw calls`, r2.info.render.calls);
	}
}

function benchInstancing() {
	console.log('--- render: 4000 identical boxes, separate meshes vs one InstancedMesh (stub GL, 5 lights)');
	const make = (instanced) => {
		const gl = createFastGL();
		const renderer = new Prism.Renderer({ canvas: createFastCanvas(gl), pixelRatio: 1 });
		const scene = new Prism.Scene();
		const camera = new Prism.PerspectiveCamera(60, 1, 0.1, 200);
		camera.position.set(0, 0, 10);
		const geometry = new Prism.BoxGeometry(1, 1, 1), material = new Prism.LambertMaterial({ color: 0x6bcbff });
		const side = 64, m = new Prism.Matrix4();
		let meshes = null;
		if (instanced) {
			meshes = new Prism.InstancedMesh(geometry, material, 4000);
			scene.add(meshes);
		}
		const moving = [];
		for (let i = 0; i < 4000; i++) {
			const x = (i % side - side / 2) * 0.1, y = (Math.floor(i / side) - side / 2) * 0.1;
			if (instanced) { m.makeScale(0.07, 0.07, 0.07); m.elements[12] = x; m.elements[13] = y; meshes.setMatrixAt(i, m); }
			else { const mesh = new Prism.Mesh(geometry, material); mesh.position.set(x, y, 0); mesh.scale.setScalar(0.07); scene.add(mesh); moving.push(mesh); }
		}
		scene.add(new Prism.AmbientLight(0xffffff, 0.4), new Prism.DirectionalLight(0xffffff, 0.6));
		return { gl, renderer, scene, camera, meshes, moving };
	};
	for (const instanced of [false, true]) {
		const { renderer, scene, camera, meshes, moving } = make(instanced);
		const label = instanced ? 'one InstancedMesh' : '4000 separate meshes';
		const touch = (i) => {
			if (instanced) { meshes.instanceMatrix.needsUpdate = true; } // all instance data re-uploaded each frame: the worst case
			else moving[i % 50].position.x += 0.0001;
		};
		for (let i = 0; i < 30; i++) { touch(i); renderer.render(scene, camera); }
		const times = [];
		for (let i = 0; i < 200; i++) { touch(i); const t = performance.now(); renderer.render(scene, camera); times.push(performance.now() - t); }
		report(`render ${label}: median`, median(times).toFixed(2), 'ms/frame');
		const counted = createFastGL({ count: true });
		const r2 = new Prism.Renderer({ canvas: createFastCanvas(counted), pixelRatio: 1 });
		r2.render(scene, camera);
		counted.resetCounts();
		r2.render(scene, camera);
		report(`render ${label}: GL calls`, counted.totalCalls());
		report(`render ${label}: draw calls`, r2.info.render.calls);
	}
}

if (which === 'all' || which === 'physics') benchPhysics();
if (which === 'all' || which === 'render') { benchRender(); benchInstancing(); }
