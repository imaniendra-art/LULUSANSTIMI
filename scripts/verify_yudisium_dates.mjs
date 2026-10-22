import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const alumni = await prisma.alumni.findMany({
    select: {
      nim: true,
      fullName: true,
      yudisiumDate: true,
      gpa: true,
      pisnNumber: true,
      pisnBatchNumber: true,
    },
    orderBy: { nim: "asc" }
  });

  console.log(`Total alumni: ${alumni.length}`);
  
  // Group by yudisium date
  const groups = {};
  for (const a of alumni) {
    const key = a.yudisiumDate ? a.yudisiumDate.toISOString().split("T")[0] : "NONE";
    groups[key] = (groups[key] || 0) + 1;
  }

  console.log("Distribution of Yudisium Dates in Database:");
  console.table(groups);

  // Show a few samples
  console.log("\nSample 5 records:");
  console.log(alumni.slice(0, 5).map(a => ({
    nim: a.nim,
    nama: a.fullName,
    yudisiumDate: a.yudisiumDate ? a.yudisiumDate.toISOString().split("T")[0] : null,
    ipk: a.gpa,
    batch: a.pisnBatchNumber,
    pisn: a.pisnNumber ? a.pisnNumber.substring(0, 10) + "..." : null
  })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
