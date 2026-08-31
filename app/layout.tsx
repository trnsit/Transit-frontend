import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "PQShield | Post-Quantum Cryptographic Migration Engine",
  description: "Evidence-driven cryptographic dependency analysis and PQC migration planner",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-row overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
