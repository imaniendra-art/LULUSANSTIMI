"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  ExternalLink,
  LogOut,
  Lock,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useTheme } from "./ThemeProvider";

function AdminHeader({
  mobileOpen,
  setMobileOpen,
  theme,
  toggleTheme,
}: {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  theme: string;
  toggleTheme: () => void;
}) {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab");
  const filter = searchParams?.get("filter");

  const breadcrumbTitle = !tab
    ? "Dashboard BAAK"
    : tab === "pisn" || (tab === "repo" && filter !== "skripsi")
    ? "Menu PISN — Repositori & Monitoring Nomor Ijazah Nasional"
    : tab === "skripsi" || filter === "skripsi"
    ? "Menu IPK & Judul Skripsi — Rekapitulasi Nilai & Judul Tesis"
    : tab === "berkas"
    ? "Menu Ijazah & SK Yudisium — Berkas Scan & Dokumen Keputusan Ketua"
    : "Konsol BAAK";

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-3 z-30 mx-3 sm:mx-5 lg:mx-6 mt-3 mb-2 h-16 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#041d21]/90 backdrop-blur-xl border border-teal-200/90 dark:border-teal-500/30 px-3 sm:px-5 flex items-center justify-between flex-shrink-0 shadow-lg shadow-teal-950/5 dark:shadow-black/30">
      {/* Left: Mobile Drawer Trigger & Dynamic Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl border border-teal-200/80 dark:border-teal-500/30 text-teal-800 dark:text-teal-200 hover:bg-teal-100/60 dark:hover:bg-teal-900/40 transition cursor-pointer"
          title="Buka Menu Samping"
        >
          <Menu className="h-5 w-5" />
        </button>

        <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-teal-950 dark:text-white">
          {breadcrumbTitle}
        </h1>
      </div>

      {/* Right: Quick Action to Public Web, Theme Toggle, Profile & Logout */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 hover:text-teal-600 dark:hover:text-teal-400 text-xs font-semibold transition shadow-xs"
          title="Lihat Halaman Verifikasi Publik di Tab Baru"
        >
          <ExternalLink className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
          <span className="hidden sm:inline">Web Publik</span>
        </Link>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === "dark" ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-300" />
          ) : (
            <Moon className="h-4 w-4 text-teal-700" />
          )}
          <span className="hidden md:inline text-[11px] font-medium text-teal-800 dark:text-teal-300">
            {theme === "dark" ? "Terang" : "Gelap"}
          </span>
        </button>

        <div className="h-5 w-[1px] bg-teal-200/80 dark:bg-teal-500/30 mx-0.5" />

        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-semibold text-teal-950 dark:text-teal-100 leading-tight">
            Staf BAAK
          </span>
          <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono leading-tight">
            STIMI YAPMI Makassar
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          title="Keluar dari sesi BAAK"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");
  const isLoginRoute = pathname === "/login";

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // 0. STANDALONE LOGIN ROUTE (/login)
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // 1. ADMIN ROUTE LAYOUT (/admin)
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f4faf9] dark:bg-[#021013] text-teal-950 dark:text-teal-50 transition-colors duration-200 font-sans selection:bg-teal-500 selection:text-white">
        {/* Sidebar (Desktop w-20 or w-64, Mobile Drawer) */}
        <React.Suspense fallback={null}>
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
          />
        </React.Suspense>

        {/* Dynamic Left Padding with Smooth 300ms Expansion for Floating Sidebar */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:pl-[96px]" : "lg:pl-[284px]"
          }`}
        >
          {/* Admin Floating Island Header */}
          <React.Suspense
            fallback={
              <header className="sticky top-3 z-30 mx-3 sm:mx-5 lg:mx-6 mt-3 mb-2 h-16 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#041d21]/90 border border-teal-200/90 dark:border-teal-500/30" />
            }
          >
            <AdminHeader
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </React.Suspense>

          {/* Admin Main Viewport */}
          <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-4">
            {children}
          </main>

          {/* Admin Floating Island Footer */}
          <footer className="mx-3 sm:mx-5 lg:mx-6 my-3 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#041d21]/90 backdrop-blur-xl border border-teal-200/90 dark:border-teal-500/30 text-teal-800/80 dark:text-teal-200/80 text-xs py-3.5 px-4 sm:px-6 shadow-md shadow-teal-950/5 dark:shadow-black/20">
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg border border-teal-300/60 dark:border-teal-500/30 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo STIMI YAPMI Makassar"
                    width={24}
                    height={24}
                    className="object-contain p-0.5"
                  />
                </div>
                <p className="text-[11px]">
                  <strong className="text-teal-950 dark:text-teal-100">
                    STIMI YAPMI MAKASSAR
                  </strong>{" "}
                  · Repositori Kredensial & PISN · Kode PT 093046
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span>
                <span className="text-teal-900 dark:text-teal-200 font-medium">
                  Sistem Repositori BAAK Terhubung · PUSDATIN
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // 2. PUBLIC PORTAL LAYOUT
  return (
    <div className="min-h-screen flex flex-col bg-[#f4faf9] dark:bg-[#021013] text-teal-950 dark:text-teal-50 transition-colors duration-200 font-sans selection:bg-teal-500 selection:text-white">
      {/* Public Floating Island Header */}
      <header className="sticky top-3 z-40 mx-3 sm:mx-6 lg:mx-8 mt-3 h-16 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#041d21]/90 backdrop-blur-xl border border-teal-200/90 dark:border-teal-500/30 px-4 sm:px-6 flex items-center justify-between shadow-lg shadow-teal-950/5 dark:shadow-black/30">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden border border-teal-300/80 dark:border-teal-500/30 bg-white flex items-center justify-center shadow-xs group-hover:scale-105 transition flex-shrink-0">
            <Image
              src="/images/logo.jpg"
              alt="Logo STIMI YAPMI Makassar"
              width={40}
              height={40}
              className="object-contain p-0.5"
              priority
            />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-teal-950 dark:text-white">
            LULUSAN<span className="text-teal-600 dark:text-teal-400">STIMI</span>
          </span>
        </Link>

        {/* Center / Nav */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-semibold text-teal-900/80 dark:text-teal-200/80">
          <Link
            href="/"
            className="hover:text-teal-600 dark:hover:text-teal-300 transition"
          >
            Verifikasi Ijazah
          </Link>
          <a
            href="/#layanan"
            className="hover:text-teal-600 dark:hover:text-teal-300 transition"
          >
            Layanan Kelulusan
          </a>
          <a
            href="https://pddikti.kemdiktisaintek.go.id"
            target="_blank"
            rel="noreferrer"
            className="hover:text-teal-600 dark:hover:text-teal-300 transition inline-flex items-center gap-1"
            title="Pangkalan Data Pendidikan Tinggi Kemdiktisaintek"
          >
            <span>PDDIKTI</span>
            <ExternalLink className="h-3 w-3 text-teal-500/70" />
          </a>
          <a
            href="https://pisn.kemdiktisaintek.go.id/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-teal-600 dark:hover:text-teal-300 transition inline-flex items-center gap-1"
            title="Penomoran Ijazah Nasional (PISN) Kemdiktisaintek"
          >
            <span>PISN</span>
            <ExternalLink className="h-3 w-3 text-teal-500/70" />
          </a>
          <a
            href="https://tracerstudy.kemdiktisaintek.go.id/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-teal-600 dark:hover:text-teal-300 transition inline-flex items-center gap-1"
            title="Portal Tracer Study Kemdiktisaintek"
          >
            <span>Tracer Study</span>
            <ExternalLink className="h-3 w-3 text-teal-500/70" />
          </a>
        </nav>

        {/* Right Actions: Theme Toggle & Prominent Login Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
            className="p-2 rounded-xl border border-teal-200/80 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-300" />
            ) : (
              <Moon className="h-4 w-4 text-teal-700" />
            )}
            <span className="hidden sm:inline text-[11px] font-medium text-teal-800 dark:text-teal-300">
              {theme === "dark" ? "Terang" : "Gelap"}
            </span>
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-sm border border-teal-400/40 transition cursor-pointer group"
          >
            <Lock className="h-3.5 w-3.5 text-teal-200 group-hover:rotate-12 transition duration-200" />
            <span>Login Staf</span>
          </Link>
        </div>
      </header>

      {/* Main Content Constrained Container */}
      <main className="flex-1 w-full max-w-5xl xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {children}
      </main>

      {/* Public Floating Island Footer */}
      <footer className="mx-3 sm:mx-6 lg:mx-8 my-6 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#041d21]/90 backdrop-blur-xl border border-teal-200/90 dark:border-teal-500/30 text-teal-800/80 dark:text-teal-200/80 text-xs py-6 sm:py-8 px-5 sm:px-8 shadow-md shadow-teal-950/5 dark:shadow-black/20">
        <div className="max-w-5xl xl:max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-teal-300/60 dark:border-teal-500/30 overflow-hidden bg-white flex-shrink-0 flex items-center justify-center shadow-xs">
              <Image
                src="/images/logo.jpg"
                alt="Logo STIMI YAPMI Makassar"
                width={36}
                height={36}
                className="object-contain p-0.5"
              />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-teal-950 dark:text-white tracking-tight">
                Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar
              </h4>
              <p className="text-[11px] text-teal-800/80 dark:text-teal-200/80 mt-0.5">
                Kode Perguruan Tinggi: 093046 · LLDIKTI Wilayah IX (Sulselbar & Sultra)
              </p>
              <p className="text-[11px] text-teal-700/70 dark:text-teal-300/70">
                Dikelola oleh Biro Administrasi Akademik & Kemahasiswaan (BAAK) bersama PUSDATIN
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 text-[11px]">
            <div className="text-left md:text-right">
              <span className="block text-teal-700/70 dark:text-teal-300/70 text-[10px] uppercase tracking-wider">
                Alamat Kampus
              </span>
              <span className="text-teal-950 dark:text-teal-100 font-medium">
                Jl. Perintis Kemerdekaan Km. 9, Tamalanrea, Makassar
              </span>
            </div>
            <div className="h-5 w-[1px] bg-teal-200/80 dark:bg-teal-700 hidden sm:block" />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200/80 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-950/70 hover:bg-teal-100/70 dark:hover:bg-teal-900/60 text-teal-900 dark:text-teal-200 font-semibold text-xs transition shadow-xs"
            >
              <Lock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              <span>Portal BAAK</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
