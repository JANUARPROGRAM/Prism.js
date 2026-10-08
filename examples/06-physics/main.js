// Rigid-body physics: boxes and balls fall into a walled arena. Tap the scene to shoot a heavy
// ball along that screen position (Vector3.unproject builds the ray).
import {
	Renderer, Scene, PerspectiveCamera, Mesh, Color, Vector3,
	BoxGeometry, SphereGeometry, PlaneGeometry, LambertMaterial,
	AmbientLight, DirectionalLight, DoubleSide,
	PhysicsWorld, RigidBody, BoxShape, SphereShape, PlaneShape
} from '../../src/index.js';

const $ = (id) => document.getElementById(id);
const canvas = $('canvas'), infoEl = $('info');
const ARENA = 6;          // half size of the walled square
const MAX_BODIES = 160;   // oldest bodies are removed beyond this
const PALETTE = [0xff6b6b, 0xffd23f, 0x6bcbff, 0x7bd88f, 0xc58bff, 0xff9f5a];

try {
	const renderer = new Renderer({ canvas, pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2) });
	const scene = new Scene();
	scene.background = new Color(0x0b0d17);
	const camera = new PerspectiveCamera(50, 1, 0.1, 100);

	scene.add(new AmbientLight(0x6670a8, 0.8));
	const sun = new DirectionalLight(0xffffff, 0.8);
	sun.position.set(4, 9, 5);
	scene.add(sun);

	const floor = new Mesh(new PlaneGeometry(ARENA * 2, ARENA * 2), new LambertMaterial({ color: 0x59638f, side: DoubleSide }));
	floor.rotation.x = -Math.PI / 2;
	scene.add(floor);

	// ---- physics world: ground + four invisible walls (infinite planes facing inward) ----
	const world = new PhysicsWorld({ gravity: new Vector3(0, -9.81, 0) });
	const wallPlane = (nx, nz) => new RigidBody({ shape: new PlaneShape(new Vector3(nx, 0, nz), -ARENA), mass: 0, restitution: 0.2 });
	world.addBody(new RigidBody({ shape: new PlaneShape(new Vector3(0, 1, 0), 0), mass: 0, restitution: 0.1 }));
	[wallPlane(1, 0), wallPlane(-1, 0), wallPlane(0, 1), wallPlane(0, -1)].forEach((w) => world.addBody(w));

	const materials = PALETTE.map((color) => new LambertMaterial({ color }));
	const boxGeometry = new BoxGeometry(1, 1, 1);
	const ballGeometry = new SphereGeometry(0.5, 24, 12);
	const rock = new LambertMaterial({ color: 0xe8ecff });
	let colorIndex = 0;
	const spawned = [];

	function addBody(mesh, body) {
		scene.add(mesh);
		world.addBody(body);
		spawned.push({ mesh, body });
		if (spawned.length > MAX_BODIES) {
			const old = spawned.shift();
			scene.remove(old.mesh);
			world.removeBody(old.body);
		}
		return body;
	}

	function spawnBox(x, y, z, size = 1, rotate = true) {
		const mesh = new Mesh(boxGeometry, materials[colorIndex++ % materials.length]);
		mesh.scale.setScalar(size);
		const body = new RigidBody({
			shape: new BoxShape(size, size, size), mass: size ** 3, position: new Vector3(x, y, z), object: mesh, friction: 0.6, restitution: 0.15
		});
		if (rotate) body.quaternion.setFromEuler({ x: Math.random() * 3, y: Math.random() * 3, z: Math.random() * 3, order: 'XYZ' });
		return addBody(mesh, body);
	}

	function spawnBall(x, y, z, radius = 0.5, mass = null, material = null) {
		const mesh = new Mesh(ballGeometry, material ?? materials[colorIndex++ % materials.length]);
		mesh.scale.setScalar(radius * 2);
		return addBody(mesh, new RigidBody({
			shape: new SphereShape(radius), mass: mass ?? (4 / 3) * Math.PI * radius ** 3 * 2, position: new Vector3(x, y, z),
			object: mesh, friction: 0.4, restitution: 0.45
		}));
	}

	function reset() {
		for (const { mesh, body } of spawned) { scene.remove(mesh); world.removeBody(body); }
		spawned.length = 0;
		// a 5-wide pyramid to knock over
		for (let row = 0; row < 5; row++) {
			for (let i = 0; i < 5 - row; i++) spawnBox((i - (4 - row) / 2) * 1.02, 0.5 + row * 1.0, -2, 1, false);
		}
		spawnBall(-3, 4, 1);
		spawnBall(3, 6, 0.5);
	}
	const random = (a, b) => a + Math.random() * (b - a);
	const spawnRandom = () => (Math.random() < 0.55
		? spawnBox(random(-4, 4), random(6, 9), random(-4, 3), random(0.6, 1.1))
		: spawnBall(random(-4, 4), random(6, 9), random(-4, 3), random(0.3, 0.55)));

	$('btn-box').onclick = () => spawnBox(random(-1, 1), 8, random(0, 2), random(0.7, 1.1));
	$('btn-ball').onclick = () => spawnBall(random(-1, 1), 8, random(0, 2), random(0.3, 0.6));
	$('btn-rain').onclick = () => { for (let i = 0; i < 25; i++) spawnRandom(); };
	$('btn-reset').onclick = reset;

	canvas.addEventListener('pointerdown', (event) => {
		const rect = canvas.getBoundingClientRect();
		const ndcX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const ndcY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		const direction = new Vector3(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
		const start = camera.position.clone().addScaledVector(direction, 1.5);
		const shot = spawnBall(start.x, start.y, start.z, 0.4, 6, rock);
		shot.velocity.copy(direction).multiplyScalar(20);
	});

	reset();

	let last = performance.now(), frames = 0, windowStart = last;
	function animate(now) {
		// rAF timestamps can precede performance.now() taken at setup, so clamp both ends
		world.step(Math.max(0, Math.min((now - last) / 1000, 0.1)));
		last = now;

		if (renderer.resizeToDisplaySize()) {
			camera.aspect = renderer.width / renderer.height;
			camera.updateProjectionMatrix();
			const k = Math.max(1, 1 / camera.aspect);
			camera.position.set(0, 9 * k, 14 * k);
			camera.lookAt(0, 0.8, 0);
		}
		renderer.render(scene, camera);

		frames++;
		if (now - windowStart >= 500) {
			const s = world.stats;
			infoEl.textContent = `${s.bodies - 5} benda · ${s.awake} aktif · ${s.contacts} kontak · fisika ${s.stepMs.toFixed(1)} ms · ${Math.round((frames * 1000) / (now - windowStart))} fps — ketuk layar untuk menembak`;
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
