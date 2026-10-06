// A small scene using the full pipeline: scene graph, geometries, materials,
// transparency, wireframe, camera and renderer.render().
import {
	Renderer, Scene, PerspectiveCamera, Object3D, Mesh,
	BoxGeometry, SphereGeometry, PlaneGeometry,
	BasicMaterial, NormalMaterial, Color, DoubleSide
} from '../../src/index.js';

const infoEl = document.getElementById('info');

try {
	const renderer = new Renderer({
		canvas: document.getElementById('canvas'),
		pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2)
	});

	const scene = new Scene();
	scene.background = new Color(0x0b0d17);

	const camera = new PerspectiveCamera(55, 1, 0.1, 100);
	camera.position.set(0, 2.4, 7.5);
	camera.lookAt(0, 0, 0);

	const floor = new Mesh(
		new PlaneGeometry(16, 16, 16, 16),
		new BasicMaterial({ color: 0x2c3566, wireframe: true, side: DoubleSide })
	);
	floor.rotation.x = -Math.PI / 2;
	floor.position.y = -1.3;
	scene.add(floor);

	// Cube with a slightly larger wireframe child: children inherit the parent's transform.
	const cube = new Mesh(new BoxGeometry(1.6, 1.6, 1.6), new NormalMaterial());
	const outline = new Mesh(cube.geometry, new BasicMaterial({ color: 0xffffff, wireframe: true }));
	outline.scale.setScalar(1.003);
	cube.add(outline);
	scene.add(cube);

	// pivot -> planet -> moon: three nested transforms.
	const pivot = new Object3D();
	const planet = new Mesh(new SphereGeometry(0.6, 32, 16), new NormalMaterial());
	const moon = new Mesh(new SphereGeometry(0.22, 16, 8), new BasicMaterial({ color: 0xffd23f }));
	planet.position.x = 3;
	moon.position.x = 1.1;
	planet.add(moon);
	pivot.add(planet);
	scene.add(pivot);

	// Transparent objects are sorted back to front and do not write depth.
	const glass = new Mesh(
		new SphereGeometry(1.1, 32, 16),
		new BasicMaterial({ color: 0x5ee1ff, opacity: 0.35, transparent: true, depthWrite: false })
	);
	glass.position.set(-3, 0.3, 1);
	scene.add(glass);

	let frames = 0;
	let windowStart = performance.now();

	function animate(now) {
		const t = now / 1000;
		cube.rotation.x = t * 0.6;
		cube.rotation.y = t * 0.9;
		pivot.rotation.y = t * 0.7;
		planet.rotation.y = t * 2.5;
		glass.position.y = 0.3 + Math.sin(t * 1.3) * 0.4;

		if (renderer.resizeToDisplaySize()) {
			camera.aspect = renderer.width / renderer.height;
			camera.updateProjectionMatrix();
		}
		renderer.render(scene, camera);

		frames++;
		if (now - windowStart >= 500) {
			const { calls, triangles } = renderer.info.render;
			const fps = Math.round((frames * 1000) / (now - windowStart));
			infoEl.textContent = `${calls} draw calls · ${triangles} triangles · ${fps} fps`;
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
