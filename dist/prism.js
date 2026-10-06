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
    BackSide: () => BackSide,
    BasicMaterial: () => BasicMaterial,
    BoxGeometry: () => BoxGeometry,
    BufferAttribute: () => BufferAttribute,
    BufferGeometry: () => BufferGeometry,
    Camera: () => Camera,
    Color: () => Color,
    DEG2RAD: () => DEG2RAD,
    DoubleSide: () => DoubleSide,
    Euler: () => Euler,
    FrontSide: () => FrontSide,
    Material: () => Material,
    Matrix3: () => Matrix3,
    Matrix4: () => Matrix4,
    Mesh: () => Mesh,
    NormalMaterial: () => NormalMaterial,
    Object3D: () => Object3D,
    OrthographicCamera: () => OrthographicCamera,
    PerspectiveCamera: () => PerspectiveCamera,
    PlaneGeometry: () => PlaneGeometry,
    Quaternion: () => Quaternion,
    RAD2DEG: () => RAD2DEG,
    Renderer: () => Renderer,
    Scene: () => Scene,
    SphereGeometry: () => SphereGeometry,
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
    uniforms: ["uModelViewMatrix", "uProjectionMatrix", "uColor"],
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

  // src/renderer/shaders/normal.js
  var normalShader = {
    uniforms: ["uModelViewMatrix", "uProjectionMatrix", "uNormalMatrix", "uOpacity"],
    usesNormalMatrix: true,
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

  // src/renderer/WebGLPrograms.js
  var SHADER_LIBRARY = {
    BasicMaterial: basicShader,
    NormalMaterial: normalShader
  };
  var WebGLPrograms = class {
    constructor(gl, info) {
      this.gl = gl;
      this.info = info;
      this._entries = /* @__PURE__ */ new Map();
    }
    get(material) {
      let entry = this._entries.get(material.type);
      if (entry === void 0) {
        const definition = SHADER_LIBRARY[material.type];
        if (definition === void 0) {
          throw new Error(
            `Prism.js: No shader is available for material type "${material.type}".

Built-in material types: ${Object.keys(SHADER_LIBRARY).join(", ")}.`
          );
        }
        const program = new WebGLProgram(this.gl, {
          name: material.type,
          vertexShader: definition.vertexShader,
          fragmentShader: definition.fragmentShader
        });
        const locations = /* @__PURE__ */ Object.create(null);
        for (const name of definition.uniforms) locations[name] = program.getUniformLocation(name);
        entry = { program, definition, locations, frame: -1 };
        this._entries.set(material.type, entry);
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

  // src/renderer/Renderer.js
  function createCanvas() {
    if (typeof document === "undefined") {
      throw new Error(
        "Prism.js: No `canvas` option was given and `document` is not available to create one."
      );
    }
    return document.createElement("canvas");
  }
  function assertPositive2(name, value) {
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
      assertPositive2("pixelRatio", pixelRatio);
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
        render: { frame: 0, calls: 0, triangles: 0, lines: 0 },
        memory: { geometries: 0, programs: 0 }
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
      assertPositive2("pixelRatio", pixelRatio);
      this._pixelRatio = pixelRatio;
      this.setSize(this.width, this.height, false);
    }
    /**
     * Sets the canvas size in CSS pixels and updates the viewport.
     * @param {boolean} [updateStyle=true] Also set `canvas.style.width/height`.
     */
    setSize(width, height, updateStyle = true) {
      this._assertAlive();
      assertPositive2("width", width);
      assertPositive2("height", height);
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
      this._list.reset();
      this._collect(scene, camera);
      this._list.sort();
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
      this._programs.dispose();
      this.domElement.removeEventListener("webglcontextlost", this._onContextLost, false);
      this.domElement.removeEventListener("webglcontextrestored", this._onContextRestored, false);
    }
    _collect(object, camera) {
      if (!object.visible) return;
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
        this._modelViewArray.set(modelView.elements);
        gl.uniformMatrix4fv(locations.uModelViewMatrix, false, this._modelViewArray);
        if (entry.definition.usesNormalMatrix) {
          this._normalMatrix.getNormalMatrix(modelView);
          this._normalArray.set(this._normalMatrix.elements);
          gl.uniformMatrix3fv(locations.uNormalMatrix, false, this._normalArray);
        }
        entry.definition.uploadMaterial(gl, locations, material);
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
