# Development Roadmap & Progress Tracking (v2.1 - PISN Focus)

**Project**: Sistem Informasi Terpadu Alumni & Repositori PISN STIMI Yapmi (`TRACER-STIMI`)  
**Status**: Fase 0 Selesai -> **Fase 1 Siap Dieksekusi**  
**Core Target**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, MongoDB 7+ (Prisma ORM), Local Server Storage  

---

## Progress Overview

| Phase | Description | Status |
|---|---|---|
| **Phase 0** | Brainstorming & PRD v2.1 (Prioritas Utama PISN, Local Storage, No MinIO) | **COMPLETED** |
| **Phase 1** | Foundation Scaffolding (Next.js 15 Port 3022, Tailwind v4, Prisma MongoDB, Local Storage Dirs) | **COMPLETED** |
| **Phase 2** | Repositori PISN: Database Models, Migrasi/Generate Prisma, & 87 Data Resmi STIMI Yapmi | **COMPLETED** |
| **Phase 3** | Portal Publik & Verifikasi Mandiri PISN (Live Search Ijazah untuk HRD/Publik) | **COMPLETED** |
| **Phase 4** | Autentikasi Staf BAAK & Proteksi Akses Route (`/login` & `/admin` Session Guard) | **COMPLETED** |
| **Phase 5** | Konsol BAAK Modul PISN: Multi-Batch Filter, Live Search, In-App PDF Preview, File Upload | **COMPLETED** |
| **Phase 5.1** | **Generate PISN & Berkas SK**: Upload Mahasiswa Eligible PISN Dikti, Auto-Grouping per Tanggal & SK Yudisium, Ekspor Lampiran SK (9 Kolom), & Generator Resmi Dokumen SPTJM PIN | **COMPLETED** |
| **Phase 6** | E-Legalisir Digital (Stempel BAAK & QR Code Validator Publik `/verify/[code]`) | Ready to Start |
| **Phase 6** | E-Legalisir Digital (Stempel BAAK & QR Code Validator Publik `/verify/[code]`) | Pending |
| **Phase 7** | Modul Tracer Study Belmawa Dikti (f1 - f17) & Ekspor Matriks Akreditasi | Pending |
| **Phase 8** | Portal Berita IKA, Bursa Karir, Testing E2E, & Deployment Panduan PC Server | Pending |

---

## Immediate Next Steps (Phase 1 Execution)
1. Inisialisasi Next.js 15 App Router (`npx create-next-app` atau setup `package.json`).
2. Konfigurasi Tailwind CSS v4 dengan tema warna institusi STIMI Yapmi (Navy Blue & Gold).
3. Setup `prisma/schema.prisma` dengan provider MongoDB dan model `Alumni` (PISN fields).
4. Pembuatan struktur folder penyimpanan berkas di server: `storage/uploads/credentials/ijazah` dan `transkrip`.
