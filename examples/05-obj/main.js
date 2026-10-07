// OBJ + MTL viewer: built-in models (crate with a texture, house with three materials)
// or your own files picked from the device (.obj, optional .mtl, and the texture images).
// Drag to rotate, mouse wheel to zoom.
import {
	Renderer, Scene, PerspectiveCamera, Object3D, Mesh, Color, PlaneGeometry,
	BasicMaterial, AmbientLight, DirectionalLight, PointLight, DoubleSide,
	OBJLoader, MTLLoader
} from '../../src/index.js';

const $ = (id) => document.getElementById(id);
const canvas = $('canvas'), statusEl = $('status'), infoEl = $('info'), errorEl = $('error');
const embedded = globalThis.__EMBEDDED_FILES__; // set by the single-file build; otherwise files come over HTTP
const basename = (url) => url.split(/[?#]/)[0].split('/').pop().toLowerCase();
const readAsDataURL = (file) => new Promise((resolve, reject) => {
	const reader = new FileReader();
	reader.onload = () => resolve(reader.result);
	reader.onerror = () => reject(new Error(`Tidak bisa membaca "${file.name}".`));
	reader.readAsDataURL(file);
});

function showError(error) {
	console.error(error);
	errorEl.textContent = error.message;
	errorEl.hidden = false;
}

async function loadBuiltIn(name) {
	if (!embedded) return new OBJLoader().loadAsync(`../../assets/models/${name}.obj`);
	const mtlLoader = new MTLLoader();
	mtlLoader.setURLModifier((url) => embedded[basename(url)] ?? url);
	const library = mtlLoader.parse(embedded[`${name}.mtl`], `${name}.mtl`);
	return new OBJLoader().parse(embedded[`${name}.obj`], library);
}

/** Models from the device: textures are matched to the .mtl by file name. */
async function loadFromFiles(fileList) {
	const files = [...fileList];
	const objFile = files.find((f) => /\.obj$/i.test(f.name));
	if (!objFile) throw new Error('Pilih sedikitnya satu file .obj. Tambahkan juga file .mtl dan gambar teksturnya bila ada.');

	const images = new Map();
	await Promise.all(files.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f.name))
		.map(async (f) => images.set(f.name.toLowerCase(), await readAsDataURL(f))));

	// Files from arbitrary exporters often have inconsistent winding, so draw both sides.
	const mtlLoader = new MTLLoader();
	mtlLoader.side = DoubleSide;
	mtlLoader.setURLModifier((url) => images.get(basename(url)) ?? url);
	const mtlFile = files.find((f) => /\.mtl$/i.test(f.name));
	const library = mtlFile ? mtlLoader.parse(await mtlFile.text(), mtlFile.name) : null;

	const loader = new OBJLoader();
	loader.side = DoubleSide;
	return loader.parse(await objFile.text(), library);
}

try {
	const renderer = new Renderer({ canvas, pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2) });
	const scene = new Scene();
	scene.background = new Color(0x0b0d17);
	const camera = new PerspectiveCamera(45, 1, 0.1, 100);

	const grid = new Mesh(new PlaneGeometry(10, 10, 10, 10), new BasicMaterial({ color: 0x2c3566, wireframe: true, side: DoubleSide }));
	grid.rotation.x = -Math.PI / 2;
	grid.position.y = -1.25;
	scene.add(grid);

	scene.add(new AmbientLight(0xffffff, 0.55));
	const sun = new DirectionalLight(0xffffff, 0.65);
	sun.position.set(3, 5, 4);
	scene.add(sun);
	const fill = new PointLight(0x88aaff, 0.5, 0, 2);
	fill.position.set(-4, 2, -3);
	scene.add(fill);

	const holder = new Object3D(); // rotated by dragging; the model inside is centered and scaled to fit
	scene.add(holder);
	let model = null, yaw = 0.5, pitch = 0.2, distance = 5, dragging = false;

	function disposeModel(group) {
		const materials = new Set();
		group.traverse((object) => {
			if (!object.isMesh) return;
			object.geometry.dispose();
			materials.add(object.material);
		});
		for (const material of materials) { material.map?.dispose(); material.dispose(); }
	}

	/** Centers the model on the origin and scales its longest side to 2 units. */
	function fit(group) {
		const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
		group.traverse((object) => {
			if (!object.isMesh) return;
			const p = object.geometry.attributes.position.array;
			for (let i = 0; i < p.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], p[i + k]); max[k] = Math.max(max[k], p[i + k]); }
		});
		const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
		if (!Number.isFinite(size) || size === 0) throw new Error('Model ini tidak punya geometri yang bisa ditampilkan.');
		const scale = 2 / size;
		group.scale.setScalar(scale);
		group.position.set(-(min[0] + max[0]) / 2 * scale, -(min[1] + max[1]) / 2 * scale, -(min[2] + max[2]) / 2 * scale);
	}

	function show(group, label) {
		fit(group);
		if (model) { holder.remove(model); disposeModel(model); }
		model = group;
		holder.add(group);
		errorEl.hidden = true;
		const data = group.userData.obj;
		statusEl.textContent = `${label}: ${group.children.length} mesh, ${data.triangleCount} segitiga`;
	}

	async function run(label, loading) {
		statusEl.textContent = `Memuat ${label}…`;
		try { show(await loading(), label); } catch (error) { statusEl.textContent = ''; showError(error); }
	}

	const press = (id) => { for (const b of ['btn-crate', 'btn-house']) $(b).setAttribute('aria-pressed', String(b === id)); };
	$('btn-crate').onclick = () => { press('btn-crate'); run('Crate', () => loadBuiltIn('crate')); };
	$('btn-house').onclick = () => { press('btn-house'); run('Rumah', () => loadBuiltIn('house')); };
	$('file').onchange = (event) => {
		const files = event.target.files;
		if (!files.length) return;
		press('');
		run(files[0].name, () => loadFromFiles(files));
		event.target.value = '';
	};

	let last = null;
	canvas.addEventListener('pointerdown', (e) => { dragging = true; last = [e.clientX, e.clientY]; canvas.setPointerCapture(e.pointerId); });
	canvas.addEventListener('pointermove', (e) => {
		if (!dragging) return;
		yaw += (e.clientX - last[0]) * 0.01;
		pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - last[1]) * 0.01));
		last = [e.clientX, e.clientY];
	});
	const release = () => { dragging = false; };
	canvas.addEventListener('pointerup', release);
	canvas.addEventListener('pointercancel', release);
	canvas.addEventListener('wheel', (e) => { e.preventDefault(); distance = Math.max(2.5, Math.min(14, distance * Math.exp(e.deltaY * 0.001))); }, { passive: false });

	run('Crate', () => loadBuiltIn('crate'));

	let frames = 0, windowStart = performance.now(), previous = windowStart;
	function animate(now) {
		if (!dragging) yaw += (now - previous) * 0.0004;
		previous = now;
		holder.rotation.set(pitch, yaw, 0);

		if (renderer.resizeToDisplaySize()) {
			camera.aspect = renderer.width / renderer.height;
			camera.updateProjectionMatrix();
		}
		const k = Math.max(1, 1 / camera.aspect);
		camera.position.set(0, 0.8 * k, distance * k);
		camera.lookAt(0, 0, 0);

		try {
			renderer.render(scene, camera);
		} catch (error) { // e.g. a texture larger than the GPU allows: drop the model and keep running
			if (model) { holder.remove(model); disposeModel(model); model = null; }
			showError(error);
		}

		frames++;
		if (now - windowStart >= 500) {
			const { calls, triangles } = renderer.info.render;
			infoEl.textContent = `${calls} draw call · ${triangles} segitiga · ${Math.round((frames * 1000) / (now - windowStart))} fps`;
			frames = 0;
			windowStart = now;
		}
		requestAnimationFrame(animate);
	}
	requestAnimationFrame(animate);
} catch (error) {
	showError(error);
}
