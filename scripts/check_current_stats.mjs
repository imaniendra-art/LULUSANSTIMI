import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.alumni.count();
  console.log(`Total Alumni in DB: ${total}`);

  const byDate = await prisma.alumni.groupBy({
    by: ['yudisiumDate', 'yudisiumDecreeNumber'],
    _count: { nim: true },
    orderBy: { yudisiumDate: 'asc' }
  });

  console.log("\nYudisium Distribution:");
  console.table(byDate.map(d => ({
    tanggal: d.yudisiumDate ? d.yudisiumDate.toISOString().split("T")[0] : null,
    sk: d.yudisiumDecreeNumber,
    jumlah: d._count.nim
  })));

  const byReg = await prisma.alumni.groupBy({
    by: ['registrationType'],
    _count: { nim: true }
  });
  console.log("\nRegistration Types:");
  console.table(byReg);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
