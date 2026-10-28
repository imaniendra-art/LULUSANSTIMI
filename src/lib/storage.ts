import fs from "fs";
import path from "path";

const BASE_STORAGE_DIR = path.join(process.cwd(), process.env.STORAGE_DIR || "storage/uploads");

export function ensureStorageDirs() {
  const dirs = [
    path.join(BASE_STORAGE_DIR, "credentials/ijazah"),
    path.join(BASE_STORAGE_DIR, "credentials/transkrip"),
    path.join(BASE_STORAGE_DIR, "legalizations/stamped"),
    path.join(BASE_STORAGE_DIR, "avatars"),
    path.join(BASE_STORAGE_DIR, "sk-yudisium"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function sanitizeSkNumber(sk: string): string {
  return sk.replace(/[/\\?%*:|"<>]/g, "_").trim();
}

export async function saveDecreePdf(decreeNumber: string, buffer: Buffer, originalName?: string) {
  ensureStorageDirs();
  const safeName = sanitizeSkNumber(decreeNumber);
  const targetDir = path.join(BASE_STORAGE_DIR, "sk-yudisium");
  const fileName = `SK_${safeName}.pdf`;
  const absolutePath = path.join(targetDir, fileName);
  const relativePath = path.posix.join("storage/uploads/sk-yudisium", fileName);

  await fs.promises.writeFile(absolutePath, buffer);
  return {
    fileName,
    relativePath,
    absolutePath,
    size: buffer.length,
  };
}

export function getDecreePdfPath(decreeNumber: string): { exists: boolean; absolutePath: string; relativePath: string } {
  ensureStorageDirs();
  const safeName = sanitizeSkNumber(decreeNumber);
  const targetDir = path.join(BASE_STORAGE_DIR, "sk-yudisium");
  const fileName = `SK_${safeName}.pdf`;
  const absolutePath = path.join(targetDir, fileName);
  const relativePath = path.posix.join("storage/uploads/sk-yudisium", fileName);

  if (fs.existsSync(absolutePath)) {
    return {
      exists: true,
      absolutePath,
      relativePath,
    };
  }

  // Fallback: cari di targetDir yang cocok secara case-insensitive atau normalisasi alphanumeric
  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    const targetNormalized = safeName.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const f of files) {
      if (f.endsWith(".pdf") && f.startsWith("SK_")) {
        const key = f.replace(/^SK_/, "").replace(/\.pdf$/, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        if (key === targetNormalized) {
          const matchAbs = path.join(targetDir, f);
          return {
            exists: true,
            absolutePath: matchAbs,
            relativePath: path.posix.join("storage/uploads/sk-yudisium", f),
          };
        }
      }
    }
  }

  return {
    exists: false,
    absolutePath,
    relativePath,
  };
}

export function listAllUploadedDecrees(): Record<string, { fileName: string; size: number; uploadedAt: string }> {
  ensureStorageDirs();
  const targetDir = path.join(BASE_STORAGE_DIR, "sk-yudisium");
  const result: Record<string, { fileName: string; size: number; uploadedAt: string }> = {};

  if (!fs.existsSync(targetDir)) return result;

  const files = fs.readdirSync(targetDir);
  for (const f of files) {
    if (f.endsWith(".pdf") && f.startsWith("SK_")) {
      const stat = fs.statSync(path.join(targetDir, f));
      const key = f.replace(/^SK_/, "").replace(/\.pdf$/, "");
      result[key] = {
        fileName: f,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      };
    }
  }
  return result;
}

export async function saveUploadedFile(params: {
  buffer: Buffer;
  subfolder: "credentials/ijazah" | "credentials/transkrip" | "legalizations/stamped";
  originalName: string;
  nim?: string;
}): Promise<{ relativePath: string; absolutePath: string; size: number }> {
  ensureStorageDirs();

  const ext = path.extname(params.originalName) || ".pdf";
  const cleanNim = params.nim ? params.nim.replace(/[^a-zA-Z0-9]/g, "") : "doc";
  const timestamp = Date.now();
  const fileName = `${cleanNim}_${params.subfolder.split("/").pop()}_${timestamp}${ext}`;

  const targetDir = path.join(BASE_STORAGE_DIR, params.subfolder);
  const absolutePath = path.join(targetDir, fileName);
  const relativePath = path.posix.join("storage/uploads", params.subfolder, fileName);

  await fs.promises.writeFile(absolutePath, params.buffer);

  return {
    relativePath,
    absolutePath,
    size: params.buffer.length,
  };
}

export function getAbsoluteFilePath(relativePath: string): string {
  if (path.isAbsolute(relativePath)) return relativePath;
  return path.join(process.cwd(), relativePath);
}

export function fileExists(relativePath: string): boolean {
  try {
    const fullPath = getAbsoluteFilePath(relativePath);
    return fs.existsSync(fullPath);
  } catch {
    return false;
  }
}
