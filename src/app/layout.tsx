import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3022"),
  title: "LULUSANSTIMI — Platform Repositori PISN & Kredensial Lulusan STIMI YAPMI Makassar",
  description:
    "Portal Resmi Kelulusan Sekolah Tinggi Ilmu Manajemen Indonesia (STIMI) Yapmi Makassar. Database Penomoran Ijazah Nasional (PISN/PIN Kemdiktisaintek), Verifikasi Dokumen, dan Pelacakan Alumni.",
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    title: "LULUSANSTIMI — STIMI YAPMI Makassar",
    description: "SaaS Repositori PISN, Ijazah Digital & Tracer Study Terpadu",
    images: ["/images/og-banner.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased font-sans selection:bg-indigo-500 selection:text-white">
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
