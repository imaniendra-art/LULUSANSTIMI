import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const prodi = searchParams.get("prodi") || "";
    const year = searchParams.get("year");
    const batch = searchParams.get("batch") || "";
    const registrationType = searchParams.get("registrationType") || "";
    const hasPisn = searchParams.get("hasPisn"); // "true" or "false"
    const yudisiumDateParam = searchParams.get("yudisiumDate") || "";
    const entryPeriodParam = searchParams.get("entryPeriod") || "";
    const fileStatusParam = searchParams.get("fileStatus") || "";
    const gpaRangeParam = searchParams.get("gpaRange") || "";
    const sortBy = searchParams.get("sortBy") || "nim";
    const sortOrder = (searchParams.get("sortOrder") || "asc").toLowerCase() === "desc" ? "desc" : "asc";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "150", 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { nim: { contains: query, mode: "insensitive" } },
        { fullName: { contains: query, mode: "insensitive" } },
        { pisnNumber: { contains: query, mode: "insensitive" } },
        { pisnBatchNumber: { contains: query, mode: "insensitive" } },
        { yudisiumDecreeNumber: { contains: query, mode: "insensitive" } },
        { entryPeriod: { contains: query, mode: "insensitive" } },
        { exitPeriod: { contains: query, mode: "insensitive" } },
        { thesisTitle: { contains: query, mode: "insensitive" } },
      ];
    }

    if (prodi) {
      where.prodiCode = prodi;
    }

    if (batch) {
      where.pisnBatchNumber = batch;
    }

    if (registrationType) {
      where.registrationType = registrationType;
    }

    if (year) {
      where.graduationYear = parseInt(year, 10);
    }

    if (entryPeriodParam) {
      where.entryPeriod = entryPeriodParam;
    }

    if (yudisiumDateParam) {
      const start = new Date(`${yudisiumDateParam}T00:00:00.000Z`);
      const end = new Date(`${yudisiumDateParam}T23:59:59.999Z`);
      where.yudisiumDate = { gte: start, lte: end };
    }

    if (fileStatusParam === "has_both") {
      where.AND = [
        { ijazahScan: { isNot: null } },
        { transkripScan: { isNot: null } },
      ];
    } else if (fileStatusParam === "has_ijazah") {
      where.ijazahScan = { isNot: null };
    } else if (fileStatusParam === "has_transkrip") {
      where.transkripScan = { isNot: null };
    } else if (fileStatusParam === "no_files") {
      where.AND = [
        { ijazahScan: { is: null } },
        { transkripScan: { is: null } },
      ];
    }

    if (gpaRangeParam === "cumlaude") {
      where.gpa = { gte: 3.75 };
    } else if (gpaRangeParam === "sangat_memuaskan") {
      where.gpa = { gte: 3.50, lt: 3.75 };
    } else if (gpaRangeParam === "memuaskan") {
      where.gpa = { lt: 3.50 };
    }

    if (hasPisn === "true") {
      const condition = {
        AND: [
          { pisnNumber: { isSet: true } },
          { pisnNumber: { not: null } },
          { pisnNumber: { not: "" } },
        ],
      };
      if (Array.isArray(where.AND)) {
        where.AND.push(condition);
      } else if (where.AND) {
        where.AND = [where.AND, condition];
      } else {
        where.AND = [condition];
      }
    } else if (hasPisn === "false") {
      const condition = {
        OR: [
          { pisnNumber: { isSet: false } },
          { pisnNumber: null },
          { pisnNumber: "" },
        ],
      };
      if (Array.isArray(where.AND)) {
        where.AND.push(condition);
      } else if (where.AND) {
        where.AND = [where.AND, condition];
      } else {
        where.AND = [condition];
      }
    }

    let orderBy: Record<string, "asc" | "desc">[] = [{ nim: "asc" }];

    if (sortBy === "name" || sortBy === "fullName") {
      orderBy = [{ fullName: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "nim") {
      orderBy = [{ nim: sortOrder }];
    } else if (sortBy === "yudisiumDate" || sortBy === "yudisium") {
      orderBy = [{ yudisiumDate: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "gpa" || sortBy === "ipk") {
      orderBy = [{ gpa: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "entryPeriod" || sortBy === "entry") {
      orderBy = [{ entryPeriod: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "exitPeriod" || sortBy === "exit") {
      orderBy = [{ exitPeriod: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "batch" || sortBy === "pisnBatchNumber") {
      orderBy = [{ pisnBatchNumber: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "pisn" || sortBy === "pisnNumber") {
      orderBy = [{ pisnNumber: sortOrder }, { nim: "asc" }];
    } else if (sortBy === "registrationType" || sortBy === "jalur") {
      orderBy = [{ registrationType: sortOrder }, { nim: "asc" }];
    }

    const [items, total] = await Promise.all([
      prisma.alumni.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.alumni.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch alumni error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data repositori lulusan" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const nim = (formData.get("nim") as string)?.trim();
    const fullName = (formData.get("fullName") as string)?.trim();
    const prodiCode = (formData.get("prodiCode") as string) || "61201";
    const prodiName =
      (formData.get("prodiName") as string) ||
      (prodiCode === "61101" ? "S2 Manajemen" : "S1 Manajemen");
    const degree = prodiCode === "61101" ? "S2" : "S1";

    const registrationType =
      (formData.get("registrationType") as
        | "PESERTA_DIDIK_BARU"
        | "RPL_PEROLEHAN_SKS"
        | "RPL_TRANSFER_SKS"
        | "RPL_KONVERSI_SKS"
        | "KONVERSI_TRANSFER_NILAI") || "PESERTA_DIDIK_BARU";
    const entryPeriod = (formData.get("entryPeriod") as string) || "";
    const exitPeriod = (formData.get("exitPeriod") as string) || "";

    const yudisiumDateStr = formData.get("yudisiumDate") as string;
    const yudisiumDecreeNumber = (formData.get("yudisiumDecreeNumber") as string) || "";
    const thesisTitle = (formData.get("thesisTitle") as string) || "Telah memenuhi syarat kelulusan";
    const pisnNumber = (formData.get("pisnNumber") as string) || "";
    const pisnBatchNumber = (formData.get("pisnBatchNumber") as string) || "";
    const certificateNumber = (formData.get("certificateNumber") as string) || "";
    const gpaStr = formData.get("gpa") as string;
    const phoneNumber = (formData.get("phoneNumber") as string) || "";
    const personalEmail = (formData.get("personalEmail") as string) || "";

    if (!nim || !fullName || !yudisiumDateStr) {
      return NextResponse.json(
        { error: "NIM, Nama Lengkap, dan Tanggal Yudisium wajib diisi." },
        { status: 400 }
      );
    }

    const yudisiumDate = new Date(yudisiumDateStr);
    const graduationYear = yudisiumDate.getFullYear();
    const gpa = gpaStr ? parseFloat(gpaStr) : null;

    // Check duplicate NIM
    const existing = await prisma.alumni.findUnique({ where: { nim } });
    if (existing) {
      return NextResponse.json(
        { error: `Lulusan dengan NIM ${nim} sudah terdaftar di sistem.` },
        { status: 409 }
      );
    }

    // Default Entry & Exit Period format compact (e.g. 2022-1, 2025-2)
    const nimPrefix = nim.substring(0, 2);
    const entryYear = parseInt(nimPrefix, 10) ? 2000 + parseInt(nimPrefix, 10) : graduationYear - 4;
    const finalEntryPeriod = entryPeriod || `${entryYear}-1`;
    const finalExitPeriod = exitPeriod || `${graduationYear - 1}-2`;

    // Process uploaded files if any
    let ijazahScan = undefined;
    const ijazahFile = formData.get("ijazahFile") as File | null;
    if (ijazahFile && ijazahFile.size > 0) {
      const buffer = Buffer.from(await ijazahFile.arrayBuffer());
      const saved = await saveUploadedFile({
        buffer,
        subfolder: "credentials/ijazah",
        originalName: ijazahFile.name,
        nim,
      });
      ijazahScan = {
        fileName: ijazahFile.name,
        filePath: saved.relativePath,
        fileSizeBytes: saved.size,
        mimeType: ijazahFile.type || "application/pdf",
        uploadedAt: new Date(),
      };
    }

    let transkripScan = undefined;
    const transkripFile = formData.get("transkripFile") as File | null;
    if (transkripFile && transkripFile.size > 0) {
      const buffer = Buffer.from(await transkripFile.arrayBuffer());
      const saved = await saveUploadedFile({
        buffer,
        subfolder: "credentials/transkrip",
        originalName: transkripFile.name,
        nim,
      });
      transkripScan = {
        fileName: transkripFile.name,
        filePath: saved.relativePath,
        fileSizeBytes: saved.size,
        mimeType: transkripFile.type || "application/pdf",
        uploadedAt: new Date(),
      };
    }

    const newAlumni = await prisma.alumni.create({
      data: {
        nim,
        fullName,
        phoneNumber,
        personalEmail,
        prodiCode,
        prodiName,
        degree,
        registrationType,
        entryPeriod: finalEntryPeriod,
        exitPeriod: finalExitPeriod,
        cohortYear: entryYear,
        graduationYear,
        yudisiumDate,
        yudisiumDecreeNumber: yudisiumDecreeNumber || null,
        thesisTitle,
        pisnNumber: pisnNumber || null,
        pisnBatchNumber: pisnBatchNumber || null,
        certificateNumber: certificateNumber || null,
        gpa,
        graduationSource: "YUDISIUM_NON_WISUDA",
        ijazahScan,
        transkripScan,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data lulusan & berkas berhasil disimpan",
      data: newAlumni,
    });
  } catch (error) {
    console.error("Create alumni error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data lulusan baru" },
      { status: 500 }
    );
  }
}
