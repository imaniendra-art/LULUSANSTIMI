"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  UserPlus,
  Trash2,
  ShieldCheck,
  Server,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  nim?: string;
  role: string;
  status: string;
  createdAt: string;
}

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSettingsModal({ isOpen, onClose }: AdminSettingsModalProps) {
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
    if (isOpen) {
      fetchUsers();
      setErrorMsg(null);
      setSuccessMsg(null);
      setNewEmail("");
      setNewNim("");
      setNewPassword("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) {
      setErrorMsg("Email admin wajib diisi.");
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
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Yakin ingin menghapus akun admin ${email}?`)) return;

    try {
      const res = await fetch(`/api/v1/admin/users?id=${id}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menghapus akun admin.");
      }

      setSuccessMsg(`Akun ${email} berhasil dihapus.`);
      fetchUsers();
    } catch (err: unknown) {
      alert((err as Error).message || "Gagal menghapus akun.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-3xl w-full rounded-3xl bg-white dark:bg-[#071719] border border-teal-500/30 dark:border-teal-500/30 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-transparent to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>Pengaturan Sistem & Akun Admin</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kelola akun staf administrator BAAK dan informasi server
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Buat Akun Admin Baru */}
          <div className="p-4 sm:p-5 rounded-3xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                Buat Akun Admin Baru
              </h4>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>Email Staf / Admin *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="misal: admin.baak@stimi-yapmi.ac.id"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>ID Staf / NIM (Opsional)</span>
                  </label>
                  <input
                    type="text"
                    value={newNim}
                    onChange={(e) => setNewNim(e.target.value)}
                    placeholder="misal: BAAK02"
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Kata Sandi Baru</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Tingkat Akses (Role)</span>
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as "ADMIN_BAAK" | "SUPERADMIN")}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-semibold focus:outline-none focus:border-teal-500"
                  >
                    <option value="ADMIN_BAAK">Administrator BAAK</option>
                    <option value="SUPERADMIN">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting || !newEmail.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-sm shadow-teal-600/20 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      <span>Simpan Akun Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Daftar Akun Admin Aktif */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
                <span>Daftar Akun Admin Terdaftar ({users.length})</span>
              </h4>
              <button
                type="button"
                onClick={fetchUsers}
                disabled={isLoading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                title="Segarkan daftar akun"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden divide-y divide-slate-200 dark:divide-white/5">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="p-3 sm:p-4 bg-white dark:bg-slate-900/80 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white font-mono truncate">
                        {u.email}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                        {u.role}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        {u.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      ID Staf: {u.nim || "-"} · Dibuat: {new Date(u.createdAt).toLocaleDateString("id-ID")}
                    </p>
                  </div>

                  {users.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/15 transition cursor-pointer flex-shrink-0"
                      title={`Hapus akun ${u.email}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Status Konfigurasi */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
            <Server className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Arsitektur Autentikasi Institusi
              </p>
              <p className="text-[11px] leading-relaxed">
                Akun yang terdaftar memiliki hak akses penuh ke panel pengelolaan data alumni, repositori PISN, SK Yudisium, serta ekspor lampiran resmi STIMI YAPMI Makassar.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Modal */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
