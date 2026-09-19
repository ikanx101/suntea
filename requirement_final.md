# Requirement Final — Webapp Manajemen Toko Online "Santi Irawati"

## 1. Latar Belakang

Santi Irawati menjalankan bisnis reseller frozen food dan ready-to-eat food yang selama ini seluruh transaksinya dilakukan lewat WhatsApp secara manual. Karena volume transaksi sudah cukup tinggi dalam beberapa bulan terakhir, dibutuhkan sebuah webapp sederhana untuk mencatat produk, pesanan, dan arus kas, sekaligus membantu membuat invoice yang bisa langsung dikirim ke pelanggan lewat WhatsApp.

## 2. Tujuan

- Menggantikan pencatatan manual (chat WhatsApp/buku catatan) dengan sistem terpusat yang rapi dan mudah dicari.
- Mempercepat pembuatan invoice untuk dikirim ke pelanggan.
- Memberi visibilitas atas keuntungan bisnis secara real-time.
- Aplikasi bersifat privat, hanya bisa diakses oleh Santi (login wajib).

## 3. Target Pengguna

- **Pengguna utama:** Santi Irawati (single-user, admin penuh).
- Tidak ada peran multi-user pada versi awal (lihat bagian 12 — Pertanyaan Terbuka jika ke depan perlu staf tambahan).
- Diasumsikan penggunaan mayoritas dari **smartphone** (sehari-hari) dan sesekali dari **tablet/laptop**, sehingga UI harus mobile-first dan tetap nyaman di layar lebih besar.

## 4. Ruang Lingkup Fitur (Functional Requirements)

### 4.1 Autentikasi
- Halaman login (username/email + password).
- Tidak ada halaman registrasi publik — akun Santi dibuat lewat seed/env variable saat setup awal.
- Semua halaman selain `/login` dilindungi (redirect ke login jika belum autentikasi).
- Sesi login bertahan (remember me) agar tidak perlu login ulang setiap hari di HP pribadinya.
- Ada fitur "logout" dan "ganti password".

### 4.2 Manajemen Produk (Master Barang)
CRUD (Create, Read, Update, Delete/Arsip) untuk barang dengan field:
- Nama barang
- Deskripsi
- Kategori (contoh: Frozen Food / Ready to Eat) — dropdown sederhana
- Nama pemasok (data internal untuk catatan Santi — **tidak ditampilkan di invoice**, lihat bagian 7)
- Harga beli (dari pemasok)
- Harga jual (ke pelanggan)
- Status aktif/nonaktif (barang yang sudah tidak dijual tidak dihapus permanen, cukup diarsipkan agar histori pesanan lama tetap valid)
- (Opsional, lihat bagian 12) Foto barang, stok kuantitas

Daftar produk ditampilkan dalam bentuk kartu/list dengan pencarian dan filter kategori.

### 4.3 Manajemen Pesanan
CRUD untuk pesanan dengan field:
- Nama pemesan
- Nomor WhatsApp pemesan
- Tanggal pesanan
- Daftar barang yang dipesan (multi-item), masing-masing dengan kuantitas — harga otomatis terisi dari master barang (harga jual saat itu disimpan sebagai snapshot, agar histori invoice tidak berubah walau harga produk kelak diubah)
- Status pesanan: **Baru → Diproses → Selesai / Dibatalkan**
- Status pembayaran: **Belum Lunas / Lunas** (independen dari status pesanan — lihat bagian 4.8; default **Belum Lunas** saat pesanan dibuat)
- Catatan tambahan (opsional, contoh: alamat, metode pembayaran, permintaan khusus)
- Total otomatis dihitung dari (harga jual × qty) semua item

Dipisahkannya status pesanan (proses pemenuhan barang) dari status pembayaran (uang sudah masuk atau belum) karena di lapangan kadang barang sudah dikirim/pesanan selesai diproses namun pelanggan belum transfer (piutang) — lihat bagian 4.8 untuk cara Santi mengonfirmasi pembayaran.

Dari satu pesanan, sistem dapat:
- Menghitung total tagihan otomatis.
- **Generate invoice dalam format PNG** yang bisa langsung diunduh/dibagikan via WhatsApp (lihat bagian 6).
- Saat status pembayaran suatu pesanan dikonfirmasi menjadi **Lunas** (lihat bagian 4.8), sistem otomatis mencatat transaksi **pemasukan** sejumlah total pesanan ke modul Keuangan (lihat 4.4), supaya Santi tidak perlu input dua kali. Jika konfirmasi ini dibatalkan (dikembalikan ke Belum Lunas, misal salah klik), transaksi pemasukan terkait otomatis ikut dihapus.

Berbeda dari Produk dan Rekening Bank (yang hanya bisa diarsipkan, tidak dihapus permanen), **pesanan/invoice bisa dihapus permanen** oleh Santi — dari daftar Pesanan, halaman detail pesanan, maupun dari baris transaksinya di Keuangan. Menghapus pesanan otomatis ikut menghapus transaksi pemasukan yang tertaut (jika sudah Lunas). Karena sifatnya permanen & tidak bisa dibatalkan, sistem WAJIB menampilkan popup konfirmasi sebelum benar-benar menghapus.

### 4.4 Manajemen Keuangan (Kas Masuk & Keluar)
Buku kas sederhana berisi daftar transaksi:
- Tanggal
- Jenis: **Masuk** (pemasukan) atau **Keluar** (pengeluaran)
- Nominal
- Kategori pengeluaran (contoh: Belanja stok ke pemasok, Ongkir, Kemasan, Operasional lain) / kategori pemasukan (Penjualan, Lain-lain)
- Keterangan
- Sumber: otomatis dari sistem (hasil konfirmasi pembayaran pesanan menjadi Lunas, lihat 4.8) atau input manual (untuk belanja ke pemasok, biaya operasional, dll.)

Transaksi yang berasal dari pesanan bersifat read-only tertaut ke pesanan tersebut (tidak bisa diedit manual, tapi otomatis menyesuaikan bila pesanan dibatalkan atau status pembayarannya dibatalkan — transaksi terkait ikut dibatalkan/dihapus).

### 4.5 Dashboard / Ringkasan
Halaman utama berisi ringkasan cepat:
- Total pemasukan, pengeluaran, dan laba bersih (harian/mingguan/bulanan, dengan filter rentang tanggal)
- Estimasi margin kotor dari selisih harga jual–harga beli per produk terjual
- Jumlah pesanan per status (baru/diproses/selesai/dibatalkan)
- **Total piutang**: jumlah invoice & total nominal yang masih **Belum Lunas**, ditampilkan menonjol agar mudah dipantau dan tidak ada yang terlewat (link langsung ke halaman Piutang — lihat bagian 4.8)
- Produk terlaris (top 5)
- Grafik tren pemasukan vs pengeluaran sederhana (line/bar chart)

### 4.6 Laporan
- Filter transaksi & pesanan berdasarkan rentang tanggal.
- Export data ke CSV/Excel (opsional, lihat bagian 12) untuk kebutuhan pembukuan/pajak sederhana.

### 4.7 Manajemen Rekening Bank
CRUD (Create, Read, Update, Delete/Arsip) untuk data rekening bank tujuan pembayaran, dengan field:
- Nama bank
- Nomor rekening
- Nama pemilik rekening
- Status aktif/nonaktif (rekening yang sudah tidak dipakai tidak dihapus permanen, cukup diarsipkan agar histori invoice lama tetap valid)

Santi bisa menambahkan **satu atau lebih** rekening bank (misal: rekening BCA, Mandiri, dst sekaligus). Dikelola dari halaman Pengaturan (`/pengaturan`).

Saat membuat/generate invoice untuk sebuah pesanan (lihat bagian 7), Santi memilih **satu rekening** dari daftar rekening aktif yang tersedia melalui dropdown, untuk ditampilkan pada invoice tersebut. Data rekening yang dipilih (nama bank, nomor rekening, nama pemilik) disimpan sebagai **snapshot** pada pesanan/invoice terkait, agar histori invoice lama tidak berubah walau data rekening kelak diedit atau diarsipkan.

### 4.8 Konfirmasi Pembayaran (Piutang)
Fitur ini memungkinkan Santi mengecek satu per satu invoice mana yang uangnya sudah masuk dan mana yang belum, supaya tidak ada piutang pelanggan yang terlewat/lupa ditagih.

- Halaman **Piutang** (`/piutang`) menampilkan daftar seluruh invoice/pesanan (kecuali yang berstatus Dibatalkan) beserta status pembayarannya, dengan filter default menampilkan yang **Belum Lunas** terlebih dahulu.
- Setiap baris menampilkan: nomor invoice, nama pemesan, tanggal, total tagihan, dan **checkbox/toggle "Lunas"**.
- Santi tinggal mencentang checkbox pada invoice yang uangnya sudah diterima → status pembayaran pesanan tersebut berubah menjadi **Lunas**, dan sistem otomatis mencatat transaksi pemasukan ke modul Keuangan (lihat 4.4).
- Centang bisa dibatalkan (uncheck) jika salah klik atau ternyata pembayaran belum benar-benar diterima → status kembali **Belum Lunas** dan transaksi pemasukan terkait otomatis dihapus.
- Tersedia filter/tab: **Semua / Belum Lunas / Lunas**, serta pencarian berdasarkan nama pemesan atau nomor invoice.
- Menampilkan ringkasan total piutang (jumlah invoice & total nominal Belum Lunas) di bagian atas halaman, senada dengan ringkasan di Dashboard (lihat 4.5).

## 5. Kebutuhan Non-Fungsional

- **Keamanan:** Password di-hash (bcrypt/argon2), koneksi HTTPS (otomatis dari Railway), proteksi terhadap akses tanpa login di seluruh route/API.
- **Performa:** Halaman list produk/pesanan/transaksi tetap ringan walau data sudah ratusan/ribuan baris (pagination/infinite scroll).
- **Responsif:** Mobile-first, dioptimalkan untuk layar HP (utama) dan tablet/desktop (sekunder).
- **Bahasa:** Seluruh antarmuka menggunakan Bahasa Indonesia, format mata uang Rupiah (Rp).
- **Ketersediaan data:** Data tersimpan permanen di database (bukan disimpan di browser), bisa diakses dari device manapun setelah login.

## 6. Desain UI/UX — Tema "Girly & Active"

- **Palet warna:** Dominan pink cerah/hot pink, ungu lavender, dan coral/peach sebagai aksen, dipadukan dengan putih/krem sebagai latar agar tetap nyaman dibaca. Warna hijau mint atau kuning lembut untuk status "sukses"/highlight agar terasa ceria.
- **Tipografi:** Font heading yang playful & rounded (contoh: Baloo 2 / Poppins / Fredoka), font body yang tetap mudah dibaca (contoh: Inter/Nunito).
- **Elemen visual:** Sudut membulat (rounded-2xl), gradient lembut pada tombol/kartu, ikon-ikon bulat/emoji-friendly, sedikit animasi/microinteraction (hover bounce, fade/slide transition) agar terasa "active"/dinamis tanpa mengganggu fungsi.
- **Layout:** Bottom navigation bar ala aplikasi mobile untuk akses cepat ke Dashboard/Produk/Pesanan/Keuangan saat dibuka dari HP; sidebar saat dibuka dari layar lebar.
- **Branding:** Ada tempat untuk nama toko & (opsional) logo yang bisa diatur Santi sendiri di halaman pengaturan, dipakai juga di invoice.

## 7. Spesifikasi Invoice PNG

**Konten invoice:**
- Nama toko / branding (dari pengaturan)
- Nomor invoice otomatis, format `INV-YYYYMMDD-XXXX`
- Tanggal & jam transaksi
- Nama pemesan & nomor WhatsApp
- Tabel item: **hanya nama barang, qty, dan total nilai (total value) per baris** — harga satuan, nama pemasok, dan data internal barang lainnya **tidak ditampilkan** di invoice
- Total keseluruhan
- Informasi rekening bank tujuan pembayaran (nama bank, nomor rekening, nama pemilik rekening) — dipilih Santi dari daftar rekening yang tersimpan (lihat bagian 4.7)
- Catatan (jika diisi)
- Footer ucapan terima kasih + sentuhan tema girly (warna/aksen sesuai bagian 6)

**Ukuran & kompatibilitas layar:**
Perangkat yang disebutkan punya resolusi berbeda:
- Samsung Galaxy A33 5G: layar ratio memanjang (±1080 × 2400 px)
- iPad 9th gen: layar ratio 4:3 (±1620 × 2160 px, setara 810 × 1080 pt)

Karena rasio kedua perangkat berbeda jauh, tidak mungkin satu gambar "pas" 1:1 penuh layar di kedua device sekaligus — dan ini juga bukan cara orang membaca invoice di WhatsApp (gambar selalu ditampilkan mengikuti bubble chat/preview, bukan full-screen). Pendekatan yang direkomendasikan:
- Invoice dibuat dengan **lebar tetap 1080 px** (tajam saat dilihat di HP, termasuk Samsung A33) dan **tinggi menyesuaikan jumlah item** (auto-height), dengan margin dan ukuran font yang cukup besar agar tetap terbaca jelas saat file gambar ini otomatis di-downscale oleh WhatsApp di layar iPad maupun HP.
- Font & elemen didesain dengan ukuran "aman dibaca" di layar kecil (bukan padat/kecil-kecil), sehingga nyaman dibaca di kedua device.
- *(Poin ini akan dikonfirmasi ke Santi — lihat bagian 12, opsi lain: menyediakan tombol "Bagikan sebagai gambar besar/kecil" jika ternyata satu ukuran dirasa kurang pas.)*

**Cara pakai:** Dari halaman detail pesanan, tombol "Generate Invoice" pertama-tama meminta Santi memilih rekening bank tujuan pembayaran (dropdown berisi rekening aktif, lihat bagian 4.7), lalu menampilkan preview PNG beserta tombol download/langsung share (Web Share API jika didukung browser HP). Jika belum ada rekening tersimpan, Santi diarahkan menambahkan rekening terlebih dahulu di halaman Pengaturan sebelum invoice bisa dibuat.

## 8. Arsitektur Teknis (diusulkan)

Karena rencana deploy ke **Railway.app**, berikut stack yang diusulkan (dioptimalkan untuk kemudahan deploy 1 service + database, tanpa perlu infra tambahan):

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | **Next.js 14+ (App Router) + TypeScript** | Full-stack (frontend + API) dalam satu project, deploy mudah ke Railway sebagai satu service |
| Styling | **Tailwind CSS** + komponen custom (shadcn/ui sebagai basis) | Cepat untuk membangun tema girly yang konsisten & responsif |
| Database | **PostgreSQL** (Railway Postgres plugin) | Managed, tinggal attach di Railway, gratis di tier awal |
| ORM | **Prisma** | Migrasi skema rapi, type-safe query |
| Autentikasi | **Auth.js (NextAuth) — Credentials Provider**, single admin user | Sederhana untuk 1 pengguna, session via cookie (JWT) |
| Generate invoice PNG | **Satori + resvg (@resvg/resvg-js)** (render JSX/HTML → SVG → PNG di server) | Ringan, tidak butuh headless browser/Chromium (lebih hemat resource di Railway dibanding Puppeteer) |
| Hosting | **Railway** — 1 Web Service (Next.js) + 1 Postgres addon | Sesuai rencana user |
| Penyimpanan file invoice | Generate on-demand (tidak disimpan permanen sebagai file), hanya metadata invoice (nomor, tanggal) yang disimpan di DB; PNG dibuat ulang saat dibutuhkan | Menghindari kebutuhan object storage tambahan (S3/Cloudinary) di awal — bisa ditambahkan nanti jika perlu histori file |

Struktur env variable utama: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL`/`ADMIN_PASSWORD_HASH` (seed akun Santi).

## 9. Model Data (Skema Awal)

**User**
- id, email, password_hash, name, created_at

**Product**
- id, name, description, category, supplier_name, buy_price, sell_price, is_active, created_at, updated_at

**Order**
- id, invoice_number, customer_name, customer_whatsapp, status (`new`/`processing`/`done`/`cancelled`), payment_status (`unpaid`/`paid`, default `unpaid` — lihat bagian 4.8), paid_at (nullable), note, order_date, total, bank_account_id (nullable, rekening yang dipilih saat generate invoice), bank_name_snapshot, account_number_snapshot, account_holder_name_snapshot, created_at, updated_at

**OrderItem**
- id, order_id, product_id, product_name_snapshot, unit_price_snapshot, qty, subtotal

**BankAccount**
- id, bank_name, account_number, account_holder_name, is_active, created_at, updated_at

**Transaction** (buku kas)
- id, type (`in`/`out`), amount, category, description, date, source (`manual`/`order`), order_id (nullable, terisi jika berasal dari konfirmasi pembayaran order menjadi Lunas), created_at

## 10. Alur Penggunaan Utama (User Flow)

1. Santi membuka webapp → diarahkan ke halaman login jika belum login.
2. Setelah login → mendarat di Dashboard (ringkasan bisnis hari ini/bulan ini).
3. **Tambah barang baru** lewat menu Produk sebelum mulai jualan barang tersebut.
4. Saat ada pesanan masuk dari WhatsApp pelanggan, Santi membuka menu Pesanan → "Tambah Pesanan Baru" → isi nama, no WA, pilih barang & qty → simpan.
5. Klik "Generate Invoice" pada pesanan tersebut → pilih rekening bank tujuan → preview PNG muncul → download/share ke WhatsApp pelanggan.
6. Setelah barang selesai dikirim/diproses, Santi ubah status pesanan menjadi "Selesai" (tidak otomatis memengaruhi status pembayaran).
7. Saat uang benar-benar diterima (transfer masuk/cash diterima), Santi buka halaman **Piutang** → centang invoice tersebut sebagai **Lunas** → sistem otomatis mencatat pemasukan di modul Keuangan. Santi bisa cek halaman ini secara rutin agar tidak ada piutang pelanggan yang terlewat.
8. Untuk pengeluaran (belanja stok ke pemasok, ongkir, dll), Santi input manual di menu Keuangan.
9. Kapan saja, Santi bisa buka Dashboard/Laporan untuk melihat keuntungan bersih dan total piutang berjalan dalam periode tertentu.

## 11. Struktur Halaman (Sitemap)

- `/login`
- `/` (Dashboard)
- `/produk` (list + tambah/edit)
- `/pesanan` (list + filter status)
- `/pesanan/[id]` (detail + generate invoice)
- `/pesanan/baru` (form tambah pesanan)
- `/keuangan` (list transaksi + tambah manual)
- `/piutang` (checklist konfirmasi lunas/belum lunas per invoice)
- `/laporan` (opsional, filter & export)
- `/pengaturan` (nama toko, logo, rekening bank, ganti password)

## 12. Pertanyaan Terbuka / Perlu Konfirmasi Santi Sebelum Development

Mohon konfirmasi poin-poin berikut agar scope development tidak berubah di tengah jalan:

1. **Stok barang** — Apakah perlu tracking kuantitas stok (barang habis/tersedia), atau cukup katalog harga saja tanpa hitung stok?
2. **Foto produk** — Apakah tiap barang perlu upload foto, atau cukup nama & deskripsi teks?
3. **Nomor invoice & nama toko** — Nama toko/brand apa yang mau ditampilkan di invoice? Ada logo yang ingin dipakai?
4. **Ukuran invoice PNG** — Setuju dengan pendekatan 1 ukuran universal (lebar 1080px, tinggi menyesuaikan) di bagian 7? Atau ingin dua varian ukuran (HP & tablet)?
5. **Metode pembayaran** — Perlu dicatat per pesanan (transfer/COD/dll) atau tidak perlu?
6. **Export data** — Apakah butuh fitur export ke Excel/CSV untuk laporan bulanan/pajak?
7. **Multi-user** — Untuk versi awal diasumsikan hanya 1 akun (Santi). Apakah nanti butuh akun tambahan untuk staf/kurir?
8. **Riwayat harga** — Jika harga jual/beli suatu barang berubah, histori pesanan lama tetap pakai harga saat itu (snapshot) — apakah ini sudah sesuai ekspektasi?
9. **Rekening default** — Jika rekening bank yang tersimpan lebih dari satu, apakah perlu ada penanda "rekening utama/default" agar otomatis terpilih saat generate invoice (Santi tetap bisa mengganti manual), atau cukup selalu pilih manual setiap kali generate invoice tanpa default?

Jika tidak ada catatan khusus, development akan mengikuti asumsi default yang tertulis di dokumen ini.

## 13. Rencana Deployment ke Railway

1. Push project ke repository Git (GitHub) yang terhubung ke Railway.
2. Buat service Postgres di Railway project yang sama.
3. Set environment variables (`DATABASE_URL` otomatis dari Railway, `AUTH_SECRET`, kredensial admin awal).
4. Jalankan migrasi Prisma (`prisma migrate deploy`) saat build/deploy.
5. Railway otomatis build & jalankan Next.js sebagai web service, memberikan URL publik (bisa dipasang custom domain nantinya bila mau).

## 14. Batasan & Asumsi Umum

- Tidak ada integrasi otomatis dengan WhatsApp API (pengiriman invoice tetap manual oleh Santi via share/download) — sesuai kebutuhan awal yang hanya minta *generate* invoice, bukan *auto-send*.
- Tidak ada fitur pembayaran online (payment gateway) di versi awal.
- Fokus MVP: Produk (termasuk data pemasok), Pesanan + Invoice, Rekening Bank, Keuangan/Kas, Konfirmasi Pembayaran/Piutang, Dashboard ringkas, Login. Fitur lain (export, foto produk, stok) menyusul sesuai jawaban di bagian 12.

---

**Langkah selanjutnya:** Mohon direview dokumen ini oleh Bapak/Santi. Setelah disetujui (dengan atau tanpa revisi dari pertanyaan di bagian 12), pengembangan webapp akan langsung dimulai sesuai spesifikasi final di dokumen ini.
