<p align="center">
  <img src="assets/logo.svg" alt="Logo Prism.js" width="128" height="128">
</p>

<h1 align="center">Prism.js</h1>

<p align="center">
  Engine rendering 3D JavaScript ringan yang dibuat dari nol di atas WebGL2.
</p>

<p align="center">
  <img src="assets/preview-scene.png" alt="Pratinjau contoh 03-scene: kubus, planet, bulan, dan bola kaca di atas lantai grid" width="640">
</p>

> **Status: pre-alpha (v0.5.0).** Alur inti berjalan dari ujung ke ujung: math, scene graph, kamera, geometry, material, lampu, texture, pemuat **OBJ + MTL**, **fisika rigid body**, dan `renderer.render(scene, camera)`.
> **Belum ada** shadow, specular, loader glTF, picking terhadap mesh, animasi skeletal, serta soft body/kain/fluida pada fisika. Prism.js **belum** sebanding fiturnya dengan engine yang sudah matang; proyek ini tidak mengklaim lebih baik daripada engine lain. Satu-satunya perbandingan kinerja yang ada adalah **sebelum/sesudah dalam proyek ini sendiri** ([Optimasi dan kinerja](#optimasi-dan-kinerja)); tidak ada yang diukur terhadap engine lain. Rincian lengkap ada di [PROGRESS.md](PROGRESS.md).

## Daftar isi

- [Ringkasan fitur](#ringkasan-fitur)
- [Kenapa Prism.js](#kenapa-prismjs)
- [Instalasi](#instalasi)
- [Mulai cepat](#mulai-cepat)
- [CSS bantu](#css-bantu)
- [Aset](#aset)
- [Memuat model OBJ dan MTL](#memuat-model-obj-dan-mtl)
- [Fisika (rigid body)](#fisika-rigid-body)
- [Optimasi dan kinerja](#optimasi-dan-kinerja)
- [Ringkasan API](#ringkasan-api)
- [Contoh](#contoh)
- [Arsitektur](#arsitektur)
- [Dukungan browser](#dukungan-browser)
- [Pengembangan](#pengembangan)
- [Merilis ke GitHub dan jsDelivr](#merilis-ke-github-dan-jsdelivr)
- [Pemecahan masalah](#pemecahan-masalah)
- [Keterbatasan](#keterbatasan)
- [Lisensi](#lisensi)

## Ringkasan fitur

| Area | Yang tersedia | Status uji |
| --- | --- | --- |
| Rendering | WebGL2, scene graph, kamera perspektif/ortografik, geometry (box, plane, sphere, kapsul, kustom), `BasicMaterial`, `NormalMaterial`, `LambertMaterial`, transparansi, wireframe, culling sisi, **frustum culling**, **`InstancedMesh`** (ribuan benda dalam satu draw call) | unit test + 30 tes piksel di browser |
| Pencahayaan | `AmbientLight`, `DirectionalLight`, `PointLight` (per piksel, hingga 4 + 4 lampu) | tes piksel (arah lampu, jangkauan, kamera berpindah) |
| Texture | `Texture`, `TextureLoader` (PNG/JPEG/WebP sesuai browser), filter, wrapping, mipmap | tes piksel (orientasi dari PNG asli) |
| Loader | `OBJLoader` + `MTLLoader` (warna, opacity, texture `map_Kd`) | unit test + memuat file nyata lewat HTTP |
| Fisika | Rigid body: gravitasi, gaya/impuls/torsi, rotasi, tumbukan bola/kotak/**kapsul**/bidang, restitusi, gesekan (Coulomb, puntir, **gelinding**), tumpukan, sleeping, raycast, platform kinematik, **joint** (ball-socket, hinge + motor, jarak/tali), **CCD** untuk benda cepat | 76 tes numerik terhadap hukum fisika |
| Alat bantu | Server dev, build `dist/` untuk CDN, halaman tes browser, skrip pembuat model contoh | berjalan |

Belum ada: bayangan, specular/PBR, glTF, picking terhadap mesh, animasi skeletal, soft body/kain/fluida pada fisika. Daftar lengkap ada di [Keterbatasan](#keterbatasan).

## Kenapa Prism.js

Engine kecil dengan arsitektur sendiri: API sederhana untuk pemula, titik perluasan yang jelas untuk yang sudah mahir, tanpa dependensi runtime, dan tanpa framework. Kodenya tidak membungkus atau menyalin engine 3D lain.

Prinsip: API sederhana, inti kecil, modular, kode mudah dibaca, dan mengutamakan browser.

## Instalasi

### Lewat CDN (jsDelivr)

Cara tercepat, tanpa bundler. Taruh CSS (opsional) di `<head>` dan JS sebelum skripmu:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.css">
<script src="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.js"></script>
```

Skrip itu membuat satu variabel global bernama `Prism` (misalnya `new Prism.Renderer(...)`).

File yang tersedia di rilis:

| File | Isi |
| --- | --- |
| `dist/prism.js` | Build global (IIFE), tidak diminify, mudah di-debug. Menyediakan `window.Prism`. |
| `dist/prism.min.js` | Sama seperti di atas, tetapi diminify (lebih kecil). |
| `dist/prism.module.js` | Build ES module, diminify. |
| `dist/prism.css` | CSS bantu (opsional), lihat [CSS bantu](#css-bantu). |
| `dist/prism.min.css` | Versi CSS yang diminify. |
| `assets/nama-file` | Aset (gambar, nanti texture dan model), lihat [Aset](#aset). |

Ganti `@v0.5.0` dengan versi lain bila perlu. Untuk produksi, pakai tag versi yang tetap dan hindari `@main` karena isinya bisa berubah dan di-cache CDN.

### ES module lewat CDN

```html
<script type="module">
  import * as Prism from "https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.module.js";

  const renderer = new Prism.Renderer({ canvas: document.querySelector("canvas") });
</script>
```

### Dari source

Repo ini berisi ES module native, jadi bisa dipakai langsung tanpa build:

```bash
git clone https://github.com/JANUARPROGRAM/Prism.js.git
cd Prism.js
npm run dev        # server lokal di http://localhost:8080/ (tidak perlu npm install)
```

```js
import * as Prism from "./src/index.js";
```

Paket npm **belum** dipublikasikan.

## Mulai cepat

Satu file HTML lengkap yang menampilkan kubus berputar (jika dibuka dari repo ini, ganti URL CDN dengan `../../dist/prism.js` dan `../../dist/prism.css`):

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Kubus Prism.js</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.css">
  <style>html, body { height: 100%; margin: 0; background: #0b0d17; }</style>
</head>
<body>
  <canvas id="canvas" class="prism-canvas prism-fullscreen"></canvas>
  <pre id="error" class="prism-error" hidden></pre>

  <script src="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.js"></script>
  <script>
    try {
      const renderer = new Prism.Renderer({ canvas: document.getElementById("canvas") });

      const scene = new Prism.Scene();
      scene.background = new Prism.Color("#0b0d17");

      const camera = new Prism.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 4;

      const cube = new Prism.Mesh(
        new Prism.BoxGeometry(1.4, 1.4, 1.4),
        new Prism.NormalMaterial()
      );
      scene.add(cube);

      function animate(ms) {
        cube.rotation.x = ms / 1700;
        cube.rotation.y = ms / 1100;

        // Samakan ukuran buffer dengan ukuran tampilan, lalu perbarui aspect kamera.
        if (renderer.resizeToDisplaySize()) {
          camera.aspect = renderer.width / renderer.height;
          camera.updateProjectionMatrix();
        }
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    } catch (error) {
      // Pesan error Prism.js menyertakan konteks (log shader, penyebab WebGL2 gagal, dll).
      const box = document.getElementById("error");
      box.textContent = error.message;
      box.hidden = false;
    }
  </script>
</body>
</html>
```

Versi yang berjalan dan sudah diuji ada di [examples/cdn](examples/cdn/index.html). Contoh yang lebih lengkap: [examples/03-scene](examples/03-scene/main.js).

Material tanpa pencahayaan: `BasicMaterial` berwarna rata dan `NormalMaterial` diwarnai berdasarkan normal. Untuk permukaan yang diterangi lampu, pakai `LambertMaterial` (lihat [Lampu](#lampu)).

## CSS bantu

`dist/prism.css` bersifat **opsional**; engine bekerja tanpa CSS. Isinya hanya kelas-kelas kecil agar canvas dan pesan status rapi:

| Kelas | Fungsi |
| --- | --- |
| `.prism-canvas` | Canvas `display: block`, memenuhi wadahnya, dan mematikan gestur bawaan browser (`touch-action: none`). |
| `.prism-fullscreen` | Menempelkan canvas ke seluruh viewport (gabungkan dengan `.prism-canvas`). |
| `.prism-info` | Baris status kecil di kiri bawah (misalnya jumlah draw call). Butuh induk yang `position: relative`, atau pakai bersama `.prism-fullscreen`. |
| `.prism-error` | Kotak untuk menampilkan pesan error; sembunyikan dengan atribut `hidden`. |

## Aset

Folder [`assets/`](assets/) disiapkan untuk berkas pendukung. Setelah rilis, setiap berkas bisa diakses lewat pola:

```
https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/assets/nama-file
```

Contoh dengan berkas yang sudah ada:

```html
<img src="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/assets/logo.svg" width="64" alt="Prism.js">
```

| Berkas | Keterangan |
| --- | --- |
| `assets/logo.svg` | Logo proyek. |
| `assets/preview-scene.png` | Tangkapan layar contoh `03-scene` (dipakai di README ini). |
| `assets/models/crate.obj`, `crate.mtl`, `crate.png` | Kotak kayu bertekstur (OBJ + MTL + PNG). |
| `assets/models/house.obj`, `house.mtl` | Rumah dengan tiga material (dinding, atap, pintu). |

Model dan texture dari folder ini bisa dimuat langsung, misalnya `new Prism.OBJLoader().loadAsync("https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/assets/models/crate.obj")` (lihat [Memuat model OBJ dan MTL](#memuat-model-obj-dan-mtl)). Jangan mengubah isi berkas pada tag yang sudah dirilis (CDN meng-cache); buat tag baru. Berkas contoh dibuat ulang dengan `npm run assets`.

## Ringkasan API

| Area | Kelas |
| --- | --- |
| Math | `Vector2`, `Vector3`, `Vector4`, `Matrix3`, `Matrix4`, `Quaternion`, `Euler`, `Color` |
| Scene graph | `Object3D`, `Group`, `Scene`, `Mesh`, `InstancedMesh` |
| Kamera | `PerspectiveCamera` (fov dalam **derajat**), `OrthographicCamera` |
| Geometry | `BufferGeometry`, `BufferAttribute`, `BoxGeometry`, `PlaneGeometry`, `SphereGeometry`, `CapsuleGeometry` |
| Material | `Material`, `BasicMaterial`, `NormalMaterial`, `LambertMaterial` |
| Lampu | `Light`, `AmbientLight`, `DirectionalLight`, `PointLight` |
| Texture | `Texture`, `TextureLoader` |
| Loader | `OBJLoader`, `MTLLoader`, `MaterialLibrary` |
| Fisika | `PhysicsWorld`, `RigidBody`, `SphereShape`, `BoxShape`, `CapsuleShape`, `PlaneShape`, `BallSocketJoint`, `HingeJoint`, `DistanceJoint` |
| Utilitas | `Frustum` (volume pandang dari matriks proyeksi), `Vector3.project` / `unproject` |
| Rendering | `Renderer`, `WebGLProgram` (level rendah) |
| Konstanta | `FrontSide`, `BackSide`, `DoubleSide`, `NearestFilter`, `LinearFilter`, `LinearMipmapLinearFilter` (dan filter lain), `ClampToEdgeWrapping`, `RepeatWrapping`, `MirroredRepeatWrapping`, `DEG2RAD`, `RAD2DEG` |

### Konvensi

- Sistem koordinat tangan kanan, sumbu **+Y ke atas**; kamera dan `lookAt()` menghadap sumbu **-Z**.
- Matriks bersifat column-major (sama seperti WebGL).
- Sudut dalam radian (kecuali `fov` kamera yang dalam derajat).
- Segitiga menghadap depan jika urutan titiknya berlawanan arah jarum jam.
- `Color` menerima `0xRRGGBB`, `'#rgb'`, `'#rrggbb'`, atau `Color` lain, dan dipakai apa adanya (tanpa konversi sRGB).

### Renderer

```js
const renderer = new Prism.Renderer({ canvas });
```

Opsi: `canvas`, `alpha`, `antialias`, `depth`, `stencil`, `powerPreference`, `preserveDrawingBuffer`, `pixelRatio`.

| Anggota | Fungsi |
| --- | --- |
| `render(scene, camera)` | Menggambar semua `Mesh` yang terlihat. |
| `setSize(w, h, updateStyle = true)` | Ukuran dalam piksel CSS (buffer = ukuran × pixelRatio). |
| `setPixelRatio(r)` | Mengubah rasio piksel. |
| `resizeToDisplaySize()` | Untuk canvas yang ukurannya diatur CSS; mengembalikan `true` jika buffer berubah. Murah, aman dipanggil tiap frame. |
| `setClearColor(warna, alpha = 1)` | Warna latar; `scene.background` menimpanya per frame. |
| `clear()` | Membersihkan buffer. |
| `autoClear` | `true` (default): `render()` membersihkan buffer lebih dulu. |
| `info` | Penghitung: `render.calls`, `render.triangles`, `render.lines`, `render.lights`, `render.frame`, `memory.geometries`, `memory.programs`, `memory.textures`. |
| `capabilities` | Versi GL/GLSL, ukuran texture maksimum, dll. |
| `dispose()` | Membebaskan semua resource GPU yang dibuat renderer. |

### Scene graph

```js
const parent = new Prism.Object3D();
const child = new Prism.Mesh(new Prism.BoxGeometry(), new Prism.BasicMaterial({ color: 0xff0000 }));
child.position.x = 2;
parent.add(child);          // child ikut bergerak dan berputar bersama parent
parent.rotation.y += 0.01;
```

- `add()` dan `remove()` memindahkan induk dengan aman dan menolak siklus.
- `rotation` (Euler) dan `quaternion` selalu sinkron; ubah salah satunya.
- Matriks lokal hanya dihitung ulang jika transformasinya berubah, dan matriks dunia hanya jika objek atau leluhurnya berubah.
- Jika `matrixAutoUpdate = false` dan kamu mengubah `matrix` sendiri, set juga `matrixWorldNeedsUpdate = true`.

### Material

```js
new Prism.BasicMaterial({
  color: 0x5ee1ff,        // 0xRRGGBB, '#rrggbb', atau Color
  opacity: 0.4,
  transparent: true,
  side: Prism.DoubleSide, // FrontSide (default), BackSide, DoubleSide
  wireframe: false,
  depthTest: true,
  depthWrite: false
});
```

Opsi yang tidak dikenal akan melempar error (bukan diabaikan diam-diam), jadi salah ketik langsung ketahuan.

### Lampu

```js
scene.add(new Prism.AmbientLight(0xffffff, 0.4));                 // cahaya merata dari segala arah

const sun = new Prism.DirectionalLight(0xffffff, 0.8);            // sinar sejajar, seperti matahari
sun.position.set(3, 5, 4);                                        // arah: dari posisi ini menuju sun.target (default titik 0,0,0)
scene.add(sun);

const bulb = new Prism.PointLight(0xffaa55, 1.2, 10, 1.5);        // warna, intensitas, jangkauan, decay
bulb.position.set(0, 2, 0);
scene.add(bulb);

const ball = new Prism.Mesh(
  new Prism.SphereGeometry(1, 48, 24),
  new Prism.LambertMaterial({ color: 0x6bcbff })                  // hanya material ini yang terpengaruh lampu
);
scene.add(ball);
```

- Lampu adalah `Object3D`: bisa dijadikan anak dari objek lain dan ikut bergerak bersamanya.
- Pencahayaan per piksel: `warna material × (ambient + Σ N·L × warna lampu × intensitas)`. Tanpa gamma/sRGB.
- `PointLight`: `distance = 0` berarti tanpa pelemahan; jika `distance > 0`, faktornya `clamp(1 − jarak/distance, 0, 1)^decay` (nol tepat di `distance`).
- Batas shader: **4** `DirectionalLight` dan **4** `PointLight` per frame (kelebihannya diabaikan dengan satu peringatan). `AmbientLight` tidak dibatasi (nilainya dijumlahkan).
- `LambertMaterial` **tanpa lampu tampil hitam**, dan geometry-nya harus punya atribut `normal` (geometry bawaan sudah punya; untuk buatan sendiri panggil `geometry.computeVertexNormals()`).
- Belum ada bayangan dan specular.

### Texture

```js
const texture = new Prism.TextureLoader().load("foto.png");       // langsung mengembalikan Texture; gambar menyusul
const material = new Prism.BasicMaterial({ map: texture });       // juga bisa untuk LambertMaterial
```

- `loadAsync(url)` mengembalikan Promise yang selesai saat gambar siap; `load(url, onLoad, onError)` memakai callback.
- Selama gambar belum siap, permukaan tampil dengan warna material (texture sementara 1×1 putih), lalu berganti otomatis.
- Geometry harus punya atribut `uv`. Format yang bisa dipakai tergantung browser (PNG, JPEG, WebP umumnya didukung).
- Properti `Texture`: `wrapS`, `wrapT`, `magFilter`, `minFilter`, `generateMipmaps`, `flipY` (default `true`). Setelah mengubah `image` atau pikselnya, set `needsUpdate = true`.
- `image` boleh berupa elemen `<img>`, `ImageBitmap`, `<canvas>`, atau data mentah `{ data: Uint8Array (RGBA), width, height }`.
- Gambar dari domain lain butuh header CORS (jsDelivr menyediakannya); `TextureLoader` memakai `crossOrigin = "anonymous"`.
- Texture dengan alpha butuh `transparent: true` di material.
- `texture.dispose()` membebaskan salinan GPU-nya.

### Urutan gambar dan memori

- Mesh opaque dikelompokkan per material dan digambar dari dekat ke jauh; mesh transparan (`transparent: true` atau `opacity < 1`) digambar sesudahnya, dari jauh ke dekat.
- Program shader dikompilasi satu kali per tipe material, dan perubahan state GL di-cache.
- Buffer GPU dibuat saat pertama digambar. `geometry.dispose()` membebaskan buffer satu geometry (diunggah ulang jika digambar lagi); `renderer.dispose()` membebaskan semuanya.
- Jika context WebGL hilang lalu pulih, program dan buffer milik engine dibangun ulang otomatis.

## Memuat model OBJ dan MTL

```js
const loader = new Prism.OBJLoader();
const model = await loader.loadAsync("assets/models/crate.obj");   // otomatis memuat crate.mtl dan texture-nya
scene.add(model);                                                   // model adalah Group berisi Mesh
scene.add(new Prism.AmbientLight(0xffffff, 0.6), new Prism.DirectionalLight(0xffffff, 0.7));
```

`loadAsync` membaca baris `mtllib` di file `.obj`, memuat file `.mtl` di folder yang sama, lalu memuat texture (`map_Kd`) relatif terhadap file `.mtl`. Semua path dihitung relatif terhadap URL file yang menyebutkannya, jadi struktur folder model tetap utuh, termasuk dari CDN:

```js
const base = "https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/assets/models/";
const house = await new Prism.OBJLoader().loadAsync(base + "house.obj");
```

### Opsi dan cara lain

| Kebutuhan | Cara |
| --- | --- |
| Model tanpa file `.mtl` | Tidak perlu apa-apa; mesh memakai `LambertMaterial` abu-abu muda. |
| Material dimuat manual | `const lib = await new Prism.MTLLoader().loadAsync("a.mtl"); loader.setMaterials(lib);` |
| Dari teks (mis. hasil upload) | `const lib = new Prism.MTLLoader().parse(teksMtl, "a.mtl"); loader.setMaterials(lib).parse(teksObj)` |
| Jangan muat `.mtl` otomatis | `loader.autoLoadMaterials = false` |
| Model bolong / terlihat dari dalam | `loader.side = Prism.DoubleSide` (untuk `MTLLoader`: `mtlLoader.side`) |
| Tanpa texture | `mtlLoader.loadTextures = false` |
| File dari perangkat pengguna | `setURLModifier(url => dataUrlDariNamaFile)`: ganti URL texture dengan data URL file yang dipilih (contoh lengkap: [examples/05-obj](examples/05-obj/main.js)) |
| Callback, bukan `await` | `loader.load(url, onLoad, onError)` |
| Membebaskan memori | `geometry.dispose()` tiap mesh, lalu `material.dispose()` dan `material.map?.dispose()`; atau `library.dispose()` |

### Yang didukung dan yang tidak

| Berkas | Didukung | Diabaikan |
| --- | --- | --- |
| `.obj` | `v`, `vt`, `vn`, `f` (`v`, `v/vt`, `v//vn`, `v/vt/vn`, indeks negatif, poligon bebas), `o`, `g`, `usemtl`, `mtllib` | `s` (smoothing group), `l`, `p`, kurva/permukaan, warna vertex |
| `.mtl` | `newmtl`, `Kd` (warna), `d` / `Tr` (opacity), `map_Kd` (texture; opsi seperti `-s`, `-o`, `-clamp` dilewati) | `Ka`, `Ks`, `Ns`, `Ke`, `illum`, bump/specular/opacity map. Model tampak matte. |

Perilaku yang perlu diketahui:

- Satu `Mesh` dibuat per kombinasi (nama `o`/`g`, material). Nama objek ada di `mesh.name`; statistik ada di `model.userData.obj` (`vertexCount`, `triangleCount`, `materialLibraries`).
- Poligon dengan lebih dari 3 titik dipecah dengan metode fan dari titik pertama. **Poligon cekung tidak ditangani dengan benar.**
- Jika file tidak punya `vn`, normal dibuat per permukaan (tampak facet/flat). Jika hanya sebagian permukaan yang punya `vn`, normal dari file untuk mesh itu dibuang dan dihitung ulang.
- Material yang disebut `usemtl` tetapi tidak ada di `.mtl` diganti material abu-abu muda dengan satu peringatan di console. Jika `.mtl` gagal dimuat, model tetap tampil dengan material bawaan dan satu peringatan.
- Texture dari `.mtl` memakai `RepeatWrapping`. Texture yang gagal dimuat hanya memberi peringatan; warna `Kd` tetap dipakai.
- Nilai yang rusak (bukan angka, indeks di luar jangkauan, face kurang dari 3 titik) melempar error dengan **nomor baris**.
- Model tidak di-skala atau dipusatkan otomatis; `examples/05-obj` memberi contoh menghitung bounding box lalu menyesuaikannya.
- Kinerja untuk model besar (ratusan ribu segitiga) belum diukur.

## Fisika (rigid body)

Prism.js punya mesin fisika benda tegar (rigid body) sendiri: `PhysicsWorld`, `RigidBody`, dan tiga bentuk tumbukan. Mesin ini **berdiri sendiri** dari renderer (hanya memakai math), jadi bisa dijalankan di Node untuk uji atau server, dan hasilnya dipasangkan ke `Mesh` lewat `body.object`.

```js
const world = new Prism.PhysicsWorld({ gravity: new Prism.Vector3(0, -9.81, 0) });

// Lantai: bidang tak hingga dengan normal +Y yang melewati y = 0. Massa 0 = statis.
world.addBody(new Prism.RigidBody({ shape: new Prism.PlaneShape(new Prism.Vector3(0, 1, 0), 0), mass: 0 }));

// Kotak 1×1×1 kg yang jatuh; mesh-nya disinkronkan otomatis setiap langkah.
const mesh = new Prism.Mesh(new Prism.BoxGeometry(1, 1, 1), new Prism.LambertMaterial({ color: 0xff6b6b }));
scene.add(mesh);
const body = new Prism.RigidBody({
  shape: new Prism.BoxShape(1, 1, 1),   // ukuran PENUH, sama seperti BoxGeometry
  mass: 1, position: new Prism.Vector3(0, 5, 0),
  restitution: 0.3, friction: 0.6, object: mesh
});
world.addBody(body);

let last = performance.now();
function animate(now) {
  world.step(Math.min((now - last) / 1000, 0.1));   // langkah tetap 1/60 s di dalam; aman untuk frame rate berapa pun
  last = now;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

### Konsep dan satuan

- Satuan bebas asal konsisten; yang paling mudah: meter, kilogram, detik (gravitasi bumi = 9,81). Ukuran benda sekitar 0,1–10 satuan memberi hasil terbaik.
- `world.step(dt)` menjalankan **langkah tetap** (`fixedTimeStep`, default 1/60 s) sebanyak yang muat dalam `dt`, paling banyak `maxSubSteps` (default 5); sisa waktu dibuang bila tertinggal terlalu jauh (gerakan melambat, tidak macet). Hasil simulasi tidak bergantung pada frame rate.
- `mass = 0` berarti massa tak hingga: benda **statis**. Jika benda statis diberi `velocity`, ia bergerak dengan kecepatan itu dan mendorong benda dinamis (**platform kinematik**), tetapi tidak terpengaruh tumbukan.
- Restitusi dua benda digabung dengan `max`, gesekan dengan `√(μ₁·μ₂)`. Untuk lantai yang tidak memantulkan, beri `restitution: 0`.
- `linearDamping` / `angularDamping` adalah fraksi kecepatan yang hilang per detik (bukan koefisien gaya).
- Benda yang diam selama `sleepTime` (0,5 s) **tidur** dan tidak dihitung lagi sampai tersentuh benda yang cukup cepat, diberi gaya/impuls (`wakeUp()` otomatis), atau benda penopangnya dihapus. Matikan dengan `allowSleep: false` (per benda atau per world).
- Memindahkan benda manual (teleport): ubah `body.position` / `body.quaternion`, nolkan `velocity` dan `angularVelocity`, lalu panggil `body.wakeUp()`.
- `collisionGroup` dan `collisionMask` (bitmask) menentukan siapa menabrak siapa: A dan B bertabrakan jika `A.group & B.mask` dan `B.group & A.mask` keduanya bukan nol.

### Bentuk dan benda

| Kelas | Keterangan |
| --- | --- |
| `SphereShape(radius)` | Bola. |
| `BoxShape(lebar, tinggi, dalam)` | Kotak yang bisa berputar (OBB). |
| `CapsuleShape(radius, tinggiSilinder)` | Silinder + dua setengah bola, berdiri sepanjang sumbu Y lokal. |
| `PlaneShape(normal, konstanta)` | Setengah ruang tak hingga: titik dengan `normal·p < konstanta` adalah "padat". Hanya untuk benda statis; bisa digeser/diputar lewat pose benda. |
| `RigidBody(opsi)` | `shape`, `mass`, `position`, `quaternion`, `velocity`, `angularVelocity`, `restitution` (0,3), `friction` (0,5), `rollingFriction` (0), `linearDamping` / `angularDamping` (0,01), `gravityScale`, `ccd` (false), `allowSleep`, `collisionGroup`, `collisionMask`, `object` (Object3D yang disinkronkan), `userData`. |

Anggota `RigidBody`: `applyForce(gaya, titik?)` dan `applyTorque(torsi)` (berlaku di langkah berikutnya; panggil lagi tiap frame untuk gaya terus-menerus), `applyImpulse(impuls, titik?)` (mengubah kecepatan seketika; dengan titik dunia juga memutar benda), `getVelocityAtPoint(titik)`, `wakeUp()`, `setMass(m)`, `kineticEnergy`, `sleeping`, `isDynamic`.

### Opsi dan anggota `PhysicsWorld`

| Anggota | Fungsi |
| --- | --- |
| `new PhysicsWorld({ gravity, fixedTimeStep, maxSubSteps, solverIterations, allowSleep })` | Default: `(0, -9.81, 0)`, 1/60, 5, 20, `true`. |
| `addBody(b)`, `removeBody(b)` | Menambah/menghapus benda; menghapus membangunkan semua benda yang tidur dan ikut menghapus joint-nya. |
| `addJoint(j)`, `removeJoint(j)` | Menambah/melepas joint (benda-bendanya harus sudah ada di world). |
| `step(dt)` | Maju `dt` detik (lihat di atas). |
| `raycast(asal, arah, jarakMaks?)` | Benda terdekat yang kena sinar: `{ body, distance, point, normal }` atau `null`. Sinar yang dimulai di dalam bola/kotak tidak mengenainya; bidang hanya menghalangi dari sisi depan. |
| `onContact` | Fungsi `fn(contact)` yang dipanggil per kontak setiap langkah tetap (`contact.a`, `.b`, titik, normal, `depth`, `normalImpulse`). |
| `stats` | `bodies`, `awake`, `contacts`, `joints`, `stepMs`, `subSteps` dari panggilan `step()` terakhir. |
| `kineticEnergy` | Total energi kinetik semua benda dinamis. |
| Penyetelan | `baumgarte` (0,2), `penetrationSlop` (0,005), `maxCorrectionSpeed` (3), `restitutionThreshold` (1 m/s), `sleepTime`, `sleepLinearSpeed`, `sleepAngularSpeed`, `wakeSpeed`, `spinFriction` (0,02), `warmStarting`, `warmStartDistance`. |

Menembak dari layar ke dunia fisika (lihat [examples/06-physics](examples/06-physics/main.js)):

```js
const ndc = new Prism.Vector3(ndcX, ndcY, 0.5).unproject(camera);          // titik di dunia pada sinar layar
const direction = ndc.sub(camera.position).normalize();
const hit = world.raycast(camera.position, direction);                       // benda yang diketuk
if (hit) hit.body.applyImpulse(direction.clone().multiplyScalar(8), hit.point);
```

`Vector3.project(camera)` dan `unproject(camera)` mengubah dunia ⇄ koordinat layar ternormalisasi (-1…1); matriks kamera harus mutakhir (`renderer.render()` atau `camera.updateMatrixWorld()`).

### Joint

Joint menghubungkan dua benda (atau satu benda ke dunia, dengan `null`) dan diselesaikan oleh solver yang sama dengan kontak. Koreksi posisi memakai pseudo-velocity (seperti kontak), jadi joint **tidak menambah energi**.

```js
// Pendulum: bola menggantung dari titik tetap (null = dunia)
world.addJoint(new Prism.BallSocketJoint(ball, null, { anchor: new Prism.Vector3(0, 5, 0) }));

// Pintu: engsel vertikal di tepi pintu, dengan motor (kecepatan B relatif terhadap A)
const hinge = world.addJoint(new Prism.HingeJoint(null, door, { anchor: hingePoint, axis: new Prism.Vector3(0, 1, 0) }));
hinge.motorSpeed = 2;          // rad/s; bisa diubah kapan saja
hinge.maxMotorTorque = 50;     // N·m; 0 = motor mati

// Tali (hanya menarik saat tegang) dan batang kaku
world.addJoint(new Prism.DistanceJoint(a, b, { maxLength: 3 }));
world.addJoint(new Prism.DistanceJoint(a, b, { length: 2 }));
```

| Kelas | Mengunci | Opsi |
| --- | --- | --- |
| `BallSocketJoint(A, B, opsi)` | satu titik di A dan B harus berimpit; rotasi bebas | `anchor` (titik dunia saat dibuat) atau `anchorA` + `anchorB` (titik lokal benda) |
| `HingeJoint(A, B, opsi)` | titik berimpit **dan** hanya boleh berputar pada `axis` | seperti di atas + `axis` (arah dunia), `motorSpeed`, `maxMotorTorque` |
| `DistanceJoint(A, B, opsi)` | jarak antara dua titik | `anchor` / `anchorA` / `anchorB` (bawaan: pusat benda), `length` (batang kaku), `minLength`, `maxLength` (tali/penahan). Tanpa opsi panjang: jarak saat dibuat |

- Benda yang dihubungkan joint **tidak saling bertabrakan** kecuali `collideConnected: true`.
- Benda yang saling terhubung tidur dan bangun bersama; menendang satu ujung rantai membangunkan seluruh rantai pada langkah berikutnya.
- Menghapus benda dari world juga menghapus joint-nya. `world.removeJoint(joint)` melepas satu joint.
- `joint._error` (internal) memberi jarak antar-jangkar pada awal langkah terakhir, berguna untuk debugging.
- **Galat diskretisasi itu nyata**: rantai yang melesat sangat cepat bisa merenggang beberapa sentimeter sesaat (tes mengukur: gap terburuk < 4 mm pada 20°, < 12 mm pada 40°, < 12 cm pada pelepasan horizontal 90°). Memperkecil `fixedTimeStep` atau menaikkan `solverIterations` menguranginya.
- Belum ada: batas sudut engsel, pegas/damper, joint prismatik (geser), dan joint kerucut.

### Kapsul, CCD, dan hambatan gelinding

```js
// Kapsul: silinder sepanjang `height` (sumbu Y lokal) dengan dua setengah bola berjari-jari `radius`
const shape = new Prism.CapsuleShape(0.4, 1.2);                 // tinggi total = 1,2 + 2 × 0,4
const mesh = new Prism.Mesh(new Prism.CapsuleGeometry(0.4, 1.2), material);   // geometry yang cocok

// Peluru cepat: ccd menyapu lintasannya sehingga tidak menembus benda tipis
new Prism.RigidBody({ shape: new Prism.SphereShape(0.1), velocity: new Prism.Vector3(300, 0, 0), ccd: true });

// Bola yang akhirnya berhenti menggelinding (panjang dalam satuan dunia; 0,01–0,05 realistis)
new Prism.RigidBody({ shape: new Prism.SphereShape(0.5), rollingFriction: 0.03 });
```

- **Kapsul** bertumbukan dengan semua bentuk lain. Kapsul rebah di bidang atau kotak mendapat dua titik tumpu (stabil); kapsul sejajar kapsul juga dua titik. Inersianya dihitung dengan teorema sumbu sejajar dan **diverifikasi dengan integrasi numerik volume** di tes.
- **CCD** (`ccd: true`) hanya bekerja bila benda bergerak lebih jauh daripada setengah-ketebalannya dalam satu langkah: lintasannya dicuplik tidak lebih jarang daripada ukuran benda terkecilnya (sehingga tidak ada yang tipis yang terlewat), lalu waktu tumbukan pertama dihaluskan dengan bisection dan benda berhenti tepat di titik itu. **Kecepatan tidak diubah**, jadi restitusi tetap memakai kecepatan benturan sebenarnya (tes: bola 100 m/s dengan e = 0,5 memantul pada ≈ 50 m/s). Benda lain dianggap berada di pose awal langkah dan rotasi diabaikan; biayanya sebanding dengan jumlah benda untuk setiap benda cepat yang ber-`ccd`. Pada skena lambat hasilnya identik dengan tanpa CCD.
- **Hambatan gelinding** (`rollingFriction`): torsi hambat maksimum = `rollingFriction × gaya normal`. Tanpa ini bola menggelinding selamanya dan tumpukan tidak pernah tidur. Hasil analitik diuji: bola menggelinding melambat dengan `a = μ_r·g / (1,4·r)`.

### Apa yang dihitung

| Bagian | Metode |
| --- | --- |
| Gerak | Hukum II Newton, integrasi **semi-implisit Euler**; orientasi diintegrasikan dengan kuaternion dan dinormalkan tiap langkah |
| Rotasi | Torsi dan impuls bertitik; tensor inersia bola (2/5·m·r²) dan kotak (m/12·(b²+c²)) diputar ke ruang dunia tiap langkah |
| Fase lebar | Sweep-and-prune pada sumbu x; urutan disimpan antar-langkah (insertion sort hampir O(N)) dan **hanya pasangan yang melibatkan benda aktif** yang disisir |
| Fase sempit | semua pasangan bola/kotak/kapsul/bidang; kotak–bidang (hingga 8 titik); **kotak–kotak: SAT 15 sumbu + clipping muka** (kontak banyak titik untuk tumpukan stabil) dan titik terdekat antar-rusuk; kapsul memakai titik terdekat pada sumbunya (sejajar: dua titik); tanpa alokasi per panggilan |
| Solver | **Sequential impulse** (20 iterasi) dengan **warm starting**, restitusi, gesekan **Coulomb** (dua arah tangen, kerucut gesek), gesekan **puntir** (torsional), dan **split impulse** (koreksi penetrasi lewat pseudo-velocity sehingga tidak menambah energi) |
| Joint | Baris kecepatan di solver yang sama (3 baris titik, 2 baris keselarasan sumbu, 1 baris motor, 1–2 baris jarak) + koreksi posisi lewat pseudo-velocity + warm start |
| CCD | Sweep terpisah per benda ber-`ccd`: cuplik lintasan, bisection, berhenti di waktu tumbukan pertama |
| Tidur | Ambang kecepatan + waktu; benda tidur bertindak sebagai benda statis bagi tetangganya; benda yang terhubung joint tidur/bangun bersama; dunia yang seluruhnya tidur nyaris tanpa biaya |

### Hasil uji numerik

Semua angka di bawah berasal dari tes otomatis (`npm test`, file `tests/physics.test.js`), dijalankan di Node tanpa WebGL:

| Fenomena | Hasil yang diuji (toleransi di dalam tes) |
| --- | --- |
| Jatuh bebas | `y = y₀ − ½gt²` dengan galat ≤ 2% (galat integrator pada langkah 1/60 s); kecepatan horizontal proyektil konstan |
| Pantulan | Tinggi pantul ≈ e²·h: e = 0,5 → 0,757 m (target 0,75); e = 0,8 → 2,00 m (target 1,92); e = 0 → tidak memantul |
| Tumbukan | Momentum kekal eksak; energi kekal dalam 1% pada e = 1; massa tak sama sesuai rumus tumbukan lenting; e = 0 → kecepatan bersama |
| Gesekan | Jarak berhenti `v²/(2μg)` dalam 0,3 m; μ gabungan `√(μ₁μ₂)` |
| Bidang miring | Diam saat `tan θ < μ`; meluncur dengan `a = g(sin θ − μ cos θ)` dalam 12% |
| Gelinding | Bola yang diberi spin berakhir menggelinding di `v = (2/7)·r·ω₀` (±0,15 m/s) |
| Tumpukan | 3 kotak berdiri 6 s tanpa tidur: simpangan ≈ 0,001–0,002 m; kotak 20 kg di atas kotak 1 kg tidak amblas |
| Tumpukan acak | 36 benda campuran dalam wadah tertutup: semua tetap di dalam, kecepatan < 40 m/s, mengendap dan tidur |
| Energi | Benda yang dijatuhkan tidak pernah punya energi kinetik melebihi `m·g·h` (+3%) |
| Hambatan gelinding | Bola menggelinding melambat dengan `a = μ_r·g/(1,4·r)` (± 0,12 m/s setelah 3 s); dengan hambatan, bola berhenti dan tidur |
| Pendulum (joint) | Periode pendulum fisis dengan koreksi amplitudo dalam 1%; panjang tetap dalam 4 mm; energi tidak pernah naik > 0,5%, kehilangan orde-pertama terhadap dt (separuh dt → separuh kehilangan) |
| Engsel | Pintu pada engsel vertikal hanya berputar pada sumbunya (komponen lain < 0,02 rad/s), engsel bergeser < 5 mm; pintu menggantung berayun seperti pendulum fisis dalam bidangnya (periode ±1,2%) |
| Motor engsel | Mencapai kecepatan target (±0,06 rad/s); dengan torsi kecil percepatannya tepat `τ/I` (3 rad/s² → 1,5 rad/s setelah 0,5 s) |
| Tali dan batang | Tali tidak menarik saat kendur (identik dengan jatuh bebas) dan tidak meregang > 1% saat tegang; batang kaku menjaga panjang ±1% dua arah |
| Kapsul | Tensor inersia cocok dengan integrasi numerik volume (±1,5%); rebah ke sisinya di y = jari-jari lalu tidur; kontak benar untuk setiap pasangan bentuk; raycast pada sisi, cap, dan pose terputar |
| CCD | Bola 400 m/s menembus dinding setebal 5 cm tanpa `ccd` dan **tidak** menembus dengan `ccd`; restitusi tetap benar; skena lambat identik |
| Deterministik | Dua simulasi identik memberi hasil identik bit-per-bit (di mesin JS yang sama) |

Angka kinerja (sebelum/sesudah, dengan metodologi dan batasannya) ada di [Optimasi dan kinerja](#optimasi-dan-kinerja).

### Batasan fisika (yang tidak ada)

Mesin ini kompak dan teruji, tetapi **jauh dari lengkap** dibanding mesin fisika khusus seperti Rapier, Cannon atau Bullet. Belum ada:

- Soft body, kain, tali berupa rangkaian pegas, dan fluida
- Joint lain: batas sudut engsel, pegas/damper, prismatik (geser), kerucut; kendaraan
- CCD yang sempurna: sapuan memakai pose awal benda lain dan mengabaikan rotasi, hanya untuk benda ber-`ccd`; dua benda cepat yang saling menyilang masih bisa saling menembus
- Collider mesh/convex hull, bentuk gabungan (compound), silinder, dan heightfield
- Trigger volume (area tanpa tumbukan), karakter controller
- Suku giroskopik: benda tak simetris yang berputar cepat tidak "tumbling" secara fisis penuh
- Multithreading
- Jaminan hasil identik antar mesin JS/perangkat yang berbeda
- Kapsul vs kotak memakai tiga titik tumpu pada sumbu kapsul: cukup untuk bertumpu dan menyentuh tepi, tetapi bukan manifold lengkap

## Optimasi dan kinerja

Aturan untuk setiap optimasi di bagian ini: **hasil tidak boleh berubah**. Buktinya diperiksa, bukan diasumsikan: simulasi fisika dibandingkan dengan versi sebelumnya lewat checksum seluruh posisi/orientasi, dan tampilan dibandingkan piksel demi piksel di GPU (lihat "Bukti kualitas tidak turun" di bawah).

### Yang dilakukan

| Area | Teknik | Cara memakainya |
| --- | --- | --- |
| Render | **Frustum culling**: mesh di luar volume pandang kamera tidak digambar. Memakai bounding sphere (dihitung sekali dari geometry, dihitung ulang bila posisi vertex berubah) yang diuji terhadap 6 bidang volume pandang; tes bersifat konservatif sehingga **tidak pernah membuang benda yang terlihat** | Aktif secara bawaan. Matikan per mesh dengan `mesh.frustumCulled = false`. `geometry.boundingSphere` dan kelas `Frustum` tersedia untuk keperluan sendiri |
| Render | **Cache uniform**: warna/opacity material dan sampler texture hanya dikirim ke GPU bila berubah | Otomatis |
| Render | **`InstancedMesh`**: ribuan salinan satu geometry dalam **satu draw call**, tiap instance dengan matriks (dan warna) sendiri | Lihat di bawah |
| Fisika | Fase lebar menyisir **hanya pasangan yang melibatkan benda aktif**; urutan sweep disimpan antar-langkah (sebelumnya diurutkan ulang dari nol tiap langkah: O(N²)) | Otomatis |
| Fisika | Hanya benda yang aktif yang dihitung tiap langkah; **dunia yang seluruhnya tidur nyaris tanpa biaya** | Otomatis |
| Fisika | Fase sempit kotak–kotak dan cache warm-start tidak lagi mengalokasi objek per langkah | Otomatis |
| Fisika | **Hambatan gelinding** (`rollingFriction`) agar bola akhirnya berhenti, sehingga tumpukan benar-benar bisa tidur | Opsi `RigidBody` |

```js
// 1000 kotak = satu draw call
const boxes = new Prism.InstancedMesh(new Prism.BoxGeometry(), new Prism.LambertMaterial(), 1000);
const m = new Prism.Matrix4();
for (let i = 0; i < 1000; i++) {
  m.compose(position, quaternion, new Prism.Vector3(1, 1, 1));
  boxes.setMatrixAt(i, m);
  boxes.setColorAt(i, new Prism.Color(0xff6b6b));      // opsional: dikalikan dengan warna material
}
boxes.instanceMatrix.needsUpdate = true;                // wajib setelah mengubah matriks
boxes.instanceColor.needsUpdate = true;
boxes.count = 600;                                      // opsional: gambar hanya 600 instance pertama
scene.add(boxes);
```

Batasan `InstancedMesh`: instance tidak di-culling satu per satu dan mesh-nya tidak di-culling secara bawaan (set `frustumCulled = true` dan bounding sphere sendiri bila perlu); transparansi diurutkan per mesh, bukan per instance; tidak mendukung `wireframe`; normal per instance dihitung di vertex shader (benar untuk skala non-uniform). Mengubah `instanceMatrix` mengunggah seluruh buffer lagi (64 byte per instance), jadi tulis hanya saat ada yang berubah (contoh: [examples/07-joints](examples/07-joints/main.js) hanya menulis matriks benda yang bergerak).

### Hasil terukur (sebelum → sesudah)

Semua angka di bawah diukur **di sandbox pengembangan ini** dengan `npm run benchmark` (Node 22 / V8, CPU server, terbaik dari 5 putaran; "sebelum" = kode rilis v0.4.0, "sesudah" = rilis ini). Render diukur dengan **GL palsu tanpa GPU**: yang diukur adalah biaya JavaScript engine dan **jumlah panggilan GL yang tepat** (angka ini sama di mesin mana pun).

| Skenario | Sebelum | Sesudah | Catatan |
| --- | --- | --- | --- |
| Fisika, 100 / 300 / 1000 benda yang sedang jatuh (median per langkah) | 0,41 / 1,30 / 4,60 ms | 0,41 / 1,36 / 4,50 ms | **Tidak berubah**: waktu habis di solver, yang memang harus menghitung |
| Fisika, 1000 benda, sudah mengendap tetapi 81 bola masih menggelinding | 1,80 ms | 0,58 ms | 3,1× lebih cepat |
| Fisika, 1000 kotak, semuanya tidur | 1,33 ms | 0,010 ms | ≈ 130× lebih cepat |
| Fisika, 1000 benda dengan `rollingFriction`, mengendap penuh | (fitur belum ada) | 0,010 ms, 0 benda aktif | |
| Render, 1000 mesh, semua terlihat: panggilan GL / waktu JS | 4013 / 0,61 ms | 3016 / 0,59 ms | −25% panggilan GL (cache uniform) |
| Render, 1000 mesh, **10% terlihat**: panggilan GL / draw call / waktu JS | 4013 / 1000 / 0,67 ms | 316 / 100 / 0,15 ms | −92% panggilan GL, 4,5× lebih cepat |
| Render, 4000 mesh semua terlihat: panggilan GL | 16.013 | 12.016 | −25% |
| Render, 4000 kotak identik: **mesh terpisah → satu `InstancedMesh`** (panggilan GL / draw call / waktu JS) | 12.013 / 4000 / 2,31 ms | 17 / 1 / 0,01 ms | |

Mesin pengukur: Intel Xeon 2,1 GHz, **1 vCPU**, Node 22.22. Variasi antar-putaran di mesin ini sekitar ±10%, jadi selisih kecil tidak berarti. Khusus baris fisika benda-jatuh, pengukuran A/B bergantian (4 putaran, terbaik dari 5 build tiap putaran) memberi rata-rata **4,21 ms (v0.4.0) vs 4,33 ms (rilis ini)** untuk 1000 benda dan **1,21 vs 1,25 ms** untuk 300 benda: tidak bisa dibedakan dari noise, dan bila ada pengaruh nyata, itu di bawah sekitar 5% **lebih lambat** (biaya tambahan fitur baru seperti joint, CCD, dan hambatan gelinding yang dicek tiap langkah).

Yang **tidak** diukur dan perlu kamu ketahui:

- Tidak ada pengukuran di GPU atau di HP. Pengurangan panggilan GL biasanya berarti kerja driver yang lebih sedikit, tetapi besarnya berbeda tiap perangkat; baris `InstancedMesh` juga belum menghitung biaya mengunggah 256 KB data instance per pembaruan (4000 instance).
- Optimasi mikro pada solver fisika (fungsi khusus tanpa percabangan, fase sempit tanpa alokasi, manifold yang dipakai ulang) **tidak memberi percepatan yang terukur** pada skenario benda-jatuh; manfaatnya hanya berkurangnya sampah memori (GC).
- Satu masalah performa sungguhan ditemukan lewat profiling dan diperbaiki (urutan fase lebar dibangun ulang dari nol tiap langkah); hasilnya terlihat pada baris "sudah mengendap".
- Tidak ada perbandingan dengan engine lain. Bandingkan dirimu sendiri: jalankan benchmark di perangkatmu.

### Bukti kualitas tidak turun

- **Fisika**: dengan sleeping dimatikan, 120 benda × 400 langkah menghasilkan checksum **identik bit-per-bit** antara v0.4.0 dan rilis ini (`d75e0e1a`). Dengan sleeping hidup, selisih posisi terbesar **3×10⁻⁸ m**, sumbernya satu hal yang disengaja: benda yang baru bangun kini langsung mendapat kontak dengan tetangga yang masih tidur pada langkah itu juga. Checksum perilaku bawaan (`afc798f4`) sejak itu tidak berubah oleh optimasi.
- **Tampilan**: tes piksel di browser membandingkan seluruh frame dengan dan tanpa culling (**nol piksel berbeda**) dan `InstancedMesh` dengan mesh terpisah (Lambert, skala non-uniform, warna per instance). Tes unit menguji secara acak (posisi, rotasi, skala) bahwa culling tidak pernah membuang benda yang terlihat.

### Benchmark di perangkatmu

```bash
npm run benchmark            # Node: fisika dan biaya JS penggambaran (GL palsu), plus jumlah panggilan GL
```

Atau buka `http://localhost:8080/tests/browser/bench.html` (setelah `npm run dev`) di HP atau laptop dan tekan **Mulai**. Halaman itu mengukur fisika dan penggambaran sungguhan di browser perangkat itu (1000 mesh dengan/tanpa culling, `InstancedMesh`, tumpukan fisika jatuh dan mengendap) dan menampilkan hasil yang bisa disalin. Catatan: `gl.finish()` di sebagian driver seluler kembali lebih awal, jadi waktu GPU bisa terlaporkan terlalu kecil.

## Contoh

Jalankan `npm run dev`, lalu buka `http://localhost:8080/examples/`.

| Contoh | Menunjukkan |
| --- | --- |
| [`01-triangle`](examples/01-triangle/) | `Renderer` dan `WebGLProgram` dengan WebGL2 mentah |
| [`02-game`](examples/02-game/) | Prism Dodge, game 2D kecil dengan vertex buffer dinamis dan kontrol sentuh |
| [`03-scene`](examples/03-scene/) | Scene graph, geometry, material, transparansi, wireframe, resize |
| [`04-lighting`](examples/04-lighting/) | Lampu ambient, directional, dan point yang mengorbit pada `LambertMaterial` |
| [`05-obj`](examples/05-obj/) | Viewer OBJ + MTL: model bawaan atau file dari perangkatmu (geser untuk memutar) |
| [`06-physics`](examples/06-physics/) | Fisika rigid body: piramida kotak, hujan benda, ketuk untuk menembak |
| [`07-joints`](examples/07-joints/) | Rantai kapsul + bola penghancur (joint), kincir bermotor (engsel), hujan kotak lewat `InstancedMesh`, peluru cepat dengan CCD |
| [`cdn`](examples/cdn/) | Pemakaian lewat tag `<script>` dan CSS, tanpa bundler |

## Arsitektur

```
src/
  index.js        API publik (hanya yang diekspor di sini yang didukung)
  constants.js    FrontSide/BackSide/DoubleSide, filter dan wrapping texture
  prism.css       sumber CSS bantu
  math/           Vector2/3/4, Matrix3/4, Quaternion, Euler, Color, Frustum
  core/           Object3D, Group, Scene, Mesh, InstancedMesh, Camera, Perspective/OrthographicCamera
  geometry/       BufferAttribute, BufferGeometry, Box/Plane/Sphere/CapsuleGeometry
  materials/      Material, BasicMaterial, NormalMaterial, LambertMaterial
  lights/         Light, AmbientLight, DirectionalLight, PointLight
  textures/       Texture
  physics/        PhysicsWorld, RigidBody, shapes (bola/kotak/kapsul/bidang), collision (fase sempit + raycast), joints
  loaders/        OBJLoader, MTLLoader, TextureLoader, resolveURL, fetchText
  renderer/       Renderer, WebGLState (cache state), WebGLPrograms (cache program),
                  WebGLGeometries (buffer GPU), WebGLTextures, WebGLLights,
                  RenderList, WebGLProgram, shaders/
dist/             hasil build (di-commit supaya bisa disajikan CDN)
assets/           logo, preview, dan assets/models/ (crate, house)
scripts/          serve.js (server dev), make-sample-assets.js
tests/            unit test (node:test, mock WebGL) dan tests/browser/ (tes piksel di GPU)
examples/         contoh yang bisa dijalankan
```

## Dukungan browser

Prism.js membutuhkan **WebGL2**. Tanpa WebGL2, pembuatan `Renderer` melempar error yang menjelaskan kemungkinan penyebabnya. Belum ada fallback WebGL1.

- **Teruji:** Chromium 141 headless dengan rendering software (SwiftShader).
- **Belum diuji:** Firefox, Safari, Edge, Chrome Android, GPU sungguhan, dan performa di perangkat apa pun.

## Pengembangan

```bash
npm run dev        # server lokal (tambahkan: -- --port 3000 untuk ganti port)
npm test           # unit test, butuh Node >= 20
npm install        # hanya diperlukan untuk build (memasang esbuild)
npm run build      # membuat dist/ (JS dan CSS)
npm run assets     # membuat ulang model contoh di assets/models/
npm run benchmark  # benchmark fisika dan biaya JS penggambaran (lihat "Optimasi dan kinerja")
```

Unit test berjalan di Node tanpa GPU: renderer diuji terhadap mock context WebGL, dan fisika diuji langsung secara numerik. Untuk renderer: yang diuji adalah logika, validasi argumen, pesan error, cache state, urutan gambar, pembebasan resource GPU, dan ketepatan numerik math. Test ini **tidak** memeriksa piksel. Untuk itu ada halaman tes browser: jalankan `npm run dev`, buka `http://localhost:8080/tests/browser/`, dan halaman itu merender adegan kecil di WebGL2 sungguhan lalu membandingkan warna piksel (lampu, texture, transparansi, culling, loader OBJ/MTL dengan file nyata). Halaman ini juga bisa dibuka dari HP untuk menguji perangkatmu sendiri.

## Merilis ke GitHub dan jsDelivr

jsDelivr (`/gh/`) menyajikan berkas langsung dari repo GitHub pada tag tertentu, jadi:

1. **Unggah semua berkas**, termasuk folder `dist/` dan `assets/` (keduanya harus ada di repo).
2. **Buat tag `v0.5.0`.** Lewat terminal:
   ```bash
   git tag v0.5.0
   git push origin v0.5.0
   ```
   atau lewat web GitHub: *Releases → Draft a new release → Choose a tag → ketik `v0.5.0` → Publish release*.
3. **Cek URL** di browser, misalnya `https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.js`.
4. Jika berkas baru tidak langsung muncul, itu cache CDN. Kamu bisa meminta purge lewat `https://purge.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.5.0/dist/prism.js`.
5. Setiap kali source berubah, jalankan `npm run build` dan commit hasil `dist/` sebelum membuat tag baru. Jangan mengubah isi tag yang sudah dirilis; buat versi baru (misalnya `v0.5.1`).

## Pemecahan masalah

| Gejala | Kemungkinan penyebab dan solusi |
| --- | --- |
| `Prism.js: Failed to create a WebGL2 context` | Browser/perangkat tidak mendukung WebGL2, akselerasi hardware dimatikan, atau canvas sudah punya context lain (mis. `"2d"`). Pesan error memuat keterangan dari browser jika ada. |
| URL CDN menghasilkan 404 | Tag `v0.5.0` belum dibuat/di-push, atau folder `dist/` / `assets/` belum diunggah. Lihat [Merilis](#merilis-ke-github-dan-jsdelivr). |
| `Prism is not defined` | Tag `<script>` Prism.js harus dimuat **sebelum** skripmu, dan memakai `dist/prism.js` atau `dist/prism.min.js` (bukan `prism.module.js`; itu untuk `import`). |
| Variabel global `Prism` bentrok | Library penyorot sintaks [PrismJS](https://prismjs.com) juga memakai nama global `Prism` dan nama berkas `prism.js`/`prism.css`. Jangan memuat keduanya pada halaman yang sama; gunakan `dist/prism.module.js` dengan `import * as Prism ...` (nama bisa kamu ganti) atau ganti nama berkas salinanmu. |
| Layar kosong, tanpa error | Pastikan `renderer.render(scene, camera)` dipanggil terus (lewat `requestAnimationFrame`), objek berada di depan kamera (kamera menghadap -Z), dan `near`/`far` kamera mencakup objekmu. Jika canvas diatur CSS, panggil `renderer.resizeToDisplaySize()` dan perbarui `camera.aspect`. |
| Objek terlihat dari dalam / bolong | Segitiga hanya digambar dari sisi depan secara default; gunakan `side: Prism.DoubleSide` atau `BackSide`. |
| Objek `LambertMaterial` tampak hitam | Belum ada lampu di scene, atau geometry tidak punya `normal` (panggil `computeVertexNormals()`). Tambahkan `AmbientLight` dan/atau `DirectionalLight`. |
| Texture tidak muncul, objek hanya berwarna | Gambar belum selesai dimuat, URL salah (cek console), geometry tidak punya `uv`, atau gambar dari domain lain tanpa header CORS. |
| Model OBJ tidak terlihat | Ukurannya sangat besar/kecil atau jauh dari origin (skala dan pusatkan model, lihat `examples/05-obj`), atau perlu `side: Prism.DoubleSide`. |
| `Failed to load OBJ file ... (HTTP 404)` | Path atau tag salah. Path `mtllib` dan `map_Kd` dihitung relatif terhadap file yang menyebutkannya. |
| Benda fisika cepat menembus dinding / lantai | Beri benda itu `ccd: true`. Untuk benda yang tidak ber-`ccd`: kecilkan `fixedTimeStep`, naikkan `maxSubSteps`, atau tebalkan penghalang. |
| `InstancedMesh` tidak berubah setelah `setMatrixAt` | Set `mesh.instanceMatrix.needsUpdate = true` (dan `instanceColor.needsUpdate = true` untuk warna) setelah mengubah datanya. |
| Mesh tiba-tiba menghilang di tepi layar | Frustum culling memakai bounding sphere dari geometry; bila kamu menggeser vertex di shader atau mengubah array posisi, set `attribute.needsUpdate = true` atau `mesh.frustumCulled = false`. |
| Rantai/joint merenggang sesaat saat bergerak cepat | Galat diskretisasi: naikkan `solverIterations`, kecilkan `fixedTimeStep`, atau kurangi rasio massa antar-benda yang terhubung. |
| Tumpukan fisika bergetar atau melorot | Naikkan `solverIterations`, hindari rasio massa ekstrem (>20:1), dan biarkan `warmStarting` menyala. |
| Benda fisika tidak bergerak setelah dipindah manual | Panggil `body.wakeUp()` dan nolkan kecepatannya setelah mengubah `position`. |
| Error kompilasi shader | Pesan menyertakan log driver, nama program, dan potongan baris source yang bermasalah. |

## Keterbatasan

Belum ada, dan akan dikerjakan bertahap (urutan di [PROGRESS.md](PROGRESS.md)):

- Bayangan, specular/PBR, environment map
- Fisika: soft body/kain/fluida, joint tambahan (batas sudut, pegas, geser), collider mesh/convex (rinci di [Batasan fisika](#batasan-fisika-yang-tidak-ada))
- Loader glTF/GLB (OBJ + MTL sudah ada, tetapi tanpa specular, bump map, dan poligon cekung)
- Pengukuran kinerja di GPU/HP sungguhan (tersedia halaman benchmark, tetapi belum ada hasil dari perangkat nyata)
- Shader/atribut kustom (`ShaderMaterial`)
- Raycaster / picking, kontrol kamera, sistem animasi
- Fallback WebGL1, paket npm

Tidak ada perbandingan dengan engine lain di proyek ini, dan angka kinerja hanya berlaku untuk mesin tempat benchmark dijalankan.

## Lisensi

MIT, lihat [LICENSE](LICENSE).
