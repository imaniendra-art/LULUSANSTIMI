import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("=== Mengosongkan Seluruh Data & Transaksi LULUSANSTIMI ===");

  // 1. Hitung sebelum dihapus
  const countLegalization = await prisma.legalizationRequest.count();
  const countTracer = await prisma.tracerResponse.count();
  const countSessions = await prisma.tracerSession.count();
  const countLogs = await prisma.integrationLog.count();
  const countAlumni = await prisma.alumni.count();
  const countUsers = await prisma.user.count();

  console.log(`Ditemukan:`);
  console.log(`- ${countAlumni} data Alumni`);
  console.log(`- ${countLegalization} Permohonan Legalisir`);
  console.log(`- ${countTracer} Respon Tracer Study`);
  console.log(`- ${countSessions} Sesi Tracer Study`);
  console.log(`- ${countLogs} Log Integrasi`);
  console.log(`- ${countUsers} Akun Pengguna`);

  // 2. Hapus data berelasi dan operasional
  console.log("\nMenghapus data...");
  const delLegal = await prisma.legalizationRequest.deleteMany({});
  console.log(`✔ Terhapus ${delLegal.count} permohonan legalisir`);

  const delTracer = await prisma.tracerResponse.deleteMany({});
  console.log(`✔ Terhapus ${delTracer.count} respon tracer`);

  const delSessions = await prisma.tracerSession.deleteMany({});
  console.log(`✔ Terhapus ${delSessions.count} sesi tracer`);

  const delLogs = await prisma.integrationLog.deleteMany({});
  console.log(`✔ Terhapus ${delLogs.count} log integrasi`);

  const delAlumni = await prisma.alumni.deleteMany({});
  console.log(`✔ Terhapus ${delAlumni.count} data alumni`);

  // Hapus semua akun user kecuali super admin iman
  const delUsers = await prisma.user.deleteMany({
    where: {
      NOT: {
        OR: [
          { email: "imaniendra@gmail.com" },
          { nim: "iman" },
          { nim: "IMANIENDRA" },
        ],
      },
    },
  });
  console.log(`✔ Terhapus ${delUsers.count} akun pengguna non-iman`);

  // 3. Pastikan Akun Superadmin Iman tetap ada dan aktif
  const passwordHash = crypto.createHash("sha256").update("makassar123").digest("hex");
  const imanAdmin = await prisma.user.upsert({
    where: { email: "imaniendra@gmail.com" },
    update: {
      nim: "iman",
      role: "SUPERADMIN",
      status: "ACTIVE",
      passwordHash,
    },
    create: {
      email: "imaniendra@gmail.com",
      nim: "iman",
      role: "SUPERADMIN",
      status: "ACTIVE",
      passwordHash,
    },
  });
  console.log(`✔ Akun Superadmin Iman siap: ${imanAdmin.email} (${imanAdmin.nim}) - ${imanAdmin.role}`);

  // 4. Verifikasi sisa data
  const finalAlumniCount = await prisma.alumni.count();
  const finalUsersCount = await prisma.user.count();
  console.log(`\nStatus Akhir: ${finalAlumniCount} Alumni, ${finalUsersCount} Superadmin User (BERSIH 100%).`);
}

main()
  .catch((err) => {
    console.error("Gagal mengosongkan database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
