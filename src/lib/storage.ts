import fs from "fs";
import path from "path";

const BASE_STORAGE_DIR = path.join(process.cwd(), process.env.STORAGE_DIR || "storage/uploads");

export function ensureStorageDirs() {
  const dirs = [
    path.join(BASE_STORAGE_DIR, "credentials/ijazah"),
    path.join(BASE_STORAGE_DIR, "credentials/transkrip"),
    path.join(BASE_STORAGE_DIR, "legalizations/stamped"),
    path.join(BASE_STORAGE_DIR, "avatars"),
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
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
  // If already absolute
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
