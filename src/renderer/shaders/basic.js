export const basicShader = {
	uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uColor', 'uMap'],
	usesNormalMatrix: false,
	supportsMap: true, // compiled again with USE_MAP when material.map is set

	vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
#ifdef USE_MAP
layout(location = 2) in vec2 aUv;
out vec2 vUv;
#endif
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
#ifdef USE_MAP
	vUv = aUv;
#endif
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}`,

	fragmentShader: `#version 300 es
precision mediump float;
#ifdef USE_MAP
in vec2 vUv;
uniform sampler2D uMap;
#endif
uniform vec4 uColor;
out vec4 outColor;
void main() {
	vec4 base = uColor;
#ifdef USE_MAP
	base *= texture(uMap, vUv);
#endif
	outColor = base;
}`,

	uploadMaterial(gl, locations, material) {
		const c = material.color;
		gl.uniform4f(locations.uColor, c.r, c.g, c.b, material.opacity);
	}
};
