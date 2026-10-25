/**
 * STIMI YAPMI NIM & Cohort Convention Helper:
 * - Format lama (11-12 digit):
 *   Digit 1: Jenjang ("2" = S1)
 *   Digit 2-3: Angkatan Masuk ("18" -> 2018, "19" -> 2019, "20" -> 2020, "21" -> 2021)
 *   Digit 4-8: Kode Prodi ("61201" = S1 Manajemen)
 *   Digit 9+: Nomor Urut
 * - Format baru (10 digit, mulai 2022 ke atas):
 *   Digit 1-2: Angkatan Masuk ("22" -> 2022, "23" -> 2023, "24" -> 2024, "25" -> 2025)
 *   Digit 3-7: Kode Prodi ("61201" = S1 Manajemen, "61101" = S2 Magister)
 *   Digit 8-10: Nomor Urut
 */

export function inferCohortYearFromNim(nim?: string | null, fallbackYear?: number): number {
  if (!nim) return fallbackYear || 2022;
  const clean = String(nim).trim().replace(/[^0-9]/g, "");
  if (!clean) return fallbackYear || 2022;

  // Format lama 11-12 digit dengan awalan Jenjang S1 ("2") + 2 digit tahun
  if (clean.startsWith("221")) return 2021;
  if (clean.startsWith("220")) return 2020;
  if (clean.startsWith("219")) return 2019;
  if (clean.startsWith("218")) return 2018;
  if (clean.startsWith("217")) return 2017;
  if (clean.startsWith("216")) return 2016;
  if (clean.startsWith("215")) return 2015;
  if (clean.startsWith("214")) return 2014;
  if (clean.startsWith("213")) return 2013;
  if (clean.startsWith("212")) return 2012;
  if (clean.startsWith("211")) return 2011;
  if (clean.startsWith("210")) return 2010;

  // Format baru 10 digit (22..., 23..., 24..., 25...) atau 2 digit awalan tahun
  const prefix = parseInt(clean.substring(0, 2), 10);
  if (!isNaN(prefix) && prefix >= 10 && prefix <= 35) {
    return 2000 + prefix;
  }

  return fallbackYear ? fallbackYear - 4 : 2022;
}

/**
 * Memeriksa apakah mahasiswa berasal dari angkatan di bawah 2020 (< 2020)
 * Mahasiswa angkatan < 2020 diabaikan / tidak dimasukkan ke dalam sistem repositori.
 */
export function isCohortBelow2020(nim?: string | null, cohortYear?: number | null): boolean {
  if (cohortYear && cohortYear >= 2000 && cohortYear <= 2035) {
    return cohortYear < 2020;
  }
  const inferred = inferCohortYearFromNim(nim);
  return inferred < 2020;
}
