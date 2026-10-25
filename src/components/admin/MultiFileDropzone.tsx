"use client";

import React, { useRef, useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

interface MultiFileDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  colorScheme?: "teal" | "emerald" | "amber" | "indigo";
  label?: string;
  hint?: string;
  disabled?: boolean;
}

const colorStyles = {
  teal: {
    border: "border-teal-500/30 dark:border-teal-500/30 hover:border-teal-500",
    borderActive: "border-teal-500 bg-teal-50/60 dark:bg-teal-950/40",
    bgDrop: "bg-teal-50/30 dark:bg-teal-950/20",
    iconBg: "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300",
    chipBg: "bg-teal-50/80 dark:bg-teal-950/50 border-teal-200 dark:border-teal-500/30 text-teal-900 dark:text-teal-200",
    chipRemove: "text-teal-600 hover:text-teal-900 dark:text-teal-400 dark:hover:text-white hover:bg-teal-200/60 dark:hover:bg-teal-800/60",
    badge: "bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-500/30",
    addBtn: "border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40",
  },
  emerald: {
    border: "border-emerald-500/30 dark:border-emerald-500/30 hover:border-emerald-500",
    borderActive: "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40",
    bgDrop: "bg-emerald-50/30 dark:bg-emerald-950/20",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
    chipBg: "bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-500/30 text-emerald-900 dark:text-emerald-200",
    chipRemove: "text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-white hover:bg-emerald-200/60 dark:hover:bg-emerald-800/60",
    badge: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
    addBtn: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40",
  },
  amber: {
    border: "border-amber-500/30 dark:border-amber-500/30 hover:border-amber-500",
    borderActive: "border-amber-500 bg-amber-50/60 dark:bg-amber-950/40",
    bgDrop: "bg-amber-50/30 dark:bg-amber-950/20",
    iconBg: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
    chipBg: "bg-amber-50/80 dark:bg-amber-950/50 border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200",
    chipRemove: "text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-white hover:bg-amber-200/60 dark:hover:bg-amber-800/60",
    badge: "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
    addBtn: "border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40",
  },
  indigo: {
    border: "border-indigo-500/30 dark:border-indigo-500/30 hover:border-indigo-500",
    borderActive: "border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40",
    bgDrop: "bg-indigo-50/30 dark:bg-indigo-950/20",
    iconBg: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
    chipBg: "bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-500/30 text-indigo-900 dark:text-indigo-200",
    chipRemove: "text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-white hover:bg-indigo-200/60 dark:hover:bg-indigo-800/60",
    badge: "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30",
    addBtn: "border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40",
  },
};

export function MultiFileDropzone({
  files,
  onFilesChange,
  accept = ".xlsx,.xls,.html,.htm,.csv",
  colorScheme = "teal",
  label = "Pilih atau Seret Beberapa File Sekaligus:",
  hint = "Format didukung: .xlsx, .xls, .csv, atau .html. Bisa pilih lebih dari 1 file.",
  disabled = false,
}: MultiFileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const styles = colorStyles[colorScheme] || colorStyles.teal;

  const handleIncoming = (incomingList: FileList | File[]) => {
    const arr = Array.from(incomingList);
    if (arr.length === 0) return;

    // Filter duplicates by name + size
    const existingKeys = new Set(files.map((f) => `${f.name}-${f.size}`));
    const newUnique = arr.filter((f) => !existingKeys.has(`${f.name}-${f.size}`));

    if (newUnique.length > 0) {
      onFilesChange([...files, ...newUnique]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleIncoming(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemove = (indexToRemove: number) => {
    onFilesChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearAll = () => {
    onFilesChange([]);
    if (inputRef.current) inputRef.current.value = "";
  };

  const totalSizeKb = files.reduce((acc, f) => acc + f.size, 0) / 1024;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {files.length > 0 && (
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}
            >
              {files.length} file ({totalSizeKb >= 1024 ? `${(totalSizeKb / 1024).toFixed(1)} MB` : `${totalSizeKb.toFixed(1)} KB`})
            </span>
            {files.length > 1 && (
              <button
                type="button"
                onClick={handleClearAll}
                disabled={disabled}
                className="inline-flex items-center gap-1 text-[10px] text-rose-500 hover:text-rose-600 dark:text-rose-400 font-medium transition cursor-pointer"
                title="Hapus semua file yang dipilih"
              >
                <Trash2 className="h-3 w-3" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Drag-Drop Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 text-center transition cursor-pointer relative ${
          isDragging ? styles.borderActive : `${styles.border} ${styles.bgDrop}`
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) {
              handleIncoming(e.target.files);
              // Reset input so re-selecting same file after removal works
              e.target.value = "";
            }
          }}
          className="hidden"
        />

        <div className="space-y-2 pointer-events-none">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center mx-auto transition-transform ${
              isDragging ? "scale-110" : ""
            } ${styles.iconBg}`}
          >
            <UploadCloud className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isDragging
                ? "Lepaskan file di sini..."
                : files.length === 0
                ? "Klik atau seret file ke sini (Bisa banyak file)"
                : "+ Klik atau seret untuk menambah file lagi"}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>
          </div>
        </div>
      </div>

      {/* Selected Files List / Chips */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Daftar File Siap Diimpor:
          </span>
          <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file, idx) => {
              const sizeKb = file.size / 1024;
              const isHtml = file.name.endsWith(".html") || file.name.endsWith(".htm");
              return (
                <div
                  key={`${file.name}-${file.size}-${idx}`}
                  className={`flex items-center justify-between p-2 rounded-xl border text-xs transition animate-in fade-in duration-150 ${styles.chipBg}`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="font-mono text-[10px] opacity-60 w-4 text-center">
                      {idx + 1}.
                    </span>
                    {isHtml ? (
                      <FileText className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                    )}
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {sizeKb >= 1024
                          ? `${(sizeKb / 1024).toFixed(1)} MB`
                          : `${sizeKb.toFixed(1)} KB`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    disabled={disabled}
                    className={`p-1 rounded-lg transition cursor-pointer flex-shrink-0 ${styles.chipRemove}`}
                    title={`Hapus ${file.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
