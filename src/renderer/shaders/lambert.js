import { MAX_DIRECTIONAL_LIGHTS, MAX_POINT_LIGHTS } from '../WebGLLights.js';

export const lambertShader = {
	uniforms: [
		'uModelViewMatrix', 'uProjectionMatrix', 'uNormalMatrix', 'uColor', 'uMap',
		'uAmbientColor',
		'uDirCount', 'uDirDirection', 'uDirColor',
		'uPointCount', 'uPointPosition', 'uPointColor', 'uPointParams'
	],
	usesNormalMatrix: true,
	usesLights: true,
	requiresNormals: true,
	supportsMap: true,

	vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
#ifdef USE_MAP
layout(location = 2) in vec2 aUv;
out vec2 vUv;
#endif
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
out vec3 vNormal;
out vec3 vViewPosition;
void main() {
#ifdef USE_MAP
	vUv = aUv;
#endif
	vec4 viewPosition = uModelViewMatrix * vec4(aPosition, 1.0);
	vNormal = uNormalMatrix * aNormal;
	vViewPosition = viewPosition.xyz;
	gl_Position = uProjectionMatrix * viewPosition;
}`,

	// All light data is in VIEW space. Directions point from the surface toward the light.
	fragmentShader: `#version 300 es
precision highp float;
#define MAX_DIR ${MAX_DIRECTIONAL_LIGHTS}
#define MAX_POINT ${MAX_POINT_LIGHTS}
in vec3 vNormal;
in vec3 vViewPosition;
#ifdef USE_MAP
in vec2 vUv;
uniform sampler2D uMap;
#endif
uniform vec4 uColor;
uniform vec3 uAmbientColor;
uniform int uDirCount;
uniform vec3 uDirDirection[MAX_DIR];
uniform vec3 uDirColor[MAX_DIR];
uniform int uPointCount;
uniform vec3 uPointPosition[MAX_POINT];
uniform vec3 uPointColor[MAX_POINT];
uniform vec2 uPointParams[MAX_POINT];
out vec4 outColor;
void main() {
	vec3 n = normalize(vNormal);
	if (!gl_FrontFacing) n = -n;

	vec3 light = uAmbientColor;
	for (int i = 0; i < MAX_DIR; i++) {
		if (i >= uDirCount) break;
		light += uDirColor[i] * max(dot(n, uDirDirection[i]), 0.0);
	}
	for (int i = 0; i < MAX_POINT; i++) {
		if (i >= uPointCount) break;
		vec3 toLight = uPointPosition[i] - vViewPosition;
		float dist = length(toLight);
		float range = uPointParams[i].x;
		float falloff = range > 0.0 ? pow(clamp(1.0 - dist / range, 0.0, 1.0), uPointParams[i].y) : 1.0;
		light += uPointColor[i] * max(dot(n, toLight / max(dist, 1e-4)), 0.0) * falloff;
	}
	vec4 base = uColor;
#ifdef USE_MAP
	base *= texture(uMap, vUv);
#endif
	outColor = vec4(base.rgb * light, base.a);
}`,

	uploadMaterial(gl, locations, material) {
		const c = material.color;
		gl.uniform4f(locations.uColor, c.r, c.g, c.b, material.opacity);
	}
};
