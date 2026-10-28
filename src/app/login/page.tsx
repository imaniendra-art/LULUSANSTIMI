"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  FileText,
  Award,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal melakukan autentikasi");
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf9] dark:bg-[#021013] text-teal-950 dark:text-teal-50 flex flex-col justify-between p-3 sm:p-5 lg:p-6 font-sans selection:bg-teal-500 selection:text-white">
      {/* Floating Island Header Bar */}
      <header className="w-full max-w-4xl mx-auto h-16 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#041d21]/90 backdrop-blur-xl border border-teal-200/90 dark:border-teal-500/30 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 mb-4 shadow-lg shadow-teal-950/5 dark:shadow-black/30">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl bg-white p-1 border border-teal-300/80 dark:border-teal-500/30 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
            <Image
              src="/images/logo.jpg"
              alt="Logo STIMI YAPMI Makassar"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-teal-950 dark:text-white">
              LULUSAN<span className="text-teal-600 dark:text-teal-400">STIMI</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100/70 dark:bg-teal-950/90 text-teal-800 dark:text-teal-300 border border-teal-300/70 dark:border-teal-500/30">
              LOGIN
            </span>
          </div>
        </Link>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-300" />
          ) : (
            <Moon className="h-4 w-4 text-teal-700" />
          )}
          <span className="text-[11px] font-medium hidden sm:inline text-teal-800 dark:text-teal-300">
            {theme === "dark" ? "Mode Terang" : "Mode Gelap"}
          </span>
        </button>
      </header>

      {/* Main Centered Content: Floating Rounded 2-Column Card */}
      <main className="flex-1 flex items-center justify-center w-full my-auto py-2">
        <div className="max-w-4xl w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl dark:shadow-2xl border border-teal-200/90 dark:border-teal-500/30 bg-white/95 dark:bg-[#041d21]/95 backdrop-blur-xl">
            {/* Left Column: Campus Information (Human & Normal) */}
            <div className="p-6 sm:p-8 lg:p-9 flex flex-col justify-between border-b md:border-b-0 md:border-r border-teal-200/80 dark:border-teal-500/30 bg-[#eaf6f5]/70 dark:bg-[#03171a]">
              <div>
                {/* Emblem & Institution Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-teal-300/80 dark:border-teal-500/30 flex items-center justify-center shadow-xs flex-shrink-0">
                    <Image
                      src="/images/logo.jpg"
                      alt="Logo STIMI YAPMI Makassar"
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm sm:text-base text-teal-950 dark:text-white tracking-wide">
                      STIMI <span className="text-teal-600 dark:text-teal-400">YAPMI</span>
                    </h2>
                    <p className="text-[10px] text-teal-700/80 dark:text-teal-300/80 uppercase tracking-widest font-mono font-medium">
                      LLDIKTI IX · KODE PT: 093046
                    </p>
                  </div>
                </div>

                {/* Title & Description (Human & Normal) */}
                <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-teal-950 dark:text-white mb-2.5">
                  Sistem Informasi Kelulusan & Alumni
                </h1>
                <p className="text-xs text-teal-900/80 dark:text-teal-100/75 leading-relaxed">
                  Layanan pengelola akademik untuk verifikasi data yudisium, penomoran ijazah nasional (PISN/PIN), pengesahan dokumen, dan tracer study STIMI YAPMI Makassar.
                </p>
              </div>

              {/* Layanan Akademik Informasi */}
              <div className="mt-6 pt-5 border-t border-teal-200/80 dark:border-teal-500/30 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                  <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-medium">Usulan Penomoran Ijazah Nasional (PISN/PIN)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                  <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                  <span className="font-medium">Penerbitan SK Yudisium & Berkas SPTJM Resmi</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                  <GraduationCap className="h-4 w-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                  <span className="font-medium">Pengelolaan Arsip Ijazah & Transkrip Nilai</span>
                </div>

                {/* Campus Status */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-teal-800/80 dark:text-teal-300/80">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  <span>Kampus Terakreditasi BAN-PT · LLDIKTI Wilayah IX</span>
                </div>
              </div>
            </div>

            {/* Right Column: Normal Login Form */}
            <div className="p-6 sm:p-8 lg:p-9 flex flex-col justify-center bg-white dark:bg-[#041d21]">
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-teal-950 dark:text-white tracking-tight">
                  Login
                </h2>
                <p className="text-xs text-teal-800/70 dark:text-teal-300/70 mt-1">
                  Silakan masukkan email atau username dan kata sandi Anda.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-teal-950 dark:text-teal-100 mb-1">
                    Email / Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-teal-500/70" />
                    <input
                      type="text"
                      required
                      placeholder="nama@stimi-yapmi.ac.id"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-teal-50/50 dark:bg-[#02181c] border border-teal-200/90 dark:border-teal-500/30 rounded-xl text-xs text-teal-950 dark:text-white placeholder-teal-700/50 dark:placeholder-teal-300/40 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>

                {/* Password Input with Show/Hide Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-teal-950 dark:text-teal-100 mb-1">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-teal-500/70" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-teal-50/50 dark:bg-[#02181c] border border-teal-200/90 dark:border-teal-500/30 rounded-xl text-xs text-teal-950 dark:text-white placeholder-teal-700/50 dark:placeholder-teal-300/40 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-3 text-teal-500/70 hover:text-teal-700 dark:hover:text-teal-200 transition cursor-pointer"
                      title={showPassword ? "Sembunyikan sandi" : "Lihat sandi"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memverifikasi...
                    </span>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Help & Return Link */}
              <div className="mt-5 pt-4 border-t border-teal-100 dark:border-teal-500/20 space-y-3 text-center">
                <p className="text-[11px] text-teal-700/80 dark:text-teal-300/70">
                  Lupa kata sandi atau butuh akses akun baru? Hubungi Administrator.
                </p>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:text-teal-600 dark:hover:text-teal-200 transition py-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Halaman Utama</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Island Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center flex-shrink-0 pt-2">
        <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 font-medium">
          © 2026 Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar · LLDIKTI Wilayah IX
        </p>
      </footer>
    </div>
  );
}
