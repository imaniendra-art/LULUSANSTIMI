"use client";

import React, { useState } from "react";
import {
  X,
  Server,
  Database,
  Code2,
  Copy,
  Check,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Shield,
  Layers,
} from "lucide-react";

interface SiamApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalGraduates: number;
}

export function SiamApiModal({
  isOpen,
  onClose,
  totalGraduates,
}: SiamApiModalProps) {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="max-w-2xl w-full max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Integrasi Otomatis SIAM & Feeder API
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Spesifikasi REST API Internal & Single Source of Truth Repositori Kredensial
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Status Architecture Card */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Konektor API Internal Aktif
              </span>
              <span className="font-mono text-[11px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                HTTP 200 READY
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Aplikasi <strong>LULUSANSTIMI</strong> bertindak sebagai <em>Single Source of Truth (SSOT)</em>. Sistem Informasi Akademik Mahasiswa (SIAM), Tracer Study, maupun aplikasi stakeholder STIMI YAPMI Makassar lainnya dapat menarik data alumni terverifikasi atau menyinkronkan data kelulusan baru secara instan.
            </p>
          </div>

          {/* Endpoints Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-indigo-500" />
              Daftar Endpoint Terbuka (REST API)
            </h4>

            {/* Endpoint 1 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    /api/v1/alumni
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("/api/v1/alumni?page=1&limit=25", "ep1")}
                  className="text-[11px] inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono cursor-pointer"
                >
                  {copiedEndpoint === "ep1" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Menarik daftar alumni terindeks ({totalGraduates} data). Mendukung filter parameter: <code>q</code>, <code>nim</code>, <code>prodi</code>, <code>yudisiumDate</code>, <code>hasPisn</code>, <code>year</code>.
              </p>
            </div>

            {/* Endpoint 2 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                    GET
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    /api/v1/credentials/:id/preview
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("/api/v1/credentials/{id}/preview?type=ijazah", "ep2")}
                  className="text-[11px] inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono cursor-pointer"
                >
                  {copiedEndpoint === "ep2" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Streaming berkas PDF scan ijazah atau transkrip nilai resmi langsung dari penyimpanan disk lokal server on-premise.
              </p>
            </div>

            {/* Endpoint 3 */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    POST
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    /api/v1/alumni/batch-import
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy("/api/v1/alumni/batch-import", "ep3")}
                  className="text-[11px] inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono cursor-pointer"
                >
                  {copiedEndpoint === "ep3" ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-500" />
                      <span>Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Salin</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Menerima data ekspor Feeder PDDIKTI (.xls / .html) atau spreadsheet Belmawa (.xlsx). Otomatis menyaring status 'Lulus' dan mengabaikan baris DO/pengunduran diri.
              </p>
            </div>
          </div>

          {/* Direct Pull Roadmap Callout */}
          <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-slate-950 border border-slate-200 dark:border-white/10 space-y-1.5">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
              Fitur Direct Pull (Tarik Otomatis 1-Klik)
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Saat ini penarikan data dilakukan secara semi-otomatis melalui menu <strong>Tarik Data Feeder</strong> (unggah file ekspor Feeder <em>Mahasiswa Lulus/DO</em>). Saat token Webhook / Web Service Feeder diizinkan oleh jaringan PDDikti kampus, tombol tarik otomatis 1-klik akan langsung menyinkronkan data mahasiswa lulus secara terjadwal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">
            Port Server: 3022 · Protokol RESTful
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
