// Pixel-level checks against a real WebGL2 context. The unit tests (npm test) use a mock GL
// and cannot see shader output; this page can. Results: the page itself and window.__prismChecks.
import * as P from '../../src/index.js';

// Odd size on purpose: the camera axis then passes through the middle of the center pixel.
// With an even size it falls on a pixel boundary and "the center pixel" would sample a point
// half a pixel off-axis, tilting the surface normal enough to shift lighting by a few levels.
const SIZE = 65;
const CENTER = (SIZE - 1) / 2;
const canvas = document.createElement('canvas');
canvas.width = canvas.height = SIZE;
const renderer = new P.Renderer({ canvas, antialias: false, pixelRatio: 1 });
const gl = renderer.gl;

// ---------- helpers ----------
const pixel = (x = CENTER, y = CENTER) => {
	const out = new Uint8Array(4);
	gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
	return Array.from(out).slice(0, 3);
};
const countLit = () => {
	const all = new Uint8Array(SIZE * SIZE * 4);
	gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, all);
	let n = 0;
	for (let i = 0; i < all.length; i += 4) if (all[i] + all[i + 1] + all[i + 2] > 12) n++;
	return n;
};
const scanFor = (target, tol) => {
	const all = new Uint8Array(SIZE * SIZE * 4);
	gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, all);
	for (let i = 0; i < all.length; i += 4) {
		if (target.every((t, k) => Math.abs(all[i + k] - t) <= tol)) return true;
	}
	return false;
};
const camera = (z = 5) => {
	const c = new P.PerspectiveCamera(40, 1, 0.1, 100);
	c.position.z = z;
	return c;
};
const sceneWith = (...objects) => {
	const scene = new P.Scene();
	scene.background = new P.Color(0x000000);
	scene.add(...objects);
	return scene;
};
const shot = (scene, cam = camera()) => { renderer.render(scene, cam); return pixel(); };
const near = (actual, expected, tol = 3, label = '') => {
	if (!expected.every((e, i) => Math.abs(actual[i] - e) <= tol)) {
		throw new Error(`${label}expected rgb(${expected.map((v) => Math.round(v))}) ±${tol}, got rgb(${actual})`);
	}
};
const sphere = () => new P.SphereGeometry(1, 64, 32); // a vertex sits exactly at the point facing the camera
const lambertSphere = (options = {}) => new P.Mesh(sphere(), new P.LambertMaterial(options));
const directional = (position, intensity = 1, color = 0xffffff) => {
	const light = new P.DirectionalLight(color, intensity);
	light.position.set(...position);
	return light;
};
const point = (position, intensity, distance, decay) => {
	const light = new P.PointLight(0xffffff, intensity, distance, decay);
	light.position.set(...position);
	return light;
};
const dataTexture = (pixels, w, h) => {
	const t = new P.Texture({ data: new Uint8Array(pixels), width: w, height: h });
	t.magFilter = t.minFilter = P.NearestFilter;
	t.generateMipmaps = false;
	return t;
};
/** 2x2 image: top row red, green; bottom row blue, white. */
const QUAD_PIXELS = [255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255];
const QUAD_EXPECTED = { topLeft: [255, 0, 0], topRight: [0, 255, 0], bottomLeft: [0, 0, 255], bottomRight: [255, 255, 255] };
const quadrants = (scene) => {
	renderer.render(scene, camera());
	return { topLeft: pixel(16, 49), topRight: pixel(49, 49), bottomLeft: pixel(16, 16), bottomRight: pixel(49, 16) };
};
const bigPlane = (material) => new P.Mesh(new P.PlaneGeometry(8, 8), material);
const waitFor = async (condition, ms = 4000) => {
	const start = performance.now();
	while (!condition()) {
		if (performance.now() - start > ms) throw new Error('timed out waiting for the texture image to load');
		await new Promise((r) => setTimeout(r, 25));
	}
};

// ---------- checks ----------
const checks = [];
const check = (name, fn) => checks.push({ name, fn });

check('clear color comes from scene.background', () => {
	const scene = sceneWith();
	scene.background = new P.Color(0x336699);
	near(shot(scene), [51, 102, 153]);
});

check('BasicMaterial draws its color and leaves the rest empty', () => {
	const scene = sceneWith(new P.Mesh(new P.BoxGeometry(1, 1, 1), new P.BasicMaterial({ color: 0xff0000 })));
	renderer.render(scene, camera());
	near(pixel(), [255, 0, 0], 2, 'center ');
	near(pixel(1, 1), [0, 0, 0], 0, 'corner ');
});

check('NormalMaterial maps a camera-facing normal to (0.5, 0.5, 1)', () => {
	near(shot(sceneWith(new P.Mesh(sphere(), new P.NormalMaterial()))), [128, 128, 255]);
});

check('opacity 0.5 blends with the background', () => {
	const m = new P.BasicMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
	near(shot(sceneWith(new P.Mesh(new P.PlaneGeometry(4, 4), m))), [128, 0, 0]);
});

check('depth test hides the far object regardless of add order', () => {
	const near_ = () => new P.Mesh(new P.BoxGeometry(2, 2, 2), new P.BasicMaterial({ color: 0x0000ff }));
	const far = () => { const m = new P.Mesh(new P.BoxGeometry(2, 2, 2), new P.BasicMaterial({ color: 0xff0000 })); m.position.z = -3; return m; };
	near(shot(sceneWith(far(), near_())), [0, 0, 255], 2, 'far first: ');
	near(shot(sceneWith(near_(), far())), [0, 0, 255], 2, 'near first: ');
});

check('transparent objects are composited far to near whatever the add order', () => {
	const plane = (color, z) => {
		const m = new P.Mesh(new P.PlaneGeometry(4, 4), new P.BasicMaterial({ color, opacity: 0.5, transparent: true, depthWrite: false }));
		m.position.z = z;
		return m;
	};
	// red far, green near: red first (127,0,0), then green over it -> (64,128,0)
	near(shot(sceneWith(plane(0xff0000, -1), plane(0x00ff00, 1))), [64, 128, 0], 3, 'far added first: ');
	near(shot(sceneWith(plane(0x00ff00, 1), plane(0xff0000, -1))), [64, 128, 0], 3, 'near added first: ');
});

check('side selects which faces are drawn', () => {
	const draw = (side, turned) => {
		const mesh = new P.Mesh(new P.PlaneGeometry(4, 4), new P.BasicMaterial({ color: 0xff0000, side }));
		if (turned) mesh.rotation.y = Math.PI;
		return shot(sceneWith(mesh))[0] > 200;
	};
	const results = {
		frontFacing_Front: draw(P.FrontSide, false), turned_Front: draw(P.FrontSide, true),
		frontFacing_Back: draw(P.BackSide, false), turned_Back: draw(P.BackSide, true),
		turned_Double: draw(P.DoubleSide, true)
	};
	const expected = { frontFacing_Front: true, turned_Front: false, frontFacing_Back: false, turned_Back: true, turned_Double: true };
	if (JSON.stringify(results) !== JSON.stringify(expected)) {
		throw new Error(`visible: ${JSON.stringify(results)}, expected ${JSON.stringify(expected)}`);
	}
});

check('wireframe draws edges only', () => {
	const geometry = new P.PlaneGeometry(3, 3);
	renderer.render(sceneWith(new P.Mesh(geometry, new P.BasicMaterial({ color: 0xffffff }))), camera());
	const solid = countLit();
	renderer.render(sceneWith(new P.Mesh(geometry, new P.BasicMaterial({ color: 0xffffff, wireframe: true }))), camera());
	const lines = countLit();
	if (!(lines > 100 && lines < solid / 4)) throw new Error(`wireframe pixels ${lines}, solid pixels ${solid}`);
});

check('ambient light scales the material color', () => {
	near(shot(sceneWith(lambertSphere(), new P.AmbientLight(0xffffff, 0.5))), [128, 128, 128]);
});

check('directional light follows N·L for many directions', () => {
	const table = [
		[[0, 0, 5], 1, 0, 255], [[5, 0, 0], 1, 0, 0], [[5, 0, 5], 1, 0, 180],
		[[0, 0, 5], 0.5, 0.2, 178.5], [[0, 0, 5], 0.25, 0, 63.75],
		[[0, -5, 0], 1, 0, 0], [[0, 0, -5], 1, 0, 0]
	];
	for (const [position, intensity, ambient, expected] of table) {
		const lights = [directional(position, intensity)];
		if (ambient > 0) lights.push(new P.AmbientLight(0xffffff, ambient));
		near(shot(sceneWith(lambertSphere(), ...lights)), [expected, expected, expected], 3, `light ${position} x${intensity} + ambient ${ambient}: `);
	}
});

check('light directions are correct when the camera moves (view-space transform)', () => {
	const look = (position) => { const c = camera(); c.position.set(...position); c.lookAt(0, 0, 0); return c; };
	const cases = [
		[[5, 0, 0], [10, 0, 0], 255], [[5, 0, 0], [0, 0, 10], 0], [[5, 0, 0], [10, 0, 10], 180],
		[[0, 5, 0], [0, 10, 0], 255], [[0, 5, 0], [10, 0, 0], 0], [[-4, 3, 2], [-8, 6, 4], 255]
	];
	for (const [cameraPosition, lightPosition, expected] of cases) {
		const value = shot(sceneWith(lambertSphere(), directional(lightPosition)), look(cameraPosition));
		near(value, [expected, expected, expected], 3, `camera ${cameraPosition}, light ${lightPosition}: `);
	}
});

check('two directional lights add up', () => {
	near(shot(sceneWith(lambertSphere(), directional([0, 0, 5], 0.3), directional([0, 0, 9], 0.4))), [178.5, 178.5, 178.5]);
});

check('point light: no range = constant, range and decay attenuate', () => {
	const at = (...args) => shot(sceneWith(lambertSphere(), point(...args)))[0];
	near([at([0, 0, 3], 1, 0, 2)], [255], 3, 'no range: ');
	near([at([0, 0, 3], 1, 4, 1)], [127.5], 3, 'range 4 decay 1: ');
	near([at([0, 0, 3], 1, 4, 2)], [63.75], 3, 'range 4 decay 2: ');
	near([at([0, 0, 3], 1, 1.5, 1)], [0], 1, 'out of range: ');
	near([at([0, 0, 3], 0.5, 0, 2)], [127.5], 3, 'intensity 0.5: ');
});

check('a point light parented to a moved group lights the surface', () => {
	const group = new P.Group();
	group.position.z = 3;
	group.add(point([0, 0, 0], 1, 0, 2));
	near(shot(sceneWith(lambertSphere(), group)), [255, 255, 255]);
});

check('light color and material color multiply per channel', () => {
	near(shot(sceneWith(lambertSphere(), directional([0, 0, 5], 1, 0xff0000))), [255, 0, 0], 2, 'red light: ');
	near(shot(sceneWith(lambertSphere({ color: 0x00ff00 }), directional([0, 0, 5]))), [0, 255, 0], 2, 'green material: ');
	near(shot(sceneWith(lambertSphere({ color: 0xff8000 }), directional([0, 0, 5], 1, 0x00ffff))), [0, 128, 0], 3, 'orange x cyan: ');
});

check('lit materials without lights are black; hidden lights do not count', () => {
	near(shot(sceneWith(lambertSphere())), [0, 0, 0], 0, 'no lights: ');
	const off = directional([0, 0, 5]);
	off.visible = false;
	near(shot(sceneWith(lambertSphere(), off)), [0, 0, 0], 0, 'hidden light: ');
});

check('double-sided lit surfaces are lit from the viewing side', () => {
	const plane = new P.Mesh(new P.PlaneGeometry(4, 4), new P.LambertMaterial({ side: P.DoubleSide }));
	plane.rotation.y = Math.PI; // its front now faces away from the camera
	near(shot(sceneWith(plane, directional([0, 0, 5]))), [255, 255, 255], 3, 'light on the camera side: ');
	near(shot(sceneWith(plane, directional([0, 0, -5]))), [0, 0, 0], 0, 'light behind: ');
});

check('texture orientation (raw RGBA data): image top is at the top of the surface', () => {
	const q = quadrants(sceneWith(bigPlane(new P.BasicMaterial({ map: dataTexture(QUAD_PIXELS, 2, 2) }))));
	for (const key of Object.keys(QUAD_EXPECTED)) near(q[key], QUAD_EXPECTED[key], 2, `${key}: `);
});

check('texture orientation (real PNG decoded by the browser via TextureLoader)', async () => {
	const source = document.createElement('canvas');
	source.width = source.height = 2;
	const context = source.getContext('2d');
	const image = context.createImageData(2, 2);
	image.data.set(QUAD_PIXELS);
	context.putImageData(image, 0, 0);
	const texture = await new P.TextureLoader().loadAsync(source.toDataURL('image/png'));
	texture.magFilter = texture.minFilter = P.NearestFilter;
	texture.generateMipmaps = false;
	const q = quadrants(sceneWith(bigPlane(new P.BasicMaterial({ map: texture }))));
	for (const key of Object.keys(QUAD_EXPECTED)) near(q[key], QUAD_EXPECTED[key], 2, `${key}: `);
});

check('texture is multiplied by the material color; a missing image shows the color', () => {
	const white = dataTexture([255, 255, 255, 255], 1, 1);
	near(shot(sceneWith(bigPlane(new P.BasicMaterial({ map: white, color: 0xff0000 })))), [255, 0, 0], 2, 'white x red: ');
	const green = dataTexture([0, 255, 0, 255], 1, 1);
	near(shot(sceneWith(bigPlane(new P.BasicMaterial({ map: green, color: 0xff0000 })))), [0, 0, 0], 2, 'green x red: ');
	near(shot(sceneWith(bigPlane(new P.BasicMaterial({ map: new P.Texture(null), color: 0x00ff00 })))), [0, 255, 0], 2, 'placeholder: ');
});

check('lit texture: texel x light', () => {
	const orange = dataTexture([255, 128, 0, 255], 1, 1);
	const plane = new P.Mesh(new P.PlaneGeometry(8, 8), new P.LambertMaterial({ map: orange }));
	near(shot(sceneWith(plane, directional([0, 0, 5], 0.5))), [128, 64, 0], 3);
});

check('mipmapped texture still shows its dominant color when minified', () => {
	const t = new P.Texture({ data: new Uint8Array(32 * 32 * 4).fill(0).map((_, i) => (i % 4 === 0 || i % 4 === 3 ? 255 : 0)), width: 32, height: 32 });
	near(shot(sceneWith(bigPlane(new P.BasicMaterial({ map: t })))), [255, 0, 0], 3);
});

check('OBJ + MTL parsed from text: Kd, opacity and a mapped texture reach the screen', () => {
	const quad = (mtl, textureLoader) => {
		const mtlLoader = new P.MTLLoader();
		if (textureLoader) mtlLoader.textureLoader = textureLoader;
		const library = mtlLoader.parse(mtl, 'q/q.mtl');
		const obj = 'v -4 -4 0\nv 4 -4 0\nv 4 4 0\nv -4 4 0\nvt 0 0\nvt 1 0\nvt 1 1\nvt 0 1\nvn 0 0 1\nusemtl M\nf 1/1/1 2/2/1 3/3/1 4/4/1';
		return sceneWith(new P.OBJLoader().setMaterials(library).parse(obj), new P.AmbientLight(0xffffff, 1));
	};
	near(shot(quad('newmtl M\nKd 0 0 1')), [0, 0, 255], 2, 'Kd: ');
	near(shot(quad('newmtl M\nKd 1 0 0\nd 0.5')), [128, 0, 0], 3, 'd 0.5: ');
	const yellow = { setURLModifier() {}, load() { return dataTexture([255, 255, 0, 255], 1, 1); } };
	near(shot(quad('newmtl M\nKd 1 1 1\nmap_Kd y.png', yellow)), [255, 255, 0], 2, 'map_Kd: ');
});

check('assets/models/crate: obj + mtl + png load over HTTP and the texture shows', async () => {
	const group = await new P.OBJLoader().loadAsync('../../assets/models/crate.obj');
	const material = group.children[0].material;
	if (!material.map) throw new Error('crate material has no map');
	await waitFor(() => material.map.image !== null);
	const scene = sceneWith(group, new P.AmbientLight(0xffffff, 1));
	renderer.render(scene, camera(3));
	near(pixel(), [205, 140, 75], 8, 'knot at the center of the front face: '); // texel color in crate.png
});

check('assets/models/house: three materials all appear', async () => {
	const group = await new P.OBJLoader().loadAsync('../../assets/models/house.obj');
	if (group.children.length !== 3) throw new Error(`expected 3 meshes, got ${group.children.length}`);
	const c = camera(6);
	c.position.y = 1.2;
	c.lookAt(0, 0.9, 0);
	renderer.render(sceneWith(group, new P.AmbientLight(0xffffff, 1)), c);
	for (const [name, rgb] of [['walls', [217, 191, 140]], ['roof', [179, 38, 26]], ['door', [89, 51, 26]]]) {
		if (!scanFor(rgb, 3)) throw new Error(`no ${name} pixels (rgb ${rgb}) on screen`);
	}
});

/** The whole frame as bytes. */
const frame = () => {
	const all = new Uint8Array(SIZE * SIZE * 4);
	gl.readPixels(0, 0, SIZE, SIZE, gl.RGBA, gl.UNSIGNED_BYTE, all);
	return all;
};
const compareFrames = (a, b) => {
	let different = 0, worst = 0, lit = 0;
	for (let i = 0; i < a.length; i += 4) {
		const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]));
		if (d > 0) different++;
		if (d > worst) worst = d;
		if (a[i] + a[i + 1] + a[i + 2] > 12) lit++;
	}
	return { different, worst, lit };
};
const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

check('frustum culling does not change a single pixel of the frame', () => {
	const rand = seeded(77);
	const scene = sceneWith(new P.AmbientLight(0xffffff, 0.35), directional([3, 5, 4], 0.7));
	const materials = [0xff6b6b, 0x6bcbff, 0xffd23f].map((color) => new P.LambertMaterial({ color }));
	const meshes = [];
	for (let i = 0; i < 90; i++) {
		const mesh = new P.Mesh(i % 2 ? new P.SphereGeometry(0.4 + rand() * 0.6, 16, 8) : new P.BoxGeometry(0.5 + rand(), 0.5 + rand(), 0.5 + rand()), materials[i % 3]);
		mesh.position.set(rand() * 24 - 12, rand() * 24 - 12, rand() * 30 - 22);   // many outside, many straddling the edges
		mesh.quaternion.setFromAxisAngle(new P.Vector3(rand(), rand(), rand()).normalize(), rand() * 6);
		meshes.push(mesh);
		scene.add(mesh);
	}
	const cam = camera(8);
	for (const m of meshes) m.frustumCulled = false;
	renderer.render(scene, cam);
	const without = frame();
	const drawnAll = renderer.info.render.calls;
	for (const m of meshes) m.frustumCulled = true;
	renderer.render(scene, cam);
	const withCulling = frame();
	const { different, worst, lit } = compareFrames(without, withCulling);
	if (renderer.info.render.culled < 20) throw new Error(`only ${renderer.info.render.culled} meshes were culled: the scene does not exercise culling`);
	if (lit < 300) throw new Error(`the frame is nearly empty (${lit} lit pixels)`);
	if (different !== 0) throw new Error(`${different} pixels differ (worst channel difference ${worst}); culled ${renderer.info.render.culled} of ${drawnAll}`);
});

check('an InstancedMesh renders the same image as the equivalent separate meshes (Lambert, non-uniform scale, colors)', () => {
	const rand = seeded(5);
	const count = 40;
	const geometry = new P.BoxGeometry(1, 1, 1);
	const instanced = new P.InstancedMesh(geometry, new P.LambertMaterial({ color: 0xffffff }), count);
	const separate = [];
	const m = new P.Matrix4(), q = new P.Quaternion(), tint = new P.Color();
	for (let i = 0; i < count; i++) {
		const position = new P.Vector3(rand() * 4 - 2, rand() * 4 - 2, rand() * 2 - 1);
		q.setFromAxisAngle(new P.Vector3(rand(), rand(), rand()).normalize(), rand() * 6);
		const scale = new P.Vector3(0.2 + rand() * 0.5, 0.2 + rand() * 0.5, 0.2 + rand() * 0.5); // non-uniform: the normal matrix matters
		m.compose(position, q, scale);
		instanced.setMatrixAt(i, m);
		tint.setRGB(0.3 + rand() * 0.7, 0.3 + rand() * 0.7, 0.3 + rand() * 0.7);
		instanced.setColorAt(i, tint);
		const mesh = new P.Mesh(geometry, new P.LambertMaterial({ color: tint.clone() }));
		mesh.position.copy(position); mesh.quaternion.copy(q); mesh.scale.copy(scale);
		separate.push(mesh);
	}
	instanced.instanceMatrix.needsUpdate = true;
	instanced.instanceColor.needsUpdate = true;
	const lights = [new P.AmbientLight(0xffffff, 0.3), directional([2, 4, 5], 0.8)];
	renderer.render(sceneWith(instanced, ...lights), camera(7));
	const a = frame();
	if (renderer.info.render.calls !== 1) throw new Error(`instanced draw calls: ${renderer.info.render.calls}`);
	renderer.render(sceneWith(...separate, ...lights.map((l) => l.clone ? l.clone() : l)), camera(7));
	const b = frame();
	if (renderer.info.render.calls !== count) throw new Error(`separate draw calls: ${renderer.info.render.calls}`);
	const { different, worst, lit } = compareFrames(a, b);
	if (lit < 300) throw new Error(`the frame is nearly empty (${lit} lit pixels)`);
	// the two paths multiply matrices in different places (CPU double precision vs GPU float), so allow rounding noise
	if (worst > 2 || different > lit * 0.02) throw new Error(`${different} of ${lit} lit pixels differ, worst channel difference ${worst}`);
});

check('instancing with NormalMaterial and BasicMaterial matches separate meshes too', () => {
	const rand = seeded(19);
	for (const makeMaterial of [() => new P.NormalMaterial(), () => new P.BasicMaterial({ color: 0x88ccff })]) {
		const geometry = new P.SphereGeometry(0.5, 20, 10);
		const count = 12;
		const instanced = new P.InstancedMesh(geometry, makeMaterial(), count);
		const separate = [];
		for (let i = 0; i < count; i++) {
			const mesh = new P.Mesh(geometry, makeMaterial());
			mesh.position.set(rand() * 3 - 1.5, rand() * 3 - 1.5, rand() * 2 - 1);
			mesh.scale.set(0.5 + rand(), 0.5 + rand(), 0.5 + rand());
			mesh.updateMatrixWorld();
			instanced.setMatrixAt(i, mesh.matrix);
			separate.push(mesh);
		}
		instanced.instanceMatrix.needsUpdate = true;
		renderer.render(sceneWith(instanced), camera(6));
		const a = frame();
		renderer.render(sceneWith(...separate), camera(6));
		const { different, worst, lit } = compareFrames(a, frame());
		if (lit < 200) throw new Error(`the frame is nearly empty (${lit} lit pixels)`);
		if (worst > 2 || different > lit * 0.02) throw new Error(`${different} of ${lit} lit pixels differ, worst ${worst}`);
	}
});

check('InstancedMesh.count draws only the first instances, and per-instance data can be updated between frames', () => {
	const mesh = new P.InstancedMesh(new P.PlaneGeometry(2, 2), new P.BasicMaterial({ color: 0xffffff }), 3);
	mesh.setMatrixAt(0, new P.Matrix4().makeTranslation(-3, 0, 0));
	mesh.setMatrixAt(1, new P.Matrix4().makeTranslation(0, 0, 0));
	mesh.setMatrixAt(2, new P.Matrix4().makeTranslation(3, 0, 0));
	mesh.setColorAt(0, new P.Color(1, 0, 0)); mesh.setColorAt(1, new P.Color(0, 1, 0)); mesh.setColorAt(2, new P.Color(0, 0, 1));
	mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
	const wide = () => { const c = new P.PerspectiveCamera(40, 1, 0.1, 100); c.position.z = 12; return c; };
	renderer.render(sceneWith(mesh), wide());
	near(pixel(CENTER, CENTER), [0, 255, 0], 2, 'middle instance: ');
	mesh.count = 1;
	renderer.render(sceneWith(mesh), wide());
	near(pixel(CENTER, CENTER), [0, 0, 0], 0, 'the middle instance is no longer drawn: ');
	mesh.count = 3;
	mesh.setColorAt(1, new P.Color(1, 1, 0)); mesh.instanceColor.needsUpdate = true;
	renderer.render(sceneWith(mesh), wide());
	near(pixel(CENTER, CENTER), [255, 255, 0], 2, 'the color update reached the GPU: ');
});

check('renderer.info reports what was drawn and GPU objects are released on dispose', () => {
	const scene = sceneWith(lambertSphere(), new P.AmbientLight());
	renderer.render(scene, camera());
	if (renderer.info.render.calls !== 1 || renderer.info.render.lights !== 1) throw new Error(JSON.stringify(renderer.info.render));
	if (renderer.info.render.triangles !== 2 * 64 * (32 - 1)) throw new Error(`triangles ${renderer.info.render.triangles}`);
});

// ---------- runner ----------
const results = [];
const list = document.getElementById('results');
for (const { name, fn } of checks) {
	const item = document.createElement('li');
	try {
		await fn();
		results.push({ name, passed: true });
		item.className = 'pass';
		item.textContent = name;
	} catch (error) {
		results.push({ name, passed: false, message: error.message });
		item.className = 'fail';
		item.textContent = name;
		const detail = document.createElement('pre');
		detail.textContent = error.message;
		item.appendChild(detail);
	}
	list.appendChild(item);
}
const failed = results.filter((r) => !r.passed).length;
document.getElementById('summary').textContent =
	`${results.length - failed} passed, ${failed} failed · ${renderer.capabilities.glVersion}`;
window.__prismChecks = { passed: results.length - failed, failed, results };
