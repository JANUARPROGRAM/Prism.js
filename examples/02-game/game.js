// Prism Dodge: a 2D game drawn entirely through Prism.js Renderer + WebGLProgram.
// All shapes go into one dynamic vertex buffer that is uploaded and drawn once per frame.
import { Renderer, WebGLProgram } from '../../src/index.js';

const VERT = `#version 300 es
layout(location = 0) in vec2 aPos;
layout(location = 1) in vec3 aColor;
uniform vec2 uRes;
out vec3 vColor;
void main() {
	vec2 c = aPos / uRes * 2.0 - 1.0;
	gl_Position = vec4(c.x, -c.y, 0.0, 1.0);
	vColor = aColor;
}`;
const FRAG = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() { outColor = vec4(vColor, 1.0); }`;

const FLOATS = 5; // x, y, r, g, b
const MAX_VERTS = 2048;
const rgb = (hex) => [(hex >> 16 & 255) / 255, (hex >> 8 & 255) / 255, (hex & 255) / 255];
const C = { bg: 0x0b0d17, star: rgb(0x3a4170), ship: rgb(0x5ee1ff), flame: rgb(0xffa63a), coin: rgb(0xffd23f),
	hazard: [rgb(0xff4d6d), rgb(0xff7a45), rgb(0xc13cff)] };

class Batch {
	constructor(gl) {
		this.gl = gl;
		this.data = new Float32Array(MAX_VERTS * FLOATS);
		this.count = 0;
		this.vao = gl.createVertexArray();
		this.buffer = gl.createBuffer();
		gl.bindVertexArray(this.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.data.byteLength, gl.DYNAMIC_DRAW);
		const stride = FLOATS * 4;
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);
		gl.enableVertexAttribArray(1);
		gl.vertexAttribPointer(1, 3, gl.FLOAT, false, stride, 8);
		gl.bindVertexArray(null);
	}
	vertex(x, y, c) {
		if (this.count >= MAX_VERTS) return;
		const d = this.data, i = this.count++ * FLOATS;
		d[i] = x; d[i + 1] = y; d[i + 2] = c[0]; d[i + 3] = c[1]; d[i + 4] = c[2];
	}
	triangle(x1, y1, x2, y2, x3, y3, c) { this.vertex(x1, y1, c); this.vertex(x2, y2, c); this.vertex(x3, y3, c); }
	rect(x, y, w, h, c) { this.triangle(x, y, x + w, y, x, y + h, c); this.triangle(x + w, y, x + w, y + h, x, y + h, c); }
	flush() {
		if (this.count === 0) return;
		const gl = this.gl;
		gl.bindVertexArray(this.vao);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.data, 0, this.count * FLOATS);
		gl.drawArrays(gl.TRIANGLES, 0, this.count);
		gl.bindVertexArray(null);
		this.count = 0;
	}
}

const $ = (id) => document.getElementById(id);
const msg = $('msg'), scoreEl = $('score'), bestEl = $('best'), titleEl = $('title'), hintEl = $('hint');

try {
	const canvas = $('c');
	const renderer = new Renderer({ canvas, pixelRatio: Math.min(globalThis.devicePixelRatio || 1, 2) });
	renderer.setClearColor(C.bg);
	const gl = renderer.gl;
	const program = new WebGLProgram(gl, { name: 'DodgeProgram', vertexShader: VERT, fragmentShader: FRAG });
	const resolution = program.getUniformLocation('uRes');
	const batch = new Batch(gl);

	let best = 0;
	try { best = Number(localStorage.getItem('prism-dodge-best')) || 0; } catch { /* storage unavailable */ }
	bestEl.textContent = best ? `Terbaik ${best}` : '';

	const stars = Array.from({ length: 45 }, () => ({ x: Math.random(), y: Math.random(), s: 1 + Math.random() * 2, v: 20 + Math.random() * 60 }));
	const keys = { left: false, right: false };
	const g = { state: 'ready', t: 0, coins: 0, x: 0, target: 0, spawn: 0, items: [], overAt: 0, shown: -1 };

	const score = () => Math.floor(g.t * 10) + g.coins * 50;
	const start = () => {
		Object.assign(g, { state: 'play', t: 0, coins: 0, spawn: 0.4, items: [], shown: -1 });
		msg.hidden = true;
	};
	const tapAction = () => {
		if (g.state === 'ready' || (g.state === 'over' && performance.now() - g.overAt > 500)) start();
	};
	const gameOver = () => {
		g.state = 'over';
		g.overAt = performance.now();
		const s = score();
		if (s > best) {
			best = s;
			bestEl.textContent = `Terbaik ${best}`;
			try { localStorage.setItem('prism-dodge-best', String(best)); } catch { /* ignore */ }
		}
		titleEl.textContent = `Skor ${s}`;
		hintEl.textContent = s >= best ? 'Rekor baru!' : 'Tabrakan.';
		msg.hidden = false;
	};

	canvas.addEventListener('pointerdown', (e) => { g.target = e.clientX - canvas.getBoundingClientRect().left; tapAction(); });
	canvas.addEventListener('pointermove', (e) => { g.target = e.clientX - canvas.getBoundingClientRect().left; });
	addEventListener('keydown', (e) => {
		if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
		else if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
		else if (e.key === ' ' || e.key === 'Enter') tapAction();
	});
	addEventListener('keyup', (e) => {
		if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
		else if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
	});

	const SHIP_Y_OFFSET = 90, SHIP_RADIUS = 13;

	function update(dt, w, h) {
		const playing = g.state === 'play';
		for (const s of stars) {
			s.y += s.v * dt * (playing ? 3 : 1) / h;
			if (s.y > 1) { s.y = 0; s.x = Math.random(); }
		}
		if (!playing) return;

		g.t += dt;
		const level = Math.min(1, g.t / 60);
		g.target += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * 600 * dt;
		g.target = Math.max(20, Math.min(w - 20, g.target));
		g.x += (g.target - g.x) * Math.min(1, dt * 14);

		g.spawn -= dt;
		if (g.spawn <= 0) {
			g.spawn = 0.7 - 0.45 * level;
			const coin = Math.random() < 0.18;
			const size = coin ? 18 : 22 + Math.random() * 34;
			g.items.push({ coin, size, x: Math.random() * (w - size), y: -size, color: coin ? C.coin : C.hazard[(Math.random() * 3) | 0], v: 170 + 260 * level + Math.random() * 60 });
		}

		const py = h - SHIP_Y_OFFSET + 2;
		for (let i = g.items.length - 1; i >= 0; i--) {
			const it = g.items[i];
			it.y += it.v * dt;
			const nx = Math.max(it.x, Math.min(g.x, it.x + it.size));
			const ny = Math.max(it.y, Math.min(py, it.y + it.size));
			const hit = (g.x - nx) ** 2 + (py - ny) ** 2 < SHIP_RADIUS ** 2;
			if (hit && it.coin) { g.coins++; g.items.splice(i, 1); }
			else if (hit) { gameOver(); return; }
			else if (it.y > h) g.items.splice(i, 1);
		}
	}

	function draw(w, h) {
		renderer.clear();
		program.use();
		gl.uniform2f(resolution, w, h);
		for (const s of stars) batch.rect(s.x * w, s.y * h, s.s, s.s, C.star);
		for (const it of g.items) batch.rect(it.x, it.y, it.size, it.size, it.color);
		if (g.state !== 'over') {
			const y = h - SHIP_Y_OFFSET, flicker = 8 + Math.sin(g.t * 60) * 3 + 6;
			batch.triangle(g.x - 6, y + 16, g.x + 6, y + 16, g.x, y + 16 + flicker, C.flame);
			batch.triangle(g.x, y - 20, g.x - 16, y + 16, g.x + 16, y + 16, C.ship);
		}
		batch.flush();
	}

	let last = performance.now();
	function frame(now) {
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		renderer.resizeToDisplaySize();
		const { width: w, height: h } = renderer;
		if (g.x === 0) g.x = g.target = w / 2;
		update(dt, w, h);
		draw(w, h);
		const s = g.state === 'play' ? score() : g.shown;
		if (s !== g.shown) { g.shown = s; scoreEl.textContent = String(s); }
		requestAnimationFrame(frame);
	}
	requestAnimationFrame(frame);
} catch (error) {
	console.error(error);
	titleEl.textContent = 'Game tidak bisa jalan';
	hintEl.textContent = error.message.split('\n')[0];
	msg.hidden = false;
}
