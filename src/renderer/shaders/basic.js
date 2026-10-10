export const basicShader = {
	uniforms: ['uModelViewMatrix', 'uProjectionMatrix', 'uColor', 'uMap'],
	usesNormalMatrix: false,
	supportsMap: true, // compiled again with USE_MAP when material.map is set
	supportsInstancing: true,
	supportsInstanceColor: true,

	vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
#ifdef USE_MAP
layout(location = 2) in vec2 aUv;
out vec2 vUv;
#endif
#ifdef USE_INSTANCING
layout(location = 4) in mat4 aInstanceMatrix;
#endif
#ifdef USE_INSTANCE_COLOR
layout(location = 8) in vec3 aInstanceColor;
out vec3 vInstanceColor;
#endif
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
#ifdef USE_MAP
	vUv = aUv;
#endif
#ifdef USE_INSTANCE_COLOR
	vInstanceColor = aInstanceColor;
#endif
	mat4 modelView = uModelViewMatrix;
#ifdef USE_INSTANCING
	modelView = uModelViewMatrix * aInstanceMatrix;
#endif
	gl_Position = uProjectionMatrix * modelView * vec4(aPosition, 1.0);
}`,

	fragmentShader: `#version 300 es
precision mediump float;
#ifdef USE_MAP
in vec2 vUv;
uniform sampler2D uMap;
#endif
#ifdef USE_INSTANCE_COLOR
in vec3 vInstanceColor;
#endif
uniform vec4 uColor;
out vec4 outColor;
void main() {
	vec4 base = uColor;
#ifdef USE_MAP
	base *= texture(uMap, vUv);
#endif
#ifdef USE_INSTANCE_COLOR
	base.rgb *= vInstanceColor;
#endif
	outColor = base;
}`,

	/** `cache` remembers what this program last received, so unchanged colors cost no GL call. */
	uploadMaterial(gl, locations, material, cache) {
		const c = material.color, a = material.opacity;
		if (cache.r === c.r && cache.g === c.g && cache.b === c.b && cache.a === a) return;
		gl.uniform4f(locations.uColor, c.r, c.g, c.b, a);
		cache.r = c.r; cache.g = c.g; cache.b = c.b; cache.a = a;
	}
};
