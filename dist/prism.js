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
    BasicMaterial: () => BasicMaterial,
    BoxGeometry: () => BoxGeometry,
    BoxShape: () => BoxShape,
    BufferAttribute: () => BufferAttribute,
    BufferGeometry: () => BufferGeometry,
    Camera: () => Camera,
    ClampToEdgeWrapping: () => ClampToEdgeWrapping,
    Color: () => Color,
    DEG2RAD: () => DEG2RAD,
    DirectionalLight: () => DirectionalLight,
    DoubleSide: () => DoubleSide,
    Euler: () => Euler,
    FrontSide: () => FrontSide,
    Group: () => Group,
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
    }
  };
  Mesh.prototype.isMesh = true;

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
  var KIND_SPHERE = 2;
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
     * @param {number} [options.linearDamping=0.01] fraction of speed lost per second
     * @param {number} [options.angularDamping=0.01]
     * @param {number} [options.gravityScale=1]
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
        linearDamping = 0.01,
        angularDamping = 0.01,
        gravityScale = 1,
        allowSleep = true,
        collisionGroup = 1,
        collisionMask = 65535,
        object = null,
        userData = {}
      } = options;
      if (!shape || typeof shape.computeInertia !== "function") {
        throw new TypeError("Prism.js: RigidBody requires a `shape` (SphereShape, BoxShape or PlaneShape).");
      }
      for (const [name, value] of Object.entries({ restitution, friction, linearDamping, angularDamping })) {
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
      this.linearDamping = linearDamping;
      this.angularDamping = angularDamping;
      this.gravityScale = gravityScale;
      this.allowSleep = allowSleep;
      this.collisionGroup = collisionGroup;
      this.collisionMask = collisionMask;
      this.object = object;
      this.userData = userData;
      this.sleeping = false;
      this.sleepTimer = 0;
      this.mass = 0;
      this.invMass = 0;
      this.invInertiaLocal = new Vector3();
      this.invInertiaWorld = new Float64Array(9);
      this.rotation = new Float64Array(9);
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
      this.updateRotation();
      return this;
    }
    /** Recomputes the rotation matrix and the world-space inverse inertia tensor from `quaternion`. */
    updateRotation() {
      const R = rotationFromQuaternion(this.quaternion, this.rotation);
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
    const R = box.rotation, h = box.shape.halfExtents, r = sphere.shape.radius;
    const rx = sphere.position.x - box.position.x, ry = sphere.position.y - box.position.y, rz = sphere.position.z - box.position.z;
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
      sphere,
      box.position.x + R[0] * qx + R[1] * qy + R[2] * qz,
      box.position.y + R[3] * qx + R[4] * qy + R[5] * qz,
      box.position.z + R[6] * qx + R[7] * qy + R[8] * qz,
      R[0] * nx + R[1] * ny + R[2] * nz,
      R[3] * nx + R[4] * ny + R[5] * nz,
      R[6] * nx + R[7] * ny + R[8] * nz,
      depth
    );
  }
  var AX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
  var BX = [new Float64Array(3), new Float64Array(3), new Float64Array(3)];
  var _L = new Float64Array(3);
  function loadAxes(R, out) {
    for (let i = 0; i < 3; i++) {
      out[i][0] = R[i];
      out[i][1] = R[3 + i];
      out[i][2] = R[6 + i];
    }
  }
  function clipPolygon(polygon, center, n, h) {
    const out = [];
    for (let i = 0; i < polygon.length; i++) {
      const p = polygon[i], q = polygon[(i + 1) % polygon.length];
      const dp = (p[0] - center[0]) * n[0] + (p[1] - center[1]) * n[1] + (p[2] - center[2]) * n[2] - h;
      const dq = (q[0] - center[0]) * n[0] + (q[1] - center[1]) * n[1] + (q[2] - center[2]) * n[2] - h;
      if (dp <= 0) out.push(p);
      if (dp < 0 && dq > 0 || dp > 0 && dq < 0) {
        const t = dp / (dp - dq);
        out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t]);
      }
    }
    return out;
  }
  function boxBox(A, B, list) {
    const ha = [A.shape.halfExtents.x, A.shape.halfExtents.y, A.shape.halfExtents.z];
    const hb = [B.shape.halfExtents.x, B.shape.halfExtents.y, B.shape.halfExtents.z];
    loadAxes(A.rotation, AX);
    loadAxes(B.rotation, BX);
    const delta = [B.position.x - A.position.x, B.position.y - A.position.y, B.position.z - A.position.z];
    let sepA = -Infinity, iA = 0, signA = 1;
    let sepB = -Infinity, jB = 0, signB = 1;
    let sepE = -Infinity, eI = 0, eJ = 0;
    const edgeAxis = new Float64Array(3);
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
          edgeAxis.set(_L);
        }
      }
    }
    const faceBest = Math.max(sepA, sepB);
    if (sepE > faceBest * 0.95 + 0.01) {
      edgeContact(A, B, ha, hb, delta, edgeAxis, eI, eJ, -sepE, list);
      return;
    }
    let ref, inc, refAxes, incAxes, refHalf, incHalf, axisIndex, nRef;
    if (sepB > sepA * 0.95 + 0.01) {
      ref = B;
      inc = A;
      refAxes = BX;
      incAxes = AX;
      refHalf = hb;
      incHalf = ha;
      axisIndex = jB;
      const s = -signB;
      nRef = [BX[jB][0] * s, BX[jB][1] * s, BX[jB][2] * s];
    } else {
      ref = A;
      inc = B;
      refAxes = AX;
      incAxes = BX;
      refHalf = ha;
      incHalf = hb;
      axisIndex = iA;
      nRef = [AX[iA][0] * signA, AX[iA][1] * signA, AX[iA][2] * signA];
    }
    const normal = ref === A ? nRef : [-nRef[0], -nRef[1], -nRef[2]];
    const u = (axisIndex + 1) % 3, v = (axisIndex + 2) % 3;
    const rp = ref.position;
    const refCenter = [rp.x + nRef[0] * refHalf[axisIndex], rp.y + nRef[1] * refHalf[axisIndex], rp.z + nRef[2] * refHalf[axisIndex]];
    let k = 0, best = 0;
    for (let m = 0; m < 3; m++) {
      const d = dot(incAxes[m], nRef);
      if (Math.abs(d) > Math.abs(best)) {
        best = d;
        k = m;
      }
    }
    const sgn = best > 0 ? -1 : 1;
    const ip = inc.position;
    const ic = [ip.x + incAxes[k][0] * sgn * incHalf[k], ip.y + incAxes[k][1] * sgn * incHalf[k], ip.z + incAxes[k][2] * sgn * incHalf[k]];
    const p = (k + 1) % 3, q = (k + 2) % 3;
    let polygon = [];
    for (const [sp, sq] of [[1, 1], [1, -1], [-1, -1], [-1, 1]]) {
      polygon.push([
        ic[0] + incAxes[p][0] * sp * incHalf[p] + incAxes[q][0] * sq * incHalf[q],
        ic[1] + incAxes[p][1] * sp * incHalf[p] + incAxes[q][1] * sq * incHalf[q],
        ic[2] + incAxes[p][2] * sp * incHalf[p] + incAxes[q][2] * sq * incHalf[q]
      ]);
    }
    const un = refAxes[u], vn = refAxes[v];
    polygon = clipPolygon(polygon, refCenter, un, refHalf[u]);
    polygon = clipPolygon(polygon, refCenter, [-un[0], -un[1], -un[2]], refHalf[u]);
    polygon = clipPolygon(polygon, refCenter, vn, refHalf[v]);
    polygon = clipPolygon(polygon, refCenter, [-vn[0], -vn[1], -vn[2]], refHalf[v]);
    for (const pt of polygon) {
      const sep = (pt[0] - refCenter[0]) * nRef[0] + (pt[1] - refCenter[1]) * nRef[1] + (pt[2] - refCenter[2]) * nRef[2];
      if (sep > 0) continue;
      const depth = -sep;
      list.add(
        A,
        B,
        pt[0] + nRef[0] * depth * 0.5,
        pt[1] + nRef[1] * depth * 0.5,
        pt[2] + nRef[2] * depth * 0.5,
        normal[0],
        normal[1],
        normal[2],
        depth
      );
    }
  }
  function edgeContact(A, B, ha, hb, delta, axis, i, j, depth, list) {
    const flip = dot(axis, delta) < 0 ? -1 : 1;
    const n = [axis[0] * flip, axis[1] * flip, axis[2] * flip];
    const c1 = [A.position.x, A.position.y, A.position.z];
    const c2 = [B.position.x, B.position.y, B.position.z];
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
    const r = [c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]];
    const b = dot(d1, d2), c = dot(d1, r), f = dot(d2, r);
    const denom = 1 - b * b;
    let s = 0, t = 0;
    if (denom > 1e-9) {
      t = (f - b * c) / denom;
      s = t * b - c;
    }
    s = Math.max(-ha[i], Math.min(ha[i], s));
    t = Math.max(-hb[j], Math.min(hb[j], t));
    const p1 = [c1[0] + d1[0] * s, c1[1] + d1[1] * s, c1[2] + d1[2] * s];
    const p2 = [c2[0] + d2[0] * t, c2[1] + d2[1] * t, c2[2] + d2[2] * t];
    list.add(A, B, (p1[0] + p2[0]) * 0.5, (p1[1] + p2[1]) * 0.5, (p1[2] + p2[2]) * 0.5, n[0], n[1], n[2], depth);
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
      else if (kb === KIND_SPHERE) planeSphere(a, b, list);
    } else if (ka === KIND_BOX) {
      if (kb === KIND_BOX) boxBox(a, b, list);
      else boxSphere(a, b, list);
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

  // src/physics/PhysicsWorld.js
  var ZERO_INERTIA = new Float64Array(9);
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
      this.stats = { bodies: 0, awake: 0, contacts: 0, stepMs: 0, subSteps: 0 };
      this._accumulator = 0;
      this._cache = /* @__PURE__ */ new Map();
      this._nextCache = /* @__PURE__ */ new Map();
      this._sorted = [];
      this._planes = [];
    }
    addBody(body) {
      if (!body || !body.isRigidBody) throw new TypeError("Prism.js: PhysicsWorld.addBody() expects a RigidBody.");
      if (this.bodies.includes(body)) throw new Error("Prism.js: This RigidBody is already in the world.");
      this.bodies.push(body);
      this._syncObject(body);
      return body;
    }
    /** Removes a body. Sleeping bodies are woken because their support may have been removed. */
    removeBody(body) {
      const index = this.bodies.indexOf(body);
      if (index === -1) return false;
      this.bodies.splice(index, 1);
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
      if (steps > 0) for (const body of this.bodies) {
        body.force.set(0, 0, 0);
        body.torque.set(0, 0, 0);
      }
      let awake = 0;
      for (const body of this.bodies) if (body.invMass > 0 && !body.sleeping) awake++;
      this.stats.bodies = this.bodies.length;
      this.stats.awake = awake;
      this.stats.contacts = this.contacts.count;
      this.stats.subSteps = steps;
      this.stats.stepMs = typeof performance !== "undefined" ? performance.now() - start : 0;
    }
    _fixedStep(dt) {
      const bodies = this.bodies, g = this.gravity;
      for (const body of bodies) {
        body.updateRotation();
        body._im = body.sleeping ? 0 : body.invMass;
        body._ii = body.sleeping ? ZERO_INERTIA : body.invInertiaWorld;
        if (body.invMass === 0 || body.sleeping) continue;
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
      for (const body of bodies) {
        if (body.shape.kind === KIND_PLANE || body.sleeping) continue;
        const v = body.velocity, pv = body._pv, pw = body._pw;
        if (body.invMass === 0 && v.lengthSq() === 0 && body.angularVelocity.lengthSq() === 0) continue;
        body.position.x += (v.x + pv.x) * dt;
        body.position.y += (v.y + pv.y) * dt;
        body.position.z += (v.z + pv.z) * dt;
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
        for (const body of bodies) {
          if (body.invMass === 0 || body.sleeping || !body.allowSleep) continue;
          if (body.velocity.lengthSq() < lin2 && body.angularVelocity.lengthSq() < ang2) {
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
      for (const body of bodies) this._syncObject(body);
    }
    _syncObject(body) {
      const o = body.object;
      if (o && body.shape.kind !== KIND_PLANE) {
        o.position.copy(body.position);
        o.quaternion.copy(body.quaternion);
      }
    }
    // ---------- broad phase ----------
    _collideAll() {
      const sorted = this._sorted, planes = this._planes;
      sorted.length = 0;
      planes.length = 0;
      for (const body of this.bodies) {
        if (body.shape.kind === KIND_PLANE) {
          planes.push(body);
          continue;
        }
        if (body._aabb === void 0) body._aabb = new Float64Array(6);
        computeAABB(body, body._aabb);
        sorted.push(body);
      }
      for (let i = 1; i < sorted.length; i++) {
        const item = sorted[i], key = item._aabb[0];
        let j = i - 1;
        while (j >= 0 && sorted[j]._aabb[0] > key) {
          sorted[j + 1] = sorted[j];
          j--;
        }
        sorted[j + 1] = item;
      }
      for (let i = 0; i < sorted.length; i++) {
        const a = sorted[i], ab = a._aabb;
        for (let j = i + 1; j < sorted.length; j++) {
          const b = sorted[j], bb = b._aabb;
          if (bb[0] > ab[3]) break;
          if (bb[1] > ab[4] || bb[4] < ab[1] || bb[2] > ab[5] || bb[5] < ab[2]) continue;
          this._testPair(a, b);
        }
      }
      for (const plane of planes) {
        for (const body of sorted) this._testPair(plane, body);
      }
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
      const aMoves = this._isMover(a), bMoves = this._isMover(b);
      if (!aMoves && !bMoves) return;
      const wake2 = this.wakeSpeed * this.wakeSpeed;
      if (a.sleeping && bMoves && this._speedSq(b) > wake2) a.wakeUp();
      else if (b.sleeping && aMoves && this._speedSq(a) > wake2) b.wakeUp();
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
      const items = this.contacts.items, n = this.contacts.count;
      const beta = this.baumgarte / dt, slop = this.penetrationSlop;
      const maxBias = this.maxCorrectionSpeed, threshold = this.restitutionThreshold, spin = this.spinFriction;
      for (let i = 0; i < n; i++) {
        const c = items[i], A = c.a, B = c.b;
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
        const vn = relativeVelocity(c, c.nx, c.ny, c.nz);
        const e = Math.max(A.restitution, B.restitution);
        const bounce = vn < -threshold ? -e * vn : 0;
        c.target = bounce;
        c.bias = Math.min(beta * Math.max(c.depth - slop, 0), maxBias);
        c.accP = 0;
        c.mu = Math.sqrt(A.friction * B.friction);
        c.accN = c.accT1 = c.accT2 = 0;
      }
      if (this.warmStarting) for (let i = 0; i < n; i++) this._warmStart(items[i]);
      for (let it = 0; it < this.solverIterations; it++) {
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
        }
      }
      for (let i = 0; i < n; i++) items[i].normalImpulse = items[i].accN;
      this._storeImpulses();
      for (let it = 0; it < this.solverIterations; it++) {
        for (let i = 0; i < n; i++) {
          const c = items[i];
          if (c.bias <= 0) continue;
          let lambda = (c.bias - relativeVelocity(c, c.nx, c.ny, c.nz, true)) * c.invKN;
          const acc = Math.max(c.accP + lambda, 0);
          lambda = acc - c.accP;
          c.accP = acc;
          applyImpulse(c, c.nx * lambda, c.ny * lambda, c.nz * lambda, true);
        }
      }
    }
    /**
     * Finds the same contact in last step's cache (same pair, nearby point) and applies its
     * impulses again as the starting guess. Friction impulses are cached as world vectors on the
     * body with the higher id, so they stay valid when the pair's order or tangent basis changes.
     */
    _warmStart(c) {
      const list = this._cache.get(pairKey(c.a, c.b));
      if (list === void 0) return;
      let best = null, bestD = this.warmStartDistance * this.warmStartDistance;
      for (let k = 0; k < list.length; k++) {
        const r = list[k];
        if (r.used) continue;
        const d = (r.px - c.px) ** 2 + (r.py - c.py) ** 2 + (r.pz - c.pz) ** 2;
        if (d < bestD) {
          bestD = d;
          best = r;
        }
      }
      if (best === null) return;
      best.used = true;
      const sign = c.b.id > c.a.id ? 1 : -1;
      const fx = best.fx * sign, fy = best.fy * sign, fz = best.fz * sign;
      c.accN = best.accN;
      c.accT1 = fx * c.t1x + fy * c.t1y + fz * c.t1z;
      c.accT2 = fx * c.t2x + fy * c.t2y + fz * c.t2z;
      applyImpulse(
        c,
        c.nx * c.accN + c.t1x * c.accT1 + c.t2x * c.accT2,
        c.ny * c.accN + c.t1y * c.accT1 + c.t2y * c.accT2,
        c.nz * c.accN + c.t1z * c.accT1 + c.t2z * c.accT2
      );
    }
    _storeImpulses() {
      const next = this._nextCache, items = this.contacts.items;
      next.clear();
      for (let i = 0; i < this.contacts.count; i++) {
        const c = items[i];
        const sign = c.b.id > c.a.id ? 1 : -1;
        const key = pairKey(c.a, c.b);
        let list = next.get(key);
        if (list === void 0) {
          list = [];
          next.set(key, list);
        }
        list.push({
          px: c.px,
          py: c.py,
          pz: c.pz,
          accN: c.accN,
          used: false,
          fx: (c.t1x * c.accT1 + c.t2x * c.accT2) * sign,
          fy: (c.t1y * c.accT1 + c.t2y * c.accT2) * sign,
          fz: (c.t1z * c.accT1 + c.t2z * c.accT2) * sign
        });
      }
      this._cache = next;
      this._nextCache = /* @__PURE__ */ new Map();
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
  function relativeVelocity(c, dx, dy, dz, pseudo = false) {
    const va = pseudo ? c.a._pv : c.a.velocity, wa = pseudo ? c.a._pw : c.a.angularVelocity;
    const vb = pseudo ? c.b._pv : c.b.velocity, wb = pseudo ? c.b._pw : c.b.angularVelocity;
    const x = vb.x + wb.y * c.rbz - wb.z * c.rby - va.x - wa.y * c.raz + wa.z * c.ray;
    const y = vb.y + wb.z * c.rbx - wb.x * c.rbz - va.y - wa.z * c.rax + wa.x * c.raz;
    const z = vb.z + wb.x * c.rby - wb.y * c.rbx - va.z - wa.x * c.ray + wa.y * c.rax;
    return x * dx + y * dy + z * dz;
  }
  function applyImpulse(c, px, py, pz, pseudo = false) {
    const A = c.a, B = c.b;
    const imA = A._im, imB = B._im;
    if (imA > 0) {
      const va = pseudo ? A._pv : A.velocity;
      va.x -= px * imA;
      va.y -= py * imA;
      va.z -= pz * imA;
      const tx = c.ray * pz - c.raz * py, ty = c.raz * px - c.rax * pz, tz = c.rax * py - c.ray * px;
      const I = A._ii, w = pseudo ? A._pw : A.angularVelocity;
      w.x -= I[0] * tx + I[1] * ty + I[2] * tz;
      w.y -= I[3] * tx + I[4] * ty + I[5] * tz;
      w.z -= I[6] * tx + I[7] * ty + I[8] * tz;
    }
    if (imB > 0) {
      const vb = pseudo ? B._pv : B.velocity;
      vb.x += px * imB;
      vb.y += py * imB;
      vb.z += pz * imB;
      const tx = c.rby * pz - c.rbz * py, ty = c.rbz * px - c.rbx * pz, tz = c.rbx * py - c.rby * px;
      const I = B._ii, w = pseudo ? B._pw : B.angularVelocity;
      w.x += I[0] * tx + I[1] * ty + I[2] * tz;
      w.y += I[3] * tx + I[4] * ty + I[5] * tz;
      w.z += I[6] * tx + I[7] * ty + I[8] * tz;
    }
  }

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

  // src/renderer/shaders/normal.js
  var normalShader = {
    uniforms: ["uModelViewMatrix", "uProjectionMatrix", "uNormalMatrix", "uOpacity"],
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
    get(material) {
      const definition = SHADER_LIBRARY[material.type];
      const useMap = definition !== void 0 && definition.supportsMap === true && Boolean(material.map);
      const key = useMap ? `${material.type}:map` : material.type;
      let entry = this._entries.get(key);
      if (entry === void 0) {
        if (definition === void 0) {
          throw new Error(
            `Prism.js: No shader is available for material type "${material.type}".

Built-in material types: ${Object.keys(SHADER_LIBRARY).join(", ")}.`
          );
        }
        const defines = useMap ? ["USE_MAP"] : [];
        const program = new WebGLProgram(this.gl, {
          name: key,
          vertexShader: withDefines(definition.vertexShader, defines),
          fragmentShader: withDefines(definition.fragmentShader, defines)
        });
        const locations = /* @__PURE__ */ Object.create(null);
        for (const name of definition.uniforms) locations[name] = program.getUniformLocation(name);
        entry = { program, definition, locations, frame: -1, lightsFrame: -1 };
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
      this._onGeometryDispose = (geometry) => this.release(geometry);
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
      this.info.memory.geometries = this._records.size;
      this.state.resetBindings();
    }
    /** Forgets all records without deleting GL objects (they died with a lost context). */
    clear() {
      this._records.clear();
      this.info.memory.geometries = 0;
    }
    dispose() {
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
        render: { frame: 0, calls: 0, triangles: 0, lines: 0, lights: 0 },
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
      scene.updateMatrixWorld();
      if (camera.parent === null) camera.updateMatrixWorld();
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
        if (material.visible) {
          const item = this._list.push(object, object.geometry, material);
          item.modelView.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
          item.depth = -item.modelView.elements[14];
        }
      }
      const children = object.children;
      for (let i = 0; i < children.length; i++) this._collect(children[i], camera);
    }
    _drawItems(items) {
      const gl = this.gl, state = this.state, stats = this.info.render;
      const frame = stats.frame;
      for (let i = 0; i < items.length; i++) {
        const { geometry, material, modelView } = items[i];
        state.setDepthTest(material.depthTest);
        state.setDepthMask(material.depthWrite);
        state.setSide(material.side);
        state.setBlending(material.transparent || material.opacity < 1);
        const entry = this._programs.get(material);
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
        if (entry.definition.usesNormalMatrix) {
          this._normalMatrix.getNormalMatrix(modelView);
          this._normalArray.set(this._normalMatrix.elements);
          gl.uniformMatrix3fv(locations.uNormalMatrix, false, this._normalArray);
        }
        entry.definition.uploadMaterial(gl, locations, material);
        if (material.map && entry.definition.supportsMap) {
          if (geometry.attributes.uv === void 0) {
            throw new Error(
              `Prism.js: ${material.type} has a texture map but the geometry has no "uv" attribute.`
            );
          }
          this._textures.bind(material.map);
          gl.uniform1i(locations.uMap, 0);
        }
        const record = this._geometries.get(geometry);
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
