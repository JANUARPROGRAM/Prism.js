// Public API. Only what is exported here is supported; everything else is internal.
export {
	FrontSide, BackSide, DoubleSide,
	NearestFilter, LinearFilter, NearestMipmapNearestFilter, LinearMipmapNearestFilter,
	NearestMipmapLinearFilter, LinearMipmapLinearFilter,
	ClampToEdgeWrapping, RepeatWrapping, MirroredRepeatWrapping
} from './constants.js';

export { DEG2RAD, RAD2DEG, clamp, lerp } from './math/MathUtils.js';
export { Vector2 } from './math/Vector2.js';
export { Vector3 } from './math/Vector3.js';
export { Vector4 } from './math/Vector4.js';
export { Matrix3 } from './math/Matrix3.js';
export { Matrix4 } from './math/Matrix4.js';
export { Quaternion } from './math/Quaternion.js';
export { Euler } from './math/Euler.js';
export { Color } from './math/Color.js';

export { Object3D } from './core/Object3D.js';
export { Scene } from './core/Scene.js';
export { Group } from './core/Group.js';
export { Mesh } from './core/Mesh.js';
export { Camera } from './core/Camera.js';
export { PerspectiveCamera } from './core/PerspectiveCamera.js';
export { OrthographicCamera } from './core/OrthographicCamera.js';

export { BufferAttribute } from './geometry/BufferAttribute.js';
export { BufferGeometry } from './geometry/BufferGeometry.js';
export { BoxGeometry } from './geometry/BoxGeometry.js';
export { PlaneGeometry } from './geometry/PlaneGeometry.js';
export { SphereGeometry } from './geometry/SphereGeometry.js';

export { Light } from './lights/Light.js';
export { AmbientLight } from './lights/AmbientLight.js';
export { DirectionalLight } from './lights/DirectionalLight.js';
export { PointLight } from './lights/PointLight.js';

export { Material } from './materials/Material.js';
export { BasicMaterial } from './materials/BasicMaterial.js';
export { NormalMaterial } from './materials/NormalMaterial.js';
export { LambertMaterial } from './materials/LambertMaterial.js';

export { Texture } from './textures/Texture.js';
export { TextureLoader } from './loaders/TextureLoader.js';
export { OBJLoader } from './loaders/OBJLoader.js';
export { MTLLoader, MaterialLibrary } from './loaders/MTLLoader.js';

export { SphereShape, BoxShape, PlaneShape } from './physics/shapes.js';
export { RigidBody } from './physics/RigidBody.js';
export { PhysicsWorld } from './physics/PhysicsWorld.js';

export { Renderer } from './renderer/Renderer.js';
export { WebGLProgram } from './renderer/WebGLProgram.js';
