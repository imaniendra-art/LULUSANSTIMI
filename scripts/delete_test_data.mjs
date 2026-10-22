import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function clean() {
  const testNims = ["202061201001", "202061201002", "202062201001", "202062201002"];
  
  // Also delete records with no pisnBatchNumber
  const deleted = await prisma.alumni.deleteMany({
    where: {
      OR: [
        { nim: { in: testNims } },
        { pisnBatchNumber: null },
      ]
    }
  });

  console.log(`Berhasil menghapus ${deleted.count} data uji.`);

  // Remove test files
  const testFiles = [
    "storage/uploads/credentials/ijazah/202061201001_ijazah.pdf",
    "storage/uploads/credentials/transkrip/202061201001_transkrip.pdf",
    "storage/uploads/credentials/ijazah/202061201002_ijazah.pdf",
    "storage/uploads/credentials/transkrip/202061201002_transkrip.pdf",
  ];

  for (const f of testFiles) {
    const full = path.join(process.cwd(), f);
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      console.log(`File uji dihapus: ${f}`);
    }
  }

  const remaining = await prisma.alumni.count();
  console.log(`Jumlah total data resmi tersisa: ${remaining} lulusan.`);
}

clean()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
