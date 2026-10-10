var Prism = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    AmbientLight: () => AmbientLight,
    BackSide: () => BackSide,
    BallSocketJoint: () => BallSocketJoint,
    BasicMaterial: () => BasicMaterial,
    BoxGeometry: () => BoxGeometry,
    BoxShape: () => BoxShape,
    BufferAttribute: () => BufferAttribute,
    BufferGeometry: () => BufferGeometry,
    Camera: () => Camera,
    CapsuleGeometry: () => CapsuleGeometry,
    CapsuleShape: () => CapsuleShape,
    ClampToEdgeWrapping: () => ClampToEdgeWrapping,
    Color: () => Color,
    DEG2RAD: () => DEG2RAD,
    DirectionalLight: () => DirectionalLight,
    DistanceJoint: () => DistanceJoint,
    DoubleSide: () => DoubleSide,
    Euler: () => Euler,
    FrontSide: () => FrontSide,
    Frustum: () => Frustum,
    Group: () => Group,
    HingeJoint: () => HingeJoint,
    InstancedMesh: () => InstancedMesh,
    LambertMaterial: () => LambertMaterial,
    Light: () => Light,
    LinearFilter: () => LinearFilter,
    LinearMipmapLinearFilter: () => LinearMipmapLinearFilter,
    LinearMipmapNearestFilter: () => LinearMipmapNearestFilter,
    MTLLoader: () => MTLLoader,
    Material: () => Material,
    MaterialLibrary: () => MaterialLibrary,
    Matrix3: () => Matrix3,
    Matrix4: () => Matrix4,
    Mesh: () => Mesh,
    MirroredRepeatWrapping: () => MirroredRepeatWrapping,
    NearestFilter: () => NearestFilter,
    NearestMipmapLinearFilter: () => NearestMipmapLinearFilter,
    NearestMipmapNearestFilter: () => NearestMipmapNearestFilter,
    NormalMaterial: () => NormalMaterial,
    OBJLoader: () => OBJLoader,
    Object3D: () => Object3D,
    OrthographicCamera: () => OrthographicCamera,
    PerspectiveCamera: () => PerspectiveCamera,
    PhysicsWorld: () => PhysicsWorld,
    PlaneGeometry: () => PlaneGeometry,
    PlaneShape: () => PlaneShape,
    PointLight: () => PointLight,
    Quaternion: () => Quaternion,
    RAD2DEG: () => RAD2DEG,
    Renderer: () => Renderer,
    RepeatWrapping: () => RepeatWrapping,
    RigidBody: () => RigidBody,
    Scene: () => Scene,
    SphereGeometry: () => SphereGeometry,
    SphereShape: () => SphereShape,
    Texture: () => Texture,
    TextureLoader: () => TextureLoader,
    Vector2: () => Vector2,
    Vector3: () => Vector3,
    Vector4: () => Vector4,
    WebGLProgram: () => WebGLProgram,
    clamp: () => clamp,
    lerp: () => lerp
  });

  // src/constants.js
  var FrontSide = 0;
  var BackSide = 1;
  var DoubleSide = 2;
  var NearestFilter = 9728;
  var LinearFilter = 9729;
  var NearestMipmapNearestFilter = 9984;
  var LinearMipmapNearestFilter = 9985;
  var NearestMipmapLinearFilter = 9986;
  var LinearMipmapLinearFilter = 9987;
  var ClampToEdgeWrapping = 33071;
  var RepeatWrapping = 10497;
  var MirroredRepeatWrapping = 33648;

  // src/math/MathUtils.js
  var DEG2RAD = Math.PI / 180;
  var RAD2DEG = 180 / Math.PI;
  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // src/math/Vector2.js
  var Vector2 = class _Vector2 {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    }
    clone() {
      return new _Vector2(this.x, this.y);
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      return this;
    }
    /** Dividing by 0 yields Infinity/NaN components, as with plain JS numbers. */
    divideScalar(s) {
      return this.multiplyScalar(1 / s);
    }
    dot(v) {
      return this.x * v.x + this.y * v.y;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }
    length() {
      return Math.sqrt(this.lengthSq());
    }
    /** A zero-length vector stays zero. */
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    distanceTo(v) {
      return Math.hypot(this.x - v.x, this.y - v.y);
    }
    lerp(v, t) {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      return this;
    }
    equals(v) {
      return this.x === v.x && this.y === v.y;
    }
    fromArray(a, offset = 0) {
      this.x = a[offset];
      this.y = a[offset + 1];
      return this;
    }
    toArray(a = [], offset = 0) {
      a[offset] = this.x;
      a[offset + 1] = this.y;
      return a;
    }
  };
  Vector2.prototype.isVector2 = true;

  // src/math/Vector3.js
  var Vector3 = class _Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
    }
    set(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    }
    setScalar(s) {
      this.x = s;
      this.y = s;
      this.z = s;
      return this;
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    }
    clone() {
      return new _Vector3(this.x, this.y, this.z);
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      return this;
    }
    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      return this;
    }
    /** Component-wise product. */
    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      return this;
    }
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      return this;
    }
    /** Dividing by 0 yields Infinity/NaN components, as with plain JS numbers. */
    divideScalar(s) {
      return this.multiplyScalar(1 / s);
    }
    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      return this;
    }
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
      return this.crossVectors(this, v);
    }
    crossVectors(a, b) {
      const ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;
      return this;
    }
    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
      return Math.sqrt(this.lengthSq());
    }
    /** A zero-length vector stays zero. */
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }
    distanceToSquared(v) {
      const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
      return dx * dx + dy * dy + dz * dz;
    }
    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }
    lerp(v, t) {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      this.z += (v.z - this.z) * t;
      return this;
    }
    lerpVectors(a, b, t) {
      return this.copy(a).lerp(b, t);
    }
    /** Transforms as a point (w = 1) and divides by the resulting w, so projection matrices work. */
    applyMatrix4(m) {
      const e = m.elements, x = this.x, y = this.y, z = this.z;
      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
      return this;
    }
    applyMatrix3(m) {
      const e = m.elements, x = this.x, y = this.y, z = this.z;
      this.x = e[0] * x + e[3] * y + e[6] * z;
      this.y = e[1] * x + e[4] * y + e[7] * z;
      this.z = e[2] * x + e[5] * y + e[8] * z;
      return this;
    }
    /** Rotates by a unit quaternion: v' = v + 2w(q×v) + 2 q×(q×v). */
    applyQuaternion(q) {
      const x = this.x, y = this.y, z = this.z, qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      const tx = 2 * (qy * z - qz * y);
      const ty = 2 * (qz * x - qx * z);
      const tz = 2 * (qx * y - qy * x);
      this.x = x + qw * tx + (qy * tz - qz * ty);
      this.y = y + qw * ty + (qz * tx - qx * tz);
      this.z = z + qw * tz + (qx * ty - qy * tx);
      return this;
    }
    /** Applies the rotation/scale part of a Matrix4 (ignores translation), then normalizes. */
    transformDirection(m) {
      const e = m.elements, x = this.x, y = this.y, z = this.z;
      this.x = e[0] * x + e[4] * y + e[8] * z;
      this.y = e[1] * x + e[5] * y + e[9] * z;
      this.z = e[2] * x + e[6] * y + e[10] * z;
      return this.normalize();
    }
    /**
     * World -> normalized device coordinates (x, y, z in -1..1) for `camera`.
     * The camera's matrices must be current (renderer.render() or camera.updateMatrixWorld()).
     */
    project(camera) {
      return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);
    }
    /**
     * Normalized device coordinates -> world. With z = -1 the point is on the near plane and with
     * z = 1 on the far plane, so unproject((x, y, 0.5)) - cameraPosition is the direction of the ray
     * through that screen position.
     */
    unproject(camera) {
      return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);
    }
    setFromMatrixPosition(m) {
      const e = m.elements;
      return this.set(e[12], e[13], e[14]);
    }
    setFromMatrixColumn(m, index) {
      return this.fromArray(m.elements, index * 4);
    }
    equals(v) {
      return this.x === v.x && this.y === v.y && this.z === v.z;
    }
    fromArray(a, offset = 0) {
      this.x = a[offset];
      this.y = a[offset + 1];
      this.z = a[offset + 2];
      return this;
    }
    toArray(a = [], offset = 0) {
      a[offset] = this.x;
      a[offset + 1] = this.y;
      a[offset + 2] = this.z;
      return a;
    }
  };
  Vector3.prototype.isVector3 = true;

  // src/math/Vector4.js
  var Vector4 = class _Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }
    set(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
      return this;
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      this.w = v.w;
      return this;
    }
    clone() {
      return new _Vector4(this.x, this.y, this.z, this.w);
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      this.w += v.w;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      this.w -= v.w;
      return this;
    }
    multiplyScalar(s) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      this.w *= s;
      return this;
    }
    divideScalar(s) {
      return this.multiplyScalar(1 / s);
    }
    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }
    lengthSq() {
      return this.dot(this);
    }
    length() {
      return Math.sqrt(this.lengthSq());
    }
    normalize() {
      return this.divideScalar(this.length() || 1);
    }
    lerp(v, t) {
      this.x += (v.x - this.x) * t;
      this.y += (v.y - this.y) * t;
      this.z += (v.z - this.z) * t;
      this.w += (v.w - this.w) * t;
      return this;
    }
    /** Full 4x4 transform with no perspective divide (clip-space result). */
    applyMatrix4(m) {
      const e = m.elements, x = this.x, y = this.y, z = this.z, w = this.w;
      this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
      this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
      this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
      this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
      return this;
    }
    equals(v) {
      return this.x === v.x && this.y === v.y && this.z === v.z && this.w === v.w;
    }
    fromArray(a, offset = 0) {
      this.x = a[offset];
      this.y = a[offset + 1];
      this.z = a[offset + 2];
      this.w = a[offset + 3];
      return this;
    }
    toArray(a = [], offset = 0) {
      a[offset] = this.x;
      a[offset + 1] = this.y;
      a[offset + 2] = this.z;
      a[offset + 3] = this.w;
      return a;
    }
  };
  Vector4.prototype.isVector4 = true;

  // src/math/Matrix3.js
  var _tmp = new Float64Array(9);
  var Matrix3 = class _Matrix3 {
    constructor() {
      this.elements = new Float64Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }
    identity() {
      this.elements.set([1, 0, 0, 0, 1, 0, 0, 0, 1]);
      return this;
    }
    copy(m) {
      this.elements.set(m.elements);
      return this;
    }
    clone() {
      return new _Matrix3().copy(this);
    }
    fromArray(a, offset = 0) {
      for (let i = 0; i < 9; i++) this.elements[i] = a[offset + i];
      return this;
    }
    toArray(a = [], offset = 0) {
      for (let i = 0; i < 9; i++) a[offset + i] = this.elements[i];
      return a;
    }
    equals(m) {
      for (let i = 0; i < 9; i++) if (this.elements[i] !== m.elements[i]) return false;
      return true;
    }
    /** Takes the upper-left 3x3 block of a Matrix4. */
    setFromMatrix4(m) {
      const me = m.elements, te = this.elements;
      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[4];
      te[4] = me[5];
      te[5] = me[6];
      te[6] = me[8];
      te[7] = me[9];
      te[8] = me[10];
      return this;
    }
    /** this = this * m */
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    multiplyMatrices(a, b) {
      const ae = a.elements, be = b.elements;
      for (let c = 0; c < 3; c++) {
        for (let r = 0; r < 3; r++) {
          _tmp[c * 3 + r] = ae[r] * be[c * 3] + ae[3 + r] * be[c * 3 + 1] + ae[6 + r] * be[c * 3 + 2];
        }
      }
      this.elements.set(_tmp);
      return this;
    }
    determinant() {
      const e = this.elements;
      return e[0] * (e[4] * e[8] - e[7] * e[5]) - e[3] * (e[1] * e[8] - e[7] * e[2]) + e[6] * (e[1] * e[5] - e[4] * e[2]);
    }
    transpose() {
      const e = this.elements;
      let t = e[1];
      e[1] = e[3];
      e[3] = t;
      t = e[2];
      e[2] = e[6];
      e[6] = t;
      t = e[5];
      e[5] = e[7];
      e[7] = t;
      return this;
    }
    /** Inverts in place. A singular matrix becomes the zero matrix. */
    invert() {
      const e = this.elements;
      const a00 = e[0], a10 = e[1], a20 = e[2];
      const a01 = e[3], a11 = e[4], a21 = e[5];
      const a02 = e[6], a12 = e[7], a22 = e[8];
      const det = this.determinant();
      if (det === 0) {
        e.fill(0);
        return this;
      }
      const id = 1 / det;
      e[0] = (a11 * a22 - a12 * a21) * id;
      e[1] = (a12 * a20 - a10 * a22) * id;
      e[2] = (a10 * a21 - a11 * a20) * id;
      e[3] = (a02 * a21 - a01 * a22) * id;
      e[4] = (a00 * a22 - a02 * a20) * id;
      e[5] = (a01 * a20 - a00 * a21) * id;
      e[6] = (a01 * a12 - a02 * a11) * id;
      e[7] = (a02 * a10 - a00 * a12) * id;
      e[8] = (a00 * a11 - a01 * a10) * id;
      return this;
    }
    /** Normal matrix = inverse-transpose of the upper 3x3 of `m4` (correct under non-uniform scale). */
    getNormalMatrix(m4) {
      return this.setFromMatrix4(m4).invert().transpose();
    }
  };
  Matrix3.prototype.isMatrix3 = true;

  // src/math/Matrix4.js
  var _tmp2 = new Float64Array(16);
  var Matrix4 = class _Matrix4 {
    constructor() {
      this.elements = new Float64Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    identity() {
      this.elements.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
      return this;
    }
    copy(m) {
      this.elements.set(m.elements);
      return this;
    }
    clone() {
      return new _Matrix4().copy(this);
    }
    fromArray(a, offset = 0) {
      for (let i = 0; i < 16; i++) this.elements[i] = a[offset + i];
      return this;
    }
    toArray(a = [], offset = 0) {
      for (let i = 0; i < 16; i++) a[offset + i] = this.elements[i];
      return a;
    }
    equals(m) {
      for (let i = 0; i < 16; i++) if (this.elements[i] !== m.elements[i]) return false;
      return true;
    }
    /** this = this * m (m is applied first when transforming a vector). */
    multiply(m) {
      return this.multiplyMatrices(this, m);
    }
    /** this = m * this */
    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }
    /** this = a * b. Safe when `this` is a or b. */
    multiplyMatrices(a, b) {
      const ae = a.elements, be = b.elements;
      for (let c = 0; c < 4; c++) {
        const b0 = be[c * 4], b1 = be[c * 4 + 1], b2 = be[c * 4 + 2], b3 = be[c * 4 + 3];
        for (let r = 0; r < 4; r++) {
          _tmp2[c * 4 + r] = ae[r] * b0 + ae[4 + r] * b1 + ae[8 + r] * b2 + ae[12 + r] * b3;
        }
      }
      this.elements.set(_tmp2);
      return this;
    }
    transpose() {
      const e = this.elements;
      let t;
      t = e[1];
      e[1] = e[4];
      e[4] = t;
      t = e[2];
      e[2] = e[8];
      e[8] = t;
      t = e[3];
      e[3] = e[12];
      e[12] = t;
      t = e[6];
      e[6] = e[9];
      e[9] = t;
      t = e[7];
      e[7] = e[13];
      e[13] = t;
      t = e[11];
      e[11] = e[14];
      e[14] = t;
      return this;
    }
    determinant() {
      const e = this.elements;
      const a00 = e[0], a10 = e[1], a20 = e[2], a30 = e[3];
      const a01 = e[4], a11 = e[5], a21 = e[6], a31 = e[7];
      const a02 = e[8], a12 = e[9], a22 = e[10], a32 = e[11];
      const a03 = e[12], a13 = e[13], a23 = e[14], a33 = e[15];
      const s0 = a00 * a11 - a10 * a01, s1 = a00 * a12 - a10 * a02, s2 = a00 * a13 - a10 * a03;
      const s3 = a01 * a12 - a11 * a02, s4 = a01 * a13 - a11 * a03, s5 = a02 * a13 - a12 * a03;
      const c5 = a22 * a33 - a32 * a23, c4 = a21 * a33 - a31 * a23, c3 = a21 * a32 - a31 * a22;
      const c2 = a20 * a33 - a30 * a23, c1 = a20 * a32 - a30 * a22, c0 = a20 * a31 - a30 * a21;
      return s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
    }
    /**
     * Inverts in place using 2x2 sub-determinants (Laplace expansion).
     * A singular matrix becomes the zero matrix.
     */
    invert() {
      const e = this.elements;
      const a00 = e[0], a10 = e[1], a20 = e[2], a30 = e[3];
      const a01 = e[4], a11 = e[5], a21 = e[6], a31 = e[7];
      const a02 = e[8], a12 = e[9], a22 = e[10], a32 = e[11];
      const a03 = e[12], a13 = e[13], a23 = e[14], a33 = e[15];
      const s0 = a00 * a11 - a10 * a01, s1 = a00 * a12 - a10 * a02, s2 = a00 * a13 - a10 * a03;
      const s3 = a01 * a12 - a11 * a02, s4 = a01 * a13 - a11 * a03, s5 = a02 * a13 - a12 * a03;
      const c5 = a22 * a33 - a32 * a23, c4 = a21 * a33 - a31 * a23, c3 = a21 * a32 - a31 * a22;
      const c2 = a20 * a33 - a30 * a23, c1 = a20 * a32 - a30 * a22, c0 = a20 * a31 - a30 * a21;
      const det = s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
      if (det === 0) {
        e.fill(0);
        return this;
      }
      const id = 1 / det;
      e[0] = (a11 * c5 - a12 * c4 + a13 * c3) * id;
      e[1] = (-a10 * c5 + a12 * c2 - a13 * c1) * id;
      e[2] = (a10 * c4 - a11 * c2 + a13 * c0) * id;
      e[3] = (-a10 * c3 + a11 * c1 - a12 * c0) * id;
      e[4] = (-a01 * c5 + a02 * c4 - a03 * c3) * id;
      e[5] = (a00 * c5 - a02 * c2 + a03 * c1) * id;
      e[6] = (-a00 * c4 + a01 * c2 - a03 * c0) * id;
      e[7] = (a00 * c3 - a01 * c1 + a02 * c0) * id;
      e[8] = (a31 * s5 - a32 * s4 + a33 * s3) * id;
      e[9] = (-a30 * s5 + a32 * s2 - a33 * s1) * id;
      e[10] = (a30 * s4 - a31 * s2 + a33 * s0) * id;
      e[11] = (-a30 * s3 + a31 * s1 - a32 * s0) * id;
      e[12] = (-a21 * s5 + a22 * s4 - a23 * s3) * id;
      e[13] = (a20 * s5 - a22 * s2 + a23 * s1) * id;
      e[14] = (-a20 * s4 + a21 * s2 - a23 * s0) * id;
      e[15] = (a20 * s3 - a21 * s1 + a22 * s0) * id;
      return this;
    }
    makeTranslation(x, y, z) {
      this.identity();
      const e = this.elements;
      e[12] = x;
      e[13] = y;
      e[14] = z;
      return this;
    }
    makeScale(x, y, z) {
      this.identity();
      const e = this.elements;
      e[0] = x;
      e[5] = y;
      e[10] = z;
      return this;
    }
    makeRotationX(angle) {
      const c = Math.cos(angle), s = Math.sin(angle);
      this.identity();
      const e = this.elements;
      e[5] = c;
      e[6] = s;
      e[9] = -s;
      e[10] = c;
      return this;
    }
    makeRotationY(angle) {
      const c = Math.cos(angle), s = Math.sin(angle);
      this.identity();
      const e = this.elements;
      e[0] = c;
      e[2] = -s;
      e[8] = s;
      e[10] = c;
      return this;
    }
    makeRotationZ(angle) {
      const c = Math.cos(angle), s = Math.sin(angle);
      this.identity();
      const e = this.elements;
      e[0] = c;
      e[1] = s;
      e[4] = -s;
      e[5] = c;
      return this;
    }
    /** Rotation of `angle` radians about a unit-length axis (Rodrigues' formula). */
    makeRotationAxis(axis, angle) {
      const c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
      const x = axis.x, y = axis.y, z = axis.z;
      this.identity();
      const e = this.elements;
      e[0] = t * x * x + c;
      e[4] = t * x * y - s * z;
      e[8] = t * x * z + s * y;
      e[1] = t * x * y + s * z;
      e[5] = t * y * y + c;
      e[9] = t * y * z - s * x;
      e[2] = t * x * z - s * y;
      e[6] = t * y * z + s * x;
      e[10] = t * z * z + c;
      return this;
    }
    makeRotationFromQuaternion(q) {
      return this.compose(_zero, q, _one);
    }
    /** Columns become the three basis vectors; translation is cleared. */
    makeBasis(xAxis, yAxis, zAxis) {
      this.identity();
      const e = this.elements;
      e[0] = xAxis.x;
      e[1] = xAxis.y;
      e[2] = xAxis.z;
      e[4] = yAxis.x;
      e[5] = yAxis.y;
      e[6] = yAxis.z;
      e[8] = zAxis.x;
      e[9] = zAxis.y;
      e[10] = zAxis.z;
      return this;
    }
    /** this = T(position) * R(quaternion) * S(scale). */
    compose(position, quaternion, scale) {
      const e = this.elements;
      const x = quaternion.x, y = quaternion.y, z = quaternion.z, w = quaternion.w;
      const x2 = x + x, y2 = y + y, z2 = z + z;
      const xx = x * x2, xy = x * y2, xz = x * z2;
      const yy = y * y2, yz = y * z2, zz = z * z2;
      const wx = w * x2, wy = w * y2, wz = w * z2;
      const sx = scale.x, sy = scale.y, sz = scale.z;
      e[0] = (1 - (yy + zz)) * sx;
      e[1] = (xy + wz) * sx;
      e[2] = (xz - wy) * sx;
      e[3] = 0;
      e[4] = (xy - wz) * sy;
      e[5] = (1 - (xx + zz)) * sy;
      e[6] = (yz + wx) * sy;
      e[7] = 0;
      e[8] = (xz + wy) * sz;
      e[9] = (yz - wx) * sz;
      e[10] = (1 - (xx + yy)) * sz;
      e[11] = 0;
      e[12] = position.x;
      e[13] = position.y;
      e[14] = position.z;
      e[15] = 1;
      return this;
    }
    /** Largest scale factor along any axis (length of the longest column of the 3x3 part). */
    getMaxScaleOnAxis() {
      const e = this.elements;
      return Math.sqrt(Math.max(
        e[0] * e[0] + e[1] * e[1] + e[2] * e[2],
        e[4] * e[4] + e[5] * e[5] + e[6] * e[6],
        e[8] * e[8] + e[9] * e[9] + e[10] * e[10]
      ));
    }
    /** Splits an affine TRS matrix. A negative determinant is folded into scale.x. */
    decompose(position, quaternion, scale) {
      const e = this.elements;
      let sx = Math.sqrt(e[0] * e[0] + e[1] * e[1] + e[2] * e[2]);
      const sy = Math.sqrt(e[4] * e[4] + e[5] * e[5] + e[6] * e[6]);
      const sz = Math.sqrt(e[8] * e[8] + e[9] * e[9] + e[10] * e[10]);
      if (this.determinant() < 0) sx = -sx;
      position.set(e[12], e[13], e[14]);
      const r = _rotation.elements;
      const ix = sx === 0 ? 0 : 1 / sx, iy = sy === 0 ? 0 : 1 / sy, iz = sz === 0 ? 0 : 1 / sz;
      r.set(e);
      r[0] *= ix;
      r[1] *= ix;
      r[2] *= ix;
      r[4] *= iy;
      r[5] *= iy;
      r[6] *= iy;
      r[8] *= iz;
      r[9] *= iz;
      r[10] *= iz;
      quaternion.setFromRotationMatrix(_rotation);
      scale.set(sx, sy, sz);
      return this;
    }
    /**
     * Perspective projection for WebGL clip space (z from -1 at `near` to +1 at `far`).
     * @param {number} fovY Vertical field of view in RADIANS.
     */
    makePerspective(fovY, aspect, near, far) {
      const f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far);
      const e = this.elements;
      e.fill(0);
      e[0] = f / aspect;
      e[5] = f;
      e[10] = (far + near) * nf;
      e[11] = -1;
      e[14] = 2 * far * near * nf;
      return this;
    }
    makeOrthographic(left, right, top, bottom, near, far) {
      const w = 1 / (right - left), h = 1 / (top - bottom), d = 1 / (far - near);
      const e = this.elements;
      this.identity();
      e[0] = 2 * w;
      e[5] = 2 * h;
      e[10] = -2 * d;
      e[12] = -(right + left) * w;
      e[13] = -(top + bottom) * h;
      e[14] = -(far + near) * d;
      return this;
    }
    /**
     * Builds a VIEW matrix (world -> camera) for a camera at `eye` looking at
     * `target`; the camera looks down its own -Z axis.
     */
    lookAt(eye, target, up) {
      let zx = eye.x - target.x, zy = eye.y - target.y, zz = eye.z - target.z;
      let zl = Math.sqrt(zx * zx + zy * zy + zz * zz);
      if (zl === 0) {
        zz = 1;
        zl = 1;
      }
      zx /= zl;
      zy /= zl;
      zz /= zl;
      let xx = up.y * zz - up.z * zy, xy = up.z * zx - up.x * zz, xz = up.x * zy - up.y * zx;
      let xl = Math.sqrt(xx * xx + xy * xy + xz * xz);
      if (xl < 1e-9) {
        if (Math.abs(up.z) === 1) zx += 1e-4;
        else zz += 1e-4;
        const l = Math.sqrt(zx * zx + zy * zy + zz * zz);
        zx /= l;
        zy /= l;
        zz /= l;
        xx = up.y * zz - up.z * zy;
        xy = up.z * zx - up.x * zz;
        xz = up.x * zy - up.y * zx;
        xl = Math.sqrt(xx * xx + xy * xy + xz * xz);
      }
      xx /= xl;
      xy /= xl;
      xz /= xl;
      const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
      const e = this.elements;
      e[0] = xx;
      e[4] = xy;
      e[8] = xz;
      e[12] = -(xx * eye.x + xy * eye.y + xz * eye.z);
      e[1] = yx;
      e[5] = yy;
      e[9] = yz;
      e[13] = -(yx * eye.x + yy * eye.y + yz * eye.z);
      e[2] = zx;
      e[6] = zy;
      e[10] = zz;
      e[14] = -(zx * eye.x + zy * eye.y + zz * eye.z);
      e[3] = 0;
      e[7] = 0;
      e[11] = 0;
      e[15] = 1;
      return this;
    }
  };
  Matrix4.prototype.isMatrix4 = true;
  var _zero = { x: 0, y: 0, z: 0 };
  var _one = { x: 1, y: 1, z: 1 };
  var _rotation = new Matrix4();

  // src/math/Quaternion.js
  var Quaternion = class _Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
      this._onChangeCallback = noop;
    }
    get x() {
      return this._x;
    }
    set x(v) {
      this._x = v;
      this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(v) {
      this._y = v;
      this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(v) {
      this._z = v;
      this._onChangeCallback();
    }
    get w() {
      return this._w;
    }
    set w(v) {
      this._w = v;
      this._onChangeCallback();
    }
    /** Registers the single listener used by Object3D to keep `rotation` in sync. */
    onChange(callback) {
      this._onChangeCallback = callback;
      return this;
    }
    set(x, y, z, w) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
      this._onChangeCallback();
      return this;
    }
    copy(q) {
      return this.set(q.x, q.y, q.z, q.w);
    }
    clone() {
      return new _Quaternion(this._x, this._y, this._z, this._w);
    }
    identity() {
      return this.set(0, 0, 0, 1);
    }
    /** @param {{x:number,y:number,z:number}} axis Must be unit length. */
    setFromAxisAngle(axis, angle) {
      const s = Math.sin(angle / 2);
      return this.set(axis.x * s, axis.y * s, axis.z * s, Math.cos(angle / 2));
    }
    /** Composes the three axis rotations in the Euler's order (R = Ra * Rb * Rc for order "ABC"). */
    setFromEuler(euler, update = true) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
      const order = euler.order;
      for (let i = 0; i < 3; i++) {
        const axis = order.charCodeAt(i) - 88;
        const angle = axis === 0 ? euler.x : axis === 1 ? euler.y : euler.z;
        this._multiplyAxisAngle(axis, angle);
      }
      if (update) this._onChangeCallback();
      return this;
    }
    /** this = this * (rotation of `angle` about the given axis index), no callback. */
    _multiplyAxisAngle(axis, angle) {
      const s = Math.sin(angle / 2), bw = Math.cos(angle / 2);
      const bx = axis === 0 ? s : 0, by = axis === 1 ? s : 0, bz = axis === 2 ? s : 0;
      const ax = this._x, ay = this._y, az = this._z, aw = this._w;
      this._x = ax * bw + aw * bx + ay * bz - az * by;
      this._y = ay * bw + aw * by + az * bx - ax * bz;
      this._z = az * bw + aw * bz + ax * by - ay * bx;
      this._w = aw * bw - ax * bx - ay * by - az * bz;
    }
    /** Reads the rotation part of a Matrix4 (must be a pure rotation, no scale). */
    setFromRotationMatrix(m) {
      const e = m.elements;
      const m11 = e[0], m12 = e[4], m13 = e[8];
      const m21 = e[1], m22 = e[5], m23 = e[9];
      const m31 = e[2], m32 = e[6], m33 = e[10];
      const trace = m11 + m22 + m33;
      if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1);
        this._w = 0.25 / s;
        this._x = (m32 - m23) * s;
        this._y = (m13 - m31) * s;
        this._z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        const s = 2 * Math.sqrt(1 + m11 - m22 - m33);
        this._w = (m32 - m23) / s;
        this._x = 0.25 * s;
        this._y = (m12 + m21) / s;
        this._z = (m13 + m31) / s;
      } else if (m22 > m33) {
        const s = 2 * Math.sqrt(1 + m22 - m11 - m33);
        this._w = (m13 - m31) / s;
        this._x = (m12 + m21) / s;
        this._y = 0.25 * s;
        this._z = (m23 + m32) / s;
      } else {
        const s = 2 * Math.sqrt(1 + m33 - m11 - m22);
        this._w = (m21 - m12) / s;
        this._x = (m13 + m31) / s;
        this._y = (m23 + m32) / s;
        this._z = 0.25 * s;
      }
      this._onChangeCallback();
      return this;
    }
    dot(q) {
      return this._x * q.x + this._y * q.y + this._z * q.z + this._w * q.w;
    }
    lengthSq() {
      return this.dot(this);
    }
    length() {
      return Math.sqrt(this.lengthSq());
    }
    /** A zero quaternion becomes the identity. */
    normalize() {
      const l = this.length();
      if (l === 0) return this.set(0, 0, 0, 1);
      return this.set(this._x / l, this._y / l, this._z / l, this._w / l);
    }
    conjugate() {
      return this.set(-this._x, -this._y, -this._z, this._w);
    }
    /** Inverse rotation (conjugate divided by squared length, so it is exact for non-unit input too). */
    invert() {
      const l = this.lengthSq() || 1;
      return this.set(-this._x / l, -this._y / l, -this._z / l, this._w / l);
    }
    /** this = this * q (q is applied first). */
    multiply(q) {
      return this.multiplyQuaternions(this, q);
    }
    /** this = q * this */
    premultiply(q) {
      return this.multiplyQuaternions(q, this);
    }
    multiplyQuaternions(a, b) {
      const ax = a.x, ay = a.y, az = a.z, aw = a.w, bx = b.x, by = b.y, bz = b.z, bw = b.w;
      return this.set(
        ax * bw + aw * bx + ay * bz - az * by,
        ay * bw + aw * by + az * bx - ax * bz,
        az * bw + aw * bz + ax * by - ay * bx,
        aw * bw - ax * bx - ay * by - az * bz
      );
    }
    /** Spherical interpolation toward `q` along the shortest arc. */
    slerp(q, t) {
      if (t === 0) return this;
      if (t === 1) return this.copy(q);
      let bx = q.x, by = q.y, bz = q.z, bw = q.w;
      let cos = this.dot(q);
      if (cos < 0) {
        cos = -cos;
        bx = -bx;
        by = -by;
        bz = -bz;
        bw = -bw;
      }
      let s0, s1;
      if (cos > 0.9995) {
        s0 = 1 - t;
        s1 = t;
      } else {
        const theta = Math.acos(cos), sin = Math.sin(theta);
        s0 = Math.sin((1 - t) * theta) / sin;
        s1 = Math.sin(t * theta) / sin;
      }
      this._x = s0 * this._x + s1 * bx;
      this._y = s0 * this._y + s1 * by;
      this._z = s0 * this._z + s1 * bz;
      this._w = s0 * this._w + s1 * bw;
      return this.normalize();
    }
    equals(q) {
      return this._x === q.x && this._y === q.y && this._z === q.z && this._w === q.w;
    }
    fromArray(a, offset = 0) {
      return this.set(a[offset], a[offset + 1], a[offset + 2], a[offset + 3]);
    }
    toArray(a = [], offset = 0) {
      a[offset] = this._x;
      a[offset + 1] = this._y;
      a[offset + 2] = this._z;
      a[offset + 3] = this._w;
      return a;
    }
  };
  Quaternion.prototype.isQuaternion = true;
  function noop() {
  }

  // src/math/Euler.js
  var ORDERS = /^(?:XYZ|XZY|YXZ|YZX|ZXY|ZYX)$/;
  var GIMBAL_LIMIT = 0.9999999;
  var _matrix = new Matrix4();
  function assertOrder(order) {
    if (!ORDERS.test(order)) {
      throw new RangeError(`Prism.js: Invalid Euler order "${String(order)}". Use one of XYZ, XZY, YXZ, YZX, ZXY, ZYX.`);
    }
  }
  var Euler = class _Euler {
    constructor(x = 0, y = 0, z = 0, order = "XYZ") {
      assertOrder(order);
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
      this._onChangeCallback = noop2;
    }
    get x() {
      return this._x;
    }
    set x(v) {
      this._x = v;
      this._onChangeCallback();
    }
    get y() {
      return this._y;
    }
    set y(v) {
      this._y = v;
      this._onChangeCallback();
    }
    get z() {
      return this._z;
    }
    set z(v) {
      this._z = v;
      this._onChangeCallback();
    }
    get order() {
      return this._order;
    }
    set order(v) {
      assertOrder(v);
      this._order = v;
      this._onChangeCallback();
    }
    /** Registers the single listener used by Object3D to keep `quaternion` in sync. */
    onChange(callback) {
      this._onChangeCallback = callback;
      return this;
    }
    set(x, y, z, order = this._order) {
      assertOrder(order);
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
      this._onChangeCallback();
      return this;
    }
    copy(e) {
      return this.set(e.x, e.y, e.z, e.order);
    }
    clone() {
      return new _Euler(this._x, this._y, this._z, this._order);
    }
    equals(e) {
      return this._x === e.x && this._y === e.y && this._z === e.z && this._order === e.order;
    }
    /**
     * Decomposes the rotation part of `m` into three angles for `order`.
     * For order axes (i, j, k): R[i][k] = ±sin(angle_j); the sign is + for even
     * permutations of XYZ (XYZ, YZX, ZXY) and - for odd ones. Near gimbal lock
     * (|sin| ~ 1) the third angle is set to 0 and the first absorbs the rest.
     */
    setFromRotationMatrix(m, order = this._order, update = true) {
      assertOrder(order);
      const e = m.elements;
      const i = order.charCodeAt(0) - 88, j = order.charCodeAt(1) - 88, k = order.charCodeAt(2) - 88;
      const sign = (j - i + 3) % 3 === 1 ? 1 : -1;
      const at = (row, col) => e[col * 4 + row];
      const sinJ = clamp(sign * at(i, k), -1, 1);
      const b = Math.asin(sinJ);
      let a, c;
      if (Math.abs(sinJ) < GIMBAL_LIMIT) {
        a = Math.atan2(-sign * at(j, k), at(k, k));
        c = Math.atan2(-sign * at(i, j), at(i, i));
      } else {
        a = Math.atan2(sign * at(k, j), at(j, j));
        c = 0;
      }
      this._x = i === 0 ? a : j === 0 ? b : c;
      this._y = i === 1 ? a : j === 1 ? b : c;
      this._z = i === 2 ? a : j === 2 ? b : c;
      this._order = order;
      if (update) this._onChangeCallback();
      return this;
    }
    setFromQuaternion(q, order = this._order, update = true) {
      _matrix.makeRotationFromQuaternion(q);
      return this.setFromRotationMatrix(_matrix, order, update);
    }
    fromArray(a, offset = 0) {
      return this.set(a[offset], a[offset + 1], a[offset + 2], a[offset + 3] ?? this._order);
    }
    toArray(a = [], offset = 0) {
      a[offset] = this._x;
      a[offset + 1] = this._y;
      a[offset + 2] = this._z;
      a[offset + 3] = this._order;
      return a;
    }
  };
  Euler.prototype.isEuler = true;
  function noop2() {
  }

  // src/math/Color.js
  var HEX_STYLE = /^#(?:([0-9a-f])([0-9a-f])([0-9a-f])|([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}))$/i;
  var toByte = (v) => Math.round(clamp(v, 0, 1) * 255);
  var Color = class _Color {
    /** `new Color()` is white; `new Color(0xff8800)`, `new Color('#f80')`, `new Color(1, 0.5, 0)` also work. */
    constructor(r, g, b) {
      this.r = 1;
      this.g = 1;
      this.b = 1;
      if (r === void 0) return;
      if (g === void 0) this.set(r);
      else this.setRGB(r, g, b);
    }
    /** @param {number|string|Color} value 0xRRGGBB, '#rgb' / '#rrggbb', or a Color. */
    set(value) {
      if (typeof value === "number") return this.setHex(value);
      if (typeof value === "string") return this.setStyle(value);
      if (value && value.isColor) return this.copy(value);
      throw new TypeError(`Prism.js: Cannot make a Color from ${String(value)}. Use 0xRRGGBB, '#rrggbb' or a Color.`);
    }
    setHex(hex) {
      if (!Number.isInteger(hex) || hex < 0 || hex > 16777215) {
        throw new RangeError(`Prism.js: Expected a color as an integer between 0x000000 and 0xffffff, received ${String(hex)}.`);
      }
      this.r = (hex >> 16 & 255) / 255;
      this.g = (hex >> 8 & 255) / 255;
      this.b = (hex & 255) / 255;
      return this;
    }
    setStyle(style) {
      const m = HEX_STYLE.exec(style);
      if (m === null) {
        throw new RangeError(`Prism.js: Unsupported color string "${style}". Use '#rgb' or '#rrggbb'.`);
      }
      if (m[1] !== void 0) {
        return this.setHex(parseInt(m[1] + m[1] + m[2] + m[2] + m[3] + m[3], 16));
      }
      return this.setHex(parseInt(m[4] + m[5] + m[6], 16));
    }
    setRGB(r, g, b) {
      this.r = r;
      this.g = g;
      this.b = b;
      return this;
    }
    copy(c) {
      this.r = c.r;
      this.g = c.g;
      this.b = c.b;
      return this;
    }
    clone() {
      return new _Color(this.r, this.g, this.b);
    }
    getHex() {
      return toByte(this.r) << 16 | toByte(this.g) << 8 | toByte(this.b);
    }
    getHexString() {
      return "#" + this.getHex().toString(16).padStart(6, "0");
    }
    multiplyScalar(s) {
      this.r *= s;
      this.g *= s;
      this.b *= s;
      return this;
    }
    lerp(c, t) {
      this.r += (c.r - this.r) * t;
      this.g += (c.g - this.g) * t;
      this.b += (c.b - this.b) * t;
      return this;
    }
    equals(c) {
      return this.r === c.r && this.g === c.g && this.b === c.b;
    }
    fromArray(a, offset = 0) {
      this.r = a[offset];
      this.g = a[offset + 1];
      this.b = a[offset + 2];
      return this;
    }
    toArray(a = [], offset = 0) {
      a[offset] = this.r;
      a[offset + 1] = this.g;
      a[offset + 2] = this.b;
      return a;
    }
  };
  Color.prototype.isColor = true;

  // src/math/Frustum.js
  var Frustum = class {
    constructor() {
      this.planes = new Float64Array(24);
    }
    /**
     * @param {import('./Matrix4.js').Matrix4} m projectionMatrix × matrixWorldInverse (world -> clip),
     *        for WebGL clip space (z from -1 to 1).
     */
    setFromProjectionMatrix(m) {
      const e = m.elements, p = this.planes;
      const set = (i, sign, row) => {
        const nx = e[3] + sign * e[row], ny = e[7] + sign * e[4 + row], nz = e[11] + sign * e[8 + row], d = e[15] + sign * e[12 + row];
        const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        p[i * 4] = nx / length;
        p[i * 4 + 1] = ny / length;
        p[i * 4 + 2] = nz / length;
        p[i * 4 + 3] = d / length;
      };
      set(0, 1, 0);
      set(1, -1, 0);
      set(2, 1, 1);
      set(3, -1, 1);
      set(4, 1, 2);
      set(5, -1, 2);
      return this;
    }
    /** True unless the sphere lies entirely outside one of the planes (so it is conservative: never wrong in the "visible" direction). */
    intersectsSphere(x, y, z, radius) {
      const p = this.planes;
      for (let i = 0; i < 24; i += 4) {
        if (p[i] * x + p[i + 1] * y + p[i + 2] * z + p[i + 3] < -radius) return false;
      }
      return true;
    }
    containsPoint(x, y, z) {
      return this.intersectsSphere(x, y, z, 0);
    }
  };
  Frustum.prototype.isFrustum = true;

  // src/core/Object3D.js
  var _nextId = 1;
  var _target = new Vector3();
  var _position = new Vector3();
  var _parentPosition = new Vector3();
  var _parentScale = new Vector3();
  var _parentQuaternion = new Quaternion();
  var _lookQuaternion = new Quaternion();
  var _lookMatrix = new Matrix4();
  var Object3D = class {
    constructor() {
      this.id = _nextId++;
      this.name = "";
      this.parent = null;
      this.children = [];
      this.visible = true;
      this.userData = {};
      this.position = new Vector3();
      this.rotation = new Euler();
      this.quaternion = new Quaternion();
      this.scale = new Vector3(1, 1, 1);
      this.up = new Vector3(0, 1, 0);
      this.rotation.onChange(() => this.quaternion.setFromEuler(this.rotation, false));
      this.quaternion.onChange(() => this.rotation.setFromQuaternion(this.quaternion, void 0, false));
      this.matrix = new Matrix4();
      this.matrixWorld = new Matrix4();
      this.matrixAutoUpdate = true;
      this.matrixWorldNeedsUpdate = true;
      this._composed = new Float64Array(10).fill(NaN);
    }
    /** Adds children, removing each from its previous parent first. */
    add(...objects) {
      for (const object of objects) {
        if (!object || !object.isObject3D) {
          throw new TypeError(`Prism.js: Object3D.add() expects Object3D instances, received ${String(object)}.`);
        }
        if (object === this) throw new Error("Prism.js: An object cannot be added as a child of itself.");
        for (let ancestor = this.parent; ancestor !== null; ancestor = ancestor.parent) {
          if (ancestor === object) throw new Error("Prism.js: Cannot add an ancestor as a child (it would create a cycle).");
        }
        if (object.parent !== null) object.parent.remove(object);
        object.parent = this;
        object.matrixWorldNeedsUpdate = true;
        this.children.push(object);
      }
      return this;
    }
    /** Removes children; objects that are not children are ignored. */
    remove(...objects) {
      for (const object of objects) {
        const index = this.children.indexOf(object);
        if (index === -1) continue;
        this.children.splice(index, 1);
        object.parent = null;
        object.matrixWorldNeedsUpdate = true;
      }
      return this;
    }
    removeFromParent() {
      if (this.parent !== null) this.parent.remove(this);
      return this;
    }
    /** Calls `callback(object)` for this object and all descendants (depth-first). */
    traverse(callback) {
      callback(this);
      for (let i = 0; i < this.children.length; i++) this.children[i].traverse(callback);
    }
    /** Like traverse(), but skips invisible objects together with their subtrees. */
    traverseVisible(callback) {
      if (!this.visible) return;
      callback(this);
      for (let i = 0; i < this.children.length; i++) this.children[i].traverseVisible(callback);
    }
    /** Recomposes the local matrix if position, quaternion or scale changed. Returns true if it did. */
    updateMatrix() {
      const c = this._composed, p = this.position, q = this.quaternion, s = this.scale;
      const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
      if (c[0] === p.x && c[1] === p.y && c[2] === p.z && c[3] === qx && c[4] === qy && c[5] === qz && c[6] === qw && c[7] === s.x && c[8] === s.y && c[9] === s.z) {
        return false;
      }
      c[0] = p.x;
      c[1] = p.y;
      c[2] = p.z;
      c[3] = qx;
      c[4] = qy;
      c[5] = qz;
      c[6] = qw;
      c[7] = s.x;
      c[8] = s.y;
      c[9] = s.z;
      this.matrix.compose(p, q, s);
      this.matrixWorldNeedsUpdate = true;
      return true;
    }
    /** Updates this object's world matrix and its descendants'. Pass force = true to ignore dirty flags. */
    updateMatrixWorld(force = false) {
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.matrixWorldNeedsUpdate || force) {
        if (this.parent === null) this.matrixWorld.copy(this.matrix);
        else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
        this.matrixWorldNeedsUpdate = false;
        force = true;
      }
      const children = this.children;
      for (let i = 0; i < children.length; i++) children[i].updateMatrixWorld(force);
    }
    /** Brings only this object's world matrix (and optionally its ancestors') up to date. */
    updateWorldMatrix(updateParents = true) {
      if (updateParents && this.parent !== null) this.parent.updateWorldMatrix(true);
      if (this.matrixAutoUpdate) this.updateMatrix();
      if (this.parent === null) this.matrixWorld.copy(this.matrix);
      else this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      this.matrixWorldNeedsUpdate = false;
    }
    getWorldPosition(target) {
      this.updateWorldMatrix(true);
      return target.setFromMatrixPosition(this.matrixWorld);
    }
    /**
     * Rotates the object so its -Z axis points at a world-space point
     * (the same convention cameras use). Accepts (Vector3) or (x, y, z).
     */
    lookAt(x, y, z) {
      if (x.isVector3) _target.copy(x);
      else _target.set(x, y, z);
      this.updateWorldMatrix(true);
      _position.setFromMatrixPosition(this.matrixWorld);
      _lookMatrix.lookAt(_position, _target, this.up).transpose();
      _lookQuaternion.setFromRotationMatrix(_lookMatrix);
      if (this.parent !== null) {
        this.parent.matrixWorld.decompose(_parentPosition, _parentQuaternion, _parentScale);
        _lookQuaternion.premultiply(_parentQuaternion.invert());
      }
      this.quaternion.copy(_lookQuaternion);
      return this;
    }
  };
  Object3D.prototype.isObject3D = true;

  // src/core/Scene.js
  var Scene = class extends Object3D {
    constructor() {
      super();
      this.background = null;
    }
  };
  Scene.prototype.isScene = true;

  // src/core/Group.js
  var Group = class extends Object3D {
  };
  Group.prototype.isGroup = true;

  // src/geometry/BufferAttribute.js
  var BufferAttribute = class {
    /**
     * @param {ArrayBufferView} array e.g. Float32Array
     * @param {number} itemSize Components per vertex (3 for positions)
     * @param {boolean} [normalized=false] Integer data is mapped to 0..1 / -1..1 on the GPU
     */
    constructor(array, itemSize, normalized = false) {
      if (!ArrayBuffer.isView(array) || array instanceof DataView) {
        throw new TypeError("Prism.js: BufferAttribute requires a typed array (for example Float32Array).");
      }
      if (!Number.isInteger(itemSize) || itemSize < 1) {
        throw new RangeError(`Prism.js: BufferAttribute itemSize must be a positive integer, received ${itemSize}.`);
      }
      if (array.length % itemSize !== 0) {
        throw new RangeError(`Prism.js: BufferAttribute array length ${array.length} is not a multiple of itemSize ${itemSize}.`);
      }
      this.array = array;
      this.itemSize = itemSize;
      this.normalized = normalized;
      this.usage = "static";
      this.version = 0;
    }
    get count() {
      return this.array.length / this.itemSize;
    }
    set needsUpdate(value) {
      if (value) this.version++;
    }
  };
  BufferAttribute.prototype.isBufferAttribute = true;

  // src/geometry/BufferGeometry.js
  var _nextId2 = 1;
  var MAX_UINT16_INDEX = 65534;
  var BufferGeometry = class {
    constructor() {
      this.id = _nextId2++;
      this.attributes = {};
      this.index = null;
      this._disposeListeners = /* @__PURE__ */ new Set();
    }
    setAttribute(name, attribute) {
      if (!attribute || !attribute.isBufferAttribute) {
        throw new TypeError(`Prism.js: setAttribute("${name}") expects a BufferAttribute.`);
      }
      this.attributes[name] = attribute;
      return this;
    }
    getAttribute(name) {
      return this.attributes[name];
    }
    hasAttribute(name) {
      return this.attributes[name] !== void 0;
    }
    /** Accepts a BufferAttribute or a plain number[]/typed array (Uint16 or Uint32 is chosen automatically). */
    setIndex(index) {
      if (index === null) {
        this.index = null;
        return this;
      }
      if (index.isBufferAttribute) {
        this.index = index;
        return this;
      }
      let max = 0;
      for (let i = 0; i < index.length; i++) if (index[i] > max) max = index[i];
      const array = max > MAX_UINT16_INDEX ? new Uint32Array(index) : new Uint16Array(index);
      this.index = new BufferAttribute(array, 1);
      return this;
    }
    /**
     * A sphere that contains every vertex ({ center: Vector3, radius }), or null without positions.
     * Computed on first use and again whenever the position attribute is replaced or its `version` changes.
     */
    get boundingSphere() {
      const position = this.attributes.position;
      if (!position) return null;
      let sphere = this._boundingSphere;
      if (sphere === void 0 || sphere.source !== position || sphere.version !== position.version) {
        sphere = this._boundingSphere = computeBoundingSphere(position);
      }
      return sphere;
    }
    /** Number of vertices (from the position attribute). */
    get vertexCount() {
      const position = this.attributes.position;
      return position ? position.count : 0;
    }
    /** Number of indices if indexed, otherwise the number of vertices. */
    get drawCount() {
      return this.index ? this.index.count : this.vertexCount;
    }
    /**
     * Smooth per-vertex normals: each triangle's (area-weighted) normal is
     * accumulated into its three vertices, then normalized. Vertices shared
     * between triangles are smoothed; duplicate vertices stay faceted.
     */
    computeVertexNormals() {
      const position = this.attributes.position;
      if (!position || position.itemSize !== 3) {
        throw new Error('Prism.js: computeVertexNormals() needs a 3-component "position" attribute.');
      }
      const p = position.array;
      const normals = new Float32Array(p.length);
      const idx = this.index ? this.index.array : null;
      const triangleCount = this.drawCount / 3;
      for (let t = 0; t < triangleCount; t++) {
        const a = (idx ? idx[t * 3] : t * 3) * 3;
        const b = (idx ? idx[t * 3 + 1] : t * 3 + 1) * 3;
        const c = (idx ? idx[t * 3 + 2] : t * 3 + 2) * 3;
        const e1x = p[b] - p[a], e1y = p[b + 1] - p[a + 1], e1z = p[b + 2] - p[a + 2];
        const e2x = p[c] - p[a], e2y = p[c + 1] - p[a + 1], e2z = p[c + 2] - p[a + 2];
        const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
        for (const v of [a, b, c]) {
          normals[v] += nx;
          normals[v + 1] += ny;
          normals[v + 2] += nz;
        }
      }
      for (let i = 0; i < normals.length; i += 3) {
        const l = Math.sqrt(normals[i] ** 2 + normals[i + 1] ** 2 + normals[i + 2] ** 2) || 1;
        normals[i] /= l;
        normals[i + 1] /= l;
        normals[i + 2] /= l;
      }
      const existing = this.attributes.normal;
      if (existing && existing.array.length === normals.length && existing.array instanceof Float32Array) {
        existing.array.set(normals);
        existing.needsUpdate = true;
      } else {
        this.setAttribute("normal", new BufferAttribute(normals, 3));
      }
      return this;
    }
    /** Used by the renderer to learn when to free GPU buffers. */
    addDisposeListener(listener) {
      this._disposeListeners.add(listener);
    }
    removeDisposeListener(listener) {
      this._disposeListeners.delete(listener);
    }
    /** Frees GPU resources held for this geometry. */
    dispose() {
      for (const listener of [...this._disposeListeners]) listener(this);
    }
  };
  BufferGeometry.prototype.isBufferGeometry = true;
  function computeBoundingSphere(position) {
    const a = position.array, n = position.itemSize;
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < a.length; i += n) {
      for (let k = 0; k < 3; k++) {
        const v = a[i + k];
        if (v < min[k]) min[k] = v;
        if (v > max[k]) max[k] = v;
      }
    }
    const cx = (min[0] + max[0]) / 2, cy = (min[1] + max[1]) / 2, cz = (min[2] + max[2]) / 2;
    let r2 = 0;
    for (let i = 0; i < a.length; i += n) {
      const dx = a[i] - cx, dy = a[i + 1] - cy, dz = a[i + 2] - cz;
      const d = dx * dx + dy * dy + dz * dz;
      if (d > r2) r2 = d;
    }
    return { center: { x: cx, y: cy, z: cz }, radius: Math.sqrt(r2), source: position, version: position.version };
  }

  // src/materials/Material.js
  var _nextId3 = 1;
  var Material = class {
    constructor() {
      this.id = _nextId3++;
      this.type = "Material";
      this.name = "";
      this.visible = true;
      this.opacity = 1;
      this.transparent = false;
      this.side = FrontSide;
      this.depthTest = true;
      this.depthWrite = true;
      this._disposeListeners = /* @__PURE__ */ new Set();
    }
    /** Assigns constructor options. Unknown keys throw so typos do not fail silently. */
    setValues(values = {}) {
      for (const key of Object.keys(values)) {
        if (!(key in this)) {
          throw new TypeError(`Prism.js: "${key}" is not a property of ${this.type}.`);
        }
        this[key] = values[key];
      }
      return this;
    }
    addDisposeListener(listener) {
      this._disposeListeners.add(listener);
    }
    removeDisposeListener(listener) {
      this._disposeListeners.delete(listener);
    }
    /** Frees GPU resources tied to this material (none yet; programs are shared per material type). */
    dispose() {
      for (const listener of [...this._disposeListeners]) listener(this);
    }
  };
  Material.prototype.isMaterial = true;

  // src/materials/BasicMaterial.js
  var BasicMaterial = class extends Material {
    constructor(parameters = {}) {
      super();
      this.type = "BasicMaterial";
      this.color = new Color(1, 1, 1);
      this.wireframe = false;
      this.map = null;
      this.setValues(parameters);
    }
    setValues(values = {}) {
      const { color, ...rest } = values;
      if (color !== void 0) this.color.set(color);
      return super.setValues(rest);
    }
  };
  BasicMaterial.prototype.isBasicMaterial = true;

  // src/core/Mesh.js
  var Mesh = class extends Object3D {
    constructor(geometry = new BufferGeometry(), material = new BasicMaterial()) {
      super();
      this.geometry = geometry;
      this.material = material;
      this.frustumCulled = true;
    }
  };
  Mesh.prototype.isMesh = true;

  // src/core/InstancedMesh.js
  var IDENTITY = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  var InstancedMesh = class extends Mesh {
    constructor(geometry, material, capacity) {
      super(geometry, material);
      if (!Number.isInteger(capacity) || capacity < 1) {
        throw new RangeError(`Prism.js: InstancedMesh capacity must be a positive integer, received ${String(capacity)}.`);
      }
      this.capacity = capacity;
      this.count = capacity;
      this.instanceMatrix = new BufferAttribute(new Float32Array(capacity * 16), 16);
      this.instanceMatrix.usage = "dynamic";
      for (let i = 0; i < capacity; i++) this.instanceMatrix.array.set(IDENTITY, i * 16);
      this.instanceColor = null;
      this.frustumCulled = false;
      this._disposeListeners = /* @__PURE__ */ new Set();
    }
    /** Stores a Matrix4 for instance `index`. Set `instanceMatrix.needsUpdate = true` afterwards. */
    setMatrixAt(index, matrix) {
      this._check(index);
      this.instanceMatrix.array.set(matrix.elements, index * 16);
    }
    getMatrixAt(index, target) {
      this._check(index);
      const a = this.instanceMatrix.array, o = index * 16;
      for (let i = 0; i < 16; i++) target.elements[i] = a[o + i];
      return target;
    }
    /** Per-instance color, multiplied with the material color. Set `instanceColor.needsUpdate = true` afterwards. */
    setColorAt(index, color) {
      this._check(index);
      if (this.instanceColor === null) {
        this.instanceColor = new BufferAttribute(new Float32Array(this.capacity * 3).fill(1), 3);
        this.instanceColor.usage = "dynamic";
      }
      const a = this.instanceColor.array;
      a[index * 3] = color.r;
      a[index * 3 + 1] = color.g;
      a[index * 3 + 2] = color.b;
    }
    getColorAt(index, target) {
      this._check(index);
      if (this.instanceColor === null) return target.setRGB(1, 1, 1);
      const a = this.instanceColor.array;
      return target.setRGB(a[index * 3], a[index * 3 + 1], a[index * 3 + 2]);
    }
    _check(index) {
      if (!Number.isInteger(index) || index < 0 || index >= this.capacity) {
        throw new RangeError(`Prism.js: Instance index ${String(index)} is outside 0..${this.capacity - 1}.`);
      }
    }
    addDisposeListener(listener) {
      this._disposeListeners.add(listener);
    }
    removeDisposeListener(listener) {
      this._disposeListeners.delete(listener);
    }
    /** Frees the GPU copy of the instance data (the geometry and material are not touched). */
    dispose() {
      for (const listener of [...this._disposeListeners]) listener(this);
    }
  };
  InstancedMesh.prototype.isInstancedMesh = true;

  // src/core/Camera.js
  var Camera = class extends Object3D {
    constructor() {
      super();
      this.matrixWorldInverse = new Matrix4();
      this.projectionMatrix = new Matrix4();
      this.projectionMatrixInverse = new Matrix4();
      this._inverseSource = new Float64Array(16).fill(NaN);
    }
    updateMatrixWorld(force = false) {
      super.updateMatrixWorld(force);
      this._updateInverse();
    }
    updateWorldMatrix(updateParents = true) {
      super.updateWorldMatrix(updateParents);
      this._updateInverse();
    }
    /** Inverts the world matrix only when it actually changed since the last inversion. */
    _updateInverse() {
      const world = this.matrixWorld.elements, source = this._inverseSource;
      let changed = false;
      for (let i = 0; i < 16; i++) {
        if (source[i] !== world[i]) {
          changed = true;
          break;
        }
      }
      if (!changed) return;
      source.set(world);
      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }
  };
  Camera.prototype.isCamera = true;

  // src/core/PerspectiveCamera.js
  var PerspectiveCamera = class extends Camera {
    /**
     * @param {number} fov Vertical field of view in DEGREES.
     * @param {number} aspect Width / height.
     * Call updateProjectionMatrix() after changing any of these properties.
     */
    constructor(fov = 50, aspect = 1, near = 0.1, far = 1e3) {
      super();
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
      this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const { fov, aspect, near, far } = this;
      if (!(fov > 0 && fov < 180)) throw new RangeError(`Prism.js: PerspectiveCamera fov must be between 0 and 180 degrees, received ${fov}.`);
      if (!(aspect > 0)) throw new RangeError(`Prism.js: PerspectiveCamera aspect must be positive, received ${aspect}.`);
      if (!(near > 0 && far > near)) throw new RangeError(`Prism.js: PerspectiveCamera requires 0 < near < far, received near=${near}, far=${far}.`);
      this.projectionMatrix.makePerspective(fov * DEG2RAD, aspect, near, far);
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
  };
  PerspectiveCamera.prototype.isPerspectiveCamera = true;

  // src/core/OrthographicCamera.js
  var OrthographicCamera = class extends Camera {
    /** Call updateProjectionMatrix() after changing any of these properties. */
    constructor(left = -1, right = 1, top = 1, bottom = -1, near = 0.1, far = 1e3) {
      super();
      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;
      this.near = near;
      this.far = far;
      this.updateProjectionMatrix();
    }
    updateProjectionMatrix() {
      const { left, right, top, bottom, near, far } = this;
      if (left === right || top === bottom || near === far) {
        throw new RangeError("Prism.js: OrthographicCamera needs a non-empty box (left != right, top != bottom, near != far).");
      }
      this.projectionMatrix.makeOrthographic(left, right, top, bottom, near, far);
      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }
  };
  OrthographicCamera.prototype.isOrthographicCamera = true;

  // src/geometry/buildGrid.js
  function buildGrid(out, uAxis, vAxis, normal, width, height, depth, gridX, gridY) {
    const base = out.vertexOffset;
    const columns = gridX + 1;
    for (let iy = 0; iy <= gridY; iy++) {
      const t = iy / gridY;
      for (let ix = 0; ix <= gridX; ix++) {
        const s = ix / gridX;
        const v = base + iy * columns + ix;
        for (let k = 0; k < 3; k++) {
          out.position[v * 3 + k] = normal[k] * depth * 0.5 + uAxis[k] * (s - 0.5) * width + vAxis[k] * (t - 0.5) * height;
          out.normal[v * 3 + k] = normal[k];
        }
        out.uv[v * 2] = s;
        out.uv[v * 2 + 1] = t;
      }
    }
    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = base + iy * columns + ix;
        const b = a + 1;
        const d = a + columns;
        const c = d + 1;
        out.index.push(a, b, d, b, c, d);
      }
    }
    out.vertexOffset = base + columns * (gridY + 1);
  }

  // src/geometry/PlaneGeometry.js
  var PlaneGeometry = class extends BufferGeometry {
    constructor(width = 1, height = 1, widthSegments = 1, heightSegments = 1) {
      super();
      assertPositive("PlaneGeometry", { width, height });
      const sx = segments("PlaneGeometry", "widthSegments", widthSegments);
      const sy = segments("PlaneGeometry", "heightSegments", heightSegments);
      this.parameters = { width, height, widthSegments: sx, heightSegments: sy };
      const vertexCount = (sx + 1) * (sy + 1);
      const out = {
        position: new Float32Array(vertexCount * 3),
        normal: new Float32Array(vertexCount * 3),
        uv: new Float32Array(vertexCount * 2),
        index: [],
        vertexOffset: 0
      };
      buildGrid(out, [1, 0, 0], [0, 1, 0], [0, 0, 1], width, height, 0, sx, sy);
      this.setAttribute("position", new BufferAttribute(out.position, 3));
      this.setAttribute("normal", new BufferAttribute(out.normal, 3));
      this.setAttribute("uv", new BufferAttribute(out.uv, 2));
      this.setIndex(out.index);
    }
  };
  function assertPositive(name, values) {
    for (const [key, value] of Object.entries(values)) {
      if (!(value > 0) || !Number.isFinite(value)) {
        throw new RangeError(`Prism.js: ${name} ${key} must be a positive finite number, received ${String(value)}.`);
      }
    }
  }
  function segments(name, key, value) {
    if (!Number.isFinite(value) || value < 1) {
      throw new RangeError(`Prism.js: ${name} ${key} must be at least 1, received ${String(value)}.`);
    }
    return Math.floor(value);
  }

  // src/geometry/BoxGeometry.js
  var FACES = [
    { normal: [1, 0, 0], u: [0, 0, -1], v: [0, 1, 0] },
    // +X
    { normal: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
    // -X
    { normal: [0, 1, 0], u: [1, 0, 0], v: [0, 0, -1] },
    // +Y
    { normal: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
    // -Y
    { normal: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
    // +Z
    { normal: [0, 0, -1], u: [-1, 0, 0], v: [0, 1, 0] }
    // -Z
  ];
  var abs = Math.abs;
  var BoxGeometry = class extends BufferGeometry {
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
      super();
      assertPositive("BoxGeometry", { width, height, depth });
      const sx = segments("BoxGeometry", "widthSegments", widthSegments);
      const sy = segments("BoxGeometry", "heightSegments", heightSegments);
      const sz = segments("BoxGeometry", "depthSegments", depthSegments);
      this.parameters = { width, height, depth, widthSegments: sx, heightSegments: sy, depthSegments: sz };
      const size = [width, height, depth];
      const grid = [sx, sy, sz];
      const pick = (axis, values) => abs(axis[0]) * values[0] + abs(axis[1]) * values[1] + abs(axis[2]) * values[2];
      let vertexCount = 0;
      for (const f of FACES) vertexCount += (pick(f.u, grid) + 1) * (pick(f.v, grid) + 1);
      const out = {
        position: new Float32Array(vertexCount * 3),
        normal: new Float32Array(vertexCount * 3),
        uv: new Float32Array(vertexCount * 2),
        index: [],
        vertexOffset: 0
      };
      for (const f of FACES) {
        buildGrid(out, f.u, f.v, f.normal, pick(f.u, size), pick(f.v, size), pick(f.normal, size), pick(f.u, grid), pick(f.v, grid));
      }
      this.setAttribute("position", new BufferAttribute(out.position, 3));
      this.setAttribute("normal", new BufferAttribute(out.normal, 3));
      this.setAttribute("uv", new BufferAttribute(out.uv, 2));
      this.setIndex(out.index);
    }
  };

  // src/geometry/SphereGeometry.js
  var SphereGeometry = class extends BufferGeometry {
    constructor(radius = 1, widthSegments = 32, heightSegments = 16) {
      super();
      assertPositive("SphereGeometry", { radius });
      const cols = Math.max(3, Math.floor(widthSegments));
      const rows = Math.max(2, Math.floor(heightSegments));
      this.parameters = { radius, widthSegments: cols, heightSegments: rows };
      const vertexCount = (cols + 1) * (rows + 1);
      const position = new Float32Array(vertexCount * 3);
      const normal = new Float32Array(vertexCount * 3);
      const uv = new Float32Array(vertexCount * 2);
      const index = [];
      for (let iy = 0; iy <= rows; iy++) {
        const v = iy / rows;
        const theta = v * Math.PI;
        const sinT = Math.sin(theta), cosT = Math.cos(theta);
        for (let ix = 0; ix <= cols; ix++) {
          const u = ix / cols;
          const phi = u * Math.PI * 2;
          const nx = sinT * Math.cos(phi), ny = cosT, nz = sinT * Math.sin(phi);
          const i = iy * (cols + 1) + ix;
          position[i * 3] = nx * radius;
          position[i * 3 + 1] = ny * radius;
          position[i * 3 + 2] = nz * radius;
          normal[i * 3] = nx;
          normal[i * 3 + 1] = ny;
          normal[i * 3 + 2] = nz;
          uv[i * 2] = u;
          uv[i * 2 + 1] = 1 - v;
        }
      }
      for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
          const a = iy * (cols + 1) + ix, b = a + 1, d = a + cols + 1, c = d + 1;
          if (iy !== 0) index.push(a, b, d);
          if (iy !== rows - 1) index.push(b, c, d);
        }
      }
      this.setAttribute("position", new BufferAttribute(position, 3));
      this.setAttribute("normal", new BufferAttribute(normal, 3));
      this.setAttribute("uv", new BufferAttribute(uv, 2));
      this.setIndex(index);
    }
  };

  // src/geometry/CapsuleGeometry.js
  var CapsuleGeometry = class extends BufferGeometry {
    constructor(radius = 0.5, length = 1, capSegments = 8, radialSegments = 24) {
      super();
      assertPositive("CapsuleGeometry", { radius });
      if (!(length >= 0) || !Number.isFinite(length)) throw new RangeError(`Prism.js: CapsuleGeometry length must be a finite number >= 0, received ${String(length)}.`);
      const caps = Math.max(1, Math.floor(capSegments)), cols = Math.max(3, Math.floor(radialSegments));
      this.parameters = { radius, length, capSegments: caps, radialSegments: cols };
      const rings = 2 * (caps + 1), half = length / 2;
      const vertexCount = rings * (cols + 1);
      const position = new Float32Array(vertexCount * 3), normal = new Float32Array(vertexCount * 3), uv = new Float32Array(vertexCount * 2);
      const total = Math.PI * radius + length;
      for (let ring = 0; ring < rings; ring++) {
        const upper = ring <= caps;
        const theta = upper ? Math.PI / 2 * (ring / caps) : Math.PI / 2 + Math.PI / 2 * ((ring - caps - 1) / caps);
        const sinT = Math.sin(theta), cosT = Math.cos(theta), cy = upper ? half : -half;
        const arc = upper ? radius * theta : radius * (Math.PI / 2) + length + radius * (theta - Math.PI / 2);
        for (let ix = 0; ix <= cols; ix++) {
          const phi = ix / cols * Math.PI * 2;
          const nx = sinT * Math.cos(phi), ny = cosT, nz = sinT * Math.sin(phi);
          const i = ring * (cols + 1) + ix;
          position[i * 3] = nx * radius;
          position[i * 3 + 1] = cy + ny * radius;
          position[i * 3 + 2] = nz * radius;
          normal[i * 3] = nx;
          normal[i * 3 + 1] = ny;
          normal[i * 3 + 2] = nz;
          uv[i * 2] = ix / cols;
          uv[i * 2 + 1] = 1 - arc / total;
        }
      }
      const index = [];
      for (let ring = 0; ring < rings - 1; ring++) {
        for (let ix = 0; ix < cols; ix++) {
          const a = ring * (cols + 1) + ix, b = a + 1, d = a + cols + 1, c = d + 1;
          if (ring !== 0) index.push(a, b, d);
          if (ring !== rings - 2) index.push(b, c, d);
        }
      }
      this.setAttribute("position", new BufferAttribute(position, 3));
      this.setAttribute("normal", new BufferAttribute(normal, 3));
      this.setAttribute("uv", new BufferAttribute(uv, 2));
      this.setIndex(index);
    }
  };

  // src/lights/Light.js
  var Light = class extends Object3D {
    /** @param {number|string|Color} color @param {number} intensity Must be >= 0. */
    constructor(color = 16777215, intensity = 1) {
      super();
      if (!(intensity >= 0) || !Number.isFinite(intensity)) {
        throw new RangeError(`Prism.js: Light intensity must be a finite number >= 0, received ${String(intensity)}.`);
      }
      this.color = new Color(color);
      this.intensity = intensity;
    }
  };
  Light.prototype.isLight = true;

  // src/lights/AmbientLight.js
  var AmbientLight = class extends Light {
  };
  AmbientLight.prototype.isAmbientLight = true;

  // src/lights/DirectionalLight.js
  var DirectionalLight = class extends Light {
    constructor(color, intensity) {
      super(color, intensity);
      this.position.set(0, 1, 0);
      this.target = new Object3D();
    }
  };
  DirectionalLight.prototype.isDirectionalLight = true;

  // src/lights/PointLight.js
  var PointLight = class extends Light {
    /** @param {number} distance 0 = unlimited. @param {number} decay Falloff exponent, >= 0. */
    constructor(color, intensity, distance = 0, decay = 2) {
      super(color, intensity);
      if (!(distance >= 0) || !Number.isFinite(distance)) {
        throw new RangeError(`Prism.js: PointLight distance must be a finite number >= 0, received ${String(distance)}.`);
      }
      if (!(decay >= 0) || !Number.isFinite(decay)) {
        throw new RangeError(`Prism.js: PointLight decay must be a finite number >= 0, received ${String(decay)}.`);
      }
      this.distance = distance;
      this.decay = decay;
    }
  };
  PointLight.prototype.isPointLight = true;

  // src/materials/NormalMaterial.js
  var NormalMaterial = class extends Material {
    constructor(parameters = {}) {
      super();
      this.type = "NormalMaterial";
      this.wireframe = false;
      this.setValues(parameters);
    }
  };
  NormalMaterial.prototype.isNormalMaterial = true;

  // src/materials/LambertMaterial.js
  var LambertMaterial = class extends Material {
    constructor(parameters = {}) {
      super();
      this.type = "LambertMaterial";
      this.color = new Color(1, 1, 1);
      this.wireframe = false;
      this.map = null;
      this.setValues(parameters);
    }
    setValues(values = {}) {
      const { color, ...rest } = values;
      if (color !== void 0) this.color.set(color);
      return super.setValues(rest);
    }
  };
  LambertMaterial.prototype.isLambertMaterial = true;

  // src/textures/Texture.js
  var _nextId4 = 1;
  var Texture = class {
    constructor(image = null) {
      this.id = _nextId4++;
      this.name = "";
      this.image = image;
      this.wrapS = ClampToEdgeWrapping;
      this.wrapT = ClampToEdgeWrapping;
      this.magFilter = LinearFilter;
      this.minFilter = LinearMipmapLinearFilter;
      this.generateMipmaps = true;
      this.flipY = true;
      this.version = 0;
      this._disposeListeners = /* @__PURE__ */ new Set();
    }
    set needsUpdate(value) {
      if (value) this.version++;
    }
    addDisposeListener(listener) {
      this._disposeListeners.add(listener);
    }
    removeDisposeListener(listener) {
      this._disposeListeners.delete(listener);
    }
    /** Frees the GPU copy (it is re-uploaded if the texture is used again). */
    dispose() {
      for (const listener of [...this._disposeListeners]) listener(this);
    }
  };
  Texture.prototype.isTexture = true;

  // src/loaders/TextureLoader.js
  var TextureLoader = class {
    constructor() {
      this.crossOrigin = "anonymous";
      this._urlModifier = null;
      this._createImage = () => {
        if (typeof Image === "undefined") {
          throw new Error("Prism.js: TextureLoader needs a browser environment (the Image class is not available).");
        }
        return new Image();
      };
    }
    /** `fn(url) => url` is applied to every URL before loading (e.g. to map names to data: URLs). */
    setURLModifier(fn) {
      this._urlModifier = fn;
      return this;
    }
    /**
     * Returns the Texture immediately; its `image` is filled in when loading finishes
     * (until then it renders as white). Errors go to `onError`, or console.error if omitted.
     */
    load(url, onLoad, onError) {
      const texture = new Texture();
      texture.name = url;
      const image = this._createImage();
      image.crossOrigin = this.crossOrigin;
      image.onload = () => {
        texture.image = image;
        texture.needsUpdate = true;
        if (onLoad) onLoad(texture);
      };
      image.onerror = () => {
        const error = new Error(`Prism.js: Failed to load texture "${url}".`);
        if (onError) onError(error);
        else console.error(error);
      };
      image.src = this._urlModifier ? this._urlModifier(url) : url;
      return texture;
    }
    /** Promise version: resolves with the Texture once the image has loaded. */
    loadAsync(url) {
      return new Promise((resolve, reject) => {
        this.load(url, resolve, reject);
      });
    }
  };

  // src/loaders/resolveURL.js
  function resolveURL(base, ref) {
    ref = ref.trim().replace(/\\/g, "/");
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(ref)) return ref;
    const clean = String(base).split(/[?#]/)[0];
    const slash = clean.lastIndexOf("/");
    return (slash === -1 ? "" : clean.slice(0, slash + 1)) + ref;
  }

  // src/loaders/fetchText.js
  async function fetchText(url, what = "file") {
    if (typeof fetch !== "function") {
      throw new Error(`Prism.js: fetch() is not available, cannot load ${what} "${url}".`);
    }
    let response;
    try {
      response = await fetch(url);
    } catch (cause) {
      throw new Error(`Prism.js: Failed to load ${what} "${url}": ${cause.message}`, { cause });
    }
    if (!response.ok) {
      throw new Error(
        `Prism.js: Failed to load ${what} "${url}" (HTTP ${response.status}${response.statusText ? " " + response.statusText : ""}).`
      );
    }
    return response.text();
  }

  // src/loaders/MTLLoader.js
  var NUMERIC_OPTIONS = { "-s": 3, "-o": 3, "-t": 3, "-mm": 2, "-bm": 1, "-blendu": 1, "-blendv": 1, "-texres": 1 };
  var WORD_OPTIONS = /* @__PURE__ */ new Set(["-cc", "-clamp", "-imfchan", "-type"]);
  var DEFAULT_DIFFUSE = [0.8, 0.8, 0.8];
  var MaterialLibrary = class {
    constructor() {
      this.materials = /* @__PURE__ */ Object.create(null);
      this.textures = [];
    }
    get(name) {
      return this.materials[name];
    }
    get names() {
      return Object.keys(this.materials);
    }
    /** Copies the entries of another library into this one (later names win). */
    add(other) {
      Object.assign(this.materials, other.materials);
      this.textures.push(...other.textures);
      return this;
    }
    /** Disposes every material and texture of the library. */
    dispose() {
      for (const material of Object.values(this.materials)) material.dispose();
      for (const texture of this.textures) texture.dispose();
    }
  };
  function fail(line, message) {
    return new Error(`Prism.js: MTL parse error at line ${line}: ${message}`);
  }
  function numbers(rest, count, line, keyword) {
    const values = rest.split(/\s+/).filter((t) => t !== "").slice(0, count).map(Number);
    if (values.length === 0 || values.some((v) => !Number.isFinite(v))) {
      throw fail(line, `"${keyword} ${rest}" must be followed by ${count} number(s).`);
    }
    return values;
  }
  function mapFileName(rest) {
    const tokens = rest.split(/\s+/);
    let i = 0;
    while (i < tokens.length && tokens[i].startsWith("-")) {
      const option = tokens[i].toLowerCase();
      if (option in NUMERIC_OPTIONS) {
        let taken = 0;
        i++;
        while (taken < NUMERIC_OPTIONS[option] && i < tokens.length && tokens[i] !== "" && Number.isFinite(Number(tokens[i]))) {
          i++;
          taken++;
        }
      } else if (WORD_OPTIONS.has(option)) {
        i += 2;
      } else {
        break;
      }
    }
    return tokens.slice(i).join(" ");
  }
  var MTLLoader = class {
    constructor() {
      this.side = FrontSide;
      this.loadTextures = true;
      this.textureLoader = new TextureLoader();
      this._urlModifier = null;
    }
    /** `fn(url) => url` is applied to every URL this loader (and its textures) fetches. */
    setURLModifier(fn) {
      this._urlModifier = fn;
      this.textureLoader.setURLModifier(fn);
      return this;
    }
    async loadAsync(url) {
      const text = await fetchText(this._urlModifier ? this._urlModifier(url) : url, "MTL file");
      return this.parse(text, url);
    }
    load(url, onLoad, onError) {
      this.loadAsync(url).then(onLoad, (error) => {
        if (onError) onError(error);
        else console.error(error);
      });
    }
    /**
     * @param {string} text Contents of the .mtl file.
     * @param {string} [basePath] URL of the .mtl file; texture names are resolved against it.
     * @returns {MaterialLibrary}
     */
    parse(text, basePath = "") {
      const definitions = [];
      let current = null;
      const lines = text.split(/\r?\n/);
      for (let n = 0; n < lines.length; n++) {
        const line = lines[n].trim();
        if (line === "" || line[0] === "#") continue;
        const split = line.search(/\s/);
        const keyword = (split === -1 ? line : line.slice(0, split)).toLowerCase();
        const rest = split === -1 ? "" : line.slice(split).trim();
        if (keyword === "newmtl") {
          current = { name: rest, diffuse: DEFAULT_DIFFUSE, opacity: 1, opacityFromD: false, map: null };
          definitions.push(current);
          continue;
        }
        if (current === null) continue;
        if (keyword === "kd") {
          if (/^(spectral|xyz)\b/i.test(rest)) continue;
          const v = numbers(rest, 3, n + 1, "Kd");
          current.diffuse = v.length === 1 ? [v[0], v[0], v[0]] : v;
        } else if (keyword === "d") {
          const [d] = numbers(rest.replace(/^-halo\s+/i, ""), 1, n + 1, "d");
          current.opacity = d;
          current.opacityFromD = true;
        } else if (keyword === "tr") {
          const [tr] = numbers(rest, 1, n + 1, "Tr");
          if (!current.opacityFromD) current.opacity = 1 - tr;
        } else if (keyword === "map_kd") {
          const file = mapFileName(rest);
          if (file !== "") current.map = file;
        }
      }
      const library = new MaterialLibrary();
      for (const def of definitions) {
        const [r, g, b] = def.diffuse;
        const opacity = Math.min(1, Math.max(0, def.opacity));
        const material = new LambertMaterial({ opacity, transparent: opacity < 1, side: this.side });
        material.color.setRGB(r, g, b);
        material.name = def.name;
        if (def.map !== null && this.loadTextures) {
          const url = resolveURL(basePath, def.map);
          const texture = this.textureLoader.load(url, void 0, () => {
            console.warn(`Prism.js: Texture "${url}" of material "${def.name}" failed to load; its color is used instead.`);
          });
          texture.wrapS = texture.wrapT = RepeatWrapping;
          material.map = texture;
          library.textures.push(texture);
        }
        library.materials[def.name] = material;
      }
      return library;
    }
  };

  // src/loaders/OBJLoader.js
  var DEFAULT_COLOR = 13421772;
  function fail2(line, message) {
    return new Error(`Prism.js: OBJ parse error at line ${line}: ${message}`);
  }
  function floats(rest, min, line, keyword) {
    const values = rest.split(/\s+/).filter((t) => t !== "").map(Number);
    if (values.length < min || values.slice(0, min).some((v) => !Number.isFinite(v))) {
      throw fail2(line, `"${keyword} ${rest}" needs at least ${min} number(s).`);
    }
    return values;
  }
  function parseOBJ(text) {
    const positions = [], uvs = [], normals = [];
    const mtllibs = [];
    const builders = /* @__PURE__ */ new Map();
    let objectName = "", materialName = "", builder = null;
    const currentBuilder = () => {
      if (builder === null) {
        const key = `${objectName}\0${materialName}`;
        builder = builders.get(key);
        if (builder === void 0) {
          builder = {
            name: objectName,
            material: materialName,
            positions: [],
            uvs: [],
            normals: [],
            indices: [],
            lookup: /* @__PURE__ */ new Map(),
            vertexCount: 0,
            uvCorners: 0,
            missingNormals: false
          };
          builders.set(key, builder);
        }
      }
      return builder;
    };
    const resolve = (token, count, line, what) => {
      const raw = parseInt(token, 10);
      if (!Number.isInteger(raw) || raw === 0) throw fail2(line, `invalid ${what} index "${token}".`);
      const index = raw > 0 ? raw - 1 : count + raw;
      if (index < 0 || index >= count) {
        throw fail2(line, `${what} index ${raw} is out of range (the file defines ${count} ${what} entries before this line).`);
      }
      return index;
    };
    const lines = text.split(/\r?\n/);
    for (let n = 0; n < lines.length; n++) {
      const line = lines[n].trim();
      if (line === "" || line[0] === "#") continue;
      const split = line.search(/\s/);
      const keyword = split === -1 ? line : line.slice(0, split);
      const rest = split === -1 ? "" : line.slice(split).trim();
      switch (keyword) {
        case "v": {
          const v = floats(rest, 3, n + 1, "v");
          positions.push(v[0], v[1], v[2]);
          break;
        }
        case "vt": {
          const v = floats(rest, 1, n + 1, "vt");
          uvs.push(v[0], v[1] ?? 0);
          break;
        }
        case "vn": {
          const v = floats(rest, 3, n + 1, "vn");
          normals.push(v[0], v[1], v[2]);
          break;
        }
        case "o":
        case "g":
          objectName = rest;
          builder = null;
          break;
        case "usemtl":
          materialName = rest;
          builder = null;
          break;
        case "mtllib":
          if (rest !== "") mtllibs.push(rest);
          break;
        case "f": {
          const corners = rest.split(/\s+/);
          if (corners.length < 3) throw fail2(n + 1, `a face needs at least 3 vertices, found ${corners.length}.`);
          const b = currentBuilder();
          const face = [];
          for (const corner of corners) {
            const parts = corner.split("/");
            const vi = resolve(parts[0], positions.length / 3, n + 1, "vertex");
            const ti = parts.length > 1 && parts[1] !== "" ? resolve(parts[1], uvs.length / 2, n + 1, "texture coordinate") : -1;
            const ni = parts.length > 2 && parts[2] !== "" ? resolve(parts[2], normals.length / 3, n + 1, "normal") : -1;
            let output;
            const key = ni === -1 ? null : `${vi}/${ti}/${ni}`;
            if (key !== null) output = b.lookup.get(key);
            if (output === void 0) {
              output = b.vertexCount++;
              if (key !== null) b.lookup.set(key, output);
              b.positions.push(positions[vi * 3], positions[vi * 3 + 1], positions[vi * 3 + 2]);
              if (ti === -1) b.uvs.push(0, 0);
              else {
                b.uvs.push(uvs[ti * 2], uvs[ti * 2 + 1]);
                b.uvCorners++;
              }
              if (ni === -1) {
                b.missingNormals = true;
                b.normals.push(0, 0, 0);
              } else b.normals.push(normals[ni * 3], normals[ni * 3 + 1], normals[ni * 3 + 2]);
            }
            face.push(output);
          }
          for (let i = 1; i < face.length - 1; i++) b.indices.push(face[0], face[i], face[i + 1]);
          break;
        }
        default:
          break;
      }
    }
    const objects = [];
    let vertexCount = 0, triangleCount = 0;
    for (const b of builders.values()) {
      if (b.indices.length === 0) continue;
      vertexCount += b.vertexCount;
      triangleCount += b.indices.length / 3;
      objects.push({
        name: b.name,
        material: b.material,
        positions: new Float32Array(b.positions),
        normals: b.missingNormals ? null : new Float32Array(b.normals),
        uvs: b.uvCorners > 0 ? new Float32Array(b.uvs) : null,
        indices: b.indices
      });
    }
    return { objects, mtllibs, vertexCount, triangleCount };
  }
  var OBJLoader = class {
    constructor() {
      this.materials = null;
      this.autoLoadMaterials = true;
      this.side = FrontSide;
      this.mtlLoader = new MTLLoader();
      this._urlModifier = null;
    }
    setMaterials(library) {
      this.materials = library;
      return this;
    }
    /** `fn(url) => url` is applied to every URL fetched (obj, mtl, textures). */
    setURLModifier(fn) {
      this._urlModifier = fn;
      this.mtlLoader.setURLModifier(fn);
      return this;
    }
    async loadAsync(url) {
      const text = await fetchText(this._urlModifier ? this._urlModifier(url) : url, "OBJ file");
      let library = this.materials;
      if (library === null && this.autoLoadMaterials) library = await this._loadMaterialLibraries(text, url);
      return this.parse(text, library);
    }
    load(url, onLoad, onError) {
      this.loadAsync(url).then(onLoad, (error) => {
        if (onError) onError(error);
        else console.error(error);
      });
    }
    async _loadMaterialLibraries(text, objUrl) {
      const names = [...text.matchAll(/^[ \t]*mtllib[ \t]+(.+?)[ \t]*$/gm)].map((m) => m[1]);
      if (names.length === 0) return null;
      this.mtlLoader.side = this.side;
      const merged = new MaterialLibrary();
      for (const name of names) {
        try {
          merged.add(await this.mtlLoader.loadAsync(resolveURL(objUrl, name)));
        } catch (error) {
          console.warn(`Prism.js: Could not load material library "${name}" (${error.message}); default materials are used.`);
        }
      }
      return merged;
    }
    /**
     * @param {string} text Contents of the .obj file.
     * @param {MaterialLibrary|null} [materials] Defaults to the library set with setMaterials().
     * @returns {Group}
     */
    parse(text, materials = this.materials) {
      const parsed = parseOBJ(text);
      const group = new Group();
      group.userData.obj = {
        materialLibraries: parsed.mtllibs,
        vertexCount: parsed.vertexCount,
        triangleCount: parsed.triangleCount
      };
      let fallback = null;
      const warned = /* @__PURE__ */ new Set();
      const materialFor = (name) => {
        const found = name === "" || !materials ? void 0 : materials.get(name);
        if (found !== void 0) return found;
        if (name !== "" && materials && !warned.has(name)) {
          warned.add(name);
          console.warn(`Prism.js: Material "${name}" is not defined in the loaded MTL; a default gray material is used.`);
        }
        if (fallback === null) fallback = new LambertMaterial({ color: DEFAULT_COLOR, side: this.side });
        return fallback;
      };
      for (const o of parsed.objects) {
        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(o.positions, 3));
        geometry.setIndex(o.indices);
        if (o.uvs) geometry.setAttribute("uv", new BufferAttribute(o.uvs, 2));
        if (o.normals) geometry.setAttribute("normal", new BufferAttribute(o.normals, 3));
        else geometry.computeVertexNormals();
        const mesh = new Mesh(geometry, materialFor(o.material));
        mesh.name = o.name;
        group.add(mesh);
      }
      return group;
    }
  };

  // src/physics/shapes.js
  var KIND_PLANE = 0;
  var KIND_BOX = 1;
  var KIND_CAPSULE = 2;
  var KIND_SPHERE = 3;
  function assertPositive2(name, value) {
    if (!(value > 0) || !Number.isFinite(value)) {
      throw new RangeError(`Prism.js: ${name} must be a positive finite number, received ${String(value)}.`);
    }
  }
  var SphereShape = class {
    constructor(radius = 0.5) {
      assertPositive2("SphereShape radius", radius);
      this.radius = radius;
      this.kind = KIND_SPHERE;
    }
    /** Principal moments of a solid sphere: 2/5 m r². */
    computeInertia(mass, out) {
      return out.setScalar(0.4 * mass * this.radius * this.radius);
    }
    /** Smallest half-thickness, used to decide whether a body is fast enough to need continuous collision. */
    get minExtent() {
      return this.radius;
    }
  };
  var BoxShape = class {
    constructor(width = 1, height = 1, depth = 1) {
      assertPositive2("BoxShape width", width);
      assertPositive2("BoxShape height", height);
      assertPositive2("BoxShape depth", depth);
      this.size = new Vector3(width, height, depth);
      this.halfExtents = new Vector3(width / 2, height / 2, depth / 2);
      this.kind = KIND_BOX;
    }
    /** Principal moments of a solid cuboid: m/12 (b² + c²) about each axis. */
    computeInertia(mass, out) {
      const { x: w, y: h, z: d } = this.size;
      const k = mass / 12;
      return out.set(k * (h * h + d * d), k * (w * w + d * d), k * (w * w + h * h));
    }
    get minExtent() {
      return Math.min(this.halfExtents.x, this.halfExtents.y, this.halfExtents.z);
    }
  };
  var CapsuleShape = class {
    constructor(radius = 0.5, height = 1) {
      assertPositive2("CapsuleShape radius", radius);
      if (!(height >= 0) || !Number.isFinite(height)) {
        throw new RangeError(`Prism.js: CapsuleShape height must be a finite number >= 0, received ${String(height)}.`);
      }
      this.radius = radius;
      this.height = height;
      this.halfHeight = height / 2;
      this.kind = KIND_CAPSULE;
    }
    /** Solid cylinder + two hemispheres (parallel-axis theorem for the caps). Axis is local Y. */
    computeInertia(mass, out) {
      const r = this.radius, h = this.height;
      const cylinder = Math.PI * r * r * h, sphere = 4 / 3 * Math.PI * r ** 3;
      const mc = mass * cylinder / (cylinder + sphere), ms = mass - mc;
      const axial = mc * r * r / 2 + ms * 0.4 * r * r;
      const lateral = mc * (r * r / 4 + h * h / 12) + ms * (0.4 * r * r + h * h / 4 + 3 * h * r / 8);
      return out.set(lateral, axial, lateral);
    }
    get minExtent() {
      return this.radius;
    }
  };
  var PlaneShape = class {
    constructor(normal = new Vector3(0, 1, 0), constant = 0) {
      const n = new Vector3().copy(normal);
      if (n.lengthSq() === 0) throw new RangeError("Prism.js: PlaneShape normal must not be the zero vector.");
      this.normal = n.normalize();
      this.constant = constant;
      this.kind = KIND_PLANE;
    }
    computeInertia(mass, out) {
      return out.set(0, 0, 0);
    }
  };

  // src/physics/RigidBody.js
  var _nextId5 = 1;
  var _inertia = new Vector3();
  function rotationFromQuaternion(q, out) {
    const x = q.x, y = q.y, z = q.z, w = q.w;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy - wz;
    out[2] = xz + wy;
    out[3] = xy + wz;
    out[4] = 1 - (xx + zz);
    out[5] = yz - wx;
    out[6] = xz - wy;
    out[7] = yz + wx;
    out[8] = 1 - (xx + yy);
    return out;
  }
  var RigidBody = class {
    /**
     * @param {object} options
     * @param {SphereShape|BoxShape|PlaneShape} options.shape
     * @param {number} [options.mass=1]
     * @param {Vector3} [options.position]
     * @param {Quaternion} [options.quaternion]
     * @param {Vector3} [options.velocity]
     * @param {Vector3} [options.angularVelocity] radians per second, world axes
     * @param {number} [options.restitution=0.3] 0 = no bounce, 1 = perfectly elastic
     * @param {number} [options.friction=0.5] Coulomb coefficient
     * @param {number} [options.rollingFriction=0] rolling resistance length; 0.01-0.05 lets balls come to rest
     * @param {number} [options.linearDamping=0.01] fraction of speed lost per second
     * @param {number} [options.angularDamping=0.01]
     * @param {number} [options.gravityScale=1]
     * @param {boolean} [options.ccd=false] sweep along the path when moving faster than its own size per step
     * @param {boolean} [options.allowSleep=true]
     * @param {number} [options.collisionGroup=1] bit(s) this body belongs to
     * @param {number} [options.collisionMask=0xffff] groups this body collides with
     * @param {import('../core/Object3D.js').Object3D} [options.object] mesh kept in sync by the world
     */
    constructor(options = {}) {
      const {
        shape,
        mass = 1,
        position,
        quaternion,
        velocity,
        angularVelocity,
        restitution = 0.3,
        friction = 0.5,
        rollingFriction = 0,
        linearDamping = 0.01,
        angularDamping = 0.01,
        gravityScale = 1,
        ccd = false,
        allowSleep = true,
        collisionGroup = 1,
        collisionMask = 65535,
        object = null,
        userData = {}
      } = options;
      if (!shape || typeof shape.computeInertia !== "function") {
        throw new TypeError("Prism.js: RigidBody requires a `shape` (SphereShape, BoxShape or PlaneShape).");
      }
      for (const [name, value] of Object.entries({ restitution, friction, rollingFriction, linearDamping, angularDamping })) {
        if (!(value >= 0) || !Number.isFinite(value)) {
          throw new RangeError(`Prism.js: RigidBody ${name} must be a finite number >= 0, received ${String(value)}.`);
        }
      }
      if (linearDamping > 1 || angularDamping > 1) throw new RangeError("Prism.js: damping is a fraction per second and must be <= 1.");
      this.id = _nextId5++;
      this.shape = shape;
      this.position = position ? new Vector3().copy(position) : new Vector3();
      this.quaternion = quaternion ? new Quaternion().copy(quaternion).normalize() : new Quaternion();
      this.velocity = velocity ? new Vector3().copy(velocity) : new Vector3();
      this.angularVelocity = angularVelocity ? new Vector3().copy(angularVelocity) : new Vector3();
      this.force = new Vector3();
      this.torque = new Vector3();
      this.restitution = restitution;
      this.friction = friction;
      this.rollingFriction = rollingFriction;
      this.linearDamping = linearDamping;
      this.angularDamping = angularDamping;
      this.gravityScale = gravityScale;
      this.allowSleep = allowSleep;
      this.ccd = ccd;
      this._ccdFraction = 1;
      this.collisionGroup = collisionGroup;
      this.collisionMask = collisionMask;
      this.object = object;
      this.userData = userData;
      this.sleeping = false;
      this.sleepTimer = 0;
      this._moverTick = -1;
      this._index = -1;
      this.mass = 0;
      this.invMass = 0;
      this.invInertiaLocal = new Vector3();
      this.invInertiaWorld = new Float64Array(9);
      this.rotation = new Float64Array(9);
      this._rotationKey = new Float64Array(4).fill(NaN);
      this._pv = new Vector3();
      this._pw = new Vector3();
      this._im = 0;
      this._ii = this.invInertiaWorld;
      this.setMass(mass);
      this.updateRotation();
    }
    get isDynamic() {
      return this.invMass > 0;
    }
    setMass(mass) {
      if (!(mass >= 0) || !Number.isFinite(mass)) {
        throw new RangeError(`Prism.js: RigidBody mass must be a finite number >= 0, received ${String(mass)}.`);
      }
      if (this.shape.kind === KIND_PLANE && mass !== 0) {
        throw new RangeError("Prism.js: A body with a PlaneShape must be static (mass 0).");
      }
      this.mass = mass;
      this.invMass = mass > 0 ? 1 / mass : 0;
      if (mass > 0) {
        this.shape.computeInertia(mass, _inertia);
        this.invInertiaLocal.set(1 / _inertia.x, 1 / _inertia.y, 1 / _inertia.z);
      } else {
        this.invInertiaLocal.set(0, 0, 0);
      }
      this.updateRotation(true);
      return this;
    }
    /**
     * Recomputes the rotation matrix and the world-space inverse inertia tensor from `quaternion`.
     * Skipped when the quaternion has not changed since the last call (pass `force` after changing mass).
     */
    updateRotation(force = false) {
      const q = this.quaternion, key = this._rotationKey;
      if (!force && key[0] === q.x && key[1] === q.y && key[2] === q.z && key[3] === q.w) return;
      key[0] = q.x;
      key[1] = q.y;
      key[2] = q.z;
      key[3] = q.w;
      const R = rotationFromQuaternion(q, this.rotation);
      const d = this.invInertiaLocal, I = this.invInertiaWorld;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          I[i * 3 + j] = R[i * 3] * d.x * R[j * 3] + R[i * 3 + 1] * d.y * R[j * 3 + 1] + R[i * 3 + 2] * d.z * R[j * 3 + 2];
        }
      }
    }
    wakeUp() {
      this.sleeping = false;
      this.sleepTimer = 0;
      return this;
    }
    /** Adds a force (newtons) for the next step; with a world-space `point` it also adds the torque. */
    applyForce(force, point) {
      if (this.invMass === 0) return this;
      this.wakeUp();
      this.force.add(force);
      if (point) {
        this.torque.x += (point.y - this.position.y) * force.z - (point.z - this.position.z) * force.y;
        this.torque.y += (point.z - this.position.z) * force.x - (point.x - this.position.x) * force.z;
        this.torque.z += (point.x - this.position.x) * force.y - (point.y - this.position.y) * force.x;
      }
      return this;
    }
    /** Adds a torque (newton-meters, world axes) for the next step. */
    applyTorque(torque) {
      if (this.invMass === 0) return this;
      this.wakeUp();
      this.torque.add(torque);
      return this;
    }
    /** Instantly changes the velocity: dv = J / m, and with a world-space `point` also dω = I⁻¹ (r × J). */
    applyImpulse(impulse, point) {
      if (this.invMass === 0) return this;
      this.wakeUp();
      this.velocity.addScaledVector(impulse, this.invMass);
      if (point) {
        const rx = point.x - this.position.x, ry = point.y - this.position.y, rz = point.z - this.position.z;
        const tx = ry * impulse.z - rz * impulse.y, ty = rz * impulse.x - rx * impulse.z, tz = rx * impulse.y - ry * impulse.x;
        const I = this.invInertiaWorld;
        this.angularVelocity.x += I[0] * tx + I[1] * ty + I[2] * tz;
        this.angularVelocity.y += I[3] * tx + I[4] * ty + I[5] * tz;
        this.angularVelocity.z += I[6] * tx + I[7] * ty + I[8] * tz;
      }
      return this;
    }
    /** Velocity of the material point of this body that is currently at world position `point`. */
    getVelocityAtPoint(point, target = new Vector3()) {
      const rx = point.x - this.position.x, ry = point.y - this.position.y, rz = point.z - this.position.z;
      const w = this.angularVelocity;
      return target.set(
        this.velocity.x + w.y * rz - w.z * ry,
        this.velocity.y + w.z * rx - w.x * rz,
        this.velocity.z + w.x * ry - w.y * rx
      );
    }
    /** Kinetic energy: translational + rotational (computed with the world inertia tensor). */
    get kineticEnergy() {
      if (this.invMass === 0) return 0;
      const v = this.velocity, w = this.angularVelocity;
      const R = this.rotation, d = this.invInertiaLocal;
      const lx = R[0] * w.x + R[3] * w.y + R[6] * w.z;
      const ly = R[1] * w.x + R[4] * w.y + R[7] * w.z;
      const lz = R[2] * w.x + R[5] * w.y + R[8] * w.z;
      return 0.5 * this.mass * v.lengthSq() + 0.5 * (lx * lx / d.x + ly * ly / d.y + lz * lz / d.z);
    }
  };
  RigidBody.prototype.isRigidBody = true;

  // src/physics/collision.js
  var Contact = class {
    constructor() {
      this.a = null;
      this.b = null;
      this.px = 0;
      this.py = 0;
      this.pz = 0;
      this.nx = 0;
      this.ny = 0;
      this.nz = 0;
      this.depth = 0;
      this.rax = 0;
      this.ray = 0;
      this.raz = 0;
      this.rbx = 0;
      this.rby = 0;
      this.rbz = 0;
      this.t1x = 0;
      this.t1y = 0;
      this.t1z = 0;
      this.t2x = 0;
      this.t2y = 0;
      this.t2z = 0;
      this.invKN = 0;
      this.invKT1 = 0;
      this.invKT2 = 0;
      this.target = 0;
      this.mu = 0;
      this.bias = 0;
      this.accP = 0;
      this.accN = 0;
      this.accT1 = 0;
      this.accT2 = 0;
      this.invKS = 0;
      this.accS = 0;
      this.rollMu = 0;
      this.invKR1 = 0;
      this.invKR2 = 0;
      this.accR1 = 0;
      this.accR2 = 0;
      this.normalImpulse = 0;
    }
  };
  var ContactList = class {
    constructor() {
      this.items = [];
      this.count = 0;
    }
    reset() {
      this.count = 0;
    }
    add(a, b, px, py, pz, nx, ny, nz, depth) {
      let c = this.items[this.count];
      if (c === void 0) c = this.items[this.count] = new Contact();
      this.count++;
      c.a = a;
      c.b = b;
      c.px = px;
      c.py = py;
      c.pz = pz;
      c.nx = nx;
      c.ny = ny;
      c.nz = nz;
      c.depth = depth;
      return c;
    }
  };
  function computeAABB(body, out) {
    const p = body.position;
    let ex, ey, ez;
    if (body.shape.kind === KIND_SPHERE) {
      ex = ey = ez = body.shape.radius;
    } else if (body.shape.kind === KIND_CAPSULE) {
      const R = body.rotation, h = body.shape.halfHeight, r = body.shape.radius;
      ex = Math.abs(R[1]) * h + r;
      ey = Math.abs(R[4]) * h + r;
      ez = Math.abs(R[7]) * h + r;
    } else {
      const R = body.rotation, h = body.shape.halfExtents;
      ex = Math.abs(R[0]) * h.x + Math.abs(R[1]) * h.y + Math.abs(R[2]) * h.z;
      ey = Math.abs(R[3]) * h.x + Math.abs(R[4]) * h.y + Math.abs(R[5]) * h.z;
      ez = Math.abs(R[6]) * h.x + Math.abs(R[7]) * h.y + Math.abs(R[8]) * h.z;
    }
    out[0] = p.x - ex;
    out[1] = p.y - ey;
    out[2] = p.z - ez;
    out[3] = p.x + ex;
    out[4] = p.y + ey;
    out[5] = p.z + ez;
  }
  var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  function worldPlane(body, out) {
    const R = body.rotation, n = body.shape.normal, p = body.position;
    out[0] = R[0] * n.x + R[1] * n.y + R[2] * n.z;
    out[1] = R[3] * n.x + R[4] * n.y + R[5] * n.z;
    out[2] = R[6] * n.x + R[7] * n.y + R[8] * n.z;
    out[3] = body.shape.constant + out[0] * p.x + out[1] * p.y + out[2] * p.z;
    return out;
  }
  var _plane = new Float64Array(4);
  function planeSphere(plane, sphere, list) {
    const pl = worldPlane(plane, _plane), r = sphere.shape.radius, c = sphere.position;
    const dist = pl[0] * c.x + pl[1] * c.y + pl[2] * c.z - pl[3];
    const depth = r - dist;
    if (depth <= 0) return;
    const k = r - depth * 0.5;
    list.add(plane, sphere, c.x - pl[0] * k, c.y - pl[1] * k, c.z - pl[2] * k, pl[0], pl[1], pl[2], depth);
  }
  function planeBox(plane, box, list) {
    const pl = worldPlane(plane, _plane), R = box.rotation, h = box.shape.halfExtents, p = box.position;
    for (let sx = -1; sx <= 1; sx += 2) {
      for (let sy = -1; sy <= 1; sy += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          const lx = sx * h.x, ly = sy * h.y, lz = sz * h.z;
          const x = p.x + R[0] * lx + R[1] * ly + R[2] * lz;
          const y = p.y + R[3] * lx + R[4] * ly + R[5] * lz;
          const z = p.z + R[6] * lx + R[7] * ly + R[8] * lz;
          const dist = pl[0] * x + pl[1] * y + pl[2] * z - pl[3];
          if (dist < 0) {
            const half = -dist * 0.5;
            list.add(plane, box, x + pl[0] * half, y + pl[1] * half, z + pl[2] * half, pl[0], pl[1], pl[2], -dist);
          }
        }
      }
    }
  }
  function sphereSphere(a, b, list) {
    const dx = b.position.x - a.position.x, dy = b.position.y - a.position.y, dz = b.position.z - a.position.z;
    const ra = a.shape.radius, rb = b.shape.radius, sum = ra + rb;
    const d2 = dx * dx + dy * dy + dz * dz;
    if (d2 >= sum * sum) return;
    const dist = Math.sqrt(d2);
    let nx = 0, ny = 1, nz = 0;
    if (dist > 1e-9) {
      nx = dx / dist;
      ny = dy / dist;
      nz = dz / dist;
    }
    const depth = sum - dist;
    const k = ra - depth * 0.5;
    list.add(a, b, a.position.x + nx * k, a.position.y + ny * k, a.position.z + nz * k, nx, ny, nz, depth);
  }
  function boxSphere(box, sphere, list) {
    sphereVsBox(box, sphere, sphere.position.x, sphere.position.y, sphere.position.z, sphere.shape.radius, list);
  }
  function sphereVsBox(box, other, x, y, z, r, list) {
    const R = box.rotation, h = box.shape.halfExtents;
    const rx = x - box.position.x, ry = y - box.position.y, rz = z - box.position.z;
    const lx = R[0] * rx + R[3] * ry + R[6] * rz;
    const ly = R[1] * rx + R[4] * ry + R[7] * rz;
    const lz = R[2] * rx + R[5] * ry + R[8] * rz;
    const cx = Math.max(-h.x, Math.min(h.x, lx));
    const cy = Math.max(-h.y, Math.min(h.y, ly));
    const cz = Math.max(-h.z, Math.min(h.z, lz));
    const dx = lx - cx, dy = ly - cy, dz = lz - cz;
    const d2 = dx * dx + dy * dy + dz * dz;
    let nx, ny, nz, depth, qx, qy, qz;
    if (d2 > 1e-18) {
      if (d2 >= r * r) return;
      const dist = Math.sqrt(d2);
      nx = dx / dist;
      ny = dy / dist;
      nz = dz / dist;
      depth = r - dist;
      qx = cx + nx * depth * 0.5;
      qy = cy + ny * depth * 0.5;
      qz = cz + nz * depth * 0.5;
    } else {
      const gx = h.x - Math.abs(lx), gy = h.y - Math.abs(ly), gz = h.z - Math.abs(lz);
      nx = ny = nz = 0;
      if (gx <= gy && gx <= gz) {
        nx = lx < 0 ? -1 : 1;
        depth = r + gx;
        qx = nx * h.x;
        qy = ly;
        qz = lz;
      } else if (gy <= gz) {
        ny = ly < 0 ? -1 : 1;
        depth = r + gy;
        qx = lx;
        qy = ny * h.y;
        qz = lz;
      } else {
        nz = lz < 0 ? -1 : 1;
        depth = r + gz;
        qx = lx;
        qy = ly;
        qz = nz * h.z;
      }
    }
    list.add(
      box,
      other,
      box.position.x + R[0] * qx + R[1] * qy + R[2] * qz,
      box.position.y + R[3] * qx + R[4] * qy + R[5] * qz,
      box.position.z + R[6] * qx + R[7] * qy + R[8] * qz,
      R[0] * nx + R[1] * ny + R[2] * nz,
      R[3] * nx + R[4] * ny + R[5] * nz,
      R[6] * nx + R[7] * ny + R[8] * nz,
      depth
    );
  }
  var _seg = new Float64Array(6);
  var _seg2 = new Float64Array(6);
  function capsuleSegment(body, out) {
    const R = body.rotation, h = body.shape.halfHeight, p = body.position;
    const ax = R[1] * h, ay = R[4] * h, az = R[7] * h;
    out[0] = p.x - ax;
    out[1] = p.y - ay;
    out[2] = p.z - az;
    out[3] = p.x + ax;
    out[4] = p.y + ay;
    out[5] = p.z + az;
    return out;
  }
  function closestOnSegment(seg, x, y, z) {
    const dx = seg[3] - seg[0], dy = seg[4] - seg[1], dz = seg[5] - seg[2];
    const len2 = dx * dx + dy * dy + dz * dz;
    if (len2 === 0) return 0;
    return Math.max(0, Math.min(1, ((x - seg[0]) * dx + (y - seg[1]) * dy + (z - seg[2]) * dz) / len2));
  }
  function ballBall(ba, bb, ax, ay, az, ra, bx, by, bz, rb, list, fallback) {
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const sum = ra + rb, d2 = dx * dx + dy * dy + dz * dz;
    if (d2 >= sum * sum) return;
    const dist = Math.sqrt(d2);
    let nx, ny, nz;
    if (dist > 1e-9) {
      nx = dx / dist;
      ny = dy / dist;
      nz = dz / dist;
    } else {
      nx = fallback[0];
      ny = fallback[1];
      nz = fallback[2];
    }
    const depth = sum - dist, k = ra - depth * 0.5;
    list.add(ba, bb, ax + nx * k, ay + ny * k, az + nz * k, nx, ny, nz, depth);
  }
  var _perp = new Float64Array(3);
  function perpendicularTo(R, out) {
    const ax = R[1], ay = R[4], az = R[7];
    if (Math.abs(ax) < 0.9) {
      out[0] = 0;
      out[1] = az;
      out[2] = -ay;
    } else {
      out[0] = -az;
      out[1] = 0;
      out[2] = ax;
    }
    const l = Math.hypot(out[0], out[1], out[2]);
    out[0] /= l;
    out[1] /= l;
    out[2] /= l;
    return out;
  }
  function planeCapsule(plane, cap, list) {
    const pl = worldPlane(plane, _plane), r = cap.shape.radius;
    const seg = capsuleSegment(cap, _seg);
    for (let e = 0; e < 2; e++) {
      const x = seg[e * 3], y = seg[e * 3 + 1], z = seg[e * 3 + 2];
      const depth = r - (pl[0] * x + pl[1] * y + pl[2] * z - pl[3]);
      if (depth > 0) {
        const k = r - depth * 0.5;
        list.add(plane, cap, x - pl[0] * k, y - pl[1] * k, z - pl[2] * k, pl[0], pl[1], pl[2], depth);
      }
    }
  }
  function capsuleSphere(cap, sphere, list) {
    const seg = capsuleSegment(cap, _seg), c = sphere.position;
    const t = closestOnSegment(seg, c.x, c.y, c.z);
    const qx = seg[0] + (seg[3] - seg[0]) * t, qy = seg[1] + (seg[4] - seg[1]) * t, qz = seg[2] + (seg[5] - seg[2]) * t;
    ballBall(cap, sphere, qx, qy, qz, cap.shape.radius, c.x, c.y, c.z, sphere.shape.radius, list, perpendicularTo(cap.rotation, _perp));
  }
  function capsuleCapsule(a, b, list) {
    const s1 = capsuleSegment(a, _seg), s2 = capsuleSegment(b, _seg2);
    const ra = a.shape.radius, rb = b.shape.radius;
    const d1x = s1[3] - s1[0], d1y = s1[4] - s1[1], d1z = s1[5] - s1[2];
    const d2x = s2[3] - s2[0], d2y = s2[4] - s2[1], d2z = s2[5] - s2[2];
    const rx = s1[0] - s2[0], ry = s1[1] - s2[1], rz = s1[2] - s2[2];
    const A = d1x * d1x + d1y * d1y + d1z * d1z, E = d2x * d2x + d2y * d2y + d2z * d2z;
    const fallback = perpendicularTo(a.rotation, _perp);
    if (A < 1e-18 || E < 1e-18) {
      const ta = closestOnSegment(s1, s2[0], s2[1], s2[2]), tb = closestOnSegment(s2, s1[0], s1[1], s1[2]);
      ballBall(a, b, s1[0] + d1x * ta, s1[1] + d1y * ta, s1[2] + d1z * ta, ra, s2[0] + d2x * tb, s2[1] + d2y * tb, s2[2] + d2z * tb, rb, list, fallback);
      return;
    }
    const B = d1x * d2x + d1y * d2y + d1z * d2z, C = d1x * rx + d1y * ry + d1z * rz, F = d2x * rx + d2y * ry + d2z * rz;
    const denom = A * E - B * B;
    const clamp01 = (v) => Math.max(0, Math.min(1, v));
    if (denom <= 1e-6 * A * E) {
      const len = Math.sqrt(A), ux = d1x / len, uy = d1y / len, uz = d1z / len;
      const b0 = ((s2[0] - s1[0]) * ux + (s2[1] - s1[1]) * uy + (s2[2] - s1[2]) * uz) / len;
      const b1 = ((s2[3] - s1[0]) * ux + (s2[4] - s1[1]) * uy + (s2[5] - s1[2]) * uz) / len;
      const lo = Math.max(0, Math.min(b0, b1)), hi = Math.min(1, Math.max(b0, b1));
      if (lo <= hi) {
        for (const s3 of lo === hi ? [lo] : [lo, hi]) {
          const px = s1[0] + d1x * s3, py = s1[1] + d1y * s3, pz = s1[2] + d1z * s3;
          const t2 = closestOnSegment(s2, px, py, pz);
          ballBall(a, b, px, py, pz, ra, s2[0] + d2x * t2, s2[1] + d2y * t2, s2[2] + d2z * t2, rb, list, fallback);
        }
        return;
      }
    }
    let s = denom > 1e-12 ? clamp01((B * F - C * E) / denom) : 0;
    let t = (B * s + F) / E;
    if (t < 0) {
      t = 0;
      s = clamp01(-C / A);
    } else if (t > 1) {
      t = 1;
      s = clamp01((B - C) / A);
    }
    ballBall(a, b, s1[0] + d1x * s, s1[1] + d1y * s, s1[2] + d1z * s, ra, s2[0] + d2x * t, s2[1] + d2y * t, s2[2] + d2z * t, rb, list, fallback);
  }
  function distanceToBox(box, x, y, z) {
    const R = box.rotation, h = box.shape.halfExtents;
    const rx = x - box.position.x, ry = y - box.position.y, rz = z - box.position.z;
    const lx = R[0] * rx + R[3] * ry + R[6] * rz, ly = R[1] * rx + R[4] * ry + R[7] * rz, lz = R[2] * rx + R[5] * ry + R[8] * rz;
    const dx = Math.max(Math.abs(lx) - h.x, 0), dy = Math.max(Math.abs(ly) - h.y, 0), dz = Math.max(Math.abs(lz) - h.z, 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  function boxCapsule(box, cap, list) {
    const seg = capsuleSegment(cap, _seg), r = cap.shape.radius;
    const px = (t) => seg[0] + (seg[3] - seg[0]) * t, py = (t) => seg[1] + (seg[4] - seg[1]) * t, pz = (t) => seg[2] + (seg[5] - seg[2]) * t;
    let lo = 0, hi = 1;
    for (let i = 0; i < 40; i++) {
      const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
      if (distanceToBox(box, px(m1), py(m1), pz(m1)) < distanceToBox(box, px(m2), py(m2), pz(m2))) hi = m2;
      else lo = m1;
    }
    const tMin = (lo + hi) / 2;
    sphereVsBox(box, cap, seg[0], seg[1], seg[2], r, list);
    sphereVsBox(box, cap, seg[3], seg[4], seg[5], r, list);
    if (tMin > 0.02 && tMin < 0.98) sphereVsBox(box, cap, px(tMin), py(tMin), pz(tMin), r, list);
  }
  var AX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
  var BX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
  var _L = new Float64Array(3);
  var _ha = new Float64Array(3);
  var _hb = new Float64Array(3);
  var _delta = new Float64Array(3);
  var _edgeAxis = new Float64Array(3);
  var _nRef = new Float64Array(3);
  var _refCenter = new Float64Array(3);
  var _ic = new Float64Array(3);
  var POLY_CAPACITY = 16;
  var _polyA = new Float64Array(POLY_CAPACITY * 3);
  var _polyB = new Float64Array(POLY_CAPACITY * 3);
  var _e = { c1: new Float64Array(3), c2: new Float64Array(3), n: new Float64Array(3), r: new Float64Array(3) };
  function loadAxes(R, out) {
    for (let i = 0; i < 3; i++) {
      out[i][0] = R[i];
      out[i][1] = R[3 + i];
      out[i][2] = R[6 + i];
    }
  }
  function clipPolygon(src, n, dst, center, nx, ny, nz, h) {
    let count = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const p0 = src[i * 3], p1 = src[i * 3 + 1], p2 = src[i * 3 + 2];
      const q0 = src[j * 3], q1 = src[j * 3 + 1], q2 = src[j * 3 + 2];
      const dp = (p0 - center[0]) * nx + (p1 - center[1]) * ny + (p2 - center[2]) * nz - h;
      const dq = (q0 - center[0]) * nx + (q1 - center[1]) * ny + (q2 - center[2]) * nz - h;
      if (dp <= 0) {
        dst[count * 3] = p0;
        dst[count * 3 + 1] = p1;
        dst[count * 3 + 2] = p2;
        count++;
      }
      if (dp < 0 && dq > 0 || dp > 0 && dq < 0) {
        const t = dp / (dp - dq);
        dst[count * 3] = p0 + (q0 - p0) * t;
        dst[count * 3 + 1] = p1 + (q1 - p1) * t;
        dst[count * 3 + 2] = p2 + (q2 - p2) * t;
        count++;
      }
    }
    return count;
  }
  function boxBox(A, B, list) {
    const ha = _ha, hb = _hb, delta = _delta;
    ha[0] = A.shape.halfExtents.x;
    ha[1] = A.shape.halfExtents.y;
    ha[2] = A.shape.halfExtents.z;
    hb[0] = B.shape.halfExtents.x;
    hb[1] = B.shape.halfExtents.y;
    hb[2] = B.shape.halfExtents.z;
    loadAxes(A.rotation, AX);
    loadAxes(B.rotation, BX);
    delta[0] = B.position.x - A.position.x;
    delta[1] = B.position.y - A.position.y;
    delta[2] = B.position.z - A.position.z;
    let sepA = -Infinity, iA = 0, signA = 1;
    let sepB = -Infinity, jB = 0, signB = 1;
    let sepE = -Infinity, eI = 0, eJ = 0;
    const edgeAxis = _edgeAxis;
    for (let i = 0; i < 3; i++) {
      const d = dot(delta, AX[i]);
      let rb = 0;
      for (let j = 0; j < 3; j++) rb += hb[j] * Math.abs(dot(AX[i], BX[j]));
      const sep = Math.abs(d) - (ha[i] + rb);
      if (sep > 0) return;
      if (sep > sepA) {
        sepA = sep;
        iA = i;
        signA = d < 0 ? -1 : 1;
      }
    }
    for (let j = 0; j < 3; j++) {
      const d = dot(delta, BX[j]);
      let ra = 0;
      for (let i = 0; i < 3; i++) ra += ha[i] * Math.abs(dot(BX[j], AX[i]));
      const sep = Math.abs(d) - (hb[j] + ra);
      if (sep > 0) return;
      if (sep > sepB) {
        sepB = sep;
        jB = j;
        signB = d < 0 ? -1 : 1;
      }
    }
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const a = AX[i], b = BX[j];
        _L[0] = a[1] * b[2] - a[2] * b[1];
        _L[1] = a[2] * b[0] - a[0] * b[2];
        _L[2] = a[0] * b[1] - a[1] * b[0];
        const len = Math.hypot(_L[0], _L[1], _L[2]);
        if (len < 1e-6) continue;
        _L[0] /= len;
        _L[1] /= len;
        _L[2] /= len;
        let ra = 0, rb = 0;
        for (let k2 = 0; k2 < 3; k2++) {
          ra += ha[k2] * Math.abs(dot(AX[k2], _L));
          rb += hb[k2] * Math.abs(dot(BX[k2], _L));
        }
        const sep = Math.abs(dot(delta, _L)) - (ra + rb);
        if (sep > 0) return;
        if (sep > sepE) {
          sepE = sep;
          eI = i;
          eJ = j;
          edgeAxis[0] = _L[0];
          edgeAxis[1] = _L[1];
          edgeAxis[2] = _L[2];
        }
      }
    }
    const faceBest = Math.max(sepA, sepB);
    if (sepE > faceBest * 0.95 + 0.01) {
      edgeContact(A, B, ha, hb, delta, edgeAxis, eI, eJ, -sepE, list);
      return;
    }
    const nRef = _nRef;
    let ref, inc, refAxes, incAxes, refHalf, incHalf, axisIndex;
    if (sepB > sepA * 0.95 + 0.01) {
      ref = B;
      inc = A;
      refAxes = BX;
      incAxes = AX;
      refHalf = hb;
      incHalf = ha;
      axisIndex = jB;
      const sg = -signB;
      nRef[0] = BX[jB][0] * sg;
      nRef[1] = BX[jB][1] * sg;
      nRef[2] = BX[jB][2] * sg;
    } else {
      ref = A;
      inc = B;
      refAxes = AX;
      incAxes = BX;
      refHalf = ha;
      incHalf = hb;
      axisIndex = iA;
      nRef[0] = AX[iA][0] * signA;
      nRef[1] = AX[iA][1] * signA;
      nRef[2] = AX[iA][2] * signA;
    }
    const nx = ref === A ? nRef[0] : -nRef[0], ny = ref === A ? nRef[1] : -nRef[1], nz = ref === A ? nRef[2] : -nRef[2];
    const u = (axisIndex + 1) % 3, v = (axisIndex + 2) % 3;
    const rp = ref.position, rc = _refCenter;
    rc[0] = rp.x + nRef[0] * refHalf[axisIndex];
    rc[1] = rp.y + nRef[1] * refHalf[axisIndex];
    rc[2] = rp.z + nRef[2] * refHalf[axisIndex];
    let k = 0, best = 0;
    for (let m = 0; m < 3; m++) {
      const d = dot(incAxes[m], nRef);
      if (Math.abs(d) > Math.abs(best)) {
        best = d;
        k = m;
      }
    }
    const sgn = best > 0 ? -1 : 1;
    const ip = inc.position, ic = _ic;
    ic[0] = ip.x + incAxes[k][0] * sgn * incHalf[k];
    ic[1] = ip.y + incAxes[k][1] * sgn * incHalf[k];
    ic[2] = ip.z + incAxes[k][2] * sgn * incHalf[k];
    const p = (k + 1) % 3, q = (k + 2) % 3;
    let src = _polyA, dst = _polyB, count = 0;
    for (let c = 0; c < 4; c++) {
      const sp = c < 2 ? 1 : -1, sq = c === 0 || c === 3 ? 1 : -1;
      src[count * 3] = ic[0] + incAxes[p][0] * sp * incHalf[p] + incAxes[q][0] * sq * incHalf[q];
      src[count * 3 + 1] = ic[1] + incAxes[p][1] * sp * incHalf[p] + incAxes[q][1] * sq * incHalf[q];
      src[count * 3 + 2] = ic[2] + incAxes[p][2] * sp * incHalf[p] + incAxes[q][2] * sq * incHalf[q];
      count++;
    }
    const un = refAxes[u], vn = refAxes[v];
    let t;
    count = clipPolygon(src, count, dst, rc, un[0], un[1], un[2], refHalf[u]);
    t = src;
    src = dst;
    dst = t;
    count = clipPolygon(src, count, dst, rc, -un[0], -un[1], -un[2], refHalf[u]);
    t = src;
    src = dst;
    dst = t;
    count = clipPolygon(src, count, dst, rc, vn[0], vn[1], vn[2], refHalf[v]);
    t = src;
    src = dst;
    dst = t;
    count = clipPolygon(src, count, dst, rc, -vn[0], -vn[1], -vn[2], refHalf[v]);
    t = src;
    src = dst;
    dst = t;
    for (let i = 0; i < count; i++) {
      const x = src[i * 3], y = src[i * 3 + 1], z = src[i * 3 + 2];
      const sep = (x - rc[0]) * nRef[0] + (y - rc[1]) * nRef[1] + (z - rc[2]) * nRef[2];
      if (sep > 0) continue;
      const depth = -sep;
      list.add(A, B, x + nRef[0] * depth * 0.5, y + nRef[1] * depth * 0.5, z + nRef[2] * depth * 0.5, nx, ny, nz, depth);
    }
  }
  function edgeContact(A, B, ha, hb, delta, axis, i, j, depth, list) {
    const flip = dot(axis, delta) < 0 ? -1 : 1;
    const n = _e.n, c1 = _e.c1, c2 = _e.c2, r = _e.r;
    n[0] = axis[0] * flip;
    n[1] = axis[1] * flip;
    n[2] = axis[2] * flip;
    c1[0] = A.position.x;
    c1[1] = A.position.y;
    c1[2] = A.position.z;
    c2[0] = B.position.x;
    c2[1] = B.position.y;
    c2[2] = B.position.z;
    for (let m = 0; m < 3; m++) {
      if (m !== i) {
        const s2 = dot(AX[m], n) > 0 ? 1 : -1;
        for (let c3 = 0; c3 < 3; c3++) c1[c3] += AX[m][c3] * s2 * ha[m];
      }
      if (m !== j) {
        const s2 = dot(BX[m], n) > 0 ? -1 : 1;
        for (let c3 = 0; c3 < 3; c3++) c2[c3] += BX[m][c3] * s2 * hb[m];
      }
    }
    const d1 = AX[i], d2 = BX[j];
    r[0] = c1[0] - c2[0];
    r[1] = c1[1] - c2[1];
    r[2] = c1[2] - c2[2];
    const b = dot(d1, d2), c = dot(d1, r), f = dot(d2, r);
    const denom = 1 - b * b;
    let s = 0, t = 0;
    if (denom > 1e-9) {
      t = (f - b * c) / denom;
      s = t * b - c;
    }
    s = Math.max(-ha[i], Math.min(ha[i], s));
    t = Math.max(-hb[j], Math.min(hb[j], t));
    const p10 = c1[0] + d1[0] * s, p11 = c1[1] + d1[1] * s, p12 = c1[2] + d1[2] * s;
    const p20 = c2[0] + d2[0] * t, p21 = c2[1] + d2[1] * t, p22 = c2[2] + d2[2] * t;
    list.add(A, B, (p10 + p20) * 0.5, (p11 + p21) * 0.5, (p12 + p22) * 0.5, n[0], n[1], n[2], depth);
  }
  function collide(a, b, list) {
    if (a.shape.kind > b.shape.kind) {
      const t = a;
      a = b;
      b = t;
    }
    const before = list.count;
    const ka = a.shape.kind, kb = b.shape.kind;
    if (ka === KIND_PLANE) {
      if (kb === KIND_BOX) planeBox(a, b, list);
      else if (kb === KIND_CAPSULE) planeCapsule(a, b, list);
      else if (kb === KIND_SPHERE) planeSphere(a, b, list);
    } else if (ka === KIND_BOX) {
      if (kb === KIND_BOX) boxBox(a, b, list);
      else if (kb === KIND_CAPSULE) boxCapsule(a, b, list);
      else boxSphere(a, b, list);
    } else if (ka === KIND_CAPSULE) {
      if (kb === KIND_CAPSULE) capsuleCapsule(a, b, list);
      else capsuleSphere(a, b, list);
    } else {
      sphereSphere(a, b, list);
    }
    return list.count - before;
  }
  function raycastBody(body, ox, oy, oz, dx, dy, dz, maxDistance, normalOut) {
    const kind = body.shape.kind;
    const p = body.position;
    if (kind === KIND_SPHERE) {
      const r = body.shape.radius;
      const ex = ox - p.x, ey = oy - p.y, ez = oz - p.z;
      const b = ex * dx + ey * dy + ez * dz;
      const c = ex * ex + ey * ey + ez * ez - r * r;
      if (c > 0 && b > 0) return -1;
      const disc = b * b - c;
      if (disc < 0) return -1;
      const t = -b - Math.sqrt(disc);
      if (t < 0 || t > maxDistance) return -1;
      normalOut[0] = (ex + dx * t) / r;
      normalOut[1] = (ey + dy * t) / r;
      normalOut[2] = (ez + dz * t) / r;
      return t;
    }
    if (kind === KIND_PLANE) {
      const pl = worldPlane(body, _plane);
      const side = pl[0] * ox + pl[1] * oy + pl[2] * oz - pl[3];
      const denom = pl[0] * dx + pl[1] * dy + pl[2] * dz;
      if (side < 0 || denom >= 0) return -1;
      const t = -side / denom;
      if (t > maxDistance) return -1;
      normalOut[0] = pl[0];
      normalOut[1] = pl[1];
      normalOut[2] = pl[2];
      return t;
    }
    if (kind === KIND_CAPSULE) return raycastCapsule(body, ox, oy, oz, dx, dy, dz, maxDistance, normalOut);
    const R = body.rotation, h = body.shape.halfExtents;
    const rx = ox - p.x, ry = oy - p.y, rz = oz - p.z;
    const lo = [R[0] * rx + R[3] * ry + R[6] * rz, R[1] * rx + R[4] * ry + R[7] * rz, R[2] * rx + R[5] * ry + R[8] * rz];
    const ld = [R[0] * dx + R[3] * dy + R[6] * dz, R[1] * dx + R[4] * dy + R[7] * dz, R[2] * dx + R[5] * dy + R[8] * dz];
    const half = [h.x, h.y, h.z];
    let tMin = -Infinity, tMax = Infinity, hitAxis = 0, hitSign = 1;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(ld[i]) < 1e-12) {
        if (Math.abs(lo[i]) > half[i]) return -1;
        continue;
      }
      let t1 = (-half[i] - lo[i]) / ld[i], t2 = (half[i] - lo[i]) / ld[i];
      let sign = -1;
      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        sign = 1;
      }
      if (t1 > tMin) {
        tMin = t1;
        hitAxis = i;
        hitSign = sign;
      }
      if (t2 < tMax) tMax = t2;
      if (tMin > tMax) return -1;
    }
    if (tMin < 0 || tMin > maxDistance) return -1;
    const nl = [0, 0, 0];
    nl[hitAxis] = hitSign;
    normalOut[0] = R[0] * nl[0] + R[1] * nl[1] + R[2] * nl[2];
    normalOut[1] = R[3] * nl[0] + R[4] * nl[1] + R[5] * nl[2];
    normalOut[2] = R[6] * nl[0] + R[7] * nl[1] + R[8] * nl[2];
    return tMin;
  }
  function raycastCapsule(body, ox, oy, oz, dx, dy, dz, maxDistance, normalOut) {
    const R = body.rotation, p = body.position, r = body.shape.radius, half = body.shape.halfHeight;
    const rx = ox - p.x, ry = oy - p.y, rz = oz - p.z;
    const lx = R[0] * rx + R[3] * ry + R[6] * rz, ly = R[1] * rx + R[4] * ry + R[7] * rz, lz = R[2] * rx + R[5] * ry + R[8] * rz;
    const vx = R[0] * dx + R[3] * dy + R[6] * dz, vy = R[1] * dx + R[4] * dy + R[7] * dz, vz = R[2] * dx + R[5] * dy + R[8] * dz;
    const cy = Math.max(-half, Math.min(half, ly));
    if (lx * lx + (ly - cy) * (ly - cy) + lz * lz < r * r) return -1;
    let best = Infinity, nxl = 0, nyl = 0, nzl = 0;
    const a = vx * vx + vz * vz;
    if (a > 1e-12) {
      const b = lx * vx + lz * vz, c = lx * lx + lz * lz - r * r, disc = b * b - a * c;
      if (disc >= 0) {
        const t = (-b - Math.sqrt(disc)) / a, y = ly + vy * t;
        if (t >= 0 && Math.abs(y) <= half && t < best) {
          best = t;
          nxl = (lx + vx * t) / r;
          nyl = 0;
          nzl = (lz + vz * t) / r;
        }
      }
    }
    for (const sy of [half, -half]) {
      const ex = lx, ey = ly - sy, ez = lz;
      const b = ex * vx + ey * vy + ez * vz, c = ex * ex + ey * ey + ez * ez - r * r, disc = b * b - c;
      if (disc < 0) continue;
      const t = -b - Math.sqrt(disc);
      const y = ly + vy * t;
      if (t >= 0 && t < best && (sy > 0 ? y >= half : y <= -half)) {
        best = t;
        nxl = (lx + vx * t) / r;
        nyl = (y - sy) / r;
        nzl = (lz + vz * t) / r;
      }
    }
    if (best > maxDistance || !Number.isFinite(best)) return -1;
    normalOut[0] = R[0] * nxl + R[1] * nyl + R[2] * nzl;
    normalOut[1] = R[3] * nxl + R[4] * nyl + R[5] * nzl;
    normalOut[2] = R[6] * nxl + R[7] * nyl + R[8] * nzl;
    return best;
  }

  // src/physics/PhysicsWorld.js
  var _sweepBox = new Float64Array(6);
  var ZERO_INERTIA = new Float64Array(9);
  var MANIFOLD_CAPACITY = 16;
  var Manifold = class {
    constructor() {
      this.stamp = -1;
      this.count = 0;
      this.px = new Float64Array(MANIFOLD_CAPACITY);
      this.py = new Float64Array(MANIFOLD_CAPACITY);
      this.pz = new Float64Array(MANIFOLD_CAPACITY);
      this.accN = new Float64Array(MANIFOLD_CAPACITY);
      this.fx = new Float64Array(MANIFOLD_CAPACITY);
      this.fy = new Float64Array(MANIFOLD_CAPACITY);
      this.fz = new Float64Array(MANIFOLD_CAPACITY);
      this.used = new Uint8Array(MANIFOLD_CAPACITY);
    }
  };
  var MAX_ANGULAR_SPEED = 200;
  var _normal = new Float64Array(3);
  var PhysicsWorld = class {
    /**
     * @param {object} [options]
     * @param {Vector3} [options.gravity] default (0, -9.81, 0)
     * @param {number} [options.fixedTimeStep=1/60] seconds per simulation step
     * @param {number} [options.maxSubSteps=5] most steps per step() call; extra time is dropped
     * @param {number} [options.solverIterations=20]
     * @param {boolean} [options.allowSleep=true]
     */
    constructor(options = {}) {
      const {
        gravity = new Vector3(0, -9.81, 0),
        fixedTimeStep = 1 / 60,
        maxSubSteps = 5,
        solverIterations = 20,
        allowSleep = true
      } = options;
      if (!(fixedTimeStep > 0)) throw new RangeError(`Prism.js: fixedTimeStep must be > 0, received ${String(fixedTimeStep)}.`);
      if (!Number.isInteger(maxSubSteps) || maxSubSteps < 1) throw new RangeError("Prism.js: maxSubSteps must be an integer >= 1.");
      if (!Number.isInteger(solverIterations) || solverIterations < 1) throw new RangeError("Prism.js: solverIterations must be an integer >= 1.");
      this.gravity = new Vector3().copy(gravity);
      this.fixedTimeStep = fixedTimeStep;
      this.maxSubSteps = maxSubSteps;
      this.solverIterations = solverIterations;
      this.allowSleep = allowSleep;
      this.baumgarte = 0.2;
      this.penetrationSlop = 5e-3;
      this.maxCorrectionSpeed = 3;
      this.restitutionThreshold = 1;
      this.sleepTime = 0.5;
      this.sleepLinearSpeed = 0.1;
      this.sleepAngularSpeed = 0.1;
      this.wakeSpeed = 0.25;
      this.spinFriction = 0.02;
      this.warmStarting = true;
      this.warmStartDistance = 0.05;
      this.onContact = null;
      this.bodies = [];
      this.contacts = new ContactList();
      this.stats = { bodies: 0, awake: 0, contacts: 0, joints: 0, stepMs: 0, subSteps: 0 };
      this._accumulator = 0;
      this._manifolds = /* @__PURE__ */ new Map();
      this._stepIndex = 0;
      this._sorted = [];
      this._planes = [];
      this._active = [];
      this.joints = [];
      this._noCollide = /* @__PURE__ */ new Set();
      this._movers = [];
      this._sweepContacts = new ContactList();
      this._tick = 0;
      this._pairKeys = new Float64Array(1024);
    }
    addBody(body) {
      if (!body || !body.isRigidBody) throw new TypeError("Prism.js: PhysicsWorld.addBody() expects a RigidBody.");
      if (this.bodies.includes(body)) throw new Error("Prism.js: This RigidBody is already in the world.");
      body._index = this.bodies.length;
      this.bodies.push(body);
      (body.shape.kind === KIND_PLANE ? this._planes : this._sorted).push(body);
      this._syncObject(body);
      return body;
    }
    /** Removes a body. Sleeping bodies are woken because their support may have been removed. */
    removeBody(body) {
      const index = this.bodies.indexOf(body);
      if (index === -1) return false;
      for (const joint of [...this.joints]) if (joint.bodyA === body || joint.bodyB === body) this.removeJoint(joint);
      this.bodies.splice(index, 1);
      for (let i = index; i < this.bodies.length; i++) this.bodies[i]._index = i;
      const list = body.shape.kind === KIND_PLANE ? this._planes : this._sorted;
      list.splice(list.indexOf(body), 1);
      this.wakeAll();
      return true;
    }
    /** Adds a joint. Its bodies must already be in this world (or be null for the world itself). */
    addJoint(joint) {
      if (!joint || !joint.isJoint) throw new TypeError("Prism.js: PhysicsWorld.addJoint() expects a joint (BallSocketJoint, HingeJoint or DistanceJoint).");
      if (this.joints.includes(joint)) throw new Error("Prism.js: This joint is already in the world.");
      for (const body of [joint.bodyA, joint.bodyB]) {
        if (body !== null && !this.bodies.includes(body)) throw new Error("Prism.js: Add the joint's bodies to the world before adding the joint.");
      }
      this.joints.push(joint);
      if (!joint.collideConnected && joint.bodyA && joint.bodyB) this._noCollide.add(pairKey(joint.bodyA, joint.bodyB));
      joint._reset();
      joint.bodyA?.wakeUp();
      joint.bodyB?.wakeUp();
      return joint;
    }
    removeJoint(joint) {
      const index = this.joints.indexOf(joint);
      if (index === -1) return false;
      this.joints.splice(index, 1);
      if (joint.bodyA && joint.bodyB) this._noCollide.delete(pairKey(joint.bodyA, joint.bodyB));
      this.wakeAll();
      return true;
    }
    wakeAll() {
      for (const body of this.bodies) body.wakeUp();
    }
    /** Advances the simulation by `deltaTime` seconds using fixed steps. */
    step(deltaTime) {
      if (!(deltaTime >= 0) || !Number.isFinite(deltaTime)) {
        throw new RangeError(`Prism.js: PhysicsWorld.step() needs a finite deltaTime >= 0, received ${String(deltaTime)}.`);
      }
      const start = typeof performance !== "undefined" ? performance.now() : 0;
      this._accumulator += deltaTime;
      let steps = 0;
      while (this._accumulator >= this.fixedTimeStep && steps < this.maxSubSteps) {
        this._fixedStep(this.fixedTimeStep);
        this._accumulator -= this.fixedTimeStep;
        steps++;
      }
      if (steps === this.maxSubSteps) this._accumulator = 0;
      if (steps > 0) for (const body of this._movers) {
        body.force.set(0, 0, 0);
        body.torque.set(0, 0, 0);
      }
      let awake = 0;
      for (const body of this._movers) if (body.invMass > 0 && !body.sleeping) awake++;
      this.stats.bodies = this.bodies.length;
      this.stats.awake = awake;
      this.stats.contacts = this.contacts.count;
      this.stats.joints = this.joints.length;
      this.stats.subSteps = steps;
      this.stats.stepMs = typeof performance !== "undefined" ? performance.now() - start : 0;
    }
    _fixedStep(dt) {
      const bodies = this.bodies, g = this.gravity, movers = this._movers;
      for (let changed = this.joints.length > 0, guard = 0; changed && guard <= this.joints.length; guard++) {
        changed = false;
        for (let i = 0; i < this.joints.length; i++) {
          const a = this.joints[i].bodyA, b = this.joints[i].bodyB;
          if (!a || !b) continue;
          if (a.sleeping && this._isMover(b)) {
            a.wakeUp();
            changed = true;
          } else if (b.sleeping && this._isMover(a)) {
            b.wakeUp();
            changed = true;
          }
        }
      }
      movers.length = 0;
      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        body.updateRotation();
        if (body.shape.kind !== KIND_PLANE && this._isMover(body)) movers.push(body);
      }
      this._tick++;
      for (let i = 0; i < movers.length; i++) movers[i]._moverTick = this._tick;
      if (movers.length === 0) {
        this.contacts.reset();
        return;
      }
      for (let i = 0; i < movers.length; i++) {
        const body = movers[i];
        if (body.invMass === 0) continue;
        const v = body.velocity, w = body.angularVelocity, f = body.force, t = body.torque, I = body.invInertiaWorld;
        const k = body.invMass, gs = body.gravityScale;
        v.x += (g.x * gs + f.x * k) * dt;
        v.y += (g.y * gs + f.y * k) * dt;
        v.z += (g.z * gs + f.z * k) * dt;
        w.x += (I[0] * t.x + I[1] * t.y + I[2] * t.z) * dt;
        w.y += (I[3] * t.x + I[4] * t.y + I[5] * t.z) * dt;
        w.z += (I[6] * t.x + I[7] * t.y + I[8] * t.z) * dt;
        const lin = Math.pow(1 - body.linearDamping, dt), ang = Math.pow(1 - body.angularDamping, dt);
        v.multiplyScalar(lin);
        w.multiplyScalar(ang);
        const ws = w.length();
        if (ws > MAX_ANGULAR_SPEED) w.multiplyScalar(MAX_ANGULAR_SPEED / ws);
      }
      this.contacts.reset();
      this._collideAll();
      this._solve(dt);
      if (this.onContact !== null) {
        for (let i = 0; i < this.contacts.count; i++) this.onContact(this.contacts.items[i]);
      }
      for (let i = 0; i < movers.length; i++) {
        const body = movers[i];
        if (body.ccd && body.invMass > 0) body._ccdFraction = this._sweep(body, dt);
      }
      for (let i = 0; i < movers.length; i++) {
        const body = movers[i];
        const v = body.velocity, pv = body._pv, pw = body._pw, f = body._ccdFraction;
        body._ccdFraction = 1;
        body.position.x += (v.x + pv.x) * dt * f;
        body.position.y += (v.y + pv.y) * dt * f;
        body.position.z += (v.z + pv.z) * dt * f;
        const w = { x: body.angularVelocity.x + pw.x, y: body.angularVelocity.y + pw.y, z: body.angularVelocity.z + pw.z };
        pv.set(0, 0, 0);
        pw.set(0, 0, 0);
        const q = body.quaternion, h = 0.5 * dt;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
        q.set(
          qx + h * (w.x * qw + w.y * qz - w.z * qy),
          qy + h * (w.y * qw + w.z * qx - w.x * qz),
          qz + h * (w.z * qw + w.x * qy - w.y * qx),
          qw + h * (-w.x * qx - w.y * qy - w.z * qz)
        ).normalize();
      }
      if (this.allowSleep) {
        const lin2 = this.sleepLinearSpeed ** 2, ang2 = this.sleepAngularSpeed ** 2;
        for (let i = 0; i < movers.length; i++) {
          const body = movers[i];
          body._quiet = body.invMass > 0 && !body.sleeping && body.allowSleep && body.velocity.lengthSq() < lin2 && body.angularVelocity.lengthSq() < ang2;
        }
        if (this.joints.length > 0) {
          for (let changed = true, guard = 0; changed && guard < 64; guard++) {
            changed = false;
            for (const joint of this.joints) {
              const a = joint.bodyA, b = joint.bodyB;
              if (!a || !b || a.invMass === 0 || b.invMass === 0) continue;
              if (a._quiet !== b._quiet && a._moverTick === this._tick && b._moverTick === this._tick) {
                a._quiet = b._quiet = false;
                changed = true;
              }
            }
          }
        }
        for (let i = 0; i < movers.length; i++) {
          const body = movers[i];
          if (body.invMass === 0 || body.sleeping || !body.allowSleep) continue;
          if (body._quiet) {
            body.sleepTimer += dt;
            if (body.sleepTimer >= this.sleepTime) {
              body.sleeping = true;
              body.velocity.set(0, 0, 0);
              body.angularVelocity.set(0, 0, 0);
            }
          } else {
            body.sleepTimer = 0;
          }
        }
      }
      for (let i = 0; i < movers.length; i++) this._syncObject(movers[i]);
    }
    /**
     * Time of first contact along the body's path this step, as a fraction of the step in (0, 1], or 1
     * when nothing is hit. The body is tested at evenly spaced poses (never further apart than its
     * smallest half-extent, so nothing thin can be stepped over) and the first overlap is refined by
     * bisection. Other bodies are taken at their poses from the start of the step; rotation is ignored.
     */
    _sweep(body, dt) {
      const v = body.velocity, pv = body._pv, p = body.position;
      const vx = (v.x + pv.x) * dt, vy = (v.y + pv.y) * dt, vz = (v.z + pv.z) * dt;
      const dist = Math.hypot(vx, vy, vz), size = body.shape.minExtent;
      if (!(dist > size)) return 1;
      const x0 = p.x, y0 = p.y, z0 = p.z;
      const place = (t) => p.set(x0 + vx * t, y0 + vy * t, z0 + vz * t);
      let result = 1;
      if (!this._overlapsAnything(body)) {
        const steps = Math.min(256, Math.ceil(dist / size));
        let hit = -1;
        for (let s = 1; s <= steps && hit < 0; s++) {
          place(s / steps);
          if (this._overlapsAnything(body)) hit = s;
        }
        if (hit > 0) {
          let lo = (hit - 1) / steps, hi = hit / steps;
          for (let i = 0; i < 12; i++) {
            const mid = (lo + hi) / 2;
            place(mid);
            if (this._overlapsAnything(body)) hi = mid;
            else lo = mid;
          }
          result = hi;
        }
      }
      p.set(x0, y0, z0);
      return result;
    }
    _overlapsAnything(body) {
      computeAABB(body, _sweepBox);
      for (let i = 0; i < this.bodies.length; i++) {
        const other = this.bodies[i];
        if (other === body || !this._canCollide(body, other)) continue;
        if (other.shape.kind !== KIND_PLANE && other._aabb !== void 0 && !this._boxesOverlap(_sweepBox, other._aabb)) continue;
        const list = this._sweepContacts;
        list.reset();
        if (collide(body, other, list) > 0) return true;
      }
      return false;
    }
    /** Adds a body that was woken during this step to the list of bodies being simulated. */
    _joinMovers(body) {
      if (body._moverTick !== this._tick && body.invMass > 0) {
        body._moverTick = this._tick;
        this._movers.push(body);
      }
    }
    _syncObject(body) {
      const o = body.object;
      if (o && body.shape.kind !== KIND_PLANE) {
        o.position.copy(body.position);
        o.quaternion.copy(body.quaternion);
      }
    }
    // ---------- broad phase ----------
    /**
     * Sweep and prune on x, but only the pairs that involve a body that is awake (or a moving
     * kinematic body) are enumerated: two sleeping or immobile bodies can never produce a contact,
     * so a settled pile costs almost nothing. The pairs are then tested in the same order a full
     * sweep would have used, so results do not depend on this shortcut.
     */
    _collideAll() {
      const sorted = this._sorted, planes = this._planes, active = this._active;
      active.length = 0;
      for (let i = 0; i < sorted.length; i++) {
        const body = sorted[i];
        if (body._aabb === void 0) body._aabb = new Float64Array(6);
        if (!(body.sleeping && body._aabbValid)) {
          computeAABB(body, body._aabb);
          body._aabbValid = true;
        }
      }
      let maxWidth = 0;
      for (let i = 1; i < sorted.length; i++) {
        const item = sorted[i], key = item._aabb[0], index = item._index;
        let j = i - 1;
        while (j >= 0) {
          const other = sorted[j], k = other._aabb[0];
          if (k > key || k === key && other._index > index) {
            sorted[j + 1] = other;
            j--;
          } else break;
        }
        sorted[j + 1] = item;
      }
      for (let i = 0; i < sorted.length; i++) {
        const box = sorted[i]._aabb;
        if (box[3] - box[0] > maxWidth) maxWidth = box[3] - box[0];
      }
      const wake2 = this.wakeSpeed * this.wakeSpeed;
      let any = false;
      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i];
        if (!this._isMover(a)) continue;
        any = true;
        if (this._speedSq(a) > wake2) this._wakeOverlapping(sorted, i, maxWidth);
      }
      for (let i = 0; i < sorted.length; i++) if (this._isMover(sorted[i])) active.push(i);
      if (active.length > 0) {
        const n = sorted.length;
        let keys = this._pairKeys, count = 0;
        for (let ai = 0; ai < active.length; ai++) {
          const i = active[ai], a = sorted[i], ab = a._aabb;
          for (let j = i + 1; j < n; j++) {
            const bb = sorted[j]._aabb;
            if (bb[0] > ab[3]) break;
            if (bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]) continue;
            if (count === keys.length) keys = this._growPairKeys();
            keys[count++] = i * n + j;
          }
          for (let k = i - 1; k >= 0; k--) {
            const bb = sorted[k]._aabb;
            if (bb[0] < ab[0] - maxWidth) break;
            if (bb[3] < ab[0] || bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]) continue;
            if (this._isMover(sorted[k])) continue;
            if (count === keys.length) keys = this._growPairKeys();
            keys[count++] = k * n + i;
          }
        }
        const view = keys.subarray(0, count);
        view.sort();
        for (let q = 0; q < count; q++) {
          const key = view[q], lo = Math.floor(key / n);
          this._testPair(sorted[lo], sorted[key - lo * n]);
        }
      }
      if (!any && planes.every((plane) => !this._isMover(plane))) return;
      for (const plane of planes) {
        if (this._isMover(plane)) {
          for (const body of sorted) this._testPair(plane, body);
        } else for (let ai = 0; ai < active.length; ai++) this._testPair(plane, sorted[active[ai]]);
      }
    }
    _growPairKeys() {
      const bigger = new Float64Array(this._pairKeys.length * 2);
      bigger.set(this._pairKeys);
      this._pairKeys = bigger;
      return bigger;
    }
    /** Wakes the sleeping bodies whose box overlaps that of sorted[i] (called for fast movers). */
    _wakeOverlapping(sorted, i, maxWidth) {
      const a = sorted[i], ab = a._aabb;
      for (let j = i + 1; j < sorted.length; j++) {
        const bb = sorted[j]._aabb;
        if (bb[0] > ab[3]) break;
        if (sorted[j].sleeping && this._boxesOverlap(ab, bb) && this._canCollide(a, sorted[j])) {
          sorted[j].wakeUp();
          this._joinMovers(sorted[j]);
        }
      }
      for (let k = i - 1; k >= 0; k--) {
        const bb = sorted[k]._aabb;
        if (bb[0] < ab[0] - maxWidth) break;
        if (sorted[k].sleeping && this._boxesOverlap(ab, bb) && this._canCollide(a, sorted[k])) {
          sorted[k].wakeUp();
          this._joinMovers(sorted[k]);
        }
      }
    }
    _boxesOverlap(ab, bb) {
      return !(bb[0] > ab[3] || bb[3] < ab[0] || bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]);
    }
    _canCollide(a, b) {
      return !(a.invMass === 0 && b.invMass === 0) && !!(a.collisionGroup & b.collisionMask && b.collisionGroup & a.collisionMask);
    }
    _isMover(body) {
      return body.invMass > 0 ? !body.sleeping : body.velocity.lengthSq() > 0 || body.angularVelocity.lengthSq() > 0;
    }
    _speedSq(body) {
      return body.velocity.lengthSq() + body.angularVelocity.lengthSq();
    }
    _testPair(a, b) {
      if (a.invMass === 0 && b.invMass === 0) return;
      if (!(a.collisionGroup & b.collisionMask && b.collisionGroup & a.collisionMask)) return;
      if (this._noCollide.size > 0 && this._noCollide.has(pairKey(a, b))) return;
      const aMoves = this._isMover(a), bMoves = this._isMover(b);
      if (!aMoves && !bMoves) return;
      const wake2 = this.wakeSpeed * this.wakeSpeed;
      if (a.sleeping && bMoves && this._speedSq(b) > wake2) {
        a.wakeUp();
        this._joinMovers(a);
      } else if (b.sleeping && aMoves && this._speedSq(a) > wake2) {
        b.wakeUp();
        this._joinMovers(b);
      }
      const count = collide(a, b, this.contacts);
      if (count > 0) {
        if (!a.sleeping) {
          a._im = a.invMass;
          a._ii = a.invInertiaWorld;
        }
        if (!b.sleeping) {
          b._im = b.invMass;
          b._ii = b.invInertiaWorld;
        }
      }
    }
    // ---------- solver ----------
    _solve(dt) {
      this._stepIndex++;
      const items = this.contacts.items, n = this.contacts.count;
      const beta = this.baumgarte / dt, slop = this.penetrationSlop;
      const maxBias = this.maxCorrectionSpeed, threshold = this.restitutionThreshold, spin = this.spinFriction;
      for (let i = 0; i < n; i++) {
        const c = items[i], A = c.a, B = c.b;
        A._im = A.sleeping ? 0 : A.invMass;
        A._ii = A.sleeping ? ZERO_INERTIA : A.invInertiaWorld;
        B._im = B.sleeping ? 0 : B.invMass;
        B._ii = B.sleeping ? ZERO_INERTIA : B.invInertiaWorld;
        c.rax = c.px - A.position.x;
        c.ray = c.py - A.position.y;
        c.raz = c.pz - A.position.z;
        c.rbx = c.px - B.position.x;
        c.rby = c.py - B.position.y;
        c.rbz = c.pz - B.position.z;
        if (Math.abs(c.nx) >= 0.57735) {
          c.t1x = c.ny;
          c.t1y = -c.nx;
          c.t1z = 0;
        } else {
          c.t1x = 0;
          c.t1y = c.nz;
          c.t1z = -c.ny;
        }
        const tl = Math.hypot(c.t1x, c.t1y, c.t1z);
        c.t1x /= tl;
        c.t1y /= tl;
        c.t1z /= tl;
        c.t2x = c.ny * c.t1z - c.nz * c.t1y;
        c.t2y = c.nz * c.t1x - c.nx * c.t1z;
        c.t2z = c.nx * c.t1y - c.ny * c.t1x;
        c.invKN = invEffectiveMass(c, c.nx, c.ny, c.nz);
        c.invKT1 = invEffectiveMass(c, c.t1x, c.t1y, c.t1z);
        c.invKT2 = invEffectiveMass(c, c.t2x, c.t2y, c.t2z);
        c.invKS = invAngularMass(c, c.nx, c.ny, c.nz);
        c.accS = 0;
        c.rollMu = Math.max(A.rollingFriction, B.rollingFriction);
        if (c.rollMu > 0) {
          c.invKR1 = invAngularMass(c, c.t1x, c.t1y, c.t1z);
          c.invKR2 = invAngularMass(c, c.t2x, c.t2y, c.t2z);
          c.accR1 = c.accR2 = 0;
        }
        const vn = relativeVelocity(c, c.nx, c.ny, c.nz);
        const e = Math.max(A.restitution, B.restitution);
        const bounce = vn < -threshold ? -e * vn : 0;
        c.target = bounce;
        c.bias = Math.min(beta * Math.max(c.depth - slop, 0), maxBias);
        c.accP = 0;
        c.mu = Math.sqrt(A.friction * B.friction);
        c.accN = c.accT1 = c.accT2 = 0;
      }
      const joints = this.joints;
      for (let i = 0; i < joints.length; i++) joints[i]._prepare(dt, this.baumgarte, this.maxCorrectionSpeed);
      if (this.warmStarting) {
        for (let i = 0; i < n; i++) this._warmStart(items[i]);
        for (let i = 0; i < joints.length; i++) joints[i]._warmStart();
      } else {
        for (let i = 0; i < joints.length; i++) joints[i]._reset();
      }
      for (let it = 0; it < this.solverIterations; it++) {
        for (let i = 0; i < joints.length; i++) joints[i]._solve(false);
        for (let i = 0; i < n; i++) {
          const c = items[i];
          const vn = relativeVelocity(c, c.nx, c.ny, c.nz);
          let lambda = (c.target - vn) * c.invKN;
          const accN = Math.max(c.accN + lambda, 0);
          lambda = accN - c.accN;
          c.accN = accN;
          applyImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda);
          const maxF = c.mu * c.accN;
          let vt = relativeVelocity(c, c.t1x, c.t1y, c.t1z);
          lambda = -vt * c.invKT1;
          let acc = Math.max(-maxF, Math.min(maxF, c.accT1 + lambda));
          lambda = acc - c.accT1;
          c.accT1 = acc;
          applyImpulse(c, c.t1x * lambda, c.t1y * lambda, c.t1z * lambda);
          vt = relativeVelocity(c, c.t2x, c.t2y, c.t2z);
          lambda = -vt * c.invKT2;
          acc = Math.max(-maxF, Math.min(maxF, c.accT2 + lambda));
          lambda = acc - c.accT2;
          c.accT2 = acc;
          applyImpulse(c, c.t2x * lambda, c.t2y * lambda, c.t2z * lambda);
          if (spin > 0 && c.invKS > 0) {
            const wa = c.a.angularVelocity, wb = c.b.angularVelocity;
            const rel = (wb.x - wa.x) * c.nx + (wb.y - wa.y) * c.ny + (wb.z - wa.z) * c.nz;
            const maxS = spin * c.accN;
            acc = Math.max(-maxS, Math.min(maxS, c.accS - rel * c.invKS));
            lambda = acc - c.accS;
            c.accS = acc;
            applyAngularImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda);
          }
          if (c.rollMu > 0) {
            const wa = c.a.angularVelocity, wb = c.b.angularVelocity;
            const maxR = c.rollMu * c.accN;
            let rel = (wb.x - wa.x) * c.t1x + (wb.y - wa.y) * c.t1y + (wb.z - wa.z) * c.t1z;
            acc = Math.max(-maxR, Math.min(maxR, c.accR1 - rel * c.invKR1));
            lambda = acc - c.accR1;
            c.accR1 = acc;
            applyAngularImpulse(c, c.t1x * lambda, c.t1y * lambda, c.t1z * lambda);
            rel = (wb.x - wa.x) * c.t2x + (wb.y - wa.y) * c.t2y + (wb.z - wa.z) * c.t2z;
            acc = Math.max(-maxR, Math.min(maxR, c.accR2 - rel * c.invKR2));
            lambda = acc - c.accR2;
            c.accR2 = acc;
            applyAngularImpulse(c, c.t2x * lambda, c.t2y * lambda, c.t2z * lambda);
          }
        }
      }
      for (let i = 0; i < n; i++) items[i].normalImpulse = items[i].accN;
      this._storeImpulses();
      for (let it = 0; it < this.solverIterations; it++) {
        for (let i = 0; i < joints.length; i++) joints[i]._solve(true);
        for (let i = 0; i < n; i++) {
          const c = items[i];
          if (c.bias <= 0) continue;
          let lambda = (c.bias - relativePseudoVelocity(c, c.nx, c.ny, c.nz)) * c.invKN;
          const acc = Math.max(c.accP + lambda, 0);
          lambda = acc - c.accP;
          c.accP = acc;
          applyPseudoImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda);
        }
      }
    }
    /**
     * Finds the same contact in last step's manifold (same pair, nearby point) and applies its
     * impulses again as the starting guess. Friction impulses are cached as world vectors on the
     * body with the higher id, so they stay valid when the pair's order or tangent basis changes.
     */
    _warmStart(c) {
      const m = this._manifolds.get(pairKey(c.a, c.b));
      if (m === void 0 || m.stamp !== this._stepIndex - 1) return;
      let best = -1, bestD = this.warmStartDistance * this.warmStartDistance;
      for (let k = 0; k < m.count; k++) {
        if (m.used[k] === 1) continue;
        const d = (m.px[k] - c.px) ** 2 + (m.py[k] - c.py) ** 2 + (m.pz[k] - c.pz) ** 2;
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      }
      if (best < 0) return;
      m.used[best] = 1;
      const sign = c.b.id > c.a.id ? 1 : -1;
      const fx = m.fx[best] * sign, fy = m.fy[best] * sign, fz = m.fz[best] * sign;
      c.accN = m.accN[best];
      c.accT1 = fx * c.t1x + fy * c.t1y + fz * c.t1z;
      c.accT2 = fx * c.t2x + fy * c.t2y + fz * c.t2z;
      applyImpulse(
        c,
        c.nx * c.accN + c.t1x * c.accT1 + c.t2x * c.accT2,
        c.ny * c.accN + c.t1y * c.accT1 + c.t2y * c.accT2,
        c.nz * c.accN + c.t1z * c.accT1 + c.t2z * c.accT2
      );
    }
    /** Writes this step's impulses into the per-pair manifolds (reused objects, no allocation once warm). */
    _storeImpulses() {
      const items = this.contacts.items, step = this._stepIndex;
      for (let i = 0; i < this.contacts.count; i++) {
        const c = items[i];
        const key = pairKey(c.a, c.b);
        let m = this._manifolds.get(key);
        if (m === void 0) {
          m = new Manifold();
          this._manifolds.set(key, m);
        }
        if (m.stamp !== step) {
          m.stamp = step;
          m.count = 0;
        }
        const k = m.count;
        if (k >= MANIFOLD_CAPACITY) continue;
        const sign = c.b.id > c.a.id ? 1 : -1;
        m.px[k] = c.px;
        m.py[k] = c.py;
        m.pz[k] = c.pz;
        m.accN[k] = c.accN;
        m.used[k] = 0;
        m.fx[k] = (c.t1x * c.accT1 + c.t2x * c.accT2) * sign;
        m.fy[k] = (c.t1y * c.accT1 + c.t2y * c.accT2) * sign;
        m.fz[k] = (c.t1z * c.accT1 + c.t2z * c.accT2) * sign;
        m.count = k + 1;
      }
      if ((step & 255) === 0) {
        for (const [key, m] of this._manifolds) if (m.stamp < step - 1) this._manifolds.delete(key);
      }
    }
    /**
     * Nearest solid hit along a ray, or null. `direction` is normalized for you.
     * A ray that starts inside a sphere or box does not hit it; planes block from their front side.
     * @returns {{ body: object, distance: number, point: Vector3, normal: Vector3 } | null}
     */
    raycast(origin, direction, maxDistance = Infinity) {
      const len = Math.hypot(direction.x, direction.y, direction.z);
      if (len === 0) throw new RangeError("Prism.js: raycast direction must not be the zero vector.");
      const dx = direction.x / len, dy = direction.y / len, dz = direction.z / len;
      let best = null, bestT = maxDistance;
      for (const body of this.bodies) {
        if (body.rotation === void 0) continue;
        const t = raycastBody(body, origin.x, origin.y, origin.z, dx, dy, dz, bestT, _normal);
        if (t >= 0 && t <= bestT) {
          bestT = t;
          best = { body, distance: t, point: new Vector3(origin.x + dx * t, origin.y + dy * t, origin.z + dz * t), normal: new Vector3(_normal[0], _normal[1], _normal[2]) };
        }
      }
      return best;
    }
    /** Total kinetic energy of all dynamic bodies (joules, if you use SI units). */
    get kineticEnergy() {
      let sum = 0;
      for (const body of this.bodies) sum += body.kineticEnergy;
      return sum;
    }
  };
  function pairKey(a, b) {
    return a.id < b.id ? a.id * 4194304 + b.id : b.id * 4194304 + a.id;
  }
  function invEffectiveMass(c, dx, dy, dz) {
    const A = c.a, B = c.b;
    let k = A._im + B._im;
    let ax = c.ray * dz - c.raz * dy, ay = c.raz * dx - c.rax * dz, az = c.rax * dy - c.ray * dx;
    let I = A._ii;
    k += ax * (I[0] * ax + I[1] * ay + I[2] * az) + ay * (I[3] * ax + I[4] * ay + I[5] * az) + az * (I[6] * ax + I[7] * ay + I[8] * az);
    ax = c.rby * dz - c.rbz * dy;
    ay = c.rbz * dx - c.rbx * dz;
    az = c.rbx * dy - c.rby * dx;
    I = B._ii;
    k += ax * (I[0] * ax + I[1] * ay + I[2] * az) + ay * (I[3] * ax + I[4] * ay + I[5] * az) + az * (I[6] * ax + I[7] * ay + I[8] * az);
    return k > 0 ? 1 / k : 0;
  }
  function invAngularMass(c, nx, ny, nz) {
    let k = 0;
    for (const I of [c.a._ii, c.b._ii]) {
      k += nx * (I[0] * nx + I[1] * ny + I[2] * nz) + ny * (I[3] * nx + I[4] * ny + I[5] * nz) + nz * (I[6] * nx + I[7] * ny + I[8] * nz);
    }
    return k > 0 ? 1 / k : 0;
  }
  function applyAngularImpulse(c, tx, ty, tz) {
    const A = c.a, B = c.b;
    if (A._im > 0) {
      const I = A._ii, w = A.angularVelocity;
      w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
      w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
      w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
    }
    if (B._im > 0) {
      const I = B._ii, w = B.angularVelocity;
      w.x += I[0] * tx + I[1] * ty + I[2] * tz;
      w.y += I[3] * tx + I[4] * ty + I[5] * tz;
      w.z += I[6] * tx + I[7] * ty + I[8] * tz;
    }
  }
  function relativeVelocity(c, dx, dy, dz) {
    const va = c.a.velocity, wa = c.a.angularVelocity, vb = c.b.velocity, wb = c.b.angularVelocity;
    const x = vb.x + wb.y * c.rbz - wb.z * c.rby - va.x - wa.y * c.raz + wa.z * c.ray;
    const y = vb.y + wb.z * c.rbx - wb.x * c.rbz - va.y - wa.z * c.rax + wa.x * c.raz;
    const z = vb.z + wb.x * c.rby - wb.y * c.rbx - va.z - wa.x * c.ray + wa.y * c.rax;
    return x * dx + y * dy + z * dz;
  }
  function relativePseudoVelocity(c, dx, dy, dz) {
    const va = c.a._pv, wa = c.a._pw, vb = c.b._pv, wb = c.b._pw;
    const x = vb.x + wb.y * c.rbz - wb.z * c.rby - va.x - wa.y * c.raz + wa.z * c.ray;
    const y = vb.y + wb.z * c.rbx - wb.x * c.rbz - va.y - wa.z * c.rax + wa.x * c.raz;
    const z = vb.z + wb.x * c.rby - wb.y * c.rbx - va.z - wa.x * c.ray + wa.y * c.rax;
    return x * dx + y * dy + z * dz;
  }
  function applyImpulse(c, px, py, pz) {
    const A = c.a, B = c.b;
    const imA = A._im, imB = B._im;
    if (imA > 0) {
      const va = A.velocity;
      va.x -= px * imA;
      va.y -= py * imA;
      va.z -= pz * imA;
      const tx = c.ray * pz - c.raz * py, ty = c.raz * px - c.rax * pz, tz = c.rax * py - c.ray * px;
      const I = A._ii, w = A.angularVelocity;
      w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
      w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
      w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
    }
    if (imB > 0) {
      const vb = B.velocity;
      vb.x += px * imB;
      vb.y += py * imB;
      vb.z += pz * imB;
      const tx = c.rby * pz - c.rbz * py, ty = c.rbz * px - c.rbx * pz, tz = c.rbx * py - c.rby * px;
      const I = B._ii, w = B.angularVelocity;
      w.x += I[0] * tx + I[1] * ty + I[2] * tz;
      w.y += I[3] * tx + I[4] * ty + I[5] * tz;
      w.z += I[6] * tx + I[7] * ty + I[8] * tz;
    }
  }
  function applyPseudoImpulse(c, px, py, pz) {
    const A = c.a, B = c.b;
    const imA = A._im, imB = B._im;
    if (imA > 0) {
      const va = A._pv;
      va.x -= px * imA;
      va.y -= py * imA;
      va.z -= pz * imA;
      const tx = c.ray * pz - c.raz * py, ty = c.raz * px - c.rax * pz, tz = c.rax * py - c.ray * px;
      const I = A._ii, w = A._pw;
      w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
      w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
      w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
    }
    if (imB > 0) {
      const vb = B._pv;
      vb.x += px * imB;
      vb.y += py * imB;
      vb.z += pz * imB;
      const tx = c.rby * pz - c.rbz * py, ty = c.rbz * px - c.rbx * pz, tz = c.rbx * py - c.rby * px;
      const I = B._ii, w = B._pw;
      w.x += I[0] * tx + I[1] * ty + I[2] * tz;
      w.y += I[3] * tx + I[4] * ty + I[5] * tz;
      w.z += I[6] * tx + I[7] * ty + I[8] * tz;
    }
  }

  // src/physics/joints.js
  var ZERO9 = new Float64Array(9);
  var WORLD = new RigidBody({ shape: new SphereShape(1e-3), mass: 0 });
  var _t = new Float64Array(3);
  var _va = new Float64Array(3);
  var _vb = new Float64Array(3);
  function rotate(R, x, y, z, out) {
    out[0] = R[0] * x + R[1] * y + R[2] * z;
    out[1] = R[3] * x + R[4] * y + R[5] * z;
    out[2] = R[6] * x + R[7] * y + R[8] * z;
  }
  function unrotate(R, x, y, z, out) {
    out[0] = R[0] * x + R[3] * y + R[6] * z;
    out[1] = R[1] * x + R[4] * y + R[7] * z;
    out[2] = R[2] * x + R[5] * y + R[8] * z;
  }
  function addSandwich(K, rx, ry, rz, I) {
    const S = [0, -rz, ry, rz, 0, -rx, -ry, rx, 0];
    for (let i = 0; i < 3; i++) {
      const t0 = S[i * 3] * I[0] + S[i * 3 + 1] * I[3] + S[i * 3 + 2] * I[6];
      const t1 = S[i * 3] * I[1] + S[i * 3 + 1] * I[4] + S[i * 3 + 2] * I[7];
      const t2 = S[i * 3] * I[2] + S[i * 3 + 1] * I[5] + S[i * 3 + 2] * I[8];
      for (let j = 0; j < 3; j++) K[i * 3 + j] += t0 * S[j * 3] + t1 * S[j * 3 + 1] + t2 * S[j * 3 + 2];
    }
  }
  function invert3(m, out) {
    const a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5], g = m[6], h = m[7], i = m[8];
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (Math.abs(det) < 1e-30) {
      out.fill(0);
      return false;
    }
    const k = 1 / det;
    out[0] = (e * i - f * h) * k;
    out[1] = (c * h - b * i) * k;
    out[2] = (b * f - c * e) * k;
    out[3] = (f * g - d * i) * k;
    out[4] = (a * i - c * g) * k;
    out[5] = (c * d - a * f) * k;
    out[6] = (d * h - e * g) * k;
    out[7] = (b * g - a * h) * k;
    out[8] = (a * e - b * d) * k;
    return true;
  }
  function pointVelocity(v, w, rx, ry, rz, out) {
    out[0] = v.x + w.y * rz - w.z * ry;
    out[1] = v.y + w.z * rx - w.x * rz;
    out[2] = v.z + w.x * ry - w.y * rx;
  }
  function applyLinear(body, rx, ry, rz, px, py, pz, sign, pseudo) {
    const im = body._im;
    if (im === 0) return;
    const v = pseudo ? body._pv : body.velocity, w = pseudo ? body._pw : body.angularVelocity, I = body._ii;
    v.x += sign * px * im;
    v.y += sign * py * im;
    v.z += sign * pz * im;
    const tx = ry * pz - rz * py, ty = rz * px - rx * pz, tz = rx * py - ry * px;
    w.x += sign * (I[0] * tx + I[1] * ty + I[2] * tz);
    w.y += sign * (I[3] * tx + I[4] * ty + I[5] * tz);
    w.z += sign * (I[6] * tx + I[7] * ty + I[8] * tz);
  }
  function applyAngular(body, tx, ty, tz, sign, pseudo) {
    if (body._im === 0) return;
    const w = pseudo ? body._pw : body.angularVelocity, I = body._ii;
    w.x += sign * (I[0] * tx + I[1] * ty + I[2] * tz);
    w.y += sign * (I[3] * tx + I[4] * ty + I[5] * tz);
    w.z += sign * (I[6] * tx + I[7] * ty + I[8] * tz);
  }
  var Joint = class {
    constructor(bodyA, bodyB, options = {}, anchorRequired = false) {
      if (!bodyA && !bodyB) throw new Error("Prism.js: A joint needs at least one body (the other end may be null for the world).");
      for (const body of [bodyA, bodyB]) {
        if (body && !body.isRigidBody) throw new TypeError("Prism.js: Joint bodies must be RigidBody instances (or null for the world).");
      }
      if (bodyA === bodyB) throw new Error("Prism.js: A joint cannot connect a body to itself.");
      this.bodyA = bodyA;
      this.bodyB = bodyB;
      this.collideConnected = options.collideConnected ?? false;
      this._a = bodyA ?? WORLD;
      this._b = bodyB ?? WORLD;
      this.localAnchorA = new Float64Array(3);
      this.localAnchorB = new Float64Array(3);
      this._error = 0;
      this._dt = 1 / 60;
      this._beta = 0.2;
      this._maxBias = 3;
      this._setAnchors(options, anchorRequired);
    }
    _setAnchors({ anchor, anchorA, anchorB }, required) {
      const local = (body, world, out) => {
        if (!body) {
          out[0] = world.x;
          out[1] = world.y;
          out[2] = world.z;
          return;
        }
        body.updateRotation();
        unrotate(body.rotation, world.x - body.position.x, world.y - body.position.y, world.z - body.position.z, out);
      };
      if (anchor) {
        local(this.bodyA, anchor, this.localAnchorA);
        local(this.bodyB, anchor, this.localAnchorB);
      } else if (anchorA || anchorB) {
        if (required && !(anchorA && anchorB)) throw new Error("Prism.js: Give the joint an `anchor` (a world point), or both `anchorA` and `anchorB`.");
        if (anchorA) this.localAnchorA.set([anchorA.x, anchorA.y, anchorA.z]);
        if (anchorB) this.localAnchorB.set([anchorB.x, anchorB.y, anchorB.z]);
      } else if (required) {
        throw new Error("Prism.js: A joint needs an `anchor` (a world point), or both `anchorA` and `anchorB` (body-local points).");
      }
    }
    /** World position of an anchor right now. */
    _anchorPoint(body, local) {
      const b = body ?? WORLD;
      b.updateRotation();
      rotate(b.rotation, local[0], local[1], local[2], _t);
      return new Vector3(b.position.x + _t[0], b.position.y + _t[1], b.position.z + _t[2]);
    }
    /** Effective inverse masses for this step: sleeping bodies act like static ones. */
    _loadBodies() {
      const A = this._a, B = this._b;
      A._im = A.sleeping ? 0 : A.invMass;
      A._ii = A.sleeping ? ZERO9 : A.invInertiaWorld;
      B._im = B.sleeping ? 0 : B.invMass;
      B._ii = B.sleeping ? ZERO9 : B.invInertiaWorld;
    }
    /** Pseudo-velocity bias per unit of position error, capped so a large error is corrected gently. */
    _biasScale(errorLength) {
      const rate = this._beta / this._dt;
      return errorLength * rate > this._maxBias ? this._maxBias / errorLength : rate;
    }
  };
  Joint.prototype.isJoint = true;
  var BallSocketJoint = class extends Joint {
    /** @param {{ anchor?: Vector3, anchorA?: Vector3, anchorB?: Vector3, collideConnected?: boolean }} options */
    constructor(bodyA, bodyB, options = {}) {
      super(bodyA, bodyB, options, true);
      this._rA = new Float64Array(3);
      this._rB = new Float64Array(3);
      this._K = new Float64Array(9);
      this._invK = new Float64Array(9);
      this._acc = new Float64Array(3);
      this._e = new Float64Array(3);
      this._active = false;
    }
    _prepare(dt, beta, maxBias) {
      this._dt = dt;
      this._beta = beta;
      this._maxBias = maxBias;
      this._loadBodies();
      const A = this._a, B = this._b, rA = this._rA, rB = this._rB, K = this._K;
      rotate(A.rotation, this.localAnchorA[0], this.localAnchorA[1], this.localAnchorA[2], rA);
      rotate(B.rotation, this.localAnchorB[0], this.localAnchorB[1], this.localAnchorB[2], rB);
      K.fill(0);
      K[0] = K[4] = K[8] = A._im + B._im;
      addSandwich(K, rA[0], rA[1], rA[2], A._ii);
      addSandwich(K, rB[0], rB[1], rB[2], B._ii);
      this._active = invert3(K, this._invK);
      const e = this._e;
      e[0] = B.position.x + rB[0] - A.position.x - rA[0];
      e[1] = B.position.y + rB[1] - A.position.y - rA[1];
      e[2] = B.position.z + rB[2] - A.position.z - rA[2];
      this._error = Math.hypot(e[0], e[1], e[2]);
    }
    _warmStart() {
      if (this._active) this._applyBall(this._acc[0], this._acc[1], this._acc[2], false);
    }
    _reset() {
      this._acc.fill(0);
    }
    _applyBall(px, py, pz, pseudo) {
      const A = this._a, B = this._b, rA = this._rA, rB = this._rB;
      applyLinear(A, rA[0], rA[1], rA[2], px, py, pz, -1, pseudo);
      applyLinear(B, rB[0], rB[1], rB[2], px, py, pz, 1, pseudo);
    }
    _solveBall(pseudo, tx, ty, tz) {
      const A = this._a, B = this._b, rA = this._rA, rB = this._rB;
      pointVelocity(pseudo ? A._pv : A.velocity, pseudo ? A._pw : A.angularVelocity, rA[0], rA[1], rA[2], _va);
      pointVelocity(pseudo ? B._pv : B.velocity, pseudo ? B._pw : B.angularVelocity, rB[0], rB[1], rB[2], _vb);
      const bx = tx - (_vb[0] - _va[0]), by = ty - (_vb[1] - _va[1]), bz = tz - (_vb[2] - _va[2]);
      const k = this._invK;
      const px = k[0] * bx + k[1] * by + k[2] * bz, py = k[3] * bx + k[4] * by + k[5] * bz, pz = k[6] * bx + k[7] * by + k[8] * bz;
      this._applyBall(px, py, pz, pseudo);
      if (!pseudo) {
        this._acc[0] += px;
        this._acc[1] += py;
        this._acc[2] += pz;
      }
    }
    _solve(pseudo) {
      if (!this._active) return;
      if (!pseudo) {
        this._solveBall(false, 0, 0, 0);
        return;
      }
      const e = this._e, s = -this._biasScale(this._error);
      this._solveBall(true, s * e[0], s * e[1], s * e[2]);
    }
  };
  var HingeJoint = class extends BallSocketJoint {
    /** @param {{ anchor?: Vector3, axis: Vector3, motorSpeed?: number, maxMotorTorque?: number, collideConnected?: boolean }} options */
    constructor(bodyA, bodyB, options = {}) {
      super(bodyA, bodyB, options);
      const axis = options.axis;
      if (!axis || !(axis.lengthSq() > 0)) throw new Error("Prism.js: HingeJoint needs a non-zero `axis` direction.");
      const n = new Vector3().copy(axis).normalize();
      const local = (body) => {
        if (!body) return [n.x, n.y, n.z];
        body.updateRotation();
        unrotate(body.rotation, n.x, n.y, n.z, _t);
        return [_t[0], _t[1], _t[2]];
      };
      this.localAxisA = new Float64Array(local(bodyA));
      this.localAxisB = new Float64Array(local(bodyB));
      this.motorSpeed = options.motorSpeed ?? 0;
      this.maxMotorTorque = options.maxMotorTorque ?? 0;
      this._aW = new Float64Array(3);
      this._bW = new Float64Array(3);
      this._t1 = new Float64Array(3);
      this._t2 = new Float64Array(3);
      this._k = new Float64Array(3);
      this._m = new Float64Array(3);
      this._motorAcc = 0;
    }
    _prepare(dt, beta, maxBias) {
      super._prepare(dt, beta, maxBias);
      const A = this._a, B = this._b, a = this._aW, b = this._bW, t1 = this._t1, t2 = this._t2;
      rotate(A.rotation, this.localAxisA[0], this.localAxisA[1], this.localAxisA[2], a);
      rotate(B.rotation, this.localAxisB[0], this.localAxisB[1], this.localAxisB[2], b);
      if (Math.abs(a[0]) >= 0.57735) {
        t1[0] = a[1];
        t1[1] = -a[0];
        t1[2] = 0;
      } else {
        t1[0] = 0;
        t1[1] = a[2];
        t1[2] = -a[1];
      }
      const l = Math.hypot(t1[0], t1[1], t1[2]);
      t1[0] /= l;
      t1[1] /= l;
      t1[2] /= l;
      t2[0] = a[1] * t1[2] - a[2] * t1[1];
      t2[1] = a[2] * t1[0] - a[0] * t1[2];
      t2[2] = a[0] * t1[1] - a[1] * t1[0];
      this._k[0] = this._angularInv(t1);
      this._k[1] = this._angularInv(t2);
      this._k[2] = this._angularInv(a);
      this._m[0] = b[1] * a[2] - b[2] * a[1];
      this._m[1] = b[2] * a[0] - b[0] * a[2];
      this._m[2] = b[0] * a[1] - b[1] * a[0];
      this._motorAcc = 0;
    }
    _angularInv(d) {
      let k = 0;
      for (const I of [this._a._ii, this._b._ii]) {
        k += d[0] * (I[0] * d[0] + I[1] * d[1] + I[2] * d[2]) + d[1] * (I[3] * d[0] + I[4] * d[1] + I[5] * d[2]) + d[2] * (I[6] * d[0] + I[7] * d[1] + I[8] * d[2]);
      }
      return k > 0 ? 1 / k : 0;
    }
    _spinRate(d, pseudo) {
      const wa = pseudo ? this._a._pw : this._a.angularVelocity, wb = pseudo ? this._b._pw : this._b.angularVelocity;
      return (wb.x - wa.x) * d[0] + (wb.y - wa.y) * d[1] + (wb.z - wa.z) * d[2];
    }
    _spin(d, lambda, pseudo) {
      applyAngular(this._a, d[0] * lambda, d[1] * lambda, d[2] * lambda, -1, pseudo);
      applyAngular(this._b, d[0] * lambda, d[1] * lambda, d[2] * lambda, 1, pseudo);
    }
    _reset() {
      super._reset();
      this._motorAcc = 0;
    }
    _solve(pseudo) {
      super._solve(pseudo);
      if (!pseudo) {
        for (let r = 0; r < 2; r++) {
          const d = r === 0 ? this._t1 : this._t2;
          this._spin(d, -this._spinRate(d, false) * this._k[r], false);
        }
        if (this.maxMotorTorque > 0) {
          const limit = this.maxMotorTorque * this._dt;
          const lambda = (this.motorSpeed - this._spinRate(this._aW, false)) * this._k[2];
          const acc = Math.max(-limit, Math.min(limit, this._motorAcc + lambda));
          this._spin(this._aW, acc - this._motorAcc, false);
          this._motorAcc = acc;
        }
      } else {
        const mag = Math.hypot(this._m[0], this._m[1], this._m[2]);
        const s = mag > 0 ? Math.min(this._beta / this._dt, this._maxBias / mag) : 0;
        for (let r = 0; r < 2; r++) {
          const d = r === 0 ? this._t1 : this._t2;
          const target = s * (this._m[0] * d[0] + this._m[1] * d[1] + this._m[2] * d[2]);
          this._spin(d, (target - this._spinRate(d, true)) * this._k[r], true);
        }
      }
    }
  };
  var DistanceJoint = class extends Joint {
    /** @param {{ anchor?: Vector3, anchorA?: Vector3, anchorB?: Vector3, length?: number, minLength?: number, maxLength?: number, collideConnected?: boolean }} options */
    constructor(bodyA, bodyB, options = {}) {
      super(bodyA, bodyB, options, false);
      const { length, minLength, maxLength } = options;
      if (length !== void 0) {
        this.minLength = this.maxLength = length;
      } else if (minLength === void 0 && maxLength === void 0) {
        this.minLength = this.maxLength = this._anchorPoint(bodyA, this.localAnchorA).distanceTo(this._anchorPoint(bodyB, this.localAnchorB));
      } else {
        this.minLength = minLength ?? 0;
        this.maxLength = maxLength ?? Infinity;
      }
      if (!(this.minLength >= 0) || !(this.maxLength >= this.minLength)) {
        throw new RangeError(`Prism.js: DistanceJoint needs 0 <= minLength <= maxLength, received minLength ${this.minLength}, maxLength ${this.maxLength}.`);
      }
      this._rA = new Float64Array(3);
      this._rB = new Float64Array(3);
      this._u = new Float64Array(3);
      this._rows = [{ acc: 0, kind: "upper", on: false, slack: 0, rod: false }, { acc: 0, kind: "lower", on: false, slack: 0, rod: false }];
      this._invK = 0;
      this._length = 0;
    }
    _prepare(dt, beta, maxBias) {
      this._dt = dt;
      this._beta = beta;
      this._maxBias = maxBias;
      this._loadBodies();
      const A = this._a, B = this._b, rA = this._rA, rB = this._rB, u = this._u;
      rotate(A.rotation, this.localAnchorA[0], this.localAnchorA[1], this.localAnchorA[2], rA);
      rotate(B.rotation, this.localAnchorB[0], this.localAnchorB[1], this.localAnchorB[2], rB);
      const dx = B.position.x + rB[0] - A.position.x - rA[0], dy = B.position.y + rB[1] - A.position.y - rA[1], dz = B.position.z + rB[2] - A.position.z - rA[2];
      this._length = Math.hypot(dx, dy, dz);
      if (this._length > 1e-9) {
        u[0] = dx / this._length;
        u[1] = dy / this._length;
        u[2] = dz / this._length;
      } else {
        u[0] = 0;
        u[1] = 1;
        u[2] = 0;
      }
      let k = A._im + B._im;
      for (const [body, r] of [[A, rA], [B, rB]]) {
        const cx = r[1] * u[2] - r[2] * u[1], cy = r[2] * u[0] - r[0] * u[2], cz = r[0] * u[1] - r[1] * u[0], I = body._ii;
        k += cx * (I[0] * cx + I[1] * cy + I[2] * cz) + cy * (I[3] * cx + I[4] * cy + I[5] * cz) + cz * (I[6] * cx + I[7] * cy + I[8] * cz);
      }
      this._invK = k > 0 ? 1 / k : 0;
      const rod = this.minLength === this.maxLength;
      const [upper, lower] = this._rows;
      upper.on = rod || this.maxLength < Infinity;
      lower.on = !rod && this.minLength > 0;
      upper.rod = lower.rod = rod;
      upper.slack = this.maxLength - this._length;
      lower.slack = this._length - this.minLength;
      this._error = rod ? Math.abs(this._length - this.maxLength) : Math.max(this._length - this.maxLength, this.minLength - this._length, 0);
    }
    _warmStart() {
      for (const row of this._rows) {
        if (row.on && row.acc !== 0) this._apply(row.acc, false);
        else row.acc = 0;
      }
    }
    _reset() {
      for (const row of this._rows) row.acc = 0;
    }
    _apply(lambda, pseudo) {
      const u = this._u, rA = this._rA, rB = this._rB;
      applyLinear(this._a, rA[0], rA[1], rA[2], u[0] * lambda, u[1] * lambda, u[2] * lambda, -1, pseudo);
      applyLinear(this._b, rB[0], rB[1], rB[2], u[0] * lambda, u[1] * lambda, u[2] * lambda, 1, pseudo);
    }
    _cdot(pseudo) {
      const A = this._a, B = this._b, u = this._u;
      pointVelocity(pseudo ? A._pv : A.velocity, pseudo ? A._pw : A.angularVelocity, this._rA[0], this._rA[1], this._rA[2], _va);
      pointVelocity(pseudo ? B._pv : B.velocity, pseudo ? B._pw : B.angularVelocity, this._rB[0], this._rB[1], this._rB[2], _vb);
      return (_vb[0] - _va[0]) * u[0] + (_vb[1] - _va[1]) * u[1] + (_vb[2] - _va[2]) * u[2];
    }
    _solve(pseudo) {
      for (const row of this._rows) {
        if (!row.on) continue;
        if (!pseudo) {
          const cdot = this._cdot(false);
          let lambda;
          if (row.rod) {
            lambda = -cdot * this._invK;
            row.acc += lambda;
          } else if (row.kind === "upper") {
            lambda = -(cdot - Math.max(row.slack, 0) / this._dt) * this._invK;
            const acc = Math.min(row.acc + lambda, 0);
            lambda = acc - row.acc;
            row.acc = acc;
          } else {
            lambda = -(cdot + Math.max(row.slack, 0) / this._dt) * this._invK;
            const acc = Math.max(row.acc + lambda, 0);
            lambda = acc - row.acc;
            row.acc = acc;
          }
          this._apply(lambda, false);
        } else {
          const c = row.kind === "upper" ? this._length - this.maxLength : this._length - this.minLength;
          if (!row.rod && (row.kind === "upper" && c <= 0 || row.kind === "lower" && c >= 0)) continue;
          const target = -this._biasScale(Math.abs(c)) * c;
          this._apply((target - this._cdot(true)) * this._invK, true);
        }
      }
    }
  };

  // src/renderer/WebGLState.js
  var WebGLState = class {
    constructor(gl) {
      this.gl = gl;
      this.reset();
    }
    /** Re-establishes the baseline; also used after a context is restored. */
    reset() {
      const gl = this.gl;
      this._depthTest = false;
      this._depthMask = true;
      this._cullMode = 0;
      this._blend = false;
      gl.depthFunc(gl.LEQUAL);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.frontFace(gl.CCW);
      this.resetBindings();
    }
    /** Forgets the bound program/VAO (call at the start of a frame; other code may have changed them). */
    resetBindings() {
      this._program = null;
      this._vao = null;
    }
    setDepthTest(enabled) {
      if (enabled === this._depthTest) return;
      if (enabled) this.gl.enable(this.gl.DEPTH_TEST);
      else this.gl.disable(this.gl.DEPTH_TEST);
      this._depthTest = enabled;
    }
    setDepthMask(enabled) {
      if (enabled === this._depthMask) return;
      this.gl.depthMask(enabled);
      this._depthMask = enabled;
    }
    setBlending(enabled) {
      if (enabled === this._blend) return;
      if (enabled) this.gl.enable(this.gl.BLEND);
      else this.gl.disable(this.gl.BLEND);
      this._blend = enabled;
    }
    /** FrontSide culls back faces, BackSide culls front faces, DoubleSide disables culling. */
    setSide(side) {
      const gl = this.gl;
      const mode = side === DoubleSide ? 0 : side === BackSide ? gl.FRONT : gl.BACK;
      if (mode === this._cullMode) return;
      if (mode === 0) {
        gl.disable(gl.CULL_FACE);
      } else {
        if (this._cullMode === 0) gl.enable(gl.CULL_FACE);
        gl.cullFace(mode);
      }
      this._cullMode = mode;
    }
    useProgram(program) {
      if (program === this._program) return;
      this.gl.useProgram(program);
      this._program = program;
    }
    bindVertexArray(vao) {
      if (vao === this._vao) return;
      this.gl.bindVertexArray(vao);
      this._vao = vao;
    }
  };

  // src/renderer/WebGLProgram.js
  var SOURCE_CONTEXT_LINES = 2;
  function describeSource(source, log) {
    const match = /ERROR:\s*\d+:(\d+)/.exec(log);
    if (match === null) return "";
    const lines = source.split("\n");
    const errorLine = Number(match[1]);
    if (errorLine < 1 || errorLine > lines.length) return "";
    const first = Math.max(1, errorLine - SOURCE_CONTEXT_LINES);
    const last = Math.min(lines.length, errorLine + SOURCE_CONTEXT_LINES);
    const numberWidth = String(last).length;
    let excerpt = "";
    for (let n = first; n <= last; n++) {
      const marker = n === errorLine ? ">" : " ";
      excerpt += `
${marker} ${String(n).padStart(numberWidth)} | ${lines[n - 1]}`;
    }
    return `

Source:${excerpt}`;
  }
  function formatLog(log) {
    return (log || "").replace(/\u0000/g, "").trim() || "(the driver provided no log)";
  }
  function compileShader(gl, type, source, programName = "unnamed") {
    const kind = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
    const shader = gl.createShader(type);
    if (shader === null) {
      throw new Error(
        `Prism.js: Failed to create a ${kind} shader object.

The WebGL context may have been lost.

Program:
${programName}`
      );
    }
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = formatLog(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      throw new Error(
        `Prism.js: Failed to compile ${kind} shader.

WebGL error:
${log}

Program:
${programName}${describeSource(source, log)}`
      );
    }
    return shader;
  }
  var WebGLProgram = class {
    /**
     * @param {WebGL2RenderingContext} gl
     * @param {{ vertexShader: string, fragmentShader: string, name?: string }} options
     *        Shader sources must be GLSL ES 3.00 and start with `#version 300 es`.
     */
    constructor(gl, { vertexShader, fragmentShader, name = "unnamed" } = {}) {
      if (typeof vertexShader !== "string" || typeof fragmentShader !== "string") {
        throw new TypeError(
          "Prism.js: WebGLProgram requires `vertexShader` and `fragmentShader` source strings."
        );
      }
      this.gl = gl;
      this.name = name;
      this.program = null;
      this._uniformLocations = /* @__PURE__ */ new Map();
      this._attributeLocations = /* @__PURE__ */ new Map();
      const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShader, name);
      let fragment;
      try {
        fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader, name);
      } catch (error) {
        gl.deleteShader(vertex);
        throw error;
      }
      const program = gl.createProgram();
      if (program === null) {
        gl.deleteShader(vertex);
        gl.deleteShader(fragment);
        throw new Error(
          `Prism.js: Failed to create a program object.

The WebGL context may have been lost.

Program:
${name}`
        );
      }
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
      const log = linked ? "" : formatLog(gl.getProgramInfoLog(program));
      gl.detachShader(program, vertex);
      gl.detachShader(program, fragment);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!linked) {
        gl.deleteProgram(program);
        throw new Error(
          `Prism.js: Failed to link shader program.

WebGL error:
${log}

Program:
${name}`
        );
      }
      this.program = program;
    }
    /** Makes this program current. */
    use() {
      this._assertAlive();
      this.gl.useProgram(this.program);
    }
    /**
     * Cached uniform lookup. Returns null for uniforms that do not exist or were
     * optimised out by the driver (null results are cached too).
     */
    getUniformLocation(name) {
      this._assertAlive();
      let location = this._uniformLocations.get(name);
      if (location === void 0) {
        location = this.gl.getUniformLocation(this.program, name);
        this._uniformLocations.set(name, location);
      }
      return location;
    }
    /** Cached attribute lookup. Returns -1 when the attribute is not active. */
    getAttributeLocation(name) {
      this._assertAlive();
      let location = this._attributeLocations.get(name);
      if (location === void 0) {
        location = this.gl.getAttribLocation(this.program, name);
        this._attributeLocations.set(name, location);
      }
      return location;
    }
    /** Releases the GPU program. Safe to call more than once. */
    dispose() {
      if (this.program === null) return;
      this.gl.deleteProgram(this.program);
      this.program = null;
      this._uniformLocations.clear();
      this._attributeLocations.clear();
    }
    _assertAlive() {
      if (this.program === null) {
        throw new Error(`Prism.js: WebGLProgram "${this.name}" has been disposed.`);
      }
    }
  };

  // src/renderer/shaders/basic.js
  var basicShader = {
    uniforms: ["uModelViewMatrix", "uProjectionMatrix", "uColor", "uMap"],
    usesNormalMatrix: false,
    supportsMap: true,
    // compiled again with USE_MAP when material.map is set
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
      cache.r = c.r;
      cache.g = c.g;
      cache.b = c.b;
      cache.a = a;
    }
  };

  // src/renderer/shaders/normal.js
  var normalShader = {
    uniforms: ["uModelViewMatrix", "uProjectionMatrix", "uNormalMatrix", "uOpacity"],
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

  // src/renderer/WebGLLights.js
  var MAX_DIRECTIONAL_LIGHTS = 4;
  var MAX_POINT_LIGHTS = 4;
  var _a = new Vector3();
  var _b = new Vector3();
  var WebGLLights = class {
    constructor() {
      this.ambient = new Float32Array(3);
      this.directionalCount = 0;
      this.directionalDirection = new Float32Array(MAX_DIRECTIONAL_LIGHTS * 3);
      this.directionalColor = new Float32Array(MAX_DIRECTIONAL_LIGHTS * 3);
      this.pointCount = 0;
      this.pointPosition = new Float32Array(MAX_POINT_LIGHTS * 3);
      this.pointColor = new Float32Array(MAX_POINT_LIGHTS * 3);
      this.pointParams = new Float32Array(MAX_POINT_LIGHTS * 2);
      this.count = 0;
      this._warned = false;
    }
    reset() {
      this.ambient.fill(0);
      this.directionalCount = 0;
      this.pointCount = 0;
      this.count = 0;
    }
    /** @param {Matrix4} view The camera's world -> view matrix. */
    add(light, view) {
      const color = light.color, k = light.intensity;
      if (light.isAmbientLight) {
        this.ambient[0] += color.r * k;
        this.ambient[1] += color.g * k;
        this.ambient[2] += color.b * k;
      } else if (light.isDirectionalLight) {
        const i = this.directionalCount;
        if (i >= MAX_DIRECTIONAL_LIGHTS) return this._overflow("DirectionalLights", MAX_DIRECTIONAL_LIGHTS);
        _a.setFromMatrixPosition(light.matrixWorld);
        light.target.updateWorldMatrix(true);
        _b.setFromMatrixPosition(light.target.matrixWorld);
        _a.sub(_b);
        if (_a.lengthSq() === 0) _a.set(0, 1, 0);
        _a.normalize().transformDirection(view).toArray(this.directionalDirection, i * 3);
        this.directionalColor[i * 3] = color.r * k;
        this.directionalColor[i * 3 + 1] = color.g * k;
        this.directionalColor[i * 3 + 2] = color.b * k;
        this.directionalCount++;
      } else if (light.isPointLight) {
        const i = this.pointCount;
        if (i >= MAX_POINT_LIGHTS) return this._overflow("PointLights", MAX_POINT_LIGHTS);
        _a.setFromMatrixPosition(light.matrixWorld).applyMatrix4(view).toArray(this.pointPosition, i * 3);
        this.pointColor[i * 3] = color.r * k;
        this.pointColor[i * 3 + 1] = color.g * k;
        this.pointColor[i * 3 + 2] = color.b * k;
        this.pointParams[i * 2] = light.distance;
        this.pointParams[i * 2 + 1] = light.decay;
        this.pointCount++;
      } else {
        throw new TypeError(
          `Prism.js: Unsupported light type "${light.constructor.name}". Use AmbientLight, DirectionalLight or PointLight.`
        );
      }
      this.count++;
    }
    upload(gl, locations) {
      gl.uniform3fv(locations.uAmbientColor, this.ambient);
      gl.uniform1i(locations.uDirCount, this.directionalCount);
      gl.uniform3fv(locations.uDirDirection, this.directionalDirection);
      gl.uniform3fv(locations.uDirColor, this.directionalColor);
      gl.uniform1i(locations.uPointCount, this.pointCount);
      gl.uniform3fv(locations.uPointPosition, this.pointPosition);
      gl.uniform3fv(locations.uPointColor, this.pointColor);
      gl.uniform2fv(locations.uPointParams, this.pointParams);
    }
    _overflow(name, max) {
      if (!this._warned) {
        this._warned = true;
        console.warn(`Prism.js: Only the first ${max} ${name} are used; additional ones are ignored.`);
      }
    }
  };

  // src/renderer/shaders/lambert.js
  var lambertShader = {
    uniforms: [
      "uModelViewMatrix",
      "uProjectionMatrix",
      "uNormalMatrix",
      "uColor",
      "uMap",
      "uAmbientColor",
      "uDirCount",
      "uDirDirection",
      "uDirColor",
      "uPointCount",
      "uPointPosition",
      "uPointColor",
      "uPointParams"
    ],
    usesNormalMatrix: true,
    usesLights: true,
    requiresNormals: true,
    supportsMap: true,
    supportsInstancing: true,
    supportsInstanceColor: true,
    vertexShader: `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
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
uniform mat3 uNormalMatrix;
out vec3 vNormal;
out vec3 vViewPosition;
void main() {
#ifdef USE_MAP
	vUv = aUv;
#endif
#ifdef USE_INSTANCE_COLOR
	vInstanceColor = aInstanceColor;
#endif
	mat4 modelView = uModelViewMatrix;
	mat3 normalMatrix = uNormalMatrix;
#ifdef USE_INSTANCING
	modelView = uModelViewMatrix * aInstanceMatrix;
	normalMatrix = transpose(inverse(mat3(modelView)));
#endif
	vec4 viewPosition = modelView * vec4(aPosition, 1.0);
	vNormal = normalMatrix * aNormal;
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
#ifdef USE_INSTANCE_COLOR
in vec3 vInstanceColor;
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
#ifdef USE_INSTANCE_COLOR
	base.rgb *= vInstanceColor;
#endif
	outColor = vec4(base.rgb * light, base.a);
}`,
    /** `cache` remembers what this program last received, so unchanged colors cost no GL call. */
    uploadMaterial(gl, locations, material, cache) {
      const c = material.color, a = material.opacity;
      if (cache.r === c.r && cache.g === c.g && cache.b === c.b && cache.a === a) return;
      gl.uniform4f(locations.uColor, c.r, c.g, c.b, a);
      cache.r = c.r;
      cache.g = c.g;
      cache.b = c.b;
      cache.a = a;
    }
  };

  // src/renderer/WebGLPrograms.js
  var SHADER_LIBRARY = {
    BasicMaterial: basicShader,
    NormalMaterial: normalShader,
    LambertMaterial: lambertShader
  };
  function withDefines(source, defines) {
    if (defines.length === 0) return source;
    const newline = source.indexOf("\n");
    return `${source.slice(0, newline + 1)}${defines.map((d) => `#define ${d}
`).join("")}${source.slice(newline + 1)}`;
  }
  var WebGLPrograms = class {
    constructor(gl, info) {
      this.gl = gl;
      this.info = info;
      this._entries = /* @__PURE__ */ new Map();
    }
    /** @param {{ instanced?: boolean, instanceColor?: boolean }} [flags] set for InstancedMesh draws */
    get(material, flags = {}) {
      const definition = SHADER_LIBRARY[material.type];
      const useMap = definition !== void 0 && definition.supportsMap === true && Boolean(material.map);
      const instanced = flags.instanced === true, instanceColor = instanced && flags.instanceColor === true;
      if (definition !== void 0) {
        if (instanced && !definition.supportsInstancing) throw new Error(`Prism.js: ${material.type} cannot be used with an InstancedMesh.`);
        if (instanceColor && !definition.supportsInstanceColor) throw new Error(`Prism.js: ${material.type} does not support per-instance colors; use BasicMaterial or LambertMaterial.`);
      }
      const key = material.type + (useMap ? ":map" : "") + (instanced ? ":inst" : "") + (instanceColor ? ":icol" : "");
      let entry = this._entries.get(key);
      if (entry === void 0) {
        if (definition === void 0) {
          throw new Error(
            `Prism.js: No shader is available for material type "${material.type}".

Built-in material types: ${Object.keys(SHADER_LIBRARY).join(", ")}.`
          );
        }
        const defines = [];
        if (useMap) defines.push("USE_MAP");
        if (instanced) defines.push("USE_INSTANCING");
        if (instanceColor) defines.push("USE_INSTANCE_COLOR");
        const program = new WebGLProgram(this.gl, {
          name: key,
          vertexShader: withDefines(definition.vertexShader, defines),
          fragmentShader: withDefines(definition.fragmentShader, defines)
        });
        const locations = /* @__PURE__ */ Object.create(null);
        for (const name of definition.uniforms) locations[name] = program.getUniformLocation(name);
        entry = { program, definition, locations, frame: -1, lightsFrame: -1, cache: {}, samplerSet: false };
        this._entries.set(key, entry);
        this.info.memory.programs = this._entries.size;
      }
      return entry;
    }
    /** Forgets all programs without deleting them (their GL objects died with a lost context). */
    clear() {
      this._entries.clear();
      this.info.memory.programs = 0;
    }
    dispose() {
      for (const entry of this._entries.values()) entry.program.dispose();
      this.clear();
    }
  };

  // src/renderer/WebGLGeometries.js
  var ATTRIBUTE_LOCATIONS = { position: 0, normal: 1, uv: 2, color: 3 };
  var MAX_DEDUP_VERTICES = 67108864;
  var MAX_UINT16_INDEX2 = 65534;
  function glTypeOf(gl, array, what) {
    if (array instanceof Float32Array) return gl.FLOAT;
    if (array instanceof Uint8Array) return gl.UNSIGNED_BYTE;
    if (array instanceof Int8Array) return gl.BYTE;
    if (array instanceof Uint16Array) return gl.UNSIGNED_SHORT;
    if (array instanceof Int16Array) return gl.SHORT;
    if (array instanceof Uint32Array) return gl.UNSIGNED_INT;
    if (array instanceof Int32Array) return gl.INT;
    throw new TypeError(`Prism.js: Unsupported array type ${array.constructor.name} for ${what}.`);
  }
  function buildWireframeIndices(geometry) {
    const source = geometry.index ? geometry.index.array : null;
    const n = geometry.vertexCount;
    const seen = n < MAX_DEDUP_VERTICES ? /* @__PURE__ */ new Set() : null;
    const lines = [];
    const edge = (a, b) => {
      if (seen !== null) {
        const key = (a < b ? a : b) * n + (a < b ? b : a);
        if (seen.has(key)) return;
        seen.add(key);
      }
      lines.push(a, b);
    };
    const triangles = geometry.drawCount / 3;
    for (let t = 0; t < triangles; t++) {
      const a = source ? source[t * 3] : t * 3;
      const b = source ? source[t * 3 + 1] : t * 3 + 1;
      const c = source ? source[t * 3 + 2] : t * 3 + 2;
      edge(a, b);
      edge(b, c);
      edge(c, a);
    }
    return n > MAX_UINT16_INDEX2 ? new Uint32Array(lines) : new Uint16Array(lines);
  }
  var WebGLGeometries = class {
    constructor(gl, state, info) {
      this.gl = gl;
      this.state = state;
      this.info = info;
      this._records = /* @__PURE__ */ new Map();
      this._instanced = /* @__PURE__ */ new Map();
      this._ids = /* @__PURE__ */ new WeakMap();
      this._onGeometryDispose = (geometry) => this.release(geometry);
      this._onInstancedDispose = (mesh) => this.releaseInstanced(mesh);
    }
    /** Returns the up-to-date GPU record for `geometry`, uploading what changed. */
    get(geometry) {
      if (!geometry.attributes.position) {
        throw new Error('Prism.js: Cannot draw a geometry without a "position" attribute.');
      }
      let record = this._records.get(geometry);
      if (record === void 0) {
        record = {
          vao: this.gl.createVertexArray(),
          buffers: /* @__PURE__ */ new Map(),
          indexBuffer: null,
          indexVersion: -1,
          indexType: 0,
          indexCount: 0,
          wire: null
        };
        this._records.set(geometry, record);
        geometry.addDisposeListener(this._onGeometryDispose);
        this.info.memory.geometries = this._records.size;
      }
      this._update(record, geometry);
      return record;
    }
    _update(record, geometry) {
      const gl = this.gl;
      this.state.bindVertexArray(record.vao);
      for (const name of Object.keys(geometry.attributes)) {
        const location = ATTRIBUTE_LOCATIONS[name];
        if (location === void 0) continue;
        const attribute = geometry.attributes[name];
        const usage = attribute.usage === "dynamic" ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW;
        let entry = record.buffers.get(name);
        if (entry === void 0) {
          entry = { buffer: gl.createBuffer(), version: attribute.version, byteLength: attribute.array.byteLength, attribute };
          record.buffers.set(name, entry);
          gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
          gl.bufferData(gl.ARRAY_BUFFER, attribute.array, usage);
          this._pointAt(location, attribute);
        } else if (entry.attribute !== attribute || entry.version !== attribute.version) {
          gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
          if (entry.attribute === attribute && entry.byteLength === attribute.array.byteLength) {
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, attribute.array);
          } else {
            gl.bufferData(gl.ARRAY_BUFFER, attribute.array, usage);
            entry.byteLength = attribute.array.byteLength;
          }
          if (entry.attribute !== attribute) this._pointAt(location, attribute);
          entry.attribute = attribute;
          entry.version = attribute.version;
        }
      }
      const index = geometry.index;
      if (index !== null) {
        if (record.indexBuffer === null) record.indexBuffer = gl.createBuffer();
        if (record.indexVersion !== index.version || record.indexSource !== index) {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, record.indexBuffer);
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, index.array, gl.STATIC_DRAW);
          record.indexType = glTypeOf(gl, index.array, "index");
          if (record.indexType !== gl.UNSIGNED_SHORT && record.indexType !== gl.UNSIGNED_INT) {
            throw new TypeError("Prism.js: Geometry index must be a Uint16Array or Uint32Array.");
          }
          record.indexCount = index.count;
          record.indexVersion = index.version;
          record.indexSource = index;
          this._releaseWireframe(record);
        }
      } else if (record.indexBuffer !== null) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.deleteBuffer(record.indexBuffer);
        record.indexBuffer = null;
        record.indexVersion = -1;
        record.indexSource = null;
        this._releaseWireframe(record);
      }
    }
    _pointAt(location, attribute) {
      const gl = this.gl;
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, attribute.itemSize, glTypeOf(gl, attribute.array, "vertex attribute"), attribute.normalized, 0, 0);
    }
    /** GPU line list for wireframe drawing, rebuilt only when the index or vertex count changed. */
    getWireframe(record, geometry) {
      const n = geometry.vertexCount;
      const index = geometry.index;
      const wire = record.wire;
      if (wire !== null && wire.source === index && wire.version === (index ? index.version : -1) && wire.vertexCount === n) {
        return wire;
      }
      this._releaseWireframe(record);
      const gl = this.gl;
      const lines = buildWireframeIndices(geometry);
      const vao = gl.createVertexArray();
      this.state.bindVertexArray(vao);
      for (const [name, entry] of record.buffers) {
        gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
        this._pointAt(ATTRIBUTE_LOCATIONS[name], entry.attribute);
      }
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lines, gl.STATIC_DRAW);
      record.wire = {
        vao,
        buffer,
        count: lines.length,
        type: lines instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
        source: index,
        version: index ? index.version : -1,
        vertexCount: n
      };
      return record.wire;
    }
    _releaseWireframe(record) {
      if (record.wire === null) return;
      this.gl.deleteVertexArray(record.wire.vao);
      this.gl.deleteBuffer(record.wire.buffer);
      record.wire = null;
    }
    /**
     * GPU state for an InstancedMesh: a VAO that combines the geometry's buffers with the per-instance
     * matrix (locations 4-7) and optional color (location 8) buffers. Instance data is uploaded again
     * only when its `version` changes; the VAO is rebuilt only when the geometry's buffers were replaced
     * or the instance color appeared/disappeared.
     */
    getInstanced(mesh, record) {
      const gl = this.gl;
      let r = this._instanced.get(mesh);
      if (r === void 0) {
        r = { vao: gl.createVertexArray(), matrixBuffer: gl.createBuffer(), colorBuffer: null, matrixVersion: -1, colorVersion: -1, signature: "" };
        this._instanced.set(mesh, r);
        mesh.addDisposeListener(this._onInstancedDispose);
      }
      const colors = mesh.instanceColor;
      if (colors !== null && r.colorBuffer === null) r.colorBuffer = gl.createBuffer();
      const matrices = mesh.instanceMatrix;
      gl.bindBuffer(gl.ARRAY_BUFFER, r.matrixBuffer);
      if (r.matrixVersion === -1) gl.bufferData(gl.ARRAY_BUFFER, matrices.array, gl.DYNAMIC_DRAW);
      else if (r.matrixVersion !== matrices.version) gl.bufferSubData(gl.ARRAY_BUFFER, 0, matrices.array);
      r.matrixVersion = matrices.version;
      if (colors !== null) {
        gl.bindBuffer(gl.ARRAY_BUFFER, r.colorBuffer);
        if (r.colorVersion === -1) gl.bufferData(gl.ARRAY_BUFFER, colors.array, gl.DYNAMIC_DRAW);
        else if (r.colorVersion !== colors.version) gl.bufferSubData(gl.ARRAY_BUFFER, 0, colors.array);
        r.colorVersion = colors.version;
      }
      let signature = colors !== null ? "c" : "n";
      for (const entry of record.buffers.values()) signature += `|${this._bufferId(entry.buffer)}`;
      signature += `|i${record.indexBuffer === null ? 0 : this._bufferId(record.indexBuffer)}`;
      if (signature !== r.signature) {
        this.state.bindVertexArray(r.vao);
        for (const [name, entry] of record.buffers) {
          gl.bindBuffer(gl.ARRAY_BUFFER, entry.buffer);
          this._pointAt(ATTRIBUTE_LOCATIONS[name], entry.attribute);
        }
        if (record.indexBuffer !== null) gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, record.indexBuffer);
        gl.bindBuffer(gl.ARRAY_BUFFER, r.matrixBuffer);
        for (let i = 0; i < 4; i++) {
          gl.enableVertexAttribArray(4 + i);
          gl.vertexAttribPointer(4 + i, 4, gl.FLOAT, false, 64, i * 16);
          gl.vertexAttribDivisor(4 + i, 1);
        }
        if (colors !== null) {
          gl.bindBuffer(gl.ARRAY_BUFFER, r.colorBuffer);
          gl.enableVertexAttribArray(8);
          gl.vertexAttribPointer(8, 3, gl.FLOAT, false, 12, 0);
          gl.vertexAttribDivisor(8, 1);
        } else {
          gl.disableVertexAttribArray(8);
        }
        r.signature = signature;
      }
      return r;
    }
    /** Small integer identity for GL buffer objects, used to notice when a geometry's buffers were replaced. */
    _bufferId(buffer) {
      let id = this._ids.get(buffer);
      if (id === void 0) {
        id = this._ids.size + 1;
        this._ids.set(buffer, id);
      }
      return id;
    }
    releaseInstanced(mesh) {
      const r = this._instanced.get(mesh);
      if (r === void 0) return;
      const gl = this.gl;
      gl.deleteBuffer(r.matrixBuffer);
      if (r.colorBuffer !== null) gl.deleteBuffer(r.colorBuffer);
      gl.deleteVertexArray(r.vao);
      mesh.removeDisposeListener(this._onInstancedDispose);
      this._instanced.delete(mesh);
      this.state.resetBindings();
    }
    /** Frees the GPU copy of one geometry (it is re-uploaded if drawn again). */
    release(geometry) {
      const record = this._records.get(geometry);
      if (record === void 0) return;
      const gl = this.gl;
      for (const entry of record.buffers.values()) gl.deleteBuffer(entry.buffer);
      if (record.indexBuffer !== null) gl.deleteBuffer(record.indexBuffer);
      this._releaseWireframe(record);
      gl.deleteVertexArray(record.vao);
      geometry.removeDisposeListener(this._onGeometryDispose);
      this._records.delete(geometry);
      for (const r of this._instanced.values()) r.signature = "";
      this.info.memory.geometries = this._records.size;
      this.state.resetBindings();
    }
    /** Forgets all records without deleting GL objects (they died with a lost context). */
    clear() {
      this._records.clear();
      this._instanced.clear();
      this.info.memory.geometries = 0;
    }
    dispose() {
      for (const mesh of [...this._instanced.keys()]) this.releaseInstanced(mesh);
      for (const geometry of [...this._records.keys()]) this.release(geometry);
    }
  };

  // src/renderer/RenderList.js
  var RenderItem = class {
    constructor() {
      this.mesh = null;
      this.geometry = null;
      this.material = null;
      this.modelView = new Matrix4();
      this.depth = 0;
    }
  };
  function sortOpaque(a, b) {
    if (a.material.type !== b.material.type) return a.material.type < b.material.type ? -1 : 1;
    if (a.material.id !== b.material.id) return a.material.id - b.material.id;
    return a.depth - b.depth;
  }
  function sortTransparent(a, b) {
    return b.depth - a.depth;
  }
  var RenderList = class {
    constructor() {
      this.opaque = [];
      this.transparent = [];
      this._pool = [];
      this._used = 0;
    }
    reset() {
      this._used = 0;
      this.opaque.length = 0;
      this.transparent.length = 0;
    }
    push(mesh, geometry, material) {
      let item = this._pool[this._used];
      if (item === void 0) item = this._pool[this._used] = new RenderItem();
      this._used++;
      item.mesh = mesh;
      item.geometry = geometry;
      item.material = material;
      (material.transparent || material.opacity < 1 ? this.transparent : this.opaque).push(item);
      return item;
    }
    sort() {
      this.opaque.sort(sortOpaque);
      this.transparent.sort(sortTransparent);
    }
  };

  // src/renderer/WebGLTextures.js
  var WHITE_PIXEL = new Uint8Array([255, 255, 255, 255]);
  function isMipmapFilter(filter) {
    return filter >= 9984 && filter <= 9987;
  }
  function isImageReady(image) {
    if (!image) return false;
    if (image.data) return image.width > 0 && image.height > 0;
    if (image.complete === false) return false;
    const width = image.naturalWidth ?? image.videoWidth ?? image.width;
    return width > 0;
  }
  var WebGLTextures = class {
    constructor(gl, info) {
      this.gl = gl;
      this.info = info;
      this._records = /* @__PURE__ */ new Map();
      this._bound = null;
      this._maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      this._onTextureDispose = (texture) => this.release(texture);
    }
    /** Forget what is bound (other code may have changed it) and select unit 0. */
    resetBindings() {
      this._bound = null;
      this.gl.activeTexture(this.gl.TEXTURE0);
    }
    /** Binds `texture` to unit 0, uploading or refreshing it first if needed. */
    bind(texture) {
      const gl = this.gl;
      const record = this._get(texture);
      if (this._bound !== record.glTexture) {
        gl.bindTexture(gl.TEXTURE_2D, record.glTexture);
        this._bound = record.glTexture;
      }
    }
    _get(texture) {
      let record = this._records.get(texture);
      if (record === void 0) {
        record = { glTexture: this.gl.createTexture(), version: -1, ready: false };
        this._records.set(texture, record);
        texture.addDisposeListener(this._onTextureDispose);
        this.info.memory.textures = this._records.size;
      }
      if (isImageReady(texture.image)) {
        if (!record.ready || record.version !== texture.version) this._upload(record, texture);
      } else if (record.version === -1) {
        this._uploadPlaceholder(record);
      }
      return record;
    }
    _bindForUpload(record) {
      this.gl.bindTexture(this.gl.TEXTURE_2D, record.glTexture);
      this._bound = record.glTexture;
    }
    _uploadPlaceholder(record) {
      const gl = this.gl;
      this._bindForUpload(record);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, WHITE_PIXEL);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      record.version = 0;
      record.ready = false;
    }
    _upload(record, texture) {
      const gl = this.gl, image = texture.image;
      const width = image.data ? image.width : image.naturalWidth ?? image.videoWidth ?? image.width;
      const height = image.data ? image.height : image.naturalHeight ?? image.videoHeight ?? image.height;
      if (width > this._maxSize || height > this._maxSize) {
        throw new Error(
          `Prism.js: Texture "${texture.name || texture.id}" is ${width}x${height}, larger than this device's maximum texture size (${this._maxSize}). Resize the image.`
        );
      }
      this._bindForUpload(record);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
      if (image.data) {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image.data);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      }
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texture.wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texture.wrapT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.magFilter);
      const minFilter = !texture.generateMipmaps && isMipmapFilter(texture.minFilter) ? gl.LINEAR : texture.minFilter;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
      if (texture.generateMipmaps) gl.generateMipmap(gl.TEXTURE_2D);
      record.version = texture.version;
      record.ready = true;
    }
    /** Frees the GPU copy of one texture. */
    release(texture) {
      const record = this._records.get(texture);
      if (record === void 0) return;
      if (this._bound === record.glTexture) this._bound = null;
      this.gl.deleteTexture(record.glTexture);
      texture.removeDisposeListener(this._onTextureDispose);
      this._records.delete(texture);
      this.info.memory.textures = this._records.size;
    }
    /** Forgets all records without deleting GL objects (they died with a lost context). */
    clear() {
      this._records.clear();
      this._bound = null;
      this.info.memory.textures = 0;
    }
    dispose() {
      for (const texture of [...this._records.keys()]) this.release(texture);
    }
  };

  // src/renderer/Renderer.js
  function createCanvas() {
    if (typeof document === "undefined") {
      throw new Error(
        "Prism.js: No `canvas` option was given and `document` is not available to create one."
      );
    }
    return document.createElement("canvas");
  }
  function assertPositive3(name, value) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new RangeError(`Prism.js: ${name} must be a positive finite number, received ${String(value)}.`);
    }
  }
  var Renderer = class {
    /**
     * @param {object} [options]
     * @param {HTMLCanvasElement} [options.canvas] Created when omitted; see `domElement`.
     * @param {boolean} [options.alpha=false] Canvas has an alpha channel (page shows through).
     * @param {boolean} [options.antialias=true]
     * @param {boolean} [options.depth=true]
     * @param {boolean} [options.stencil=false]
     * @param {'default'|'low-power'|'high-performance'} [options.powerPreference='default']
     * @param {boolean} [options.preserveDrawingBuffer=false]
     * @param {number} [options.pixelRatio=devicePixelRatio] Drawing-buffer pixels per CSS pixel.
     */
    constructor(options = {}) {
      const {
        canvas = createCanvas(),
        alpha = false,
        antialias = true,
        depth = true,
        stencil = false,
        powerPreference = "default",
        preserveDrawingBuffer = false,
        pixelRatio = globalThis.devicePixelRatio ?? 1
      } = options;
      if (canvas === null || typeof canvas !== "object" || typeof canvas.getContext !== "function") {
        throw new TypeError("Prism.js: The `canvas` option must be an HTMLCanvasElement.");
      }
      assertPositive3("pixelRatio", pixelRatio);
      this.domElement = canvas;
      this.gl = this._createContext(canvas, {
        alpha,
        antialias,
        depth,
        stencil,
        powerPreference,
        preserveDrawingBuffer
      });
      const gl = this.gl;
      this.capabilities = Object.freeze({
        glVersion: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxVertexAttributes: gl.getParameter(gl.MAX_VERTEX_ATTRIBS)
      });
      this.info = {
        render: { frame: 0, calls: 0, triangles: 0, lines: 0, lights: 0, culled: 0, instances: 0 },
        memory: { geometries: 0, programs: 0, textures: 0 }
      };
      this.autoClear = true;
      this.width = canvas.width / pixelRatio;
      this.height = canvas.height / pixelRatio;
      this.contextLost = false;
      this._pixelRatio = pixelRatio;
      this._clearColor = [0, 0, 0, 1];
      this._appliedClear = [NaN, NaN, NaN, NaN];
      this._disposed = false;
      this.state = new WebGLState(gl);
      this._programs = new WebGLPrograms(gl, this.info);
      this._geometries = new WebGLGeometries(gl, this.state, this.info);
      this._list = new RenderList();
      this._lights = new WebGLLights();
      this._textures = new WebGLTextures(gl, this.info);
      this._colorScratch = new Color();
      this._normalMatrix = new Matrix3();
      this._viewProjection = new Matrix4();
      this._frustum = new Frustum();
      this._projectionArray = new Float32Array(16);
      this._modelViewArray = new Float32Array(16);
      this._normalArray = new Float32Array(9);
      this._onContextLost = (event) => {
        event.preventDefault();
        this.contextLost = true;
        console.warn(
          "Prism.js: WebGL context lost. Engine-managed GPU resources are rebuilt automatically on restore; resources you created with raw gl calls must be recreated by you."
        );
      };
      this._onContextRestored = () => {
        this.contextLost = false;
        this._programs.clear();
        this._geometries.clear();
        this._textures.clear();
        this.state.reset();
        this._applyState();
        console.info("Prism.js: WebGL context restored.");
      };
      canvas.addEventListener("webglcontextlost", this._onContextLost, false);
      canvas.addEventListener("webglcontextrestored", this._onContextRestored, false);
      this._applyState();
    }
    get pixelRatio() {
      return this._pixelRatio;
    }
    /** Changes drawing-buffer pixels per CSS pixel and resizes the buffer to match. */
    setPixelRatio(pixelRatio) {
      this._assertAlive();
      assertPositive3("pixelRatio", pixelRatio);
      this._pixelRatio = pixelRatio;
      this.setSize(this.width, this.height, false);
    }
    /**
     * Sets the canvas size in CSS pixels and updates the viewport.
     * @param {boolean} [updateStyle=true] Also set `canvas.style.width/height`.
     */
    setSize(width, height, updateStyle = true) {
      this._assertAlive();
      assertPositive3("width", width);
      assertPositive3("height", height);
      const canvas = this.domElement;
      this.width = width;
      this.height = height;
      canvas.width = Math.floor(width * this._pixelRatio);
      canvas.height = Math.floor(height * this._pixelRatio);
      if (updateStyle && canvas.style) {
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
      this._applyViewport();
    }
    /**
     * For CSS-sized canvases: matches the drawing buffer to the canvas's displayed
     * size. Cheap when nothing changed, so it is safe to call every frame.
     * @returns {boolean} true if the drawing buffer was resized.
     */
    resizeToDisplaySize() {
      this._assertAlive();
      const canvas = this.domElement;
      const cssWidth = canvas.clientWidth ?? 0;
      const cssHeight = canvas.clientHeight ?? 0;
      if (cssWidth === 0 || cssHeight === 0) return false;
      const bufferWidth = Math.floor(cssWidth * this._pixelRatio);
      const bufferHeight = Math.floor(cssHeight * this._pixelRatio);
      if (canvas.width === bufferWidth && canvas.height === bufferHeight) return false;
      this.setSize(cssWidth, cssHeight, false);
      return true;
    }
    /**
     * @param {number|string|Color} color 0xRRGGBB, '#rrggbb' or a Color.
     * @param {number} [alpha=1]
     */
    setClearColor(color, alpha = 1) {
      this._assertAlive();
      this._colorScratch.set(color);
      if (!(alpha >= 0 && alpha <= 1)) {
        throw new RangeError(`Prism.js: Clear alpha must be between 0 and 1, received ${String(alpha)}.`);
      }
      const c = this._clearColor;
      c[0] = this._colorScratch.r;
      c[1] = this._colorScratch.g;
      c[2] = this._colorScratch.b;
      c[3] = alpha;
      this._applyClearColor(c[0], c[1], c[2], c[3]);
    }
    /** Clears the selected buffers of the current framebuffer using the renderer's clear color. */
    clear(color = true, depth = true, stencil = false) {
      this._assertAlive();
      const gl = this.gl;
      const c = this._clearColor;
      this._applyClearColor(c[0], c[1], c[2], c[3]);
      let mask = 0;
      if (color) mask |= gl.COLOR_BUFFER_BIT;
      if (depth) {
        mask |= gl.DEPTH_BUFFER_BIT;
        this.state.setDepthMask(true);
      }
      if (stencil) mask |= gl.STENCIL_BUFFER_BIT;
      if (mask !== 0) gl.clear(mask);
    }
    /**
     * Draws every visible Mesh in `scene` as seen by `camera`.
     * Opaque objects are grouped by material and drawn near to far; transparent
     * ones are drawn afterwards, far to near. World matrices are updated first.
     */
    render(scene, camera) {
      this._assertAlive();
      if (!scene || !scene.isScene) {
        throw new TypeError("Prism.js: Renderer.render(scene, camera) expects a Scene as its first argument.");
      }
      if (!camera || !camera.isCamera) {
        throw new TypeError("Prism.js: Renderer.render(scene, camera) expects a Camera as its second argument.");
      }
      if (this.contextLost) return;
      const gl = this.gl;
      const stats = this.info.render;
      stats.frame++;
      stats.calls = 0;
      stats.triangles = 0;
      stats.lines = 0;
      stats.culled = 0;
      stats.instances = 0;
      scene.updateMatrixWorld();
      if (camera.parent === null) camera.updateMatrixWorld();
      this._viewProjection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      this._frustum.setFromProjectionMatrix(this._viewProjection);
      this.state.resetBindings();
      this._textures.resetBindings();
      this._list.reset();
      this._lights.reset();
      this._collect(scene, camera);
      this._list.sort();
      stats.lights = this._lights.count;
      if (this.autoClear) {
        const bg = scene.background;
        if (bg) this._applyClearColor(bg.r, bg.g, bg.b, 1);
        else this._applyClearColor(this._clearColor[0], this._clearColor[1], this._clearColor[2], this._clearColor[3]);
        this.state.setDepthMask(true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }
      this._projectionArray.set(camera.projectionMatrix.elements);
      this._drawItems(this._list.opaque);
      this._drawItems(this._list.transparent);
    }
    /**
     * Releases everything the renderer created on the GPU (programs, geometry
     * buffers) and stops listening to the canvas. Geometries/materials you made
     * are not destroyed; they are re-uploaded if rendered by another renderer.
     */
    dispose() {
      if (this._disposed) return;
      this._disposed = true;
      this._geometries.dispose();
      this._textures.dispose();
      this._programs.dispose();
      this.domElement.removeEventListener("webglcontextlost", this._onContextLost, false);
      this.domElement.removeEventListener("webglcontextrestored", this._onContextRestored, false);
    }
    _collect(object, camera) {
      if (!object.visible) return;
      if (object.isLight) this._lights.add(object, camera.matrixWorldInverse);
      if (object.isMesh) {
        const material = object.material;
        if (!material || !material.isMaterial) {
          throw new TypeError(`Prism.js: Mesh "${object.name || object.id}" has no valid material.`);
        }
        if (!material.visible) {
        } else if (object.frustumCulled && !this._inFrustum(object)) {
          this.info.render.culled++;
        } else {
          const item = this._list.push(object, object.geometry, material);
          item.modelView.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
          item.depth = -item.modelView.elements[14];
        }
      }
      const children = object.children;
      for (let i = 0; i < children.length; i++) this._collect(children[i], camera);
    }
    /** Conservative visibility test of a mesh's world-space bounding sphere against the camera frustum. */
    _inFrustum(mesh) {
      const sphere = mesh.geometry.boundingSphere;
      if (sphere === null) return true;
      const e = mesh.matrixWorld.elements, c = sphere.center;
      return this._frustum.intersectsSphere(
        e[0] * c.x + e[4] * c.y + e[8] * c.z + e[12],
        e[1] * c.x + e[5] * c.y + e[9] * c.z + e[13],
        e[2] * c.x + e[6] * c.y + e[10] * c.z + e[14],
        sphere.radius * mesh.matrixWorld.getMaxScaleOnAxis()
      );
    }
    _drawItems(items) {
      const gl = this.gl, state = this.state, stats = this.info.render;
      const frame = stats.frame;
      for (let i = 0; i < items.length; i++) {
        const { geometry, material, modelView, mesh } = items[i];
        const instanced = mesh.isInstancedMesh === true;
        state.setDepthTest(material.depthTest);
        state.setDepthMask(material.depthWrite);
        state.setSide(material.side);
        state.setBlending(material.transparent || material.opacity < 1);
        const entry = this._programs.get(material, instanced ? { instanced: true, instanceColor: mesh.instanceColor !== null } : void 0);
        const locations = entry.locations;
        state.useProgram(entry.program.program);
        if (entry.frame !== frame) {
          gl.uniformMatrix4fv(locations.uProjectionMatrix, false, this._projectionArray);
          entry.frame = frame;
        }
        if (entry.definition.usesLights && entry.lightsFrame !== frame) {
          this._lights.upload(gl, locations);
          entry.lightsFrame = frame;
        }
        if (entry.definition.requiresNormals && geometry.attributes.normal === void 0) {
          throw new Error(
            `Prism.js: ${material.type} needs a "normal" attribute but the geometry has none.

Call geometry.computeVertexNormals() or use a built-in geometry.`
          );
        }
        this._modelViewArray.set(modelView.elements);
        gl.uniformMatrix4fv(locations.uModelViewMatrix, false, this._modelViewArray);
        if (entry.definition.usesNormalMatrix && !instanced) {
          this._normalMatrix.getNormalMatrix(modelView);
          this._normalArray.set(this._normalMatrix.elements);
          gl.uniformMatrix3fv(locations.uNormalMatrix, false, this._normalArray);
        }
        entry.definition.uploadMaterial(gl, locations, material, entry.cache);
        if (material.map && entry.definition.supportsMap) {
          if (geometry.attributes.uv === void 0) {
            throw new Error(
              `Prism.js: ${material.type} has a texture map but the geometry has no "uv" attribute.`
            );
          }
          this._textures.bind(material.map);
          if (!entry.samplerSet) {
            gl.uniform1i(locations.uMap, 0);
            entry.samplerSet = true;
          }
        }
        const record = this._geometries.get(geometry);
        if (instanced) {
          if (material.wireframe) throw new Error("Prism.js: InstancedMesh does not support wireframe materials.");
          const count = mesh.count;
          if (!Number.isInteger(count) || count < 0 || count > mesh.capacity) {
            throw new RangeError(`Prism.js: InstancedMesh.count must be an integer between 0 and its capacity (${mesh.capacity}), received ${String(count)}.`);
          }
          if (count === 0) continue;
          state.bindVertexArray(this._geometries.getInstanced(mesh, record).vao);
          if (record.indexBuffer !== null) {
            gl.drawElementsInstanced(gl.TRIANGLES, record.indexCount, record.indexType, 0, count);
            stats.triangles += record.indexCount / 3 * count;
          } else {
            gl.drawArraysInstanced(gl.TRIANGLES, 0, geometry.vertexCount, count);
            stats.triangles += geometry.vertexCount / 3 * count;
          }
          stats.instances += count;
          stats.calls++;
          continue;
        }
        if (material.wireframe) {
          const wire = this._geometries.getWireframe(record, geometry);
          state.bindVertexArray(wire.vao);
          gl.drawElements(gl.LINES, wire.count, wire.type, 0);
          stats.lines += wire.count / 2;
        } else {
          state.bindVertexArray(record.vao);
          if (record.indexBuffer !== null) {
            gl.drawElements(gl.TRIANGLES, record.indexCount, record.indexType, 0);
            stats.triangles += record.indexCount / 3;
          } else {
            gl.drawArrays(gl.TRIANGLES, 0, geometry.vertexCount);
            stats.triangles += geometry.vertexCount / 3;
          }
        }
        stats.calls++;
      }
    }
    _createContext(canvas, attributes) {
      let statusMessage = "";
      const onCreationError = (event) => {
        statusMessage = event.statusMessage || "";
      };
      canvas.addEventListener("webglcontextcreationerror", onCreationError, false);
      const gl = canvas.getContext("webgl2", attributes);
      canvas.removeEventListener("webglcontextcreationerror", onCreationError, false);
      if (gl === null) {
        throw new Error(
          'Prism.js: Failed to create a WebGL2 context.\n\nPossible causes: the browser or device does not support WebGL2, hardware acceleration is disabled, or the canvas already has a different context type (for example "2d").' + (statusMessage ? `

Browser message:
${statusMessage}` : "")
        );
      }
      return gl;
    }
    /** (Re)applies state that a fresh or restored context starts without. */
    _applyState() {
      this._appliedClear.fill(NaN);
      const c = this._clearColor;
      this._applyClearColor(c[0], c[1], c[2], c[3]);
      this._applyViewport();
    }
    _applyClearColor(r, g, b, a) {
      const applied = this._appliedClear;
      if (applied[0] === r && applied[1] === g && applied[2] === b && applied[3] === a) return;
      this.gl.clearColor(r, g, b, a);
      applied[0] = r;
      applied[1] = g;
      applied[2] = b;
      applied[3] = a;
    }
    _applyViewport() {
      const gl = this.gl;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    _assertAlive() {
      if (this._disposed) {
        throw new Error("Prism.js: Renderer has been disposed.");
      }
    }
  };
  return __toCommonJS(index_exports);
})();
//# sourceMappingURL=prism.js.map
