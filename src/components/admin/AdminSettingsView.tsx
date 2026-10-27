"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  UserPlus,
  Trash2,
  KeyRound,
  ShieldCheck,
  Shield,
  Server,
  Building2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Mail,
  User,
  Lock,
  Database,
  FileCheck2,
  HardDrive,
  Eye,
  EyeOff,
  Check,
  Info,
  Save,
  Award,
  MapPin,
  Globe,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  nim?: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface InstitutionSettings {
  leaderName: string;
  leaderNidn: string;
  leaderPangkat: string;
  leaderTitle: string;
  institutionName: string;
  institutionCode: string;
  accreditation: string;
  city: string;
  address: string;
  website: string;
}

interface AdminSettingsViewProps {
  currentUser?: { email: string; fullName: string; role: string } | null;
  onRefresh?: () => void;
}

export function AdminSettingsView({ currentUser, onRefresh }: AdminSettingsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"users" | "institution" | "system">("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form New Admin
  const [newEmail, setNewEmail] = useState("");
  const [newNim, setNewNim] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN_BAAK" | "SUPERADMIN">("ADMIN_BAAK");
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Edit Password Modal / State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserEmail, setEditingUserEmail] = useState<string>("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Institution & Signatory Settings State
  const [instSettings, setInstSettings] = useState<InstitutionSettings>({
    leaderName: "Dr. Ibrahim Syah SE., MM.",
    leaderNidn: "0918066801",
    leaderPangkat: "Asisten Ahli/III.b",
    leaderTitle: "Ketua STIMI YAPMI Makassar",
    institutionName: "Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar",
    institutionCode: "093046",
    accreditation: "Terakreditasi BAN-PT",
    city: "Makassar",
    address: "Jl. Danau Tanjung Bunga No. 1, Kota Makassar",
    website: "stimiyapmim.ac.id",
  });
  const [isInstLoading, setIsInstLoading] = useState(false);
  const [isInstSaving, setIsInstSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/admin/users");
      const json = await res.json();
      if (json.success && json.users) {
        setUsers(json.users);
      }
    } catch (e) {
      console.error("Fetch users error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstitutionSettings = async () => {
    setIsInstLoading(true);
    try {
      const res = await fetch("/api/v1/admin/institution");
      const json = await res.json();
      if (json.success && json.settings) {
        setInstSettings(json.settings);
      }
    } catch (e) {
      console.error("Gagal mengambil data konfigurasi lembaga:", e);
    } finally {
      setIsInstLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchInstitutionSettings();
  }, []);

  const handleSaveInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInstSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/v1/admin/institution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instSettings),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan identitas institusi.");
      }

      setSuccessMsg(json.message || "Data identitas penandatangan & lembaga berhasil disimpan.");
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Terjadi kesalahan saat menyimpan identitas institusi.");
    } finally {
      setIsInstSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setErrorMsg("Email admin wajib diisi.");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg("Kata sandi minimal 6 karakter.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newEmail,
          nim: newNim,
          password: newPassword,
          role: newRole,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal membuat akun admin.");
      }

      setSuccessMsg(`Akun admin ${newEmail} berhasil dibuat.`);
      setNewEmail("");
      setNewNim("");
      setNewPassword("");
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (currentUser?.email === email) {
      alert("Anda tidak dapat menghapus akun yang sedang Anda gunakan untuk login.");
      return;
    }
    if (!confirm(`Yakin ingin menghapus akun admin ${email}? Tindakan ini tidak dapat dibatalkan.`)) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/v1/admin/users?id=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus akun admin.");
      }

      setSuccessMsg(`Akun admin ${email} telah berhasil dihapus.`);
      fetchUsers();
      if (onRefresh) onRefresh();
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Gagal menghapus akun admin.");
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    if (!editPassword.trim() || editPassword.length < 6) {
      alert("Kata sandi baru minimal 6 karakter.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await fetch("/api/v1/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUserId,
          password: editPassword,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal mengubah kata sandi.");
      }

      setSuccessMsg(`Kata sandi untuk ${editingUserEmail} berhasil diperbarui.`);
      setEditingUserId(null);
      setEditPassword("");
      fetchUsers();
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal mengubah kata sandi.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const getUserInitials = (email: string) => {
    const namePart = email.split("@")[0] || "A";
    return namePart.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-5 w-full font-sans">
      {/* 1. Header Card Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-teal-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Pengaturan Sistem & Hak Akses
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                Konsol BAAK
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Kelola kredensial staf BAAK, konfigurasi identitas dokumen resmi SK/SPTJM, dan pantau status server.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{users.length} Akun Terdaftar</span>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer shadow-2xs"
            title="Segarkan data akun dari database"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-teal-500" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-tab Segmented Control */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-white/10 pb-3 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSubTab("users")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === "users"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/5"
          }`}
        >
          <User className="h-4 w-4" />
          <span>Kelola Akun Staf BAAK & Superadmin ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("institution")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === "institution"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/5"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Identitas Lembaga & Kop SK/SPTJM</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("system")}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeSubTab === "system"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-white/5"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Diagnostik Server & Database</span>
        </button>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-xs text-rose-600 font-bold hover:underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 1: AKUN STAF BAAK & SUPERADMIN                                */}
      {/* ===================================================================== */}
      {activeSubTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Kolom Kiri: Tabel Daftar Akun (7 Kolom di Desktop) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>Daftar Akun Administrator</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {users.length} Akun
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Staf yang memiliki akses ke sistem repositori, PISN, dan arsip dokumen.
                  </p>
                </div>
              </div>

              {/* Inline Password Edit Box jika sedang aktif */}
              {editingUserId && (
                <div className="mb-4 p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-300 dark:border-teal-500/30 space-y-2.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                      <span className="text-xs font-bold text-teal-950 dark:text-teal-100">
                        Ubah Kata Sandi: <span className="font-mono text-teal-700 dark:text-teal-300">{editingUserEmail}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <form onSubmit={handleUpdatePassword} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                        className="w-full px-3 py-2 pr-9 rounded-xl bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-500/40 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showEditPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50 flex-shrink-0"
                    >
                      {isUpdatingPassword ? "Menyimpan..." : "Simpan Sandi"}
                    </button>
                  </form>
                </div>
              )}

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin text-teal-500" />
                  <span className="text-xs">Memuat daftar akun admin...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Belum ada akun admin yang terdaftar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="pb-3 pl-1">Pengguna / ID</th>
                        <th className="pb-3 px-2">Hak Akses</th>
                        <th className="pb-3 px-2">Status</th>
                        <th className="pb-3 px-2">Terdaftar</th>
                        <th className="pb-3 pr-1 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {users.map((u) => {
                        const isSelf = currentUser?.email === u.email;
                        const isSuper = u.role === "SUPERADMIN";

                        return (
                          <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                            {/* Email & ID */}
                            <td className="py-3 pl-1">
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs flex-shrink-0 shadow-2xs ${
                                    isSuper
                                      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50"
                                      : "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-700/50"
                                  }`}
                                >
                                  {getUserInitials(u.email)}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                                    <span className="truncate max-w-[180px] sm:max-w-none">{u.email}</span>
                                    {isSelf && (
                                      <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/60 px-1.5 py-0.2 rounded border border-teal-300/60 dark:border-teal-700">
                                        Anda
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10.5px] font-mono text-slate-400 mt-0.5">
                                    ID: {u.nim || "-"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Role */}
                            <td className="py-3 px-2">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                                  isSuper
                                    ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700/50"
                                    : "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700/50"
                                }`}
                              >
                                {isSuper ? "Superadmin" : "Staf BAAK"}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3 px-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{u.status}</span>
                              </span>
                            </td>

                            {/* Tanggal */}
                            <td className="py-3 px-2 text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                              {new Date(u.createdAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>

                            {/* Aksi */}
                            <td className="py-3 pr-1 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditingUserEmail(u.email);
                                    setEditPassword("");
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition text-[11px] font-semibold cursor-pointer shadow-2xs"
                                  title="Ubah kata sandi akun"
                                >
                                  <KeyRound className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                                  <span className="hidden sm:inline">Sandi</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isSelf}
                                  onClick={() => handleDeleteUser(u.id, u.email)}
                                  className={`p-1.5 rounded-lg border border-slate-200 dark:border-white/10 transition text-[11px] cursor-pointer shadow-2xs ${
                                    isSelf
                                      ? "opacity-30 cursor-not-allowed text-slate-400"
                                      : "text-slate-500 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                                  }`}
                                  title={isSelf ? "Tidak dapat menghapus akun Anda sendiri" : "Hapus akun"}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Form Tambah Admin Baru (5 Kolom di Desktop) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shadow-2xs">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Tambah Akun Admin Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Kredensial login baru untuk staf pengelola BAAK.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Staf / Admin <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="contoh: stafbaak@stimi-yapmi.ac.id"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-2xs transition"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Digunakan sebagai username saat login ke konsol BAAK.
                  </span>
                </div>

                {/* ID Staf / NIP */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ID Staf / NIP / Username <span className="text-slate-400 font-normal">(Opsional)</span>
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={newNim}
                      onChange={(e) => setNewNim(e.target.value)}
                      placeholder="Contoh: BAAK-02 atau NIP Staf"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-2xs transition"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kata Sandi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-2xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showNewPassword ? "Sembunyikan" : "Tampilkan sandi"}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Gunakan kombinasi huruf dan angka yang aman.
                  </span>
                </div>

                {/* Role Selector Card */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Tingkat Hak Akses (Role)
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Role Option 1: Staf BAAK */}
                    <div
                      onClick={() => setNewRole("ADMIN_BAAK")}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        newRole === "ADMIN_BAAK"
                          ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 shadow-2xs"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Shield className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                        {newRole === "ADMIN_BAAK" && (
                          <div className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Staf BAAK</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Kelola PISN, Skripsi & Berkas
                      </p>
                    </div>

                    {/* Role Option 2: Superadmin */}
                    <div
                      onClick={() => setNewRole("SUPERADMIN")}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        newRole === "SUPERADMIN"
                          ? "border-purple-600 bg-purple-50/70 dark:bg-purple-950/40 text-purple-950 dark:text-purple-100 shadow-2xs"
                          : "border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        {newRole === "SUPERADMIN" && (
                          <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Superadmin</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Akses Penuh + Kelola Akun
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Membuat Akun...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Simpan Akun Administrator</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 2: IDENTITAS LEMBAGA & KOP DOKUMEN                            */}
      {/* ===================================================================== */}
      {activeSubTab === "institution" && (
        <form onSubmit={handleSaveInstitution} className="space-y-6">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span>Identitas Lembaga & Pejabat Penandatangan Resmi</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Data pejabat penandatangan dan institusi ini digunakan secara otomatis pada berkas Lampiran SK Yudisium dan SPTJM PISN Kemdiktisaintek.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchInstitutionSettings}
                disabled={isInstLoading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Muat ulang data konfigurasi dari server"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isInstLoading ? "animate-spin text-teal-500" : ""}`} />
                <span>Muat Ulang</span>
              </button>

              <button
                type="submit"
                disabled={isInstSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition cursor-pointer disabled:opacity-50"
              >
                {isInstSaving ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    <span>Simpan Pengaturan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Form Fields: Grid 2 Kolom */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Bagian 1: Pejabat Penandatangan */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Pejabat Penandatangan SK / SPTJM
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pimpinan perguruan tinggi yang bertindak atas nama instansi.
                  </p>
                </div>
              </div>

              {/* Nama Lengkap & Gelar */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap & Gelar Akademik <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={instSettings.leaderName}
                  onChange={(e) => setInstSettings({ ...instSettings, leaderName: e.target.value })}
                  placeholder="Contoh: Dr. Ibrahim Syah SE., MM."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Dicetak pada baris tanda tangan dan tabel identitas SPTJM.
                </span>
              </div>

              {/* NIDN & Pangkat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    NIDN (Nomor Induk Dosen) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instSettings.leaderNidn}
                    onChange={(e) => setInstSettings({ ...instSettings, leaderNidn: e.target.value })}
                    placeholder="Contoh: 0918066801"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white font-mono font-semibold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Dicetak di bawah nama tanda tangan (NIDN. XXXXXXXX).
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Pangkat / Golongan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instSettings.leaderPangkat}
                    onChange={(e) => setInstSettings({ ...instSettings, leaderPangkat: e.target.value })}
                    placeholder="Contoh: Asisten Ahli/III.b"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Jenjang kepangkatan resmi LLDIKTI.
                  </span>
                </div>
              </div>

              {/* Jabatan Resmi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jabatan Pemimpin Perguruan Tinggi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={instSettings.leaderTitle}
                  onChange={(e) => setInstSettings({ ...instSettings, leaderTitle: e.target.value })}
                  placeholder="Contoh: Ketua STIMI YAPMI Makassar"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>
            </div>

            {/* Bagian 2: Data Lembaga Perguruan Tinggi */}
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-white/5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                    Data Lembaga Perguruan Tinggi
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Identitas resmi perguruan tinggi di PDDIKTI / Kemdiktisaintek.
                  </p>
                </div>
              </div>

              {/* Nama Perguruan Tinggi */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Resmi Perguruan Tinggi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={instSettings.institutionName}
                  onChange={(e) => setInstSettings({ ...instSettings, institutionName: e.target.value })}
                  placeholder="Contoh: Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>

              {/* Kode PT & Kota */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kode PT (PDDIKTI) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instSettings.institutionCode}
                    onChange={(e) => setInstSettings({ ...instSettings, institutionCode: e.target.value })}
                    placeholder="Contoh: 093046"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kota Penandatangan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instSettings.city}
                    onChange={(e) => setInstSettings({ ...instSettings, city: e.target.value })}
                    placeholder="Contoh: Makassar"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                  />
                </div>
              </div>

              {/* Alamat Kampus */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alamat Kampus
                </label>
                <input
                  type="text"
                  value={instSettings.address}
                  onChange={(e) => setInstSettings({ ...instSettings, address: e.target.value })}
                  placeholder="Contoh: Jl. Danau Tanjung Bunga No. 1, Kota Makassar"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* Pratinjau KOP & Tanda Tangan */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Kop Surat (7 Kolom) */}
            <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pratinjau KOP Surat Resmi (public/kop-stimi.jpg)
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-300/60 dark:border-teal-700">
                  Embed Otomatis ke SPTJM
                </span>
              </div>
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex justify-center">
                <Image
                  src="/kop-stimi.jpg"
                  alt="Kop STIMI YAPMI Makassar"
                  width={572}
                  height={113}
                  className="w-full max-w-[520px] h-auto object-contain"
                />
              </div>
            </div>

            {/* Live Tanda Tangan SPTJM (5 Kolom) */}
            <div className="lg:col-span-5 p-5 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Pratinjau Tanda Tangan SPTJM
                </span>
                <span className="text-[10px] text-slate-400">Format Kertas Dikti</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/30 dark:bg-slate-800/60 border border-amber-200/50 dark:border-white/5 font-serif text-center space-y-1">
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {instSettings.city || "Makassar"},{" "}
                  {new Date().toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  {instSettings.leaderTitle || "Ketua STIMI YAPMI Makassar"},
                </p>
                <div className="h-14 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-600 italic">
                  (Area Tanda Tangan Fisik & Cap Basah)
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white underline">
                  {instSettings.leaderName || "Dr. Ibrahim Syah SE., MM."}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-sans font-semibold">
                  NIDN. {instSettings.leaderNidn || "0918066801"}
                </p>
              </div>

              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={isInstSaving}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md shadow-teal-600/25 transition cursor-pointer disabled:opacity-50"
                >
                  {isInstSaving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Simpan Identitas Penandatangan</span>
                    </>
                  )}
                </button>

                {/* Tombol Uji Coba Dokumen Cetak */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="/api/v1/pisn/lampiran-sk?decreeNumber=000.2/342/STIMI-YAPMI/MKS/VII/2026&dateStr=2026-07-31"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:border-teal-300 dark:hover:bg-slate-800 transition text-center"
                    title="Uji coba pratinjau cetak Lampiran SK Yudisium dengan KOP & TTD"
                  >
                    <span>📄 Tes Lampiran SK</span>
                  </a>
                  <a
                    href="/api/v1/pisn/sptjm?decreeNumber=000.2/342/STIMI-YAPMI/MKS/VII/2026&dateStr=2026-07-31&count=26"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-teal-50 hover:border-teal-300 dark:hover:bg-slate-800 transition text-center"
                    title="Uji coba pratinjau cetak SPTJM PIN"
                  >
                    <span>📄 Tes SPTJM PIN</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: DIAGNOSTIK SERVER & DATABASE                               */}
      {/* ===================================================================== */}
      {activeSubTab === "system" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <span>Diagnostik Server Lokal & Basis Data</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Informasi arsitektur penyimpanan berkas dan koneksi database sistem LULUSANSTIMI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-500/20 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
                <Database className="h-4 w-4" />
                <span>Basis Data Utama</span>
              </div>
              <p className="text-lg font-black text-slate-900 dark:text-white font-mono">
                MongoDB Atlas
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Prisma Client Terhubung</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                <HardDrive className="h-4 w-4" />
                <span>Penyimpanan Berkas</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono truncate">
                storage/uploads/
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Scan Ijazah & Transkrip Nilai (PC Server Lokal)
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
                <FileCheck2 className="h-4 w-4" />
                <span>Standar Regulasi PISN</span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Ditjen Diktiristek
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                PISN & SIVIL Kemdiktisaintek 2026
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
