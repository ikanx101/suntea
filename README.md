# Toko Santi Irawati — Webapp Manajemen Toko

Webapp privat untuk mencatat produk, pesanan, invoice, keuangan (kas masuk/keluar), dan konfirmasi piutang milik Santi Irawati (reseller frozen food & ready-to-eat). Dibangun sesuai `requirement_final.md`.

## Versi

**v1.0.2** — rilis percobaan pertama, sudah mendapat beberapa perbaikan reliabilitas deploy (termasuk satu bug kritis: loop redirect saat login di Railway).

### Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/).

#### [1.0.2] - 2026-09-19

Diperbaiki (kritis — ditemukan setelah deploy sungguhan ke Railway oleh Santi):

- **Login berulang gagal dengan `ERR_TOO_MANY_REDIRECTS`/"too many redirects"** di Railway walau kredensial benar. Penyebab: middleware (jalan di Edge runtime) dan halaman login (jalan di Node runtime) menentukan nama cookie sesi NextAuth secara **otomatis** dari deteksi protokol request, dan keduanya bisa tidak sepakat di belakang proxy Railway — middleware menganggap belum login (redirect ke `/login`), halaman login menganggap sudah login (redirect ke `/`), keduanya saling lempar redirect tanpa henti. Diperbaiki dengan `lib/auth-cookie.ts`: nama cookie sesi kini ditentukan **eksplisit & identik** di kedua sisi berdasarkan `NODE_ENV` (konsisten diisi Next.js sendiri), bukan deteksi otomatis. Sudah diverifikasi langsung di production: sebelum fix `curl` mendeteksi 50+ redirect berulang, sesudah fix langsung `200` tanpa redirect sama sekali.
- Setelah fix dideploy, dilakukan **QA ulang penuh langsung di situs production** (bukan cuma lokal): login/logout berulang kali, ganti sesi, seluruh alur CRUD (produk, rekening bank, pesanan, invoice PNG, piutang, transaksi manual, laporan), dan tampilan mobile — semuanya normal. Detail lihat bagian Hasil Verifikasi Tahap 3.

#### [1.0.1] - 2026-09-19

Diperbaiki:

- Seed akun admin sekarang berjalan **otomatis** setiap kali aplikasi start/redeploy (bagian dari `npm run start`: `prisma migrate deploy && node prisma/seed.js && next start`). Sebelumnya harus dijalankan manual lewat `railway run npx prisma db seed`, yang gagal kalau Railway CLI belum ter-install di komputer lokal (perintah itu jalan di komputer lokal, bukan di server Railway). Seed dibuat idempoten — aman dijalankan berulang tiap deploy, dan tidak menimpa password admin yang sudah diganti dari halaman Pengaturan.

#### [1.0.0] - 2026-09-19

Ditambahkan:

- **Autentikasi**: login (Credentials, single admin), logout, ganti password, sesi bertahan 30 hari, tanpa halaman registrasi publik.
- **Produk**: CRUD + arsip barang, field nama pemasok (internal, tidak tampil di invoice), kategori, harga beli/jual, pencarian & filter kategori.
- **Pesanan**: CRUD pesanan multi-item dengan snapshot harga & nama barang, status pesanan (Baru/Diproses/Selesai/Dibatalkan) terpisah dari status pembayaran.
- **Invoice PNG**: generate invoice bertema girly (lebar tetap 1080px, tinggi menyesuaikan), pilih rekening bank tujuan, tabel item hanya nama barang/qty/total, tombol download & share (Web Share API).
- **Rekening Bank**: CRUD rekening bank (bisa lebih dari satu), snapshot ke pesanan saat invoice dibuat.
- **Keuangan**: buku kas — transaksi manual & otomatis dari konfirmasi pembayaran, transaksi hasil pesanan bersifat read-only.
- **Piutang**: halaman konfirmasi pembayaran — checklist Lunas/Belum Lunas per invoice, filter & pencarian, ringkasan total piutang.
- **Dashboard**: ringkasan pemasukan/pengeluaran/laba bersih, margin kotor, pesanan per status, total piutang, produk terlaris, grafik tren.
- **Laporan**: filter transaksi & pesanan berdasarkan rentang tanggal.
- **Pengaturan**: nama toko, logo (disimpan sebagai base64 di database), kelola rekening bank, ganti password. Logo awal (`public/logo.png`) otomatis terpasang saat seed pertama kali.
- **Health Check**: endpoint publik `GET /api-health-check` (tidak perlu login) untuk mengecek status koneksi database & kelengkapan env var penting — berguna untuk memantau kesehatan aplikasi setelah deploy.

Diperbaiki (ditemukan & diperbaiki lewat QA browser sebelum rilis — lihat bagian Hasil Verifikasi):

- Posisi scroll browser tidak reset ke atas setelah redirect dari Server Action (misal setelah submit "Tambah Pesanan Baru"), menyebabkan header halaman pesanan sempat tertutup topbar. Diperbaiki dengan `components/scroll-to-top.tsx` yang mereset scroll ke atas setiap perpindahan halaman.

Sengaja belum termasuk (menunggu konfirmasi Santi — lihat bagian 12 `requirement_final.md`):

- Export laporan ke CSV/Excel.
- Foto produk & tracking stok kuantitas.
- Akun multi-user (staf/kurir).
- Varian ukuran invoice (saat ini hanya 1 ukuran universal, lebar 1080px).

## Stack Teknis

| Layer | Pilihan |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS (tema custom "Girly & Active") |
| Database | PostgreSQL |
| ORM | Prisma 5 |
| Autentikasi | next-auth v4 (Credentials Provider, JWT session) + bcryptjs |
| Invoice PNG | satori (JSX → SVG) + @resvg/resvg-js (SVG → PNG) |
| Chart | Recharts |
| Validasi | Zod |
| Mutasi data | Next.js Server Actions |

## Setup Pengembangan Lokal

Prasyarat: Node.js 20+, Docker (untuk Postgres lokal).

```bash
# 1. Install dependency
npm install

# 2. Salin file environment
cp .env.example .env
# lalu isi AUTH_SECRET (contoh: openssl rand -base64 32), ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Jalankan Postgres lokal
docker compose up -d

# 4. Migrasi database
npx prisma migrate dev

# 5. Buat akun admin (Santi) + seed pengaturan awal (termasuk logo default)
npx prisma db seed

# 6. Jalankan aplikasi
npm run dev
```

Buka `http://localhost:3000`, login dengan `ADMIN_EMAIL`/`ADMIN_PASSWORD` yang diisi di `.env`.

Untuk menguji seperti kondisi production sebelum deploy, jalankan `npm run build` lalu `npm run start` (bukan `npm run dev`) — beberapa masalah hanya muncul di production build.

## Cara Deploy ke Railway

1. Push repository ini ke GitHub.
2. Di Railway, buat **New Project** → **Deploy from GitHub repo**, pilih repo ini.
3. Tambahkan **plugin/service PostgreSQL** ke project yang sama (klik **+ New** → **Database** → **PostgreSQL**).
4. Buka service web (Next.js) → tab **Variables**, tambahkan:
   - `DATABASE_URL` → isi dengan referensi variable Postgres, bukan nilai hardcode: `${{Postgres.DATABASE_URL}}` (sesuaikan nama service Postgres kamu).
   - `AUTH_SECRET` → generate manual (`openssl rand -base64 32`), **wajib diisi sebelum deploy pertama**.
   - `NEXTAUTH_URL` → domain publik yang diberikan Railway untuk service ini, contoh `https://nama-service.up.railway.app` (bisa diisi setelah domain pertama kali dibuat, lalu redeploy).
   - `ADMIN_EMAIL` dan `ADMIN_PASSWORD` → kredensial admin awal untuk seed.
5. Pastikan **Build Command** memakai default (`npm run build`) — script ini sudah menjalankan `prisma generate` otomatis (juga lewat `postinstall`).
6. Pastikan **Start Command** memakai default (`npm run start`) — script ini otomatis menjalankan `prisma migrate deploy` lalu **seed admin** (`node prisma/seed.js`) sebelum `next start`, setiap kali service start/redeploy. **Tidak perlu Railway CLI atau langkah manual apa pun** — akun admin dari `ADMIN_EMAIL`/`ADMIN_PASSWORD` otomatis dibuat saat deploy pertama. Seed ini aman dijalankan berulang: kalau admin sudah ada, seed hanya memastikan record-nya ada dan **tidak menimpa password** yang sudah kamu ganti lewat halaman Pengaturan.
7. Deploy dan tunggu sampai status **Active**. Cek tab **Deploy Logs** — pastikan muncul baris `Admin user dibuat: ...` (atau `Admin user sudah ada, ...` kalau ini bukan deploy pertama).
8. Buka domain publik dari Railway, login dengan `ADMIN_EMAIL`/`ADMIN_PASSWORD`, lalu segera ganti password lewat halaman **Pengaturan**.

> **Tidak bisa login setelah deploy?** Cek `https://<domain-kamu>/api-health-check` dulu — kalau `checks.database.ok` bernilai `false`, berarti `DATABASE_URL` belum benar (biasanya lupa pakai syntax `${{Postgres.DATABASE_URL}}`). Kalau health check `ok` tapi login tetap gagal, buka **Deploy Logs** dan cari baris `Admin user dibuat`/`Admin user sudah ada` — kalau baris itu tidak ada sama sekali, kemungkinan `ADMIN_EMAIL`/`ADMIN_PASSWORD` belum diisi (seed akan melempar error dan proses start akan gagal total, terlihat jelas di log). Isi variable-nya lalu redeploy.

### Checklist Anti-Error Railway

Poin-poin umum penyebab deploy Next.js + Prisma gagal di Railway, dan status penanganannya di project ini:

- [x] **Prisma generate saat build** — `postinstall: prisma generate` di `package.json`, dan juga eksplisit di `build`: `prisma generate && next build`. Ganda supaya aman walau salah satu hook di-skip Railway.
- [x] **Migrasi & seed admin otomatis sebelum start** — `start`: `prisma migrate deploy && node prisma/seed.js && next start -p ${PORT:-3000}`. Tidak ada langkah migrasi/seed manual (atau Railway CLI) yang bisa terlupa atau gagal karena tool belum ter-install di mesin lokal. Seed bersifat idempoten — tidak menimpa password admin yang sudah diganti lewat UI.
- [x] **Tidak ada static generation yang butuh DB saat build** — semua route yang query Prisma (dashboard, produk, pesanan, keuangan, piutang, laporan, pengaturan, login, layout app) diberi `export const dynamic = "force-dynamic"`. Sudah diverifikasi lewat audit otomatis, semua route DB-query sudah menyatakannya.
- [x] **Logo tidak disimpan di filesystem** — logo toko disimpan sebagai base64 data URL di kolom `Settings.logoDataUrl` (database), bukan `public/uploads`. File `public/logo.png` hanya fallback statis untuk favicon & default sebelum seed pertama — bukan sumber kebenaran setelah Settings ada di DB.
- [x] **Tanpa native `bcrypt`** — pakai `bcryptjs` (pure JS) di seluruh kode (hash password login & seed). Sudah diaudit, tidak ada dependency `bcrypt` native tersisa di `package.json`.
- [x] **Binary native `@resvg/resvg-js`** — versi yang dipakai punya prebuilt binary untuk `linux-x64-gnu` (target default Railway/Nixpacks) sebagai `optionalDependencies`; jangan pernah install dengan `--omit=optional`. Sudah diuji generate PNG invoice secara lokal dan berhasil (lihat hasil uji di bawah).
- [x] **Case-sensitivity import** — sudah diaudit dengan script otomatis (bandingkan setiap `import`/`from` terhadap nama file asli di disk): 0 masalah ditemukan.
- [x] **`package-lock.json` konsisten** — file di-commit (tidak di-gitignore), tidak ada `yarn.lock`/`pnpm-lock.yaml` lain, supaya Railway bisa `npm ci` deterministik.
- [x] **Build bersih** — `npm run build` diverifikasi selesai dengan exit code `0`, tanpa error TypeScript/ESLint yang lolos diam-diam.
- [x] **Environment variables build-time vs runtime** — semua env var di project ini (`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`) hanya dibutuhkan saat **runtime** (tidak ada yang dibaca saat `next build`), jadi cukup diisi sebagai service Variable biasa di Railway — tidak perlu pengaturan khusus "build-time variable". `DATABASE_URL` **wajib** memakai syntax referensi `${{Postgres.DATABASE_URL}}`, bukan nilai yang di-copy-paste manual (supaya otomatis ikut berubah kalau Postgres di-recreate).
- [x] **`AUTH_SECRET`/`NEXTAUTH_URL` wajib sebelum deploy pertama** — tanpa ini, NextAuth akan error saat runtime atau redirect login tidak berfungsi benar. Isi keduanya di tab Variables **sebelum** klik Deploy pertama kali.
- [x] **Diuji dalam mode production, bukan dev** — `npm run build` → `npm run start` dijalankan dan di-smoke-test langsung (lihat bagian Hasil Verifikasi), bukan hanya `next dev`.
- [x] **Nama cookie sesi NextAuth eksplisit & konsisten di semua runtime** — `lib/auth-cookie.ts` menentukan nama cookie sesi (dan `useSecureCookies`) berdasarkan `NODE_ENV`, dipakai identik di `middleware.ts` (Edge runtime) maupun `lib/auth.ts` (Node runtime/`getServerSession`). Ini mencegah kelas bug "loop redirect antara `/login` dan halaman terproteksi" yang bisa muncul kalau kedua runtime mendeteksi protokol/nama cookie secara berbeda di belakang reverse proxy seperti Railway — **bug ini sempat benar-benar terjadi di v1.0.1 dan baru ditemukan setelah deploy sungguhan**, lihat Changelog `[1.0.2]`.

## Hasil Verifikasi

Verifikasi dilakukan dua tahap, semuanya di lingkungan lokal dengan Postgres via `docker compose`, dalam mode **production build** (`npm run build` → `npm run start`), bukan `next dev`.

**Tahap 1 — sebelum rilis v1.0.0 (API-level, curl & Prisma langsung):**

- `npm run build` → sukses, exit code `0`, seluruh route non-auth bertipe dynamic (`ƒ`), tidak ada static generation yang menyentuh database.
- Login via NextAuth Credentials (flow CSRF penuh, bukan simulasi) → berhasil, session cookie valid, halaman terproteksi bisa diakses setelahnya.
- Akses tanpa sesi ke `/` → redirect 307 ke `/login` (middleware bekerja); asset publik (`/logo.png`) tetap bisa diakses tanpa login (dipakai di halaman login).
- Semua halaman utama (`/`, `/produk`, `/pesanan`, `/pesanan/[id]`, `/pesanan/baru`, `/keuangan`, `/piutang`, `/laporan`, `/pengaturan`) di-request dengan sesi valid → semuanya `200 OK`, termasuk saat database kosong (edge case tanpa data).
- Endpoint `GET /api/pesanan/[id]/invoice`: tanpa rekening bank → `400` rapi (bukan crash); tanpa sesi login → di-redirect middleware; dengan rekening bank terpilih → `200`, menghasilkan file **PNG valid**.

**Tahap 2 — QA browser sungguhan (browser automation, klik langsung di Chrome), setelah rilis v1.0.0:**

- Login (kredensial benar & salah) → pesan error rapi saat salah, sesi tersimpan saat benar.
- Tambah produk (termasuk field nama pemasok) → tersimpan, muncul di form edit dengan benar.
- Pengaturan: logo toko tampil, tambah rekening bank berhasil.
- Buat pesanan multi-item → kalkulasi subtotal/total otomatis benar, redirect ke halaman detail.
- Generate invoice → **PNG diunduh & diverifikasi valid** (1080×1266px, tabel item hanya nama barang/qty/total tanpa harga satuan/pemasok, info rekening bank & logo toko tampil, nama pelanggan panjang terpotong rapi dengan ellipsis).
- Ubah status pesanan ke "Selesai" → dikonfirmasi **tidak** otomatis mencatat pemasukan (status pembayaran tetap terpisah).
- Piutang: centang "Lunas" → transaksi pemasukan otomatis tercatat di Keuangan; uncheck kembali (dengan dialog konfirmasi) → transaksi otomatis terhapus.
- Transaksi manual, Laporan (filter tanggal), Dashboard (kartu total piutang, chart tren, produk terlaris) → semua angka akurat.
- Tampilan mobile (viewport 390px) → bottom nav & layout tetap rapi.
- **1 bug ditemukan & langsung diperbaiki**: posisi scroll tidak reset ke atas setelah redirect dari Server Action, menyebabkan header halaman pesanan sempat tertutup topbar sesaat setelah submit form panjang. Lihat entri Changelog `[1.0.0]` bagian "Diperbaiki".
- Setelah QA, seluruh data uji dihapus dari database, server & Postgres lokal dimatikan, dan cache/profil browser automation dibersihkan — repo & environment dikembalikan ke kondisi bersih.

**Tahap 3 — QA ulang langsung di production Railway, setelah bug redirect loop `[1.0.2]` diperbaiki:**

- Root cause redirect loop dikonfirmasi lewat `curl` langsung ke domain production (login → ambil cookie sesi asli → akses `/` → sebelum fix: 50+ redirect berulang; sesudah fix & redeploy: `200` langsung tanpa redirect).
- QA browser sungguhan diulang **langsung di domain production** (bukan lokal): login (kredensial benar & salah), reload halaman berkali-kali (pastikan sesi tidak sempat loop lagi), logout lalu login ulang, tambah produk/rekening bank/pesanan uji, generate & unduh invoice PNG (diverifikasi valid), toggle Lunas/Belum Lunas (transaksi otomatis tercatat & terhapus dengan benar), tambah transaksi manual, cek Laporan & Dashboard, cek tampilan mobile (390px) — semua normal, tidak ada regresi dari fix cookie.
- Seluruh data uji yang dibuat di production **sudah dibersihkan lewat UI** (pesanan uji dibatalkan, produk uji diarsipkan, rekening bank uji dinonaktifkan, transaksi otomatis ikut terhapus) — aplikasi ini tidak punya fitur hapus permanen by design (lihat bagian 4.2–4.7 `requirement_final.md`, arsip bukan hapus, demi integritas histori), dan proses QA ini sengaja tidak mengakses `DATABASE_URL` production secara langsung.

Karena tahap 2 & 3 sudah mencakup klik langsung di browser sungguhan (termasuk langsung di production), Santi tidak wajib mengulang uji coba ini dari awal — cukup familiarisasi normal saat pertama pakai, dan disarankan mengganti password admin dari halaman Pengaturan kalau belum.

## Struktur Folder

```
app/
  login/              halaman login (publik)
  (app)/              seluruh halaman yang butuh login (dashboard, produk, pesanan, dst.)
  api/auth/           route handler NextAuth
  api/pesanan/[id]/invoice/   route handler generate invoice PNG
  api-health-check/   endpoint publik cek kesehatan app (DB & env var)
lib/
  actions/            Next.js Server Actions per modul (produk, pesanan, keuangan, dll.)
  auth.ts             konfigurasi NextAuth
  auth-cookie.ts      nama cookie sesi (dipakai konsisten oleh middleware & auth.ts)
  prisma.ts           Prisma client singleton
  invoice-image.tsx   template JSX invoice untuk satori
  dashboard.ts        query & agregasi data dashboard
components/           komponen UI yang dipakai lintas halaman
prisma/               schema.prisma, migrations, seed.js
assets/fonts/         font .woff untuk render invoice (satori)
public/logo.png       logo default/fallback statis (favicon & sebelum seed)
```

## Catatan Keamanan

- **Jangan pernah commit `.env`** — sudah ada di `.gitignore`, hanya `.env.example` yang di-commit.
- Ganti `AUTH_SECRET` dan password admin default sebelum dipakai produksi sungguhan.
- `npm audit` masih melaporkan beberapa advisory pada Next.js 14.2.x dan dependency transitif `satori`/`postcss` yang sebagian besar terkait fitur yang tidak dipakai project ini (custom server, hosting Windows, i18n Pages Router, AVIF image optimization). Tetap disarankan menjalankan `npm audit` / `npm outdated` secara berkala dan upgrade patch versi Next 14.2.x terbaru.
- Endpoint invoice PNG dan seluruh halaman aplikasi diproteksi middleware — hanya bisa diakses setelah login.
