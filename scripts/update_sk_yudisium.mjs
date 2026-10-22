import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Updating Nomor SK Yudisium based on Yudisium Date...");

  const skMapping = [
    {
      dateStr: "2026-07-31",
      decreeNumber: "000.2/342/STIMI-YAPMI/MKS/VII/2026",
      label: "31 Juli 2026",
    },
    {
      dateStr: "2026-08-08",
      decreeNumber: "000.2/443/STIMI-YAPMI/MKS/VIII/2026",
      label: "8 Agustus 2026",
    },
    {
      dateStr: "2026-09-04",
      decreeNumber: "000.2/493/STIMI-YAPMI/MKS/IX/2026",
      label: "4 September 2026",
    },
  ];

  for (const m of skMapping) {
    const start = new Date(`${m.dateStr}T00:00:00.000Z`);
    const end = new Date(`${m.dateStr}T23:59:59.999Z`);

    const res = await prisma.alumni.updateMany({
      where: {
        yudisiumDate: {
          gte: start,
          lte: end,
        },
      },
      data: {
        yudisiumDecreeNumber: m.decreeNumber,
      },
    });

    console.log(`Updated ${res.count} alumni for Yudisium ${m.label} -> SK: ${m.decreeNumber}`);
  }

  // Summary check
  const samples = await prisma.alumni.findMany({
    select: {
      nim: true,
      fullName: true,
      yudisiumDate: true,
      yudisiumDecreeNumber: true,
      thesisTitle: true,
    },
    take: 6,
  });

  console.log("\nSample records after SK update:");
  console.log(samples.map(s => ({
    nim: s.nim,
    nama: s.fullName,
    yudisium: s.yudisiumDate ? s.yudisiumDate.toISOString().split("T")[0] : null,
    sk: s.yudisiumDecreeNumber,
    judul: s.thesisTitle
  })));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
