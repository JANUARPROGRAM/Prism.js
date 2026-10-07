export const normalShader = {
	uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uNormalMatrix', 'uOpacity'],
	usesNormalMatrix: true,
	requiresNormals: true,

	vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
out vec3 vNormal;
void main() {
	vNormal = uNormalMatrix * aNormal;
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`,

	fragmentShader: `#version 300 es
precision mediump float;
in vec3 vNormal;
uniform float uOpacity;
out vec4 outColor;
void main() {
	outColor = vec4(normalize(vNormal) * 0.5 + 0.5, uOpacity);
}`,

	uploadMaterial(gl, locations, material) {
		gl.uniform1f(locations.uOpacity, material.opacity);
	}
};
