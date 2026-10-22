# Entity Relationship & Document Model Specification (MongoDB Native - v2.1 PISN Priority)

**Project**: Sistem Informasi Terpadu Alumni, Repositori PISN & Tracer Study STIMI Yapmi (`TRACER-STIMI`)  
**Database**: MongoDB 7+  
**ORM / Data Layer**: Prisma ORM 6 with MongoDB Provider (`provider = "mongodb"`)  
**Storage**: Local Server File Storage (Dedicated PC Server Hard Disk / No MinIO)  

---

## 1. Complete Prisma Schema for MongoDB (`prisma/schema.prisma`)

Skema MongoDB berikut menempatkan **Data PISN (NIM, Nama, Tanggal Yudisium, Judul Skripsi, No PISN, Berkas Scan Ijazah & Transkrip)** sebagai *first-class citizen* terpadu:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

enum UserRole {
  SUPERADMIN
  ADMIN_BAAK
  PENGURUS_IKA
  ALUMNI
}

enum UserStatus {
  PENDING_ACTIVATION
  ACTIVE
  SUSPENDED
}

enum GenderType {
  MALE
  FEMALE
}

enum GraduationSource {
  WISUDA_PANDAWA
  YUDISIUM_NON_WISUDA
}

enum LegalizationDeliveryType {
  DIGITAL_PDF
  HARDCOPY_PICKUP
  HARDCOPY_COURIER
}

enum LegalizationStatus {
  SUBMITTED
  IN_REVIEW
  APPROVED_STAMPED
  REJECTED
  READY_FOR_PICKUP
  COMPLETED
}

enum JobStatusType {
  EMPLOYED_FULL_TIME
  EMPLOYED_PART_TIME
  ENTREPRENEUR
  CONTINUING_STUDY
  SEEKING_EMPLOYMENT
  NOT_SEEKING_EMPLOYMENT
}

enum SalaryRange {
  LESS_THAN_1M
  RANGE_1M_TO_3M
  RANGE_3M_TO_5M
  RANGE_5M_TO_10M
  MORE_THAN_10M
  CONFIDENTIAL
}

enum ArticleCategory {
  BERITA_KAMPUS
  AGENDA_IKA
  PRESTASI_ALUMNI
  DUKA_CITA
  UMUM
}

enum JobPostStatus {
  PENDING_REVIEW
  PUBLISHED
  REJECTED
  EXPIRED
}

// -----------------------------------------------------------------------------
// EMBEDDED TYPES (COMPOSITE TYPES)
// -----------------------------------------------------------------------------

type StoredLocalFile {
  fileName      String    // Nama file asli (e.g. "Ijazah_Rezky.pdf")
  filePath      String    // Path penyimpanan di server (e.g. "storage/uploads/credentials/ijazah/...")
  fileSizeBytes Int       // Ukuran berkas dalam bytes
  mimeType      String    // "application/pdf", "image/jpeg", "image/png"
  uploadedAt    DateTime  @default(now())
}

// -----------------------------------------------------------------------------
// 1. REPOSITORI UTAMA PISN & DATA KELULUSAN ALUMNI (CORE URGENT P0)
// -----------------------------------------------------------------------------

model Alumni {
  id                     String            @id @default(auto()) @map("_id") @db.ObjectId
  userId                 String?           @unique @db.ObjectId
  user                   User?             @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // === IDENTITAS KELULUSAN & PISN (SANGAT URGENT) ===
  nim                    String            @unique // Kunci utama pencarian
  nik                    String?
  fullName               String
  birthPlace             String?
  birthDate              DateTime?
  gender                 GenderType        @default(MALE)
  phoneNumber            String?
  personalEmail          String?
  
  // Informasi Akademik & Yudisium
  prodiCode              String            // "61201" (Manajemen), "62201" (Akuntansi)
  prodiName              String            // "S1 Manajemen", "S1 Akuntansi"
  degree                 String            @default("S1")
  cohortYear             Int?              // Angkatan masuk (contoh: 2020)
  graduationYear         Int               // Tahun lulus (contoh: 2024)
  yudisiumDate           DateTime          // Tanggal Yudisium resmi
  yudisiumDecreeNumber   String?           // No SK Yudisium (e.g. "SK/STIMI/2024/091")
  thesisTitle            String            // JUDUL SKRIPSI / TUGAS AKHIR MAHASISWA
  pisnNumber             String?           // NOMOR PISN / PIN KEMENDIKBUD (e.g. "612012024000123")
  certificateNumber      String?           // Nomor Ijazah Internal / Seri Ijazah
  gpa                    Float?            // Indeks Prestasi Kumulatif (IPK)

  // Asal Data & Sumber Kelulusan
  graduationSource       GraduationSource  @default(YUDISIUM_NON_WISUDA)
  graduationCeremonyDate DateTime?         // Tanggal pelaksanaan wisuda (jika ikut)
  pandawaRefId           String?           // ID rujukan sinkronisasi PANDAWA

  // === ARSIP BERKAS SCAN (LOCAL SERVER STORAGE) ===
  ijazahScan             StoredLocalFile?  // Berkas scan Ijazah Asli
  transkripScan          StoredLocalFile?  // Berkas scan Transkrip Nilai Asli
  skpiScan               StoredLocalFile?  // Berkas scan SKPI (opsional)

  // === DATA KARIR & PROFIL SOSIAL (FASE LANJUTAN) ===
  currentJobStatus       JobStatusType     @default(SEEKING_EMPLOYMENT)
  currentCompany         String?
  currentPosition        String?
  industrySector         String?
  linkedinUrl            String?
  avatarUrl              String?           // Foto profil di server
  resumeUrl              String?           // CV di server
  currentAddress         String?
  city                   String?
  province               String?
  
  isDirectoryPublic      Boolean           @default(true)
  isVerified             Boolean           @default(true) // Terverifikasi oleh BAAK
  createdAt              DateTime          @default(now())
  updatedAt              DateTime          @updatedAt

  // Relasi Sistem Lainnya
  legalizationRequests   LegalizationRequest[]
  tracerResponses        TracerResponse[]
  businesses             AlumniBusiness[]

  @@index([prodiCode, graduationYear])
  @@index([pisnNumber])
  @@index([currentJobStatus])
  @@map("alumni")
}

// -----------------------------------------------------------------------------
// 2. USER & AUTENTIKASI
// -----------------------------------------------------------------------------

model User {
  id           String      @id @default(auto()) @map("_id") @db.ObjectId
  nim          String?     @unique
  email        String?     @unique
  passwordHash String?
  role         UserRole    @default(ALUMNI)
  status       UserStatus  @default(PENDING_ACTIVATION)
  lastLoginAt  DateTime?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  alumni       Alumni?
  articles     NewsArticle[]
  jobVacancies JobVacancy[]

  @@map("users")
}

// -----------------------------------------------------------------------------
// 3. E-LEGALISIR ONLINE & PUBLIC QR VERIFICATION
// -----------------------------------------------------------------------------

model LegalizationRequest {
  id                     String                   @id @default(auto()) @map("_id") @db.ObjectId
  alumniId               String                   @db.ObjectId
  alumni                 Alumni                   @relation(fields: [alumniId], references: [id], onDelete: Cascade)
  
  documentType           String                   // "IJAZAH" atau "TRANSKRIP"
  purpose                String                   // Contoh: "Pemberkasan CPNS", "Lamar Kerja BUMN"
  destinationInstitution String?
  
  deliveryType           LegalizationDeliveryType @default(DIGITAL_PDF)
  courierAddress         String?
  
  // Verifikasi Digital & QR Code
  verificationCode       String                   @unique // Kode acak unik
  stampedPdfPath         String?                  // File PDF yang telah distempel digital di PC Server
  
  status                 LegalizationStatus       @default(SUBMITTED)
  reviewedBy             String?                  // Admin BAAK
  rejectionReason        String?
  requestedAt            DateTime                 @default(now())
  approvedAt             DateTime?

  @@index([verificationCode])
  @@index([status])
  @@map("legalization_requests")
}

// -----------------------------------------------------------------------------
// 4. TRACER STUDY STANDAR DIKTI & AKREDITASI
// -----------------------------------------------------------------------------

model TracerSession {
  id                    String           @id @default(auto()) @map("_id") @db.ObjectId
  title                 String           // e.g. "Tracer Study Lulusan 2024"
  academicYear          String           // e.g. "2025/2026"
  targetGraduationYears Int[]            // [2023, 2024]
  startDate             DateTime
  endDate               DateTime
  isActive              Boolean          @default(true)
  description           String?
  createdAt             DateTime         @default(now())

  responses             TracerResponse[]

  @@map("tracer_sessions")
}

model TracerResponse {
  id                      String         @id @default(auto()) @map("_id") @db.ObjectId
  sessionId               String         @db.ObjectId
  session                 TracerSession  @relation(fields: [sessionId], references: [id], onDelete: Restrict)
  alumniId                String         @db.ObjectId
  alumni                  Alumni         @relation(fields: [alumniId], references: [id], onDelete: Restrict)
  nim                     String
  submissionDate          DateTime       @default(now())

  // Standar Belmawa Dikti f1 - f17
  f1_jobStatus            JobStatusType
  f2_monthsToFirstJob     Int?           // Waktu tunggu (bulan)
  f3_firstSalaryRange     SalaryRange?
  f4_currentSalaryRange   SalaryRange?
  f5_horizontalMatch      Int?           // Kesesuaian bidang (1 - 5)
  f6_verticalMatch        Int?           // Kesesuaian tingkat pendidikan (1 - 5)
  f7_searchChannels       String[]
  f8_companyScale         String?
  f11_entrepreneurRevenue Float?
  f12_competencies        Json?
  rawSurveyAnswers        Json?

  isValidDikti            Boolean        @default(true)
  createdAt               DateTime       @default(now())

  @@unique([sessionId, alumniId])
  @@map("tracer_responses")
}

// -----------------------------------------------------------------------------
// 5. PORTAL BERITA, BURSA LOKER, & BISNIS ALUMNI
// -----------------------------------------------------------------------------

model NewsArticle {
  id           String          @id @default(auto()) @map("_id") @db.ObjectId
  title        String
  slug         String          @unique
  summary      String
  contentHtml  String
  category     ArticleCategory @default(BERITA_KAMPUS)
  coverImage   String?         // Path gambar di server
  authorId     String          @db.ObjectId
  author       User            @relation(fields: [authorId], references: [id])
  isPublished  Boolean         @default(true)
  publishedAt  DateTime        @default(now())
  viewsCount   Int             @default(0)
  createdAt    DateTime        @default(now())

  @@map("news_articles")
}

model AlumniBusiness {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  alumniId        String   @db.ObjectId
  alumni          Alumni   @relation(fields: [alumniId], references: [id], onDelete: Cascade)
  businessName    String
  category        String   // Kuliner, Retail, Jasa Konsultan, dsb.
  description     String
  logoPath        String?  // Path logo di server
  contactWhatsapp String
  instagramHandle String?
  address         String?
  isVerified      Boolean  @default(true)
  createdAt       DateTime @default(now())

  @@map("alumni_businesses")
}

model JobVacancy {
  id               String        @id @default(auto()) @map("_id") @db.ObjectId
  postedByUserId   String        @db.ObjectId
  postedByUser     User          @relation(fields: [postedByUserId], references: [id], onDelete: Cascade)
  title            String
  companyName      String
  location         String
  jobType          String        @default("FULL_TIME")
  salaryRange      String?
  description      String
  requirements     String
  applicationEmail String?
  deadline         DateTime?
  status           JobPostStatus @default(PENDING_REVIEW)
  createdAt        DateTime      @default(now())

  @@map("job_vacancies")
}

// -----------------------------------------------------------------------------
// 6. LOG INTEGRASI PANDAWA & EXCEL IMPORT
// -----------------------------------------------------------------------------

model IntegrationLog {
  id              String           @id @default(auto()) @map("_id") @db.ObjectId
  sourceSystem    GraduationSource
  eventType       String           // "PANDAWA_PUSH_GRADUATES", "PISN_EXCEL_IMPORT"
  batchId         String
  payloadReceived Json?
  status          String           // "SUCCESS", "FAILED"
  recordsReceived Int              @default(0)
  recordsInserted Int              @default(0)
  recordsUpdated  Int              @default(0)
  errorLog        String?
  executedAt      DateTime         @default(now())

  @@map("integration_logs")
}
```
