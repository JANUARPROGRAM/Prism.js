// Ambient + directional + an orbiting point light on LambertMaterial surfaces.
import {
	Renderer, Scene, PerspectiveCamera, Mesh, Color,
	BoxGeometry, SphereGeometry, PlaneGeometry,
	LambertMaterial, BasicMaterial, AmbientLight, DirectionalLight, PointLight, DoubleSide
} from '../../src/index.js';

const infoEl = document.getElementById('info');
const canvas = document.getElementById('canvas');

try {
	const renderer = new Renderer({ canvas, pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2) });
	const scene = new Scene();
	scene.background = new Color(0x0b0d17);

	const camera = new PerspectiveCamera(55, 1, 0.1, 100);
	camera.position.set(0, 3, 8);
	camera.lookAt(0, 0.3, 0);

	const floor = new Mesh(new PlaneGeometry(16, 16), new LambertMaterial({ color: 0x8890b8, side: DoubleSide }));
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -1;
	scene.add(floor);

	const box = new Mesh(new BoxGeometry(1.6, 1.6, 1.6), new LambertMaterial({ color: 0xff6b6b }));
	box.position.set(-2.4, -0.2, 0);
	const ball = new Mesh(new SphereGeometry(1, 48, 24), new LambertMaterial({ color: 0x6bcbff }));
	ball.position.set(0, 0, 0);
	const tower = new Mesh(new BoxGeometry(1, 2.6, 1), new LambertMaterial({ color: 0xffd23f }));
	tower.position.set(2.4, 0.3, 0);
	scene.add(box, ball, tower);

	scene.add(new AmbientLight(0x4a5588, 0.7));
	const sun = new DirectionalLight(0xaabbff, 0.45);
	sun.position.set(-4, 6, 3);
	scene.add(sun);

	// A light is an Object3D, so a visible marker can simply be its child.
	const bulb = new PointLight(0xffaa55, 1.3, 11, 1.2);
	bulb.add(new Mesh(new SphereGeometry(0.12, 12, 6), new BasicMaterial({ color: 0xffd9a8 })));
	scene.add(bulb);

	canvas.addEventListener('pointerdown', () => { bulb.visible = !bulb.visible; });

	let frames = 0, windowStart = performance.now();
	function animate(now) {
		const t = now / 1000;
		bulb.position.set(Math.cos(t * 0.9) * 3.6, 1.1 + Math.sin(t * 1.7) * 0.5, Math.sin(t * 0.9) * 3.6);
		box.rotation.y = t * 0.5;
		tower.rotation.y = -t * 0.4;

		if (renderer.resizeToDisplaySize()) {
			camera.aspect = renderer.width / renderer.height;
			camera.updateProjectionMatrix();
			const k = Math.max(1, 1 / camera.aspect);
			camera.position.set(0, 3 * k, 8 * k);
		}
		renderer.render(scene, camera);

		frames++;
		if (now - windowStart >= 500) {
			const { calls, triangles, lights } = renderer.info.render;
			const fps = Math.round((frames * 1000) / (now - windowStart));
			infoEl.textContent = `${lights} lampu · ${calls} draw call · ${triangles} segitiga · ${fps} fps — ketuk layar: lampu titik on/off`;
			frames = 0;
			windowStart = now;
		}
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
} catch (error) {
	console.error(error);
	const box = document.getElementById('error');
	box.textContent = error.message;
	box.hidden = false;
}
