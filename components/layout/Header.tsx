'use client';

import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Terminal,
  ChevronRight,
  Check,
  AlertCircle,
  Sun,
  Moon,
  User,
  LogOut,
  CircleUserRound,
  Shield,
  Activity,
  Cpu,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { PQStore, ScanJob } from '@/lib/mockData';
import Link from 'next/link';
import {
  apiRequest,
  getAccessToken,
  clearAccessToken,
} from '@/lib/api';

interface UserResponse {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Header() {
  const pathname = usePathname();

  const [scans, setScans] = useState<ScanJob[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const isAuthPage = pathname === '/login' || pathname === '/login-success';

  /*
   * Load current logged-in user
   */
  useEffect(() => {
    const loadCurrentUser = async () => {
      const token = getAccessToken();

      if (!token) {
        setCurrentUser(null);
        setIsLoadingUser(false);
        return;
      }

      try {
        const user = await apiRequest<UserResponse>('/users/me');
        setCurrentUser(user);
      } catch (error) {
        console.error('Failed to load current user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadCurrentUser();
  }, [pathname]);

  /*
   * Theme
   */
  useEffect(() => {
    const savedTheme =
      (localStorage.getItem('pq_theme') as 'dark' | 'light') || 'dark';

    setTheme(savedTheme);

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('pq_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  /*
   * Load recent scans
   */
  useEffect(() => {
    const loadScans = () => {
      const allScans = PQStore.getScans().slice(0, 3);
      setScans(allScans);
    };

    loadScans();
    const interval = setInterval(loadScans, 4000);
    return () => clearInterval(interval);
  }, []);

  /*
   * Logout
   */
  const handleLogout = () => {
    clearAccessToken();
    setCurrentUser(null);
    setShowUserMenu(false);
    window.location.href = '/login';
  };

  if (isAuthPage) {
    return null;
  }

  /*
   * Breadcrumbs
   */
  const getBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) {
      return [{ name: 'Overview', href: '/dashboard' }];
    }

    return segments.map((seg, idx) => {
      const href = '/' + segments.slice(0, idx + 1).join('/');
      let name = seg.charAt(0).toUpperCase() + seg.slice(1);

      if (name === 'Inventory') name = 'Crypto Assets';
      if (name === 'Scans') name = 'Scans Console';
      if (name === 'Risk') name = 'Risk & Impact';
      if (name === 'Policy') name = 'Policy Center';
      if (name === 'Audit') name = 'Audit Trail';
      if (name === 'Migrations') name = 'Migrations';
      if (name === 'Repositories') name = 'Repositories';

      return { name, href };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-2 text-xs">
        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-cyan-400 font-semibold tracking-wide transition-colors flex items-center gap-1.5"
        >
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>Transit</span>
        </Link>

        {breadcrumbs.map((crumb, idx) => (
          <div key={crumb.href} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-slate-600 shrink-0" />
            <Link
              href={crumb.href}
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-cyan-300 font-semibold select-none'
                  : 'text-slate-400 hover:text-slate-200 transition-colors'
              }
            >
              {crumb.name}
            </Link>
          </div>
        ))}
      </div>

      {/* Utilities Section */}
      <div className="flex items-center gap-3">
        {/* Gateway Connection Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-cyan-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-mono tracking-wider font-semibold uppercase">
            Gateway :8000 Active
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search crypto assets, rules..."
            className="w-full h-9 bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-12 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            Ctrl+K
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-amber-400" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-9 w-9 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 transition-all cursor-pointer relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0d121f] border border-slate-800/90 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  Scan Engine Activity
                </span>
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Live
                </span>
              </div>

              <div className="divide-y divide-slate-800/50 max-h-64 overflow-y-auto">
                {scans.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[10px] text-slate-500">
                    No recent scan activity recorded
                  </div>
                ) : (
                  scans.map((scan) => (
                    <div
                      key={scan.id}
                      className="p-3 hover:bg-slate-800/40 flex gap-2.5 items-start transition-colors"
                    >
                      {scan.status === 'completed' ? (
                        <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {scan.repoName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Commit: {scan.commitSha.slice(0, 7)}
                        </span>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                            {scan.status}
                          </span>
                          <span>•</span>
                          <span>{scan.findingsCount} assets found</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-800 text-center">
                <Link
                  href="/scans"
                  onClick={() => setShowNotifications(false)}
                  className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider font-mono"
                >
                  Open Scans Console →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        {isLoadingUser ? (
          <div className="hidden sm:flex items-center h-9 px-3 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-500 bg-slate-900/60">
            Connecting...
          </div>
        ) : currentUser ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="h-9 px-3 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center gap-2 text-slate-300 transition-all cursor-pointer max-w-[220px]"
            >
              <CircleUserRound className="h-4 w-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-medium truncate hidden sm:block">
                {currentUser.email}
              </span>
              <ChevronRight
                className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                  showUserMenu ? 'rotate-90' : ''
                }`}
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#0d121f] border border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 backdrop-blur-xl">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {currentUser.email}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Verified Operator
                  </p>
                </div>

                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/60 hover:text-cyan-300 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  Operator Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="h-9 px-3.5 flex items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/login?mode=register"
              className="h-9 px-3.5 flex items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-all"
            >
              Register
            </Link>
          </div>
        )}

        {/* Quick Trigger Scan Button */}
        <Link
          href="/scans"
          className="h-9 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-xl flex items-center gap-2 text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all active:scale-[0.98]"
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Run Scan</span>
        </Link>
      </div>
    </header>
  );
}