export const basicShader = {
	uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uColor'],
	usesNormalMatrix: false,

	vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`,

	fragmentShader: `#version 300 es
precision mediump float;
uniform vec4 uColor;
out vec4 outColor;
void main() {
	outColor = uColor;
}`,

	uploadMaterial(gl, locations, material) {
		const c = material.color;
		gl.uniform4f(locations.uColor, c.r, c.g, c.b, material.opacity);
	}
};
