import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalGraduates,
      withPisn,
      withIjazah,
      withTranskrip,
      s1ManajemenCount,
      s2ManajemenCount,
      pesertaBaruCount,
      rplPerolehanCount,
      rplTransferCount,
      batchAggregations,
      yudisiumAggregations,
      entryPeriodAggregations,
      allMetadata,
    ] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.count({
        where: {
          AND: [{ pisnNumber: { not: null } }, { pisnNumber: { not: "" } }],
        },
      }),
      prisma.alumni.count({
        where: {
          ijazahScan: { isNot: null },
        },
      }),
      prisma.alumni.count({
        where: {
          transkripScan: { isNot: null },
        },
      }),
      prisma.alumni.count({
        where: { prodiCode: "61201" },
      }),
      prisma.alumni.count({
        where: { prodiCode: "61101" },
      }),
      prisma.alumni.count({
        where: { registrationType: "PESERTA_DIDIK_BARU" },
      }),
      prisma.alumni.count({
        where: {
          OR: [
            { registrationType: "RPL_PEROLEHAN_SKS" },
            { registrationType: "RPL_KONVERSI_SKS" },
          ],
        },
      }),
      prisma.alumni.count({
        where: {
          OR: [
            { registrationType: "RPL_TRANSFER_SKS" },
            { registrationType: "KONVERSI_TRANSFER_NILAI" },
          ],
        },
      }),
      prisma.alumni.findMany({
        where: {
          AND: [{ pisnBatchNumber: { not: null } }, { pisnBatchNumber: { not: "" } }],
        },
        select: { pisnBatchNumber: true },
        distinct: ["pisnBatchNumber"],
        orderBy: { pisnBatchNumber: "asc" },
      }),
      prisma.alumni.findMany({
        select: { yudisiumDate: true },
        distinct: ["yudisiumDate"],
        orderBy: { yudisiumDate: "desc" },
      }),
      prisma.alumni.findMany({
        where: {
          AND: [{ entryPeriod: { not: null } }, { entryPeriod: { not: "" } }],
        },
        select: { entryPeriod: true },
        distinct: ["entryPeriod"],
        orderBy: { entryPeriod: "asc" },
      }),
      prisma.alumni.findMany({
        select: {
          yudisiumDate: true,
          entryPeriod: true,
          cohortYear: true,
          yudisiumDecreeNumber: true,
        },
      }),
    ]);

    const batches = batchAggregations
      .map((b) => b.pisnBatchNumber)
      .filter((b): b is string => !!b);

    const yudisiumDates = yudisiumAggregations
      .map((y) => (y.yudisiumDate ? y.yudisiumDate.toISOString().split("T")[0] : null))
      .filter((d): d is string => !!d);

    const entryPeriods = entryPeriodAggregations
      .map((e) => e.entryPeriod)
      .filter((p): p is string => !!p);

    const allRecords = allMetadata || [];
    const yudisiumCounts: Record<string, number> = {};
    const yudisiumSkMap: Record<string, string> = {};
    const cohortCounts: Record<string, number> = {};

    for (const r of allRecords) {
      if (r.yudisiumDate) {
        const dStr = r.yudisiumDate.toISOString().split("T")[0];
        yudisiumCounts[dStr] = (yudisiumCounts[dStr] || 0) + 1;
        if (r.yudisiumDecreeNumber && !yudisiumSkMap[dStr]) {
          yudisiumSkMap[dStr] = r.yudisiumDecreeNumber;
        }
      }

      let cYear: string | null = null;
      if (r.cohortYear && r.cohortYear >= 2000 && r.cohortYear <= 2030) {
        cYear = r.cohortYear.toString();
      } else if (r.entryPeriod && r.entryPeriod.length >= 4) {
        const y = r.entryPeriod.substring(0, 4);
        if (/^20\d\d$/.test(y)) cYear = y;
      }

      if (cYear) {
        cohortCounts[cYear] = (cohortCounts[cYear] || 0) + 1;
      }
    }

    const cohorts = Object.keys(cohortCounts).sort();

    return NextResponse.json({
      success: true,
      stats: {
        totalGraduates,
        withPisn,
        withoutPisn: totalGraduates - withPisn,
        withIjazah,
        withTranskrip,
        bothFilesArchived: Math.min(withIjazah, withTranskrip),
        batches,
        yudisiumDates,
        yudisiumCounts,
        yudisiumSkMap,
        cohorts,
        cohortCounts,
        entryPeriods,
        prodi: {
          s1Manajemen: s1ManajemenCount,
          s2Manajemen: s2ManajemenCount,
        },
        registrationTypes: {
          pesertaBaru: pesertaBaruCount,
          rplPerolehan: rplPerolehanCount,
          rplKonversi: rplPerolehanCount,
          rplTransfer: rplTransferCount,
          transfer: rplPerolehanCount + rplTransferCount,
        },
      },
    });
  } catch (error) {
    console.error("Alumni stats error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik lulusan" },
      { status: 500 }
    );
  }
}
