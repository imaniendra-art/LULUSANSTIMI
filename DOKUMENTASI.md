# Dokumentasi Teknis & Spesifikasi Sistem (v2.1)

**Aplikasi**: Sistem Informasi Terpadu Alumni & Repositori PISN STIMI Yapmi (`TRACER-STIMI`)  
**Versi**: 2.1.0  
**Tanggal**: 2026-10-22  
**Database**: MongoDB 7+ (Prisma ORM 6 MongoDB Provider)  
**Storage**: Local Server Storage (Dedicated PC Server Disk — No MinIO / No Cloud)  

---

## 1. Arsitektur Repositori PISN & Local Server Storage

Semua dokumen fisik hasil scan (Ijazah Asli & Transkrip Nilai) disimpan langsung pada hard disk PC Server kampus di folder `storage/uploads/` dengan struktur terorganisir:

```
[ PC Server Hard Disk Directory ]
  └── storage/
        └── uploads/
              ├── credentials/
              │     ├── ijazah/
              │     │     └── [NIM]_ijazah_[timestamp].pdf
              │     └── transkrip/
              │           └── [NIM]_transkrip_[timestamp].pdf
              ├── legalizations/
              │     └── stamped/
              │           └── [verificationCode]_legalized.pdf
              └── avatars/
                    └── [NIM]_avatar.webp
```

### 1.1 Secure File Streaming (Anti-Data Leak)
Dokumen ijazah dan transkrip asli **tidak boleh disajikan melalui folder public statis** agar tidak terindeks oleh Google atau diakses pihak yang tidak berhak. Akses file menggunakan handler streaming internal Next.js:

- **Path**: `GET /api/v1/credentials/[id]/preview?type=ijazah`
- **Mekanisme**:
  1. Server memvalidasi session: hanya Admin BAAK atau Alumni pemilik NIM terkait yang berhak mengakses.
  2. Server membaca file dari `storage/uploads/credentials/ijazah/...` menggunakan Node.js `fs.createReadStream`.
  3. Response dikirim dengan header:
     - `Content-Type: application/pdf`
     - `Content-Disposition: inline; filename="Ijazah_[NIM].pdf"`
     - `Cache-Control: private, max-age=3600`

---

## 2. Format Template Batch Import PISN (Excel / CSV)

Admin BAAK dapat memasukkan ratusan data lulusan secara massal menggunakan template Excel (`.xlsx` / `.csv`) dengan urutan kolom baku:

| No | Nama Kolom Header | Wajib? | Tipe Data | Contoh Isi | Keterangan |
|---|---|---|---|---|---|
| 1 | `NIM` | **YA** | Text | `202061201001` | Kunci unik data lulusan |
| 2 | `Nama Lengkap` | **YA** | Text | `Muhammad Rezky Pratama` | Sesuai ijazah & KTP |
| 3 | `Kode Prodi` | **YA** | Text | `61201` | `61201` (Manajemen) / `62201` (Akuntansi) |
| 4 | `Nama Prodi` | **YA** | Text | `S1 Manajemen` | Nama jenjang & program studi |
| 5 | `Tanggal Yudisium` | **YA** | Date | `2024-08-15` | Format YYYY-MM-DD |
| 6 | `No SK Yudisium` | Opsional | Text | `SK/STIMI/2024/089` | Surat Keputusan Yudisium |
| 7 | `Judul Skripsi` | **YA** | Text | `Pengaruh Disiplin Kerja dan Motivasi Terhadap Kinerja Karyawan PT Semen Tonasa` | **Wajib diisi untuk pelaporan PISN** |
| 8 | `Nomor PISN` | **YA** | Text | `612012024000189` | **Nomor Ijazah Nasional dari Kemendikbudristek** |
| 9 | `Nomor Ijazah Lokal`| Opsional | Text | `STIMI/S1-MNJ/2024/0189`| Nomor seri ijazah internal kampus |
| 10 | `IPK` | Opsional | Decimal | `3.78` | Nilai IPK kelulusan |
| 11 | `NIK` | Opsional | Text (16) | `7371101234560001` | Nomor Induk Kependudukan |
| 12 | `Tempat Lahir` | Opsional | Text | `Makassar` | Tempat lahir |
| 13 | `Tanggal Lahir` | Opsional | Date | `2001-05-14` | Format YYYY-MM-DD |
| 14 | `No HP / WA` | Opsional | Text | `081234567890` | Kontak alumni |
| 15 | `Email Pribadi` | Opsional | Text | `rezky@gmail.com` | Email aktif alumni |

---

## 3. Otomasi Penautan Berkas Scan (Auto-Linker)

Admin BAAK dapat menaruh file scan hasil scan resolusi tinggi langsung ke folder server atau mengunggahnya via web:
- Format penamaan file otomatis dikenali:
  - `[NIM]_ijazah.pdf` atau `[NIM]_ijazah.jpg`
  - `[NIM]_transkrip.pdf` atau `[NIM]_transkrip.jpg`
- Sistem menyediakan fitur **"Sinkronisasi Berkas Folder"**: sistem memindai direktori, mencocokkan `NIM` dari nama file dengan data di MongoDB, dan langsung mengaitkan file ke record alumni terkait tanpa perlu upload satu per satu manual.

---

## 4. Spesifikasi E-Legalisir Digital (Stempel BAAK & QR Code)

Saat alumni mengajukan permohonan legalisir dan disetujui BAAK:
1. Server membaca file ijazah/transkrip asli dari `storage/uploads/credentials/`.
2. Engine `pdf-lib` membubuhkan:
   - Cap Digital BAAK STIMI Yapmi.
   - Watermark verifikasi resmi.
   - QR Code yang mengarah ke `https://[domain-kampus]/verify/[verificationCode]`.
3. Dokumen hasil stempel disimpan di `storage/uploads/legalizations/stamped/`.
4. Alumni dan instansi pemeriksa dapat memvalidasi keaslian dokumen 24/7.
