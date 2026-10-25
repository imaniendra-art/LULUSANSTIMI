"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Server,
  Database,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Globe,
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

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDemo: true }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal login demo");
      }

      router.push("/admin");
    } catch (err: unknown) {
      setError((err as Error).message || "Terjadi kesalahan login demo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-[#f4faf9] dark:bg-[#021013] text-teal-950 dark:text-teal-50 flex flex-col justify-between p-3 sm:p-5 lg:p-6 overflow-y-auto lg:overflow-hidden font-sans selection:bg-teal-500 selection:text-white">
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
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-teal-100/70 dark:bg-teal-950/90 text-teal-800 dark:text-teal-300 border border-teal-300/70 dark:border-teal-500/30">
              PORTAL BAAK
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
            {/* Left Column: Soft Mint in Light Mode, Deep Oceanic Teal in Dark Mode */}
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

                {/* Title & Description */}
                <h1 className="text-xl sm:text-2xl font-bold leading-tight tracking-tight text-teal-950 dark:text-white mb-2.5">
                  Konsol Repositori PISN & Kredensial
                </h1>
                <p className="text-xs text-teal-900/80 dark:text-teal-100/75 leading-relaxed">
                  Akses khusus staf Administrasi Akademik & Kemahasiswaan (BAAK) untuk validasi batch Belmawa, pengarsipan nomor ijazah nasional, dan transkrip kelulusan.
                </p>
              </div>

              {/* Badges of Authenticity */}
              <div className="mt-6 pt-5 border-t border-teal-200/80 dark:border-teal-500/30 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  <span className="font-medium">Terintegrasi 10 Batch PISN Belmawa (87 Lulusan)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                  <Server className="h-4 w-4 text-cyan-500 flex-shrink-0" />
                  <span className="font-medium">Penyimpanan Berkas Hard Disk PC Server Lokal</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-teal-900 dark:text-teal-100">
                  <Database className="h-4 w-4 text-teal-500 flex-shrink-0" />
                  <span className="font-medium">Database MongoDB Atlas Terisolasi</span>
                </div>

                {/* Server Status Indicator */}
                <div className="pt-2 flex items-center gap-2 text-[11px] text-teal-800/80 dark:text-teal-300/80 font-mono">
                  <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse" />
                  <span>Server On-Premise Aktif (Port 3022)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Modern High-Contrast Login Form */}
            <div className="p-6 sm:p-8 lg:p-9 flex flex-col justify-center bg-white dark:bg-[#041d21]">
              <div className="mb-5">
                <h2 className="text-lg sm:text-xl font-bold text-teal-950 dark:text-white tracking-tight">
                  Masuk ke Konsol BAAK
                </h2>
                <p className="text-xs text-teal-800/70 dark:text-teal-300/70 mt-1">
                  Gunakan kredensial staf atau tombol akses cepat demo.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Identifier Input */}
                <div>
                  <label className="block text-xs font-semibold text-teal-950 dark:text-teal-100 mb-1">
                    Email Staf / Username Admin
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-teal-500/70" />
                    <input
                      type="text"
                      required
                      placeholder="baak@stimi-yapmi.ac.id atau ADMIN001"
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
                      placeholder="••••••••••••"
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
                  className="w-full mt-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memverifikasi...
                    </span>
                  ) : (
                    <>
                      <span>Masuk ke Konsol</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick 1-Click BAAK Demo Access */}
              <div className="mt-4 pt-3.5 border-t border-teal-200/80 dark:border-teal-500/30">
                <p className="text-[11px] text-teal-700/80 dark:text-teal-300/70 text-center mb-2">
                  Pengujian Cepat Administrator:
                </p>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/70 dark:hover:bg-teal-900/60 text-teal-900 dark:text-teal-200 font-semibold text-xs rounded-xl border border-teal-200/90 dark:border-teal-500/30 transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition" />
                  <span>Masuk Otomatis Sebagai Admin BAAK (1-Klik)</span>
                </button>
              </div>

              {/* Public Portal Button Inside Card */}
              <div className="mt-3.5 pt-3 border-t border-teal-100 dark:border-teal-500/20">
                <Link
                  href="/"
                  className="w-full py-2.5 px-3.5 rounded-xl border border-teal-200/90 dark:border-teal-500/30 bg-teal-50/50 hover:bg-teal-100/60 dark:bg-[#02181c] dark:hover:bg-[#032025] text-teal-900 dark:text-teal-200 hover:text-teal-600 dark:hover:text-teal-300 font-semibold text-xs transition flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Globe className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition" />
                  <span>Buka Portal Verifikasi Publik</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Island Footer */}
      <footer className="w-full max-w-4xl mx-auto text-center flex-shrink-0 pt-2">
        <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80 font-medium">
          © 2026 STIMI YAPMI Makassar · Kode PT: 093046 · LLDIKTI Wilayah IX · Repositori Resmi Kelulusan & PISN
        </p>
      </footer>
    </div>
  );
}
