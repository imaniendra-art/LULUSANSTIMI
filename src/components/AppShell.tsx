"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sun,
  Moon,
  Lock,
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useTheme } from "./ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // ==========================================================================
  // 1. ADMIN ROUTE LAYOUT (/admin) - PISN Repository Console
  // ==========================================================================
  if (isAdminRoute) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {/* Sidebar (Desktop w-20 or w-64, Mobile Drawer) */}
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        {/* Dynamic Left Padding with Smooth 300ms Expansion */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
            sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
          }`}
        >
          {/* Admin Sticky Topbar - Exact h-16 height matching Sidebar Header */}
          <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#07090E]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-3 sm:px-5 lg:px-6 flex items-center justify-between flex-shrink-0">
            {/* Left: Mobile Drawer Trigger & Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Buka Menu Samping"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumb Hierarchy */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline">
                  Portal BAAK
                </span>
                <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">/</span>
                <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                  Repositori PISN & Kredensial
                </span>
              </div>
            </div>

            {/* Right: Quick Action to Public Web & Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Button to View Public Page in 1-Click */}
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500/30 text-xs font-semibold transition shadow-xs"
                title="Lihat Halaman Verifikasi Publik di Tab Baru"
              >
                <ExternalLink className="h-3.5 w-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Lihat Web Publik</span>
              </Link>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === "dark" ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
                className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon className="h-4 w-4 text-indigo-600" />
                )}
                <span className="hidden md:inline text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {theme === "dark" ? "Terang" : "Gelap"}
                </span>
              </button>
            </div>
          </header>

          {/* Admin Main Viewport */}
          <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-5 sm:py-6">
            {children}
          </main>

          {/* Admin Footer */}
          <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#05070B] text-slate-500 dark:text-slate-400 text-xs py-5">
            <div className="w-full px-3 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                  <Image src="/images/logo.jpg" alt="STIMI Yapmi" width={28} height={28} />
                </div>
                <p className="text-[11px]">
                  <strong className="text-slate-800 dark:text-slate-200">STIMI YAPMI MAKASSAR</strong> · Konsol Administrator BAAK · Kode PT 093046
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                <span>Server Hard Disk On-Premise Aktif (Port 3022)</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // 2. PUBLIC ROUTE LAYOUT (/ and /login) - Full Width Without Sidebar
  // ==========================================================================
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Public Navbar - Height h-16, full width with clean border */}
      <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#07090E]/85 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0">
        {/* Left: Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-sm group-hover:scale-105 transition">
            <Image
              src="/images/logo.jpg"
              alt="Logo STIMI Yapmi"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                LULUSAN<span className="text-indigo-600 dark:text-indigo-400">STIMI</span>
              </span>
              <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-1.5 py-0.2 rounded font-semibold">
                v2.4
              </span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-tight font-medium hidden sm:inline">
              STIMI Yapmi Makassar · Verifikasi Kredensial & PISN
            </span>
          </div>
        </Link>

        {/* Center: Public Quick Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Verifikasi Publik
          </Link>
          <a href="/#layanan" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Layanan Alumni
          </a>
          <a href="/#layanan" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
            Arsitektur Repositori
          </a>
        </nav>

        {/* Right: Theme Toggle & Admin Login CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            <span className="hidden sm:inline text-[11px] font-medium text-slate-600 dark:text-slate-400">
              {theme === "dark" ? "Terang" : "Gelap"}
            </span>
          </button>

          {/* Prominent Admin Login / Portal BAAK Button */}
          <Link
            href="/admin"
            className="relative inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition duration-200 group"
          >
            <Lock className="h-3.5 w-3.5 text-indigo-200 group-hover:rotate-12 transition duration-200" />
            <span>Masuk Portal BAAK</span>
          </Link>
        </div>
      </header>

      {/* Public Main Content (Full-Width Centered Container) */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#05070B] text-slate-500 dark:text-slate-400 text-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
              <Image src="/images/logo.jpg" alt="STIMI Yapmi" width={32} height={32} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                SEKOLAH TINGGI ILMU MANAJEMEN INDONESIA (STIMI) YAPMI MAKASSAR
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kode Perguruan Tinggi: 093046 · LLDIKTI Wilayah IX · Kampus Terakreditasi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              <span>Server Hard Disk On-Premise (Port 3022)</span>
            </div>
            <span>·</span>
            <Link href="/admin" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Portal BAAK
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
