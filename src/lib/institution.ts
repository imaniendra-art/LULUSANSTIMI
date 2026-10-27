import fs from "fs";
import path from "path";

export interface InstitutionConfig {
  leaderName: string;
  leaderNidn: string;
  leaderPangkat: string;
  leaderTitle: string;
  institutionName: string;
  institutionCode: string;
  accreditation: string;
  city: string;
  address: string;
  website: string;
}

export const defaultInstitutionSettings: InstitutionConfig = {
  leaderName: "Dr. Ibrahim Syah SE., MM.",
  leaderNidn: "0918066801",
  leaderPangkat: "Asisten Ahli/III.b",
  leaderTitle: "Ketua STIMI YAPMI Makassar",
  institutionName: "Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar",
  institutionCode: "093046",
  accreditation: "Terakreditasi BAN-PT",
  city: "Makassar",
  address: "Jl. Danau Tanjung Bunga No. 1, Kota Makassar",
  website: "stimiyapmim.ac.id",
};

export const institutionConfigFilePath = path.join(process.cwd(), "src", "data", "institution.json");

export function getInstitutionSettings(): InstitutionConfig {
  try {
    if (fs.existsSync(institutionConfigFilePath)) {
      const raw = fs.readFileSync(institutionConfigFilePath, "utf8");
      return { ...defaultInstitutionSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error("Gagal membaca file konfigurasi institusi:", e);
  }
  return defaultInstitutionSettings;
}
