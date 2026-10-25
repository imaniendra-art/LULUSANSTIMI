import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCachedStats, setCachedStats } from "@/lib/statsCache";
import { inferCohortYearFromNim } from "@/lib/cohort";

function parsePeriodToFloatYear(periodStr?: string | null): number | null {
  if (!periodStr) return null;
  const m = String(periodStr).trim().match(/^(\d{4})[-/]?([12])/);
  if (m) {
    const y = parseInt(m[1], 10);
    const sem = m[2];
    return sem === "2" ? y + 0.5 : y;
  }
  const yOnly = String(periodStr).trim().match(/^(\d{4})/);
  if (yOnly) return parseInt(yOnly[1], 10);
  return null;
}

export async function GET() {
  try {
    const cached = getCachedStats();
    if (cached) {
      return NextResponse.json(cached);
    }

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
      allMetadata,
    ] = await Promise.all([
      prisma.alumni.count(),
      prisma.alumni.count({
        where: {
          OR: [
            { AND: [{ pisnNumber: { not: null } }, { pisnNumber: { not: "" } }] },
            { AND: [{ certificateNumber: { not: null } }, { certificateNumber: { not: "" } }] },
          ],
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
        select: {
          nim: true,
          pisnBatchNumber: true,
          yudisiumDate: true,
          entryPeriod: true,
          exitPeriod: true,
          graduationYear: true,
          cohortYear: true,
          yudisiumDecreeNumber: true,
          pisnNumber: true,
          certificateNumber: true,
          prodiCode: true,
          registrationType: true,
          gpa: true,
          thesisTitle: true,
          ijazahScan: true,
          transkripScan: true,
        },
      }),
    ]);

    const batchSet = new Set<string>();
    const yudisiumSet = new Set<string>();
    const entryPeriodSet = new Set<string>();

    const allRecords = allMetadata || [];
    const yudisiumCounts: Record<string, number> = {};
    const yudisiumSkMap: Record<string, string> = {};
    const cohortCounts: Record<string, number> = {};
    const graduationYearCounts: Record<string, number> = {};
    const cohortPisnStats: Record<string, { total: number; withPisn: number; withoutPisn: number }> = {};
    const cohortThesisStats: Record<string, { total: number; withThesis: number; withoutThesis: number }> = {};
    const cohortFileStats: Record<string, { total: number; withIjazah: number; withoutIjazah: number }> = {};

    // Enhanced Cross-Tab Analytics
    const cohortExitBreakdown: Record<
      string,
      {
        cohort: string;
        total: number;
        withPisn: number;
        withoutPisn: number;
        exits: Record<string, number>;
      }
    > = {};

    const exitPeriodStats: Record<
      string,
      {
        period: string;
        total: number;
        withPisn: number;
        withoutPisn: number;
        cohorts: Record<string, number>;
      }
    > = {};

    let gpaS1Sum = 0;
    let gpaS1Count = 0;
    let gpaS2Sum = 0;
    let gpaS2Count = 0;
    let cumlaudeCount = 0;
    let sangatMemuaskanCount = 0;
    let memuaskanCount = 0;

    let hasThesisCount = 0;
    let fullCompleteCount = 0;

    const regulerDurations: number[] = [];
    const rplDurations: number[] = [];
    let onTimeRegulerCount = 0;

    for (const r of allRecords) {
      if (r.pisnBatchNumber && r.pisnBatchNumber.trim()) {
        batchSet.add(r.pisnBatchNumber.trim());
      }
      if (r.entryPeriod && r.entryPeriod.trim()) {
        entryPeriodSet.add(r.entryPeriod.trim());
      }
      if (r.yudisiumDate) {
        const dStr = r.yudisiumDate.toISOString().split("T")[0];
        yudisiumSet.add(dStr);
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
      } else if (r.nim) {
        const inferred = inferCohortYearFromNim(r.nim);
        if (inferred) cYear = inferred.toString();
      }

      if (cYear && parseInt(cYear, 10) < 2020) {
        cYear = null;
      }

      const hasPisnNum = Boolean((r.pisnNumber && String(r.pisnNumber).trim().length > 0) || (r.certificateNumber && String(r.certificateNumber).trim().length > 0));
      const hasThesis = Boolean(r.thesisTitle && String(r.thesisTitle).trim().length > 0);
      const hasIjazah = Boolean(r.ijazahScan);
      const hasTranskrip = Boolean(r.transkripScan);

      if (hasThesis) hasThesisCount++;
      if (hasPisnNum && hasThesis && hasIjazah && hasTranskrip) fullCompleteCount++;

      if (cYear) {
        cohortCounts[cYear] = (cohortCounts[cYear] || 0) + 1;
        if (!cohortPisnStats[cYear]) {
          cohortPisnStats[cYear] = { total: 0, withPisn: 0, withoutPisn: 0 };
        }
        cohortPisnStats[cYear].total++;
        if (hasPisnNum) {
          cohortPisnStats[cYear].withPisn++;
        } else {
          cohortPisnStats[cYear].withoutPisn++;
        }

        if (!cohortThesisStats[cYear]) {
          cohortThesisStats[cYear] = { total: 0, withThesis: 0, withoutThesis: 0 };
        }
        cohortThesisStats[cYear].total++;
        if (hasThesis) cohortThesisStats[cYear].withThesis++;
        else cohortThesisStats[cYear].withoutThesis++;

        if (!cohortFileStats[cYear]) {
          cohortFileStats[cYear] = { total: 0, withIjazah: 0, withoutIjazah: 0 };
        }
        cohortFileStats[cYear].total++;
        if (hasIjazah) cohortFileStats[cYear].withIjazah++;
        else cohortFileStats[cYear].withoutIjazah++;

        // Cohort Exit Breakdown
        if (!cohortExitBreakdown[cYear]) {
          cohortExitBreakdown[cYear] = {
            cohort: cYear,
            total: 0,
            withPisn: 0,
            withoutPisn: 0,
            exits: {},
          };
        }
        cohortExitBreakdown[cYear].total++;
        if (hasPisnNum) cohortExitBreakdown[cYear].withPisn++;
        else cohortExitBreakdown[cYear].withoutPisn++;

        const ep = r.exitPeriod ? r.exitPeriod.trim() : "2026-2";
        cohortExitBreakdown[cYear].exits[ep] = (cohortExitBreakdown[cYear].exits[ep] || 0) + 1;
      }

      // Exit Period Stats
      const epKey = r.exitPeriod ? r.exitPeriod.trim() : "2026-2";
      if (!exitPeriodStats[epKey]) {
        exitPeriodStats[epKey] = {
          period: epKey,
          total: 0,
          withPisn: 0,
          withoutPisn: 0,
          cohorts: {},
        };
      }
      exitPeriodStats[epKey].total++;
      if (hasPisnNum) exitPeriodStats[epKey].withPisn++;
      else exitPeriodStats[epKey].withoutPisn++;
      if (cYear) {
        exitPeriodStats[epKey].cohorts[cYear] = (exitPeriodStats[epKey].cohorts[cYear] || 0) + 1;
      }

      // GPA Calculations
      if (typeof r.gpa === "number" && !isNaN(r.gpa) && r.gpa > 0) {
        if (r.prodiCode === "61101") {
          gpaS2Sum += r.gpa;
          gpaS2Count++;
        } else {
          gpaS1Sum += r.gpa;
          gpaS1Count++;
        }

        if (r.gpa >= 3.51) cumlaudeCount++;
        else if (r.gpa >= 3.0) sangatMemuaskanCount++;
        else memuaskanCount++;
      }

      // Study Duration Calculations
      const entryFloat = parsePeriodToFloatYear(r.entryPeriod) ?? (r.cohortYear ? Number(r.cohortYear) : null);
      const exitFloat = parsePeriodToFloatYear(r.exitPeriod) ?? (r.graduationYear ? Number(r.graduationYear) : null);
      if (entryFloat !== null && exitFloat !== null && exitFloat >= entryFloat) {
        const diff = exitFloat - entryFloat;
        const isReguler = r.registrationType === "PESERTA_DIDIK_BARU";
        if (isReguler) {
          regulerDurations.push(diff);
          if (diff <= 4.0) onTimeRegulerCount++;
        } else {
          rplDurations.push(diff);
        }
      }

      // Hitung Tahun Keluar Kalender
      let gradY: number | null = null;
      if (r.yudisiumDate) {
        const y = new Date(r.yudisiumDate).getFullYear();
        if (!isNaN(y) && y > 2000) gradY = y;
      }
      if (!gradY && r.graduationYear) gradY = r.graduationYear;
      if (!gradY && r.exitPeriod) {
        const match = r.exitPeriod.match(/^(\d{4})[-/]?([12])/);
        if (match) {
          const year = parseInt(match[1], 10);
          const sem = match[2];
          gradY = sem === "2" ? year + 1 : year;
        }
      }
      if (gradY) {
        const yStr = gradY.toString();
        graduationYearCounts[yStr] = (graduationYearCounts[yStr] || 0) + 1;
      }
    }

    const batches = Array.from(batchSet).sort();
    const yudisiumDates = Array.from(yudisiumSet).sort().reverse();
    const entryPeriods = Array.from(entryPeriodSet).sort();
    const cohorts = Object.keys(cohortCounts).sort();
    const graduationYears = Object.keys(graduationYearCounts).sort((a, b) => b.localeCompare(a));

    const avgGpaS1 = gpaS1Count > 0 ? parseFloat((gpaS1Sum / gpaS1Count).toFixed(2)) : null;
    const avgGpaS2 = gpaS2Count > 0 ? parseFloat((gpaS2Sum / gpaS2Count).toFixed(2)) : null;
    const totalGpaCount = gpaS1Count + gpaS2Count;
    const avgGpaOverall =
      totalGpaCount > 0
        ? parseFloat(((gpaS1Sum + gpaS2Sum) / totalGpaCount).toFixed(2))
        : null;

    const avgYearsReguler =
      regulerDurations.length > 0
        ? parseFloat((regulerDurations.reduce((a, b) => a + b, 0) / regulerDurations.length).toFixed(1))
        : null;

    const avgYearsRpl =
      rplDurations.length > 0
        ? parseFloat((rplDurations.reduce((a, b) => a + b, 0) / rplDurations.length).toFixed(1))
        : null;

    const onTimeRate =
      regulerDurations.length > 0
        ? Math.round((onTimeRegulerCount / regulerDurations.length) * 100)
        : null;

    const totalArchiveSlots = totalGraduates * 4;
    const filledArchiveSlots = withPisn + withIjazah + withTranskrip + hasThesisCount;
    const archiveHealthScore =
      totalArchiveSlots > 0 ? Math.round((filledArchiveSlots / totalArchiveSlots) * 100) : 0;

    const responsePayload = {
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
        cohortPisnStats,
        cohortThesisStats,
        cohortFileStats,
        thesisStats: {
          total: totalGraduates,
          withThesis: hasThesisCount,
          withoutThesis: totalGraduates - hasThesisCount,
        },
        fileStats: {
          total: totalGraduates,
          withIjazah,
          withoutIjazah: totalGraduates - withIjazah,
          withTranskrip,
          withoutTranskrip: totalGraduates - withTranskrip,
        },
        cohortExitBreakdown,
        exitPeriodStats,
        accreditation: {
          avgGpaS1,
          avgGpaS2,
          avgGpaOverall,
          gpaCount: totalGpaCount,
          cumlaudeCount,
          sangatMemuaskanCount,
          memuaskanCount,
          avgYearsReguler,
          avgYearsRpl,
          onTimeRate,
        },
        archiveHealth: {
          total: totalGraduates,
          fullComplete: fullCompleteCount,
          hasPisn: withPisn,
          hasIjazah: withIjazah,
          hasTranskrip: withTranskrip,
          hasThesis: hasThesisCount,
          missingPisn: totalGraduates - withPisn,
          missingIjazah: totalGraduates - withIjazah,
          missingTranskrip: totalGraduates - withTranskrip,
          missingThesis: totalGraduates - hasThesisCount,
          healthScore: archiveHealthScore,
        },
        graduationYears,
        graduationYearCounts,
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
    };

    setCachedStats(responsePayload);
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Alumni stats error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil statistik lulusan" },
      { status: 500 }
    );
  }
}
