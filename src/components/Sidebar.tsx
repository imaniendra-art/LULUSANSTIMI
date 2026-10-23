"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Layers,
  Database,
  Briefcase,
  Users,
  Lock,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  X,
  GraduationCap,
  ExternalLink,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const navSections = [
    {
      title: "KREDENSIAL & AKADEMIK",
      items: [
        {
          name: "Repositori PISN",
          href: "/admin",
          icon: Layers,
          badge: "PISN",
        },
        {
          name: "Judul Skripsi & Tesis",
          href: "/admin?tab=skripsi",
          icon: GraduationCap,
          badge: "Skripsi",
        },
        {
          name: "Brankas Berkas Ijazah",
          href: "/admin#berkas",
          icon: Database,
        },
      ],
    },
    {
      title: "PORTAL PUBLIK & ALUMNI",
      items: [
        {
          name: "Verifikasi Web Publik",
          href: "/",
          icon: ShieldCheck,
          badge: "Publik",
        },
        {
          name: "Tracer Study Dikti",
          href: "/#layanan",
          icon: Briefcase,
        },
        {
          name: "Jejaring Berita IKA",
          href: "/#layanan",
          icon: Users,
        },
      ],
    },
    {
      title: "AKSES STAF",
      items: [
        {
          name: "Login Ulang Staf",
          href: "/login",
          icon: Lock,
        },
      ],
    },
  ];

  const renderSidebarContent = (isDrawer: boolean = false) => {
    const isCollapsed = isDrawer ? false : collapsed;

    return (
      <div className="flex flex-col h-full select-none">
        {/* Brand & Collapse Header - Strict h-16 height aligned with Topbar */}
        <div
          className={`h-16 flex items-center border-b border-slate-200 dark:border-white/[0.08] flex-shrink-0 ${
            isCollapsed ? "px-2.5 justify-between" : "px-4 justify-between"
          }`}
        >
          {isCollapsed ? (
            <>
              <Link
                href="/admin"
                className="p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="LULUSANSTIMI — Admin Konsol"
              >
                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-900 flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo STIMI Yapmi"
                    width={32}
                    height={32}
                    className="object-cover"
                    priority
                  />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Perlebar menu samping"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/admin" className="flex items-center gap-3 group">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-300 dark:border-white/10 bg-slate-900 flex-shrink-0 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
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
                    <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                      LULUSAN<span className="text-indigo-600 dark:text-indigo-400">STIMI</span>
                    </span>
                    <span className="text-[9px] font-mono bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 px-1 py-0.2 rounded font-semibold">
                      v2.4
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-tight font-medium">
                    STIMI Yapmi Makassar
                  </span>
                </div>
              </Link>

              {isDrawer ? (
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Ciutkan menu samping"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto space-y-6 ${isCollapsed ? "px-2 py-4" : "px-3 py-4"}`}>
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {!isCollapsed && (
                <h4 className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                  {section.title}
                </h4>
              )}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  if (isCollapsed) {
                    return (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        title={item.name}
                        className={`flex items-center justify-center p-2.5 rounded-xl text-xs font-semibold transition duration-150 ${
                          isActive
                            ? "bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        />
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition duration-150 ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-500/30 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 ${
                          isActive
                            ? "text-indigo-600 dark:text-indigo-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                      <span className="truncate flex-1 tracking-tight">{item.name}</span>
                      {item.badge && (
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
        <div className="p-3 border-t border-slate-200 dark:border-white/[0.08] space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40 flex-shrink-0">
          {/* Theme Toggle Button */}
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
            {!isCollapsed && (
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
              {!isCollapsed && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {theme === "dark" ? "Terang" : "Gelap"}
                </span>
              )}
            </button>
          </div>

          {/* Server Telemetry Pill */}
          {isCollapsed ? (
            <div className="flex justify-center py-1" title="Server On-Premise Aktif (Port 3022)">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>
          ) : (
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
  };

  return (
    <>
      {/* 1. Desktop Sidebar (w-20 when collapsed, w-64 when expanded) */}
      <aside
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-white dark:bg-[#090D16] border-r border-slate-200 dark:border-white/[0.08] transition-all duration-300 ease-in-out ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Panel (Always fully expanded for mobile readability) */}
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#090D16] border-r border-slate-200 dark:border-white/[0.08] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
