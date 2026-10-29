"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  FileCheck,
  FileText,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Building2,
  Globe,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
  action?: "logout";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar({
  mobileOpen,
  setMobileOpen,
  collapsed,
  setCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { theme, toggleTheme } = useTheme();

  const tabParam = searchParams?.get("tab") || "";
  const filterParam = searchParams?.get("filter") || "";
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user?.role) {
          setCurrentUserRole(data.user.role);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, tabParam, filterParam, setMobileOpen]);

  const handleLogout = async () => {
    try {
      await fetch("/api/v1/auth/logout", { method: "POST" });
      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    }
  };

  const navSections: NavSection[] = [
    {
      title: "KONSOL BAAK & ARSIP",
      items: [
        {
          name: "Dashboard BAAK",
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          name: "Menu PISN",
          href: "/admin?tab=pisn",
          icon: Sparkles,
        },
        {
          name: "IPK & Judul Skripsi",
          href: "/admin?tab=skripsi",
          icon: GraduationCap,
        },
        {
          name: "Ijazah & SK Yudisium",
          href: "/admin?tab=berkas",
          icon: FileCheck,
        },
      ],
    },
    {
      title: "PORTAL PUBLIK KAMPUS",
      items: [
        {
          name: "Verifikasi Ijazah Publik",
          href: "/",
          icon: ShieldCheck,
        },
        {
          name: "Layanan Arsip Dokumen",
          href: "/#arsip",
          icon: FileText,
        },
        {
          name: "Tracer Study Kampus",
          href: "/#tracer",
          icon: Briefcase,
        },
        {
          name: "Portal IKA Alumni",
          href: "/#alumni",
          icon: Users,
        },
      ],
    },
    {
      title: "SISTEM KEMENTERIAN",
      items: [
        {
          name: "PISN Kemdiktisaintek",
          href: "https://pisn.kemdiktisaintek.go.id/",
          icon: Globe,
          external: true,
        },
        {
          name: "Tracer Study Dikti",
          href: "https://tracerstudy.kemdiktisaintek.go.id/",
          icon: Briefcase,
          external: true,
        },
        {
          name: "Neo Feeder PDDIKTI",
          href: "https://feeder.stimiyapmim.ac.id/",
          icon: Building2,
          external: true,
        },
      ],
    },
    {
      title: currentUserRole === "SUPERADMIN" ? "PENGATURAN SISTEM" : "SESI AKUN",
      items: [
        ...(currentUserRole === "SUPERADMIN"
          ? [
              {
                name: "Pengaturan Sistem",
                href: "/admin?tab=settings",
                icon: Settings,
              },
            ]
          : []),
        {
          name: "Keluar Sesi Admin",
          href: "#",
          icon: LogOut,
          action: "logout",
        },
      ],
    },
  ];

  const renderSidebarContent = (isDrawer: boolean = false) => {
    const isCollapsed = isDrawer ? false : collapsed;

    return (
      <div className="flex flex-col h-full select-none text-teal-950 dark:text-slate-100">
        {/* Brand & Header */}
        <div
          className={`h-16 flex items-center border-b border-teal-200/80 dark:border-teal-500/20 flex-shrink-0 ${
            isCollapsed ? "px-2.5 justify-between" : "px-4 justify-between"
          }`}
        >
          {isCollapsed ? (
            <>
              <Link
                href="/admin"
                className="p-1 rounded-2xl hover:bg-teal-200/50 dark:hover:bg-teal-800/40 transition"
                title="LULUSANSTIMI — Admin Konsol"
              >
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-teal-400/40 bg-white flex items-center justify-center shadow-xs">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo STIMI YAPMI Makassar"
                    width={32}
                    height={32}
                    className="object-contain p-0.5"
                    priority
                  />
                </div>
              </Link>
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="p-1.5 rounded-lg text-teal-700 dark:text-teal-300 hover:text-teal-950 dark:hover:text-white hover:bg-teal-200/50 dark:hover:bg-teal-800/40 transition cursor-pointer"
                title="Perlebar menu samping"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link href="/admin" className="flex items-center gap-3 group min-w-0">
                <div className="relative w-9 h-9 rounded-2xl overflow-hidden border border-teal-400/40 bg-white flex-shrink-0 flex items-center justify-center shadow-xs group-hover:scale-105 transition duration-200">
                  <Image
                    src="/images/logo.jpg"
                    alt="Logo STIMI YAPMI Makassar"
                    width={36}
                    height={36}
                    className="object-contain p-0.5"
                    priority
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-sm tracking-tight text-teal-950 dark:text-white truncate">
                      LULUSANSTIMI
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-teal-500/20 text-teal-800 dark:text-teal-300 text-[9.5px] font-bold tracking-tight">
                      BAAK
                    </span>
                  </div>
                  <span className="text-[10.5px] font-medium text-teal-700 dark:text-teal-300/80 truncate">
                    STIMI YAPMI Makassar
                  </span>
                </div>
              </Link>

              {!isDrawer && (
                <button
                  type="button"
                  onClick={() => setCollapsed(true)}
                  className="p-1.5 rounded-lg text-teal-700/80 dark:text-teal-300/80 hover:text-teal-950 dark:hover:text-white hover:bg-teal-200/50 dark:hover:bg-teal-800/40 transition cursor-pointer"
                  title="Perkecil menu samping"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation Sections */}
        <div className={`flex-1 overflow-y-auto space-y-4.5 ${isCollapsed ? "px-2 py-3" : "px-3 py-3.5"}`}>
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-teal-800/90 dark:text-teal-300/90 font-extrabold tracking-wider pt-1">
                  {section.title}
                </h4>
              )}
              <div className="space-y-0.5">
                {section.items.map((item, itemIdx) => {
                  let isActive = false;
                  if (pathname === "/admin") {
                    if (item.href === "/admin") {
                      isActive = !tabParam;
                    } else if (item.href === "/admin?tab=pisn") {
                      isActive = tabParam === "pisn" || (tabParam === "repo" && filterParam !== "skripsi");
                    } else if (item.href === "/admin?tab=skripsi") {
                      isActive = tabParam === "skripsi" || filterParam === "skripsi";
                    } else if (item.href === "/admin?tab=berkas") {
                      isActive = tabParam === "berkas" || tabParam === "sk-yudisium";
                    } else if (item.href === "/admin?tab=settings") {
                      isActive = tabParam === "settings";
                    }
                  } else if (pathname === item.href && item.href !== "#") {
                    isActive = true;
                  }

                  const Icon = item.icon;

                  if (isCollapsed) {
                    if (item.action === "logout") {
                      return (
                        <button
                          key={itemIdx}
                          type="button"
                          onClick={handleLogout}
                          title={item.name}
                          className="w-full flex items-center justify-center p-2.5 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-900/30 transition cursor-pointer"
                        >
                          <Icon className="h-5 w-5 text-rose-500" />
                        </button>
                      );
                    }

                    return (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        title={item.name}
                        className={`flex items-center justify-center p-2.5 rounded-2xl transition duration-150 ${
                          isActive
                            ? "bg-teal-600 text-white shadow-sm dark:bg-teal-500/25 dark:text-teal-200 dark:border dark:border-teal-400/40"
                            : "text-teal-900/70 dark:text-teal-100/70 hover:text-teal-950 dark:hover:text-white hover:bg-teal-200/60 dark:hover:bg-teal-900/30"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 flex-shrink-0 ${
                            isActive ? "text-white dark:text-teal-300" : "text-teal-700/80 dark:text-teal-400/70"
                          }`}
                        />
                      </Link>
                    );
                  }

                  // Non-collapsed:
                  if (item.action === "logout") {
                    return (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl text-[13.5px] font-bold text-rose-700 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-200 hover:bg-rose-100/70 dark:hover:bg-rose-900/30 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className="h-4.5 w-4.5 text-rose-500 flex-shrink-0" />
                          <span className="truncate">{item.name}</span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={itemIdx}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl text-[13.5px] font-bold transition duration-150 ${
                        isActive
                          ? "bg-teal-600 text-white shadow-sm dark:bg-teal-500/25 dark:text-teal-100 dark:border dark:border-teal-400/40"
                          : "text-teal-900/85 dark:text-teal-100/80 hover:text-teal-950 dark:hover:text-white hover:bg-teal-200/60 dark:hover:bg-teal-800/30"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`h-4.5 w-4.5 flex-shrink-0 ${
                            isActive ? "text-white dark:text-teal-300" : "text-teal-700/80 dark:text-teal-400/70"
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.external && (
                        <ExternalLink className="h-3.5 w-3.5 text-teal-600/70 dark:text-teal-400/60 flex-shrink-0" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Sidebar: User Role & Theme Switcher */}
        <div className={`border-t border-teal-200/80 dark:border-teal-500/20 bg-teal-100/40 dark:bg-teal-950/40 flex-shrink-0 space-y-2 ${isCollapsed ? "p-2" : "p-3"}`}>
          <div
            className={`flex items-center rounded-2xl bg-white/80 dark:bg-teal-900/30 border border-teal-200/90 dark:border-teal-500/20 shadow-2xs ${
              isCollapsed ? "justify-center p-2" : "justify-between p-2.5"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white dark:bg-teal-500/20 dark:text-teal-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                B
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-teal-950 dark:text-white truncate">
                    Administrator BAAK
                  </span>
                  <span className="text-[10.5px] font-medium text-teal-700 dark:text-teal-300/80 truncate leading-tight">
                    STIMI YAPMI Makassar
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
              className="p-1.5 rounded-xl border border-teal-300/80 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-200 hover:scale-105 transition shadow-xs flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-300" />
              ) : (
                <Moon className="h-4 w-4 text-teal-700" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* 1. Desktop Floating Rounded Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed top-4 left-4 bottom-4 z-40 rounded-3xl bg-[#eaf6f5] dark:bg-[#041d21] border border-teal-200/90 dark:border-teal-500/30 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out overflow-hidden ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-3 bottom-3 left-3 w-72 max-w-[85vw] rounded-3xl bg-[#eaf6f5] dark:bg-[#041d21] border border-teal-200/90 dark:border-teal-500/30 shadow-2xl z-50 animate-in slide-in-from-left duration-200 overflow-hidden">
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
