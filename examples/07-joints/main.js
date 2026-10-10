// Joints, capsules, CCD and instancing in one scene:
//  - a chain of capsules ending in a heavy ball (BallSocketJoint) swings into a pyramid of boxes
//  - a propeller on a motorised HingeJoint sweeps the ground
//  - "Hujan" drops boxes drawn with ONE InstancedMesh (one draw call for all of them)
//  - tap or "Tembak" fires a 60 m/s ball; `ccd: true` keeps it from tunnelling through anything thin
import {
	Renderer, Scene, PerspectiveCamera, Mesh, InstancedMesh, Color, Vector3, Matrix4, Quaternion,
	BoxGeometry, SphereGeometry, CapsuleGeometry, PlaneGeometry, LambertMaterial,
	AmbientLight, DirectionalLight, DoubleSide,
	PhysicsWorld, RigidBody, BoxShape, SphereShape, CapsuleShape, PlaneShape, BallSocketJoint, HingeJoint
} from '../../src/index.js';

const $ = (id) => document.getElementById(id);
const canvas = $('canvas'), infoEl = $('info');
const V = (x = 0, y = 0, z = 0) => new Vector3(x, y, z);
const RAIN_CAPACITY = 240;
const COLORS = [0xff6b6b, 0xffd23f, 0x6bcbff, 0x7bd88f, 0xc58bff, 0xff9f5a];

try {
	const renderer = new Renderer({ canvas, pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2) });
	const scene = new Scene();
	scene.background = new Color(0x0b0d17);
	const camera = new PerspectiveCamera(50, 1, 0.1, 200);

	scene.add(new AmbientLight(0x6670a8, 0.8));
	const sun = new DirectionalLight(0xffffff, 0.85);
	sun.position.set(6, 12, 8);
	scene.add(sun);
	const floor = new Mesh(new PlaneGeometry(40, 20), new LambertMaterial({ color: 0x59638f, side: DoubleSide }));
	floor.rotation.x = -Math.PI / 2;
	scene.add(floor);

	// geometry and materials shared by everything that is rebuilt on reset
	const boxGeometry = new BoxGeometry(1, 1, 1), ballGeometry = new SphereGeometry(0.5, 24, 12);
	const linkGeometry = new CapsuleGeometry(0.12, 0.5, 4, 12);
	const palette = COLORS.map((color) => new LambertMaterial({ color }));
	const steel = new LambertMaterial({ color: 0xb8c0d8 }), dark = new LambertMaterial({ color: 0x3a4170 });

	// all rain boxes are one InstancedMesh: one draw call, one geometry, per-instance transform and color
	const rain = new InstancedMesh(boxGeometry, new LambertMaterial({ color: 0xffffff }), RAIN_CAPACITY);
	rain.count = 0;
	scene.add(rain);

	let world, built = [], rainBodies = [], nextRain = 0, shots = [];
	const m = new Matrix4(), scaleVec = V(1, 1, 1), tint = new Color();

	function track(mesh, body) { scene.add(mesh); built.push(mesh); if (body) mesh.userData.body = body; return mesh; }

	function box(x, y, z, size, material, mass = 1) {
		const mesh = track(new Mesh(boxGeometry, material));
		mesh.scale.set(...size);
		world.addBody(new RigidBody({ shape: new BoxShape(...size), mass, position: V(x, y, z), object: mesh, friction: 0.6, restitution: 0.15 }));
	}

	function build() {
		world = new PhysicsWorld();
		world.addBody(new RigidBody({ shape: new PlaneShape(V(0, 1, 0), 0), mass: 0, restitution: 0.1 }));

		// --- capsule chain with a wrecking ball, released from the left ---
		const pivot = V(-3.5, 7, 0), theta = (58 * Math.PI) / 180, links = 8;
		const dir = V(-Math.sin(theta), -Math.cos(theta), 0), spin = new Quaternion().setFromAxisAngle(V(0, 0, 1), -theta);
		const beam = track(new Mesh(boxGeometry, dark));
		beam.scale.set(1.6, 0.25, 0.25);
		beam.position.copy(pivot);
		const bodies = [];
		for (let i = 0; i < links; i++) {
			const mesh = track(new Mesh(linkGeometry, steel));
			const body = new RigidBody({
				shape: new CapsuleShape(0.12, 0.5), mass: 0.6, position: pivot.clone().addScaledVector(dir, 0.5 * i + 0.25),
				quaternion: spin, object: mesh, linearDamping: 0.02, angularDamping: 0.05
			});
			world.addBody(body);
			bodies.push(body);
		}
		const ballMesh = track(new Mesh(ballGeometry, palette[0]));
		ballMesh.scale.setScalar(1.0);
		const ball = new RigidBody({ shape: new SphereShape(0.5), mass: 12, position: pivot.clone().addScaledVector(dir, 0.5 * links + 0.5), object: ballMesh, restitution: 0.2, linearDamping: 0.01 });
		world.addBody(ball);
		bodies.push(ball);
		world.addJoint(new BallSocketJoint(null, bodies[0], { anchor: pivot }));
		for (let i = 1; i < bodies.length; i++) {
			world.addJoint(new BallSocketJoint(bodies[i - 1], bodies[i], { anchor: pivot.clone().addScaledVector(dir, 0.5 * i) }));
		}

		// --- pyramid of boxes ---
		for (let row = 0; row < 5; row++) {
			for (let i = 0; i < 5 - row; i++) box(2.2 + (i - (4 - row) / 2) * 1.02, 0.5 + row, 0, [1, 1, 1], palette[(row + i) % palette.length]);
		}

		// --- propeller on a motorised hinge, with a few boxes to sweep up ---
		const hub = V(9.5, 2.7, 0.5);
		const post = track(new Mesh(boxGeometry, dark));
		post.scale.set(0.3, hub.y, 0.3);
		post.position.set(hub.x, hub.y / 2, 0);
		const bladeMesh = track(new Mesh(boxGeometry, palette[2]));
		bladeMesh.scale.set(4, 0.35, 0.35);
		const blade = new RigidBody({ shape: new BoxShape(4, 0.35, 0.35), mass: 15, position: hub, object: bladeMesh, linearDamping: 0, angularDamping: 0 });
		world.addBody(blade);
		world.addJoint(new HingeJoint(null, blade, { anchor: hub, axis: V(0, 0, 1), motorSpeed: -1.8, maxMotorTorque: 400 }));
		for (const x of [7.2, 8.6, 10.2, 11.4]) box(x, 0.4, 0.5, [0.8, 0.8, 0.8], palette[((x * 3) | 0) % palette.length], 0.8);

		rainBodies = [];
		nextRain = 0;
		rain.count = 0;
		shots = [];
	}

	function clear() {
		for (const mesh of built) scene.remove(mesh);
		built = [];
	}

	function rainDown(count = 40) {
		for (let n = 0; n < count; n++) {
			const index = nextRain++ % RAIN_CAPACITY;
			if (rainBodies[index]) world.removeBody(rainBodies[index].body);
			const size = 0.4 + Math.random() * 0.35;
			const body = new RigidBody({
				shape: new BoxShape(size, size, size), mass: size ** 3, friction: 0.6, restitution: 0.15,
				position: V(-3 + Math.random() * 13, 9 + Math.random() * 6, -2 + Math.random() * 4),
				quaternion: new Quaternion().setFromAxisAngle(V(Math.random(), Math.random(), Math.random()).normalize(), Math.random() * 6)
			});
			world.addBody(body);
			rainBodies[index] = { body, size, written: false };
			rain.setColorAt(index, tint.set(COLORS[index % COLORS.length]));
			rain.count = Math.min(RAIN_CAPACITY, Math.max(rain.count, index + 1));
		}
		rain.instanceColor.needsUpdate = true;
	}

	function shoot(ndcX, ndcY) {
		const target = V(ndcX, ndcY, 0.5).unproject(camera);
		const direction = target.sub(camera.position).normalize();
		const start = camera.position.clone().addScaledVector(direction, 2);
		const mesh = track(new Mesh(ballGeometry, palette[4]));
		mesh.scale.setScalar(0.4);
		const bullet = new RigidBody({
			shape: new SphereShape(0.2), mass: 2, position: start, object: mesh, ccd: true,
			velocity: direction.multiplyScalar(60), restitution: 0.3, linearDamping: 0
		});
		world.addBody(bullet);
		shots.push({ mesh, bullet });
		if (shots.length > 12) { const old = shots.shift(); scene.remove(old.mesh); world.removeBody(old.bullet); built.splice(built.indexOf(old.mesh), 1); }
	}

	canvas.addEventListener('pointerdown', (event) => {
		const r = canvas.getBoundingClientRect();
		shoot(((event.clientX - r.left) / r.width) * 2 - 1, -((event.clientY - r.top) / r.height) * 2 + 1);
	});
	$('btn-rain').onclick = () => rainDown(40);
	$('btn-shoot').onclick = () => shoot(0.1, -0.05);
	$('btn-reset').onclick = () => { clear(); build(); };
	build();

	let last = performance.now(), frames = 0, windowStart = last;
	function animate(now) {
		world.step(Math.max(0, Math.min((now - last) / 1000, 0.1)));
		last = now;

		// write an instance matrix while its body moves, and once more when it falls asleep
		let touched = false;
		for (let i = 0; i < rain.count; i++) {
			const item = rainBodies[i];
			if (!item) continue;
			if (item.body.sleeping) { if (item.written) continue; item.written = true; } else item.written = false;
			scaleVec.set(item.size, item.size, item.size);
			m.compose(item.body.position, item.body.quaternion, scaleVec);
			rain.setMatrixAt(i, m);
			touched = true;
		}
		if (touched) rain.instanceMatrix.needsUpdate = true;

		if (renderer.resizeToDisplaySize()) {
			camera.aspect = renderer.width / renderer.height;
			camera.updateProjectionMatrix();
			const k = Math.max(1, 1 / camera.aspect);
			camera.position.set(3, 8 * k, 19 * k);
			camera.lookAt(3, 2.4, 0);
		}
		renderer.render(scene, camera);

		frames++;
		if (now - windowStart >= 500) {
			const s = world.stats, r = renderer.info.render;
			infoEl.textContent = `${s.bodies - 1} benda · ${s.awake} aktif · ${s.contacts} kontak · ${s.joints} joint · fisika ${s.stepMs.toFixed(1)} ms · ${r.calls} draw call · ${Math.round((frames * 1000) / (now - windowStart))} fps`;
			frames = 0;
			windowStart = now;
		}
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
} catch (error) {
	console.error(error);
	const box = $('error');
	box.textContent = error.message;
	box.hidden = false;
}
