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

> **Status: pre-alpha (v0.2.0).** Alur inti sudah berjalan dari ujung ke ujung: math, scene graph, kamera, geometry, material, dan `renderer.render(scene, camera)`.
> **Belum ada** lighting, texture, loader (OBJ/glTF), shadow, picking, maupun sistem animasi. Prism.js **belum** sebanding fiturnya dengan engine matang seperti Three.js. Rincian lengkap ada di [PROGRESS.md](PROGRESS.md).

## Daftar isi

- [Kenapa Prism.js](#kenapa-prismjs)
- [Instalasi](#instalasi)
- [Mulai cepat](#mulai-cepat)
- [CSS bantu](#css-bantu)
- [Aset](#aset)
- [Ringkasan API](#ringkasan-api)
- [Contoh](#contoh)
- [Arsitektur](#arsitektur)
- [Dukungan browser](#dukungan-browser)
- [Pengembangan](#pengembangan)
- [Merilis ke GitHub dan jsDelivr](#merilis-ke-github-dan-jsdelivr)
- [Pemecahan masalah](#pemecahan-masalah)
- [Keterbatasan](#keterbatasan)
- [Lisensi](#lisensi)

## Kenapa Prism.js

Engine kecil dengan arsitektur sendiri: API sederhana untuk pemula, titik perluasan yang jelas untuk yang sudah mahir, tanpa dependensi runtime, dan tanpa framework. Kodenya tidak membungkus atau menyalin engine 3D lain.

Prinsip: API sederhana, inti kecil, modular, kode mudah dibaca, dan mengutamakan browser.

## Instalasi

### Lewat CDN (jsDelivr)

Cara tercepat, tanpa bundler. Taruh CSS (opsional) di `<head>` dan JS sebelum skripmu:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.css">
<script src="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.js"></script>
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

Ganti `@v0.2.0` dengan versi lain bila perlu. Untuk produksi, pakai tag versi yang tetap dan hindari `@main` karena isinya bisa berubah dan di-cache CDN.

### ES module lewat CDN

```html
<script type="module">
  import * as Prism from "https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.module.js";

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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.css">
  <style>html, body { height: 100%; margin: 0; background: #0b0d17; }</style>
</head>
<body>
  <canvas id="canvas" class="prism-canvas prism-fullscreen"></canvas>
  <pre id="error" class="prism-error" hidden></pre>

  <script src="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.js"></script>
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

Material saat ini tanpa pencahayaan: `BasicMaterial` berwarna rata, `NormalMaterial` diwarnai berdasarkan normal permukaan.

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
https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/assets/nama-file
```

Contoh dengan berkas yang sudah ada:

```html
<img src="https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/assets/logo.svg" width="64" alt="Prism.js">
```

| Berkas | Keterangan |
| --- | --- |
| `assets/logo.svg` | Logo proyek. |
| `assets/preview-scene.png` | Tangkapan layar contoh `03-scene` (dipakai di README ini). |

Catatan: `TextureLoader` dan loader model (OBJ/glTF) **belum ada** (rencana Phase 7 dan 8). Jadi saat ini Prism.js belum bisa memuat texture atau model dari `assets/`; folder ini baru dipakai untuk berkas dokumentasi. Jangan mengubah isi berkas pada tag yang sudah dirilis (CDN meng-cache); buat tag baru.

## Ringkasan API

| Area | Kelas |
| --- | --- |
| Math | `Vector2`, `Vector3`, `Vector4`, `Matrix3`, `Matrix4`, `Quaternion`, `Euler`, `Color` |
| Scene graph | `Object3D`, `Scene`, `Mesh` |
| Kamera | `PerspectiveCamera` (fov dalam **derajat**), `OrthographicCamera` |
| Geometry | `BufferGeometry`, `BufferAttribute`, `BoxGeometry`, `PlaneGeometry`, `SphereGeometry` |
| Material | `Material`, `BasicMaterial`, `NormalMaterial` |
| Rendering | `Renderer`, `WebGLProgram` (level rendah) |
| Konstanta | `FrontSide`, `BackSide`, `DoubleSide`, `DEG2RAD`, `RAD2DEG` |

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
| `info` | Penghitung: `render.calls`, `render.triangles`, `render.lines`, `render.frame`, `memory.geometries`, `memory.programs`. |
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

### Urutan gambar dan memori

- Mesh opaque dikelompokkan per material dan digambar dari dekat ke jauh; mesh transparan (`transparent: true` atau `opacity < 1`) digambar sesudahnya, dari jauh ke dekat.
- Program shader dikompilasi satu kali per tipe material, dan perubahan state GL di-cache.
- Buffer GPU dibuat saat pertama digambar. `geometry.dispose()` membebaskan buffer satu geometry (diunggah ulang jika digambar lagi); `renderer.dispose()` membebaskan semuanya.
- Jika context WebGL hilang lalu pulih, program dan buffer milik engine dibangun ulang otomatis.

## Contoh

Jalankan `npm run dev`, lalu buka `http://localhost:8080/examples/`.

| Contoh | Menunjukkan |
| --- | --- |
| [`01-triangle`](examples/01-triangle/) | `Renderer` dan `WebGLProgram` dengan WebGL2 mentah |
| [`02-game`](examples/02-game/) | Prism Dodge, game 2D kecil dengan vertex buffer dinamis dan kontrol sentuh |
| [`03-scene`](examples/03-scene/) | Scene graph, geometry, material, transparansi, wireframe, resize |
| [`cdn`](examples/cdn/) | Pemakaian lewat tag `<script>` dan CSS, tanpa bundler |

## Arsitektur

```
src/
  index.js        API publik (hanya yang diekspor di sini yang didukung)
  constants.js    FrontSide / BackSide / DoubleSide
  prism.css       sumber CSS bantu
  math/           Vector2/3/4, Matrix3/4, Quaternion, Euler, Color
  core/           Object3D, Scene, Mesh, Camera, PerspectiveCamera, OrthographicCamera
  geometry/       BufferAttribute, BufferGeometry, Box/Plane/SphereGeometry
  materials/      Material, BasicMaterial, NormalMaterial
  renderer/       Renderer, WebGLState (cache state), WebGLPrograms (cache program),
                  WebGLGeometries (buffer GPU), RenderList, WebGLProgram, shaders/
dist/             hasil build (di-commit supaya bisa disajikan CDN)
assets/           logo dan berkas pendukung
scripts/serve.js  server dev tanpa dependensi
tests/            unit test (node:test, memakai mock WebGL)
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
```

Unit test berjalan terhadap mock context WebGL: yang diuji adalah logika, validasi argumen, pesan error, cache state, urutan gambar, pembebasan resource GPU, dan ketepatan numerik math. Test **tidak** memeriksa piksel; hasil render diperiksa dengan menjalankan contoh di browser.

## Merilis ke GitHub dan jsDelivr

jsDelivr (`/gh/`) menyajikan berkas langsung dari repo GitHub pada tag tertentu, jadi:

1. **Unggah semua berkas**, termasuk folder `dist/` dan `assets/` (keduanya harus ada di repo).
2. **Buat tag `v0.2.0`.** Lewat terminal:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
   atau lewat web GitHub: *Releases → Draft a new release → Choose a tag → ketik `v0.2.0` → Publish release*.
3. **Cek URL** di browser, misalnya `https://cdn.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.js`.
4. Jika berkas baru tidak langsung muncul, itu cache CDN. Kamu bisa meminta purge lewat `https://purge.jsdelivr.net/gh/JANUARPROGRAM/Prism.js@v0.2.0/dist/prism.js`.
5. Setiap kali source berubah, jalankan `npm run build` dan commit hasil `dist/` sebelum membuat tag baru. Jangan mengubah isi tag yang sudah dirilis; buat versi baru (misalnya `v0.2.1`).

## Pemecahan masalah

| Gejala | Kemungkinan penyebab dan solusi |
| --- | --- |
| `Prism.js: Failed to create a WebGL2 context` | Browser/perangkat tidak mendukung WebGL2, akselerasi hardware dimatikan, atau canvas sudah punya context lain (mis. `"2d"`). Pesan error memuat keterangan dari browser jika ada. |
| URL CDN menghasilkan 404 | Tag `v0.2.0` belum dibuat/di-push, atau folder `dist/` / `assets/` belum diunggah. Lihat [Merilis](#merilis-ke-github-dan-jsdelivr). |
| `Prism is not defined` | Tag `<script>` Prism.js harus dimuat **sebelum** skripmu, dan memakai `dist/prism.js` atau `dist/prism.min.js` (bukan `prism.module.js`; itu untuk `import`). |
| Variabel global `Prism` bentrok | Library penyorot sintaks [PrismJS](https://prismjs.com) juga memakai nama global `Prism` dan nama berkas `prism.js`/`prism.css`. Jangan memuat keduanya pada halaman yang sama; gunakan `dist/prism.module.js` dengan `import * as Prism ...` (nama bisa kamu ganti) atau ganti nama berkas salinanmu. |
| Layar kosong, tanpa error | Pastikan `renderer.render(scene, camera)` dipanggil terus (lewat `requestAnimationFrame`), objek berada di depan kamera (kamera menghadap -Z), dan `near`/`far` kamera mencakup objekmu. Jika canvas diatur CSS, panggil `renderer.resizeToDisplaySize()` dan perbarui `camera.aspect`. |
| Objek terlihat dari dalam / bolong | Segitiga hanya digambar dari sisi depan secara default; gunakan `side: Prism.DoubleSide` atau `BackSide`. |
| Error kompilasi shader | Pesan menyertakan log driver, nama program, dan potongan baris source yang bermasalah. |

## Keterbatasan

Belum ada, dan akan dikerjakan bertahap (urutan di [PROGRESS.md](PROGRESS.md)):

- Lighting (`AmbientLight`, `DirectionalLight`, `PointLight`) dan material berpencahayaan
- Texture dan `TextureLoader`
- Loader OBJ dan glTF
- Frustum culling, instancing, dan optimasi lain yang diukur di GPU sungguhan
- Shader/atribut kustom (`ShaderMaterial`)
- Raycaster / picking, kontrol kamera, sistem animasi
- Fallback WebGL1, paket npm

Tidak ada klaim performa atau perbandingan dengan engine lain di proyek ini, karena belum diukur.

## Lisensi

MIT, lihat [LICENSE](LICENSE).
