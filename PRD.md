# Product Requirements Document (PRD) — v2.1 (PISN Core Priority)

**Project Name**: Sistem Informasi Terpadu Alumni, Repositori PISN & Tracer Study STIMI Yapmi  
**Codename**: `TRACER-STIMI`  
**Version**: 2.1.0  
**Status**: Architecture Finalized & Implementation Phase  
**Database**: MongoDB 7+ (Prisma ORM)  
**File Storage**: Local Server Storage (Dedicated PC Server Disk / No Cloud / No MinIO)  
**Urgent Focus (MVP P0)**: **Repositori PISN (Penomoran Ijazah Nasional), Judul Skripsi, & Arsip Scan Ijazah/Transkrip**  

---

## 1. Executive Summary & Prioritas Utama (URGENT PISN)

Sistem Informasi Terpadu STIMI Yapmi difokuskan untuk menyelesaikan kebutuhan paling mendesak institusi:
1. **MODUL UTAMA URGENT: Repositori PISN & Arsip Kelulusan**:
   Satu pusat database terintegrasi untuk pencatatan dan pelacakan identitas kelulusan nasional:
   - **NIM** (Nomor Induk Mahasiswa)
   - **Nama Lengkap Lulusan**
   - **Tanggal Yudisium** & Nomor SK Yudisium
   - **Judul Skripsi / Tugas Akhir**
   - **Nomor PISN** (Penomoran Ijazah Nasional / PIN Ditjen Diktiristek)
   - **File Scan Ijazah Asli** (PDF/Gambar resolusi tinggi)
   - **File Scan Transkrip Nilai Asli** (PDF/Gambar resolusi tinggi)
2. **Local Server File Storage**:
   Seluruh dokumen scan ijazah dan transkrip disimpan langsung pada **hard disk PC Server lokal milik kampus** (di folder dedicated berkeamanan tinggi), tanpa pihak ketiga cloud dan tanpa MinIO.
3. **Modul Ekosistem Terpadu (Fase Lanjutan)**:
   - E-Legalisir Online ber-QR Code Validator Publik untuk HRD/Perusahaan.
   - Tracer Study Pelacakan Karir standar Belmawa Dikti (f1 - f17).
   - Portal Lowongan Kerja (Loker) & Berita Komunitas IKA STIMI Yapmi.
   - Integrasi otomatis data wisuda dari PANDAWA dan data Yudisium non-wisuda.

---

## 2. Spesifikasi Detail: Modul Repositori PISN (Priority P0)

### 2.1 Skema Data Inti PISN per Lulusan
Setiap entri data kelulusan dalam database MongoDB wajib memuat:

| Nama Field | Tipe Data | Keterangan & Validasi |
|---|---|---|
| `nim` | String (Unique) | Kunci utama pencarian (contoh: `202061201001`) |
| `fullName` | String | Nama lengkap sesuai KTP & Ijazah |
| `prodiName` | String | Contoh: "S1 Manajemen" atau "S1 Akuntansi" |
| `prodiCode` | String | Kode PDDIKTI (Manajemen: `61201`, Akuntansi: `62201`) |
| `yudisiumDate` | Date | Tanggal resmi kelulusan yudisium |
| `yudisiumDecreeNumber` | String | Nomor Surat Keputusan (SK) Yudisium |
| `thesisTitle` | Text | **Judul Lengkap Skripsi / Tugas Akhir Mahasiswa** |
| `pisnNumber` | String (Indexed) | **Nomor PISN / PIN Nasional resmi dari Kemendikbudristek** |
| `certificateNumber` | String | Nomor Ijazah Internal Perguruan Tinggi (jika ada) |
| `gpa` | Float | Indeks Prestasi Kumulatif (contoh: `3.75`) |
| `nik` | String (16 digit) | Nomor Induk Kependudukan |
| `birthPlace` & `birthDate`| String & Date | Tempat dan tanggal lahir |
| `ijazahFile` | Object BSON | Path file scan ijazah di PC Server, ukuran, nama asli, dan tanggal upload |
| `transkripFile` | Object BSON | Path file scan transkrip nilai di PC Server, ukuran, nama asli, dan tanggal upload |

### 2.2 Fitur Panel Admin BAAK untuk Modul PISN
- **Live Search & Filter PISN**:
  Pencarian instan *real-time* berbasis NIM, Nama, Nomor PISN, atau kata kunci Judul Skripsi.
- **Single Entry / Quick Edit**:
  Form input & update berkas: input data akademik + drag & drop upload scan ijazah dan transkrip.
- **Batch Import Excel / CSV**:
  Upload file spreadsheet berisi ratusan lulusan (kolom: NIM, Nama, Tgl Yudisium, No SK, Judul Skripsi, No PISN).
- **Batch File Linker (Otomatisasi Scan Berkas)**:
  Kemampuan membaca folder scan ijazah & transkrip di server berdasarkan format nama file:
  `[NIM]_ijazah.pdf` dan `[NIM]_transkrip.pdf` untuk langsung ditautkan ke record database secara otomatis.
- **Direct PDF Viewer & Downloader**:
  Admin dan alumni dapat melihat pratinjau PDF langsung di browser (in-app preview) dan mendownload salinan resolusi penuh.
- **Export Data PISN Siap Lapor**:
  Ekspor data tabular ke Excel format baku laporan PDDIKTI / LLDIKTI IX.

---

## 3. Arsitektur Local Server Storage (Dedicated PC Server)

```
[ PC Server Hard Disk ]
  └── /storage/uploads/ (atau D:\TRACER_UPLOADS\)
        ├── credentials/
        │     ├── ijazah/
        │     │     ├── 202061201001_ijazah_1729582200.pdf
        │     │     └── 202061201002_ijazah_1729582215.pdf
        │     └── transkrip/
        │           ├── 202061201001_transkrip_1729582200.pdf
        │           └── 202061201002_transkrip_1729582215.pdf
        ├── legalizations/
        │     └── stamped/ (PDF yang telah distempel QR legalisir)
        └── news/
              └── covers/ (Gambar artikel & berita IKA)
```

### Mekanisme Akses Berkas Aman:
- File scan ijazah dan transkrip **tidak ditaruh di folder publik bebas akses** untuk mencegah kebocoran data alumni ke mesin pencari.
- Akses berkas melalui **Secure Streaming Endpoint Next.js**:
  `GET /api/v1/credentials/[id]/preview?type=ijazah`
  Endpoint memverifikasi hak akses pengguna (apakah Admin BAAK atau Alumni pemilik NIM tersebut) sebelum menyajikan aliran data berkas (*file buffer streaming*).

---

## 4. Rencana Roadmap Pelaksanaan (Dimulai dari P0)

1. **Sprint 1 (P0 - SEKARANG)**:
   - Scaffolding Next.js 15 App Router + Tailwind v4 + Prisma MongoDB.
   - Skema Database MongoDB untuk Repositori PISN (NIM, Nama, Tgl Yudisium, Judul Skripsi, No PISN, Berkas Scan).
   - CRUD Admin BAAK: Input, Edit, Live Search, Upload Scan Ijazah & Transkrip ke Hard Disk PC Server, In-App PDF Preview.
   - Batch Import Excel data PISN.
2. **Sprint 2 (P1)**:
   - Portal Login Alumni (NIM/Email) & Klaim Akun (`/aktivasi`).
   - Repository Mahasiswa: Alumni dapat melihat dan mendownload arsip ijazah & transkrip masing-masing.
   - Endpoint Webhook penerima data dari PANDAWA (Wisuda).
3. **Sprint 3 (P2)**:
   - Modul E-Legalisir Digital (Stempel BAAK & QR Code Validator publik).
   - Modul Kuesioner Tracer Study Belmawa Dikti (f1 - f17).
4. **Sprint 4 (P3)**:
   - Portal Berita IKA STIMI Yapmi, Bursa Loker, dan Etalase Bisnis Alumni.
