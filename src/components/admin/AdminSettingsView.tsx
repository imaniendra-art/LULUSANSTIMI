"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Settings,
  UserPlus,
  Trash2,
  KeyRound,
  ShieldCheck,
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
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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

  useEffect(() => {
    fetchUsers();
  }, []);

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

      setSuccessMsg(`Akun admin ${email} telah dihapus.`);
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

      setSuccessMsg(`Kata sandi akun ${editingUserEmail} berhasil diperbarui.`);
      setEditingUserId(null);
      setEditPassword("");
      fetchUsers();
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal mengubah kata sandi.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl w-full">
      {/* 1. Header Banner Pengaturan */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Pengaturan Sistem & Hak Akses
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                Konsol Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kelola akun staf BAAK, konfigurasi identitas dokumen resmi SK/SPTJM, dan pantau status server.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 2. Navigation Pills Sub-tab */}
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
          <span>Akun Staf BAAK & Superadmin ({users.length})</span>
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
          <span>Identitas Lembaga & Kop Dokumen</span>
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

      {/* Alert Notifikasi */}
      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button type="button" onClick={() => setErrorMsg(null)} className="text-rose-500 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 1: AKUN STAF BAAK & SUPERADMIN                                */}
      {/* ===================================================================== */}
      {activeSubTab === "users" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Kolom Kiri: Tabel Daftar Akun (2 Kolom) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Daftar Akun Administrator
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Akun yang memiliki hak akses untuk mengelola data lulusan dan PISN.
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {users.length} Akun
                </span>
              </div>

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <RefreshCw className="h-5 w-5 animate-spin text-teal-500" />
                  <span className="text-xs">Memuat daftar akun...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  Belum ada akun admin yang terdaftar.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/10 text-slate-400 font-semibold">
                        <th className="pb-3 pl-1">Email / ID</th>
                        <th className="pb-3 px-3">Role</th>
                        <th className="pb-3 px-3">Status</th>
                        <th className="pb-3 px-3">Dibuat</th>
                        <th className="pb-3 pr-1 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition">
                          <td className="py-3.5 pl-1">
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{u.email}</span>
                              {currentUser?.email === u.email && (
                                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.2 rounded">
                                  (Anda)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              ID: {u.nim || "-"}
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.role === "SUPERADMIN"
                                  ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                                  : "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800"
                              }`}
                            >
                              {u.role === "SUPERADMIN" ? "Superadmin" : "Staf BAAK"}
                            </span>
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{u.status}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3.5 pr-1 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingUserId(u.id);
                                  setEditingUserEmail(u.email);
                                  setEditPassword("");
                                }}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                                title="Ubah Kata Sandi"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u.id, u.email)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                                title="Hapus Akun"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Mini Ubah Sandi */}
            {editingUserId && (
              <div className="p-5 rounded-3xl bg-teal-500/10 border border-teal-500/30 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-teal-600" />
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Ubah Kata Sandi untuk: <span className="text-teal-600">{editingUserEmail}</span>
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUserId(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Batal
                  </button>
                </div>

                <form onSubmit={handleUpdatePassword} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Masukkan kata sandi baru (min. 6 karakter)"
                    className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingPassword ? "Menyimpan..." : "Simpan Sandi Baru"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Kolom Kanan: Form Tambah Admin Baru (1 Kolom) */}
          <div className="space-y-4">
            <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Tambah Akun Admin
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Buat kredensial login baru untuk staf BAAK.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3.5">
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
                      placeholder="stafbaak@stimi-yapmi.ac.id"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ID Staf / NIP / Username
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={newNim}
                      onChange={(e) => setNewNim(e.target.value)}
                      placeholder="Contoh: BAAK-02"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

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
                      className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hak Akses (Role)
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "ADMIN_BAAK" | "SUPERADMIN")}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="ADMIN_BAAK">Staf BAAK (Operator PISN & Berkas)</option>
                    <option value="SUPERADMIN">Superadmin (Kelola Akun & Semua Fitur)</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm shadow-teal-600/30 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Buat Akun Administrator</span>
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
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Identitas Lembaga & Pejabat Penandatangan Resmi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Data institusi ini digunakan secara otomatis pada berkas Lampiran SK Yudisium dan Surat Pertanggungjawaban Mutlak (SPTJM) PIN.
            </p>
          </div>

          {/* Pratinjau KOP Resmi */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Pratinjau KOP Surat Resmi STIMI YAPMI Makassar
              </span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                Tersimpan di: public/kop-stimi.jpg
              </span>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex justify-center">
              <Image
                src="/kop-stimi.jpg"
                alt="Kop STIMI YAPMI Makassar"
                width={572}
                height={113}
                className="w-full max-w-[570px] h-auto object-contain"
              />
            </div>
          </div>

          {/* Form / Data Lembaga */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Nama Perguruan Tinggi:</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) YAPMI Makassar
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Kode Perguruan Tinggi (PDDIKTI):</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                093046
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Pimpinan / Ketua STIMI:</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Dr. H. Ibrahim, S.E., M.Si.
              </p>
              <span className="text-[10px] text-slate-500">Jabatan: Ketua STIMI YAPMI Makassar</span>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-800/20 space-y-1">
              <span className="text-[11px] text-slate-400 font-semibold">Status Akreditasi & Alamat:</span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Terakreditasi BAN-PT · Jl. Danau Tanjung Bunga No. 1, Kota Makassar
              </p>
              <span className="text-[10px] text-slate-500">Website: stimiyapmim.ac.id</span>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* SUB-TAB 3: DIAGNOSTIK SERVER & DATABASE                               */}
      {/* ===================================================================== */}
      {activeSubTab === "system" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 shadow-xs space-y-5">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Diagnostik Server Lokal & Basis Data
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
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
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
