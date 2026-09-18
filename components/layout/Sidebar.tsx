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
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { PQStore } from '@/lib/mockData';
import { apiRequest, getAccessToken } from '@/lib/api';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Repositories', href: '/repositories', icon: FolderGit2, badge: null },
  { name: 'Scans Console', href: '/scans', icon: Terminal, badge: 'Live' },
  { name: 'Crypto Assets', href: '/inventory', icon: Key, badge: null },
  { name: 'Risk & Impact', href: '/risk', icon: Network, badge: null },
  { name: 'Migrations', href: '/migrations', icon: RefreshCw, badge: null },
  { name: 'Policy Center', href: '/policy', icon: Lock, badge: null },
  { name: 'Audit Trail', href: '/audit', icon: History, badge: null },
];

interface CurrentUser {
  id: string;
  email: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState({ critical: 0, total: 0 });
  const [user, setUser] = useState<CurrentUser | null>(null);

  // Hide sidebar on auth pages
  const isAuthPage = pathname === '/login' || pathname === '/login-success';

  useEffect(() => {
    const loadStats = () => {
      const assets = PQStore.getAssets();
      const criticalCount = assets.filter((a) => a.riskLevel === 'Critical').length;
      setStats({
        critical: criticalCount,
        total: assets.length,
      });
    };
    loadStats();

    const interval = setInterval(loadStats, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const u = await apiRequest<CurrentUser>('/users/me');
        setUser(u);
      } catch {
        setUser(null);
      }
    };
    loadUser();
  }, [pathname]);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all prototype simulation data to defaults?')) {
      PQStore.resetAll();
      window.location.reload();
    }
  };

  if (isAuthPage) {
    return null;
  }

  const userInitials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'TR';

  return (
    <aside className="w-64 bg-[#090d16] text-slate-300 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 z-30 select-none shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between bg-[#0b101c]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_22px_rgba(6,182,212,0.6)] transition-all duration-300">
            <ShieldCheck className="h-5 w-5 text-white" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-100 tracking-wider text-base leading-none group-hover:text-cyan-300 transition-colors">
                TRANSIT
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-mono tracking-widest text-cyan-400/90 font-semibold uppercase">
                PQC SENTINEL
              </span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation section */}
      <div className="px-4 pt-4 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-medium">
        Navigation
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (pathname.startsWith(item.href) && item.href !== '/dashboard');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 via-indigo-500/10 to-transparent text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110',
                    isActive
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                      : 'text-slate-500 group-hover:text-slate-300'
                  )}
                />
                <span>{item.name}</span>
              </div>

              {item.badge && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Critical Vulnerability Notice */}
      {stats.critical > 0 && (
        <div className="mx-3 my-2 p-3 bg-rose-950/25 border border-rose-800/40 rounded-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 to-transparent pointer-events-none" />
          <div className="flex items-start gap-2.5 relative z-10">
            <div className="p-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-xs font-semibold text-rose-300">
                Action Required
              </span>
              <span className="text-[10px] text-rose-400/90 leading-tight">
                <strong className="text-rose-200 font-bold">{stats.critical}</strong> critical quantum-vulnerable items detected.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Snippet & Settings */}
      <div className="p-3 border-t border-slate-800/80 bg-[#070a12]/80 flex flex-col gap-2">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group"
        >
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center font-mono font-bold text-xs text-cyan-300 group-hover:border-cyan-400 transition-colors">
            {userInitials}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-300 transition-colors">
              {user ? user.email : 'Security Operator'}
            </span>
            <span className="text-[9px] font-mono text-slate-500 truncate flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              {user ? 'Authenticated' : 'Local Console'}
            </span>
          </div>
        </Link>

        <button
          onClick={handleReset}
          className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[10px] font-mono text-slate-500 hover:text-cyan-400 hover:bg-slate-800/40 border border-slate-800 hover:border-cyan-500/30 transition-all uppercase tracking-wider cursor-pointer"
          title="Reset local prototype database"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Simulation DB</span>
        </button>
      </div>
    </aside>
  );
}
