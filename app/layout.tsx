import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Transit | Post-Quantum Cryptography Migration Platform",
  description: "Evidence-driven post-quantum cryptographic discovery, risk analysis, and automated migration platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-[#07090e] text-slate-100 flex flex-row overflow-hidden font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Ambient subtle cyber quantum background glow */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#07090e]/95 relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
