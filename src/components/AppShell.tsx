"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  Sun,
  Moon,
  ShieldCheck,
  Lock,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useTheme } from "./ThemeProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. Left Sidebar (Fixed on Desktop & Drawer on Mobile) */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* 2. Main Content Container (Padded left for desktop sidebar) */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300">
        {/* Sticky Topbar */}
        <header className="sticky top-0 z-30 h-16 sm:h-18 bg-white/80 dark:bg-[#07090E]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/[0.08] px-3 sm:px-5 lg:px-6 flex items-center justify-between">
          {/* Left: Mobile Hamburger & Current Location */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Buka Menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Breadcrumb / Section Brand */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white hidden sm:inline">
                Portal Resmi Kelulusan & Kredensial
              </span>
              <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">/</span>
              <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
                PISN Kemdikbud
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle & Quick CTA */}
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
              <span className="hidden md:inline text-[11px] font-medium text-slate-600 dark:text-slate-400">
                {theme === "dark" ? "Terang" : "Gelap"}
              </span>
            </button>

            {/* Portal BAAK Button */}
            <Link
              href="/admin"
              className="relative inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition duration-200"
            >
              <Lock className="h-3.5 w-3.5 text-indigo-200" />
              <span>Portal BAAK</span>
            </Link>
          </div>
        </header>

        {/* 3. Main Viewport (Full Fluid Width - Zero Wasted Space) */}
        <main className="flex-1 w-full px-3 sm:px-5 lg:px-6 py-5 sm:py-6">
          {children}
        </main>

        {/* 4. Footer */}
        <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#05070B] text-slate-500 dark:text-slate-400 text-xs py-6">
          <div className="w-full px-3 sm:px-5 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0">
                <Image src="/images/logo.jpg" alt="STIMI Yapmi" width={28} height={28} />
              </div>
              <p className="text-[11px]">
                <strong className="text-slate-800 dark:text-slate-200">STIMI YAPMI MAKASSAR</strong> · Kode PT 093046 · LLDIKTI Wilayah IX
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
