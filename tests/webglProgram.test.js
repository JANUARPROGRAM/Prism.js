import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WebGLProgram } from '../src/index.js';
import { createMockGL } from './helpers/mockGL.js';

const VERTEX = '#version 300 es\nvoid main() {\n  bad;\n}';
const FRAGMENT = '#version 300 es\nvoid main() {}';

test('links a program and frees the shader stage objects', () => {
	const gl = createMockGL();
	const program = new WebGLProgram(gl, { vertexShader: VERTEX, fragmentShader: FRAGMENT, name: 'Ok' });

	assert.equal(gl.livePrograms.size, 1);
	assert.equal(gl.liveShaders.size, 0);
	program.use();
	assert.deepEqual(gl.calls.at(-1), ['useProgram', program.program]);
});

test('requires both shader sources', () => {
	const gl = createMockGL();
	assert.throws(() => new WebGLProgram(gl, { vertexShader: VERTEX }), TypeError);
	assert.throws(() => new WebGLProgram(gl), TypeError);
});

test('vertex compile error reports driver log, program name and source excerpt', () => {
	const gl = createMockGL({ vertexLog: "ERROR: 0:3: 'bad' : undeclared identifier\n" });

	assert.throws(
		() => new WebGLProgram(gl, { vertexShader: VERTEX, fragmentShader: FRAGMENT, name: 'BrokenProgram' }),
		(error) => {
			assert.match(error.message, /^Prism\.js: Failed to compile vertex shader\./);
			assert.match(error.message, /WebGL error:\nERROR: 0:3: 'bad' : undeclared identifier/);
			assert.match(error.message, /Program:\nBrokenProgram/);
			assert.match(error.message, /> 3 \|   bad;/);
			return true;
		}
	);
	assert.equal(gl.liveShaders.size, 0, 'failed shader must be deleted');
	assert.equal(gl.livePrograms.size, 0);
});

test('fragment compile error also releases the already-compiled vertex shader', () => {
	const gl = createMockGL({ fragmentLog: 'ERROR: 0:1: oops' });

	assert.throws(
		() => new WebGLProgram(gl, { vertexShader: FRAGMENT, fragmentShader: FRAGMENT }),
		/Failed to compile fragment shader/
	);
	assert.equal(gl.liveShaders.size, 0);
});

test('compile log without a usable line number still produces an error', () => {
	const gl = createMockGL({ vertexLog: '' });
	assert.throws(
		() => new WebGLProgram(gl, { vertexShader: VERTEX, fragmentShader: FRAGMENT }),
		/\(the driver provided no log\)/
	);
});

test('link error reports the log and leaks nothing', () => {
	const gl = createMockGL({ linkLog: 'varying mismatch' });

	assert.throws(
		() => new WebGLProgram(gl, { vertexShader: FRAGMENT, fragmentShader: FRAGMENT, name: 'LinkFail' }),
		(error) => {
			assert.match(error.message, /^Prism\.js: Failed to link shader program\./);
			assert.match(error.message, /varying mismatch/);
			assert.match(error.message, /LinkFail/);
			return true;
		}
	);
	assert.equal(gl.liveShaders.size, 0);
	assert.equal(gl.livePrograms.size, 0);
});

test('uniform and attribute locations are looked up once, including missing ones', () => {
	const gl = createMockGL();
	const program = new WebGLProgram(gl, { vertexShader: FRAGMENT, fragmentShader: FRAGMENT });

	const first = program.getUniformLocation('uColor');
	assert.equal(program.getUniformLocation('uColor'), first);
	assert.equal(program.getUniformLocation('uMissing'), null);
	assert.equal(program.getUniformLocation('uMissing'), null);
	assert.equal(gl.uniformLookups, 2);

	assert.equal(program.getAttributeLocation('aMissing'), -1);
});

test('dispose deletes the GL program, is idempotent, and blocks further use', () => {
	const gl = createMockGL();
	const program = new WebGLProgram(gl, { vertexShader: FRAGMENT, fragmentShader: FRAGMENT, name: 'Gone' });

	program.dispose();
	program.dispose();
	assert.equal(gl.livePrograms.size, 0);
	assert.throws(() => program.use(), /WebGLProgram "Gone" has been disposed/);
});

test('strips the NUL terminator some drivers append to info logs', () => {
	const gl = createMockGL({ vertexLog: "ERROR: 0:3: 'bad' : undeclared identifier\n\u0000\n" });
	assert.throws(
		() => new WebGLProgram(gl, { vertexShader: VERTEX, fragmentShader: FRAGMENT }),
		(error) => !error.message.includes('\u0000')
	);
});
