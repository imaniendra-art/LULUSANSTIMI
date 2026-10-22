# LULUSANSTIMI - Sistem Repositori & Verifikasi Ijazah Lulusan STIMI YAPMI Makassar

Aplikasi web modern berbasis **Next.js 15 App Router**, **Prisma ORM**, **MongoDB Atlas**, dan **Tailwind CSS v4** untuk pengelolaan arsip lulusan, repositori penomoran ijazah nasional (PISN), repositori judul skripsi/tesis, verifikasi keaslian ijazah secara publik dengan QR Code, serta legalisir digital terverifikasi.

---

## 🚀 Fitur Utama

1. **Dashboard Admin & Tata Kelola Data Lulusan**:
   - Repositori PISN & Arsip Ijazah (Nomor Ijazah, PISN, SK Yudisium, Tanggal Kelulusan).
   - Repositori Judul Skripsi (S1) & Tesis (S2) dengan fitur *inline editing* cepat.
   - Filter multikriteria: Program Studi (S1 & S2 Manajemen), Jalur Masuk (Peserta Didik Baru & RPL Perolehan SKS), Status PISN, Tanggal Yudisium, dll.
   - Pagination interaktif (pilihan 25, 50, 100 data per halaman) dan nomor urut dinamis.
   - Fitur Ekspor Excel/Spreadsheet kustom dengan format penamaan standar instansi (*"ARSIP IJAZA LULUSAN STIMI"*).

2. **Verifikasi Publik Ijazah & Kelulusan**:
   - Halaman publik untuk verifikasi keaslian ijazah berbasis NIM atau Nomor PISN.
   - Pengecekan status PISN terverifikasi di PDDikti Kemendikbudristek.
   - Dokumen Preview Viewer terenkripsi (PDF Ijazah & Transkrip).

3. **Batch Import & Skrip Sinkronisasi**:
   - Modul otomatisasi sinkronisasi SK Yudisium dan impor berkas alumni.
   - Validasi data otomatis untuk mencegah duplikasi NIM.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions, React 19)
- **Database & ORM**: [MongoDB Atlas](https://www.mongodb.com/atlas) & [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Exporting**: SheetJS / XLSX
- **Runtime**: Node.js 20+

---

## 📦 Instalasi & Penggunaan Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/imaniendra-art/LULUSANSTIMI.git
   cd LULUSANSTIMI
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin `.env.example` ke `.env` dan sesuaikan URL database MongoDB Anda:
   ```bash
   cp .env.example .env
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

5. **Jalankan Server Development**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3022`.

---

## 📑 Struktur Proyek

```
LULUSANSTIMI/
├── prisma/
│   └── schema.prisma         # Skema database MongoDB
├── public/                   # Logo, ikon, & aset visual
├── scripts/                  # Skrip sinkronisasi & impor batch
├── src/
│   ├── app/
│   │   ├── admin/            # Dashboard manajemen admin
│   │   ├── api/v1/           # REST API endpoints (alumni, export, stats, auth)
│   │   ├── login/            # Halaman login administrator
│   │   └── page.tsx          # Portal publik verifikasi ijazah
│   └── lib/                  # Prisma client, auth session helpers
├── storage/                  # Direktori penyimpanan arsip dokumen
├── DOKUMENTASI.md            # Dokumentasi sistem lengkap
├── ERD.md                    # Entity Relationship Diagram
└── PRD.md                    # Product Requirement Document
```

---

## 📄 Lisensi
Hak Cipta © 2026 STIMI YAPMI Makassar. All Rights Reserved.
