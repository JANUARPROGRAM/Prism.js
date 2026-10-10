export const normalShader = {
	uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uNormalMatrix', 'uOpacity'],
	usesNormalMatrix: true,
	requiresNormals: true,
	supportsInstancing: true,

	vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
#ifdef USE_INSTANCING
layout(location = 4) in mat4 aInstanceMatrix;
#endif
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
out vec3 vNormal;
void main() {
	mat4 modelView = uModelViewMatrix;
	mat3 normalMatrix = uNormalMatrix;
#ifdef USE_INSTANCING
	modelView = uModelViewMatrix * aInstanceMatrix;
	normalMatrix = transpose(inverse(mat3(modelView)));
#endif
	vNormal = normalMatrix * aNormal;
	gl_Position = uProjectionMatrix * modelView * vec4(aPosition, 1.0);
}`,

	fragmentShader: `#version 300 es
precision mediump float;
in vec3 vNormal;
uniform float uOpacity;
out vec4 outColor;
void main() {
	outColor = vec4(normalize(vNormal) * 0.5 + 0.5, uOpacity);
}`,

	uploadMaterial(gl, locations, material, cache) {
		if (cache.a === material.opacity) return;
		gl.uniform1f(locations.uOpacity, material.opacity);
		cache.a = material.opacity;
	}
};
