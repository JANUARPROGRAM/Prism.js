// Foundation example: Renderer (context, size, clear) + WebGLProgram (shaders).
// Buffers are created with raw WebGL calls because BufferGeometry does not exist yet.
import { Renderer, WebGLProgram } from '../../src/index.js';

// `#version 300 es` must be the very first characters of each source string.
const VERTEX_SHADER = `#version 300 es
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec3 aColor;
out vec3 vColor;
void main() {
	vColor = aColor;
	gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
	outColor = vec4(vColor, 1.0);
}`;

// Interleaved: x, y, r, g, b (counter-clockwise).
const VERTICES = new Float32Array([
	 0.0,  0.7, 1.0, 0.25, 0.25,
	-0.7, -0.6, 0.25, 1.0, 0.25,
	 0.7, -0.6, 0.25, 0.25, 1.0
]);
const FLOAT_BYTES = Float32Array.BYTES_PER_ELEMENT;
const STRIDE = 5 * FLOAT_BYTES;

function showError(error) {
	console.error(error);
	const box = document.getElementById('error');
	box.textContent = error.message;
	box.hidden = false;
}

try {
	const renderer = new Renderer({ canvas: document.getElementById('canvas') });
	const gl = renderer.gl;
	renderer.setClearColor(0x14161a);

	const program = new WebGLProgram(gl, {
		name: 'TriangleProgram',
		vertexShader: VERTEX_SHADER,
		fragmentShader: FRAGMENT_SHADER
	});

	const vao = gl.createVertexArray();
	const buffer = gl.createBuffer();
	gl.bindVertexArray(vao);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, VERTICES, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, STRIDE, 0);
	gl.enableVertexAttribArray(1);
	gl.vertexAttribPointer(1, 3, gl.FLOAT, false, STRIDE, 2 * FLOAT_BYTES);
	gl.bindVertexArray(null);

	const draw = () => {
		renderer.resizeToDisplaySize();
		renderer.clear();
		program.use();
		gl.bindVertexArray(vao);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
		gl.bindVertexArray(null);
	};

	// Nothing animates, so redraw only when the canvas size can have changed.
	window.addEventListener('resize', draw);
	draw();

	console.info('Prism.js:', renderer.capabilities);
} catch (error) {
	showError(error);
}
