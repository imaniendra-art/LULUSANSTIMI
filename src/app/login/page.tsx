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
  ArrowLeft,
  Server,
  Database,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-[80vh] flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Background Decorative Radial Mesh */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Back Link */}
      <div className="mb-6 flex justify-start">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Verifikasi Publik</span>
        </Link>
      </div>

      <div className="max-w-4xl w-full mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0A0E1A]/90 backdrop-blur-xl">
          {/* Left Column: Brand & Security Infrastructure */}
          <div className="relative p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/60">
            <div>
              {/* Emblem */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                  <Image
                    src="/images/logo.jpg"
                    alt="STIMI Yapmi"
                    width={40}
                    height={40}
                    className="object-cover rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white tracking-wide">
                    STIMI <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400">YAPMI</span>
                  </h2>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
                    LLDIKTI IX · KODE PT: 093046
                  </p>
                </div>
              </div>

              {/* Title & Description */}
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white mb-3">
                Konsol Pengelolaan Repositori PISN & Kredensial
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Akses terbatas bagian Administrasi Akademik & Kemahasiswaan (BAAK) untuk validasi batch Belmawa, pengunggahan arsip ijazah & transkrip ke server lokal.
              </p>
            </div>

            {/* Badges of Authenticity */}
            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>Terintegrasi 10 Batch PISN Belmawa (87 Lulusan)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Server className="h-4 w-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                <span>Penyimpanan Berkas Hard Disk PC Server Lokal</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300">
                <Database className="h-4 w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span>Database MongoDB Atlas Terisolasi</span>
              </div>
            </div>
          </div>

          {/* Right Column: Modern Login Form */}
          <div className="p-8 md:p-10 flex flex-col justify-center bg-white dark:bg-slate-900/60">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Masuk ke Konsol BAAK
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Kredensial staf administrasi atau gunakan akses instan demo.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Staf / Username Admin
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="baak@stimi-yapmi.ac.id atau ADMIN001"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08]">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-2.5">
                Pengujian Cepat Administrator:
              </p>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10 font-semibold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 group"
              >
                <Sparkles className="h-4 w-4 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition" />
                <span>Masuk Otomatis Sebagai Admin BAAK (1-Klik)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
