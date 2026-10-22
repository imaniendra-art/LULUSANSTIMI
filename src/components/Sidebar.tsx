"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Layers,
  Database,
  Briefcase,
  Compass,
  Users,
  Lock,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  FileCheck,
  Server,
  Sparkles,
  ExternalLink,
  GraduationCap,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const navSections = [
    {
      title: "KREDENSIAL & AKADEMIK",
      items: [
        {
          name: "Verifikasi Publik",
          href: "/",
          icon: ShieldCheck,
          badge: "Cepat",
        },
        {
          name: "Repositori PISN",
          href: "/admin",
          icon: Layers,
          badge: "127 Data",
        },
        {
          name: "Judul Skripsi & Tesis",
          href: "/admin?tab=skripsi",
          icon: GraduationCap,
          badge: "Tabel Khusus",
        },
        {
          name: "Brankas Server Lokal",
          href: "/admin#berkas",
          icon: Database,
        },
      ],
    },
    {
      title: "PELACAKAN & ALUMNI",
      items: [
        {
          name: "Tracer Study Dikti",
          href: "/#layanan",
          icon: Briefcase,
        },
        {
          name: "Bursa Karir (Loker)",
          href: "/#layanan",
          icon: Compass,
        },
        {
          name: "Jejaring & Berita IKA",
          href: "/#layanan",
          icon: Users,
        },
      ],
    },
    {
      title: "AKSES & SISTEM",
      items: [
        {
          name: "Portal BAAK (Admin)",
          href: "/admin",
          icon: Lock,
        },
        {
          name: "Login Staf",
          href: "/login",
          icon: Users,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand & Collapse Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.08]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-md group-hover:scale-105 transition">
            <Image
              src="/images/logo.jpg"
              alt="Logo STIMI Yapmi"
              width={36}
              height={36}
              className="object-cover"
              priority
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                  LULUSAN<span className="text-indigo-600 dark:text-indigo-400">STIMI</span>
                </span>
                <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-1 py-0.2 rounded">
                  v2.4
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-tight">
                STIMI Yapmi Makassar
              </span>
            </div>
          )}
        </Link>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title={collapsed ? "Perlebar menu" : "Ciutkan menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {!collapsed && (
              <h4 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                {section.title}
              </h4>
            )}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs font-semibold transition duration-150 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      }`}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1 tracking-tight">{item.name}</span>
                    )}
                    {!collapsed && item.badge && (
                      <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Area: Dark/Light Mode Switcher & Server Status */}
      <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
        {/* Theme Toggle Button */}
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {theme === "dark" ? (
                <>
                  <Moon className="h-4 w-4 text-indigo-400" />
                  <span>Mode Gelap</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-amber-500" />
                  <span>Mode Terang</span>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
            className="p-1.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-600" />
            )}
            {!collapsed && (
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {theme === "dark" ? "Terang" : "Gelap"}
              </span>
            )}
          </button>
        </div>

        {/* Server Telemetry Pill */}
        {!collapsed && (
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Server On-Premise
              </span>
            </div>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              3022 OK
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-[#090D16] border-r border-slate-200 dark:border-white/[0.08] transition-all duration-300 ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#090D16] border-r border-slate-200 dark:border-white/[0.08] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
