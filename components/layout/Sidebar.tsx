'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderGit2,
  Terminal,
  Key,
  Network,
  RefreshCw,
  Lock,
  History,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { PQStore } from '@/lib/mockData';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Repositories', href: '/repositories', icon: FolderGit2 },
  { name: 'Scans', href: '/scans', icon: Terminal },
  { name: 'Crypto Assets', href: '/inventory', icon: Key },
  { name: 'Risk & Impact', href: '/risk', icon: Network },
  { name: 'Migrations', href: '/migrations', icon: RefreshCw },
  { name: 'Policy Center', href: '/policy', icon: Lock },
  { name: 'Audit Trail', href: '/audit', icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState({ critical: 0, total: 0 });

  useEffect(() => {
    // Load some quick status metrics from our local storage store
    const loadStats = () => {
      const assets = PQStore.getAssets();
      const criticalCount = assets.filter(a => a.riskLevel === 'Critical').length;
      setStats({
        critical: criticalCount,
        total: assets.length
      });
    };
    loadStats();
    
    // Watch for updates (can use simple polling or custom events if needed, but polling is quick for prototype)
    const interval = setInterval(loadStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all mock data to the default states?')) {
      PQStore.resetAll();
      window.location.reload();
    }
  };

  return (
    <aside className="w-64 bg-zinc-100 dark:bg-zinc-950 text-zinc-650 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-900 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-zinc-900 justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Shield className="h-4.5 w-4.5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-zinc-800 dark:text-zinc-100 tracking-wide text-sm leading-tight">PQShield</span>
            <span className="text-[10px] text-emerald-605 dark:text-emerald-400 font-mono tracking-wider font-semibold uppercase leading-none mt-0.5">PQC READY</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-150",
                isActive
                  ? "bg-zinc-200 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-l-2 border-indigo-500 pl-2.5"
                  : "hover:bg-zinc-200/50 dark:hover:bg-zinc-900/60 hover:text-zinc-800 dark:hover:text-zinc-250"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0 transition-transform group-hover:scale-105",
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-500 group-hover:text-zinc-650 dark:group-hover:text-zinc-400"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Status Warning Widget */}
      {stats.critical > 0 && (
        <div className="mx-4 my-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-lg flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-red-800 dark:text-red-200">Action Required</span>
            <span className="text-[10px] text-red-600 dark:text-red-400 leading-normal">
              {stats.critical} Critical quantum-vulnerable items detected.
            </span>
          </div>
        </div>
      )}

      {/* Bottom Profile and Settings */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-900 flex flex-col gap-2 bg-zinc-200/20 dark:bg-zinc-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-zinc-250 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center font-semibold text-sm text-zinc-700 dark:text-zinc-200">
            JD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-medium text-zinc-850 dark:text-zinc-200 truncate">John Doe</span>
            <span className="text-[10px] text-zinc-500 truncate">Security Architect</span>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          className="text-left px-2 py-1.5 text-[10px] font-mono text-zinc-550 dark:text-zinc-600 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors uppercase tracking-wider cursor-pointer"
        >
          [ Reset Prototype Database ]
        </button>
      </div>
    </aside>
  );
}
