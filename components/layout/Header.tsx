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

  const [scans, setScans] =
    useState<ScanJob[]>([]);

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showUserMenu, setShowUserMenu] =
    useState(false);

  const [theme, setTheme] =
    useState<'dark' | 'light'>('dark');

  const [currentUser, setCurrentUser] =
    useState<UserResponse | null>(null);

  const [isLoadingUser, setIsLoadingUser] =
    useState(true);

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
        const user =
          await apiRequest<UserResponse>(
            '/users/me'
          );

        setCurrentUser(user);
      } catch (error) {
        console.error(
          'Failed to load current user:',
          error
        );

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
      (localStorage.getItem(
        'pq_theme'
      ) as 'dark' | 'light') || 'dark';

    setTheme(savedTheme);

    if (savedTheme === 'dark') {
      document.documentElement.classList.add(
        'dark'
      );

      document.documentElement.style.colorScheme =
        'dark';
    } else {
      document.documentElement.classList.remove(
        'dark'
      );

      document.documentElement.style.colorScheme =
        'light';
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme =
      theme === 'dark'
        ? 'light'
        : 'dark';

    setTheme(nextTheme);

    localStorage.setItem(
      'pq_theme',
      nextTheme
    );

    if (nextTheme === 'dark') {
      document.documentElement.classList.add(
        'dark'
      );

      document.documentElement.style.colorScheme =
        'dark';
    } else {
      document.documentElement.classList.remove(
        'dark'
      );

      document.documentElement.style.colorScheme =
        'light';
    }
  };

  /*
   * Load recent scans
   */
  useEffect(() => {
    const loadScans = () => {
      const allScans =
        PQStore.getScans().slice(0, 3);

      setScans(allScans);
    };

    loadScans();

    const interval = setInterval(
      loadScans,
      5000
    );

    return () =>
      clearInterval(interval);
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

  /*
   * Breadcrumbs
   */
  const getBreadcrumbs = () => {
    const segments =
      pathname
        .split('/')
        .filter(Boolean);

    if (segments.length === 0) {
      return [
        {
          name: 'Overview',
          href: '/dashboard',
        },
      ];
    }

    return segments.map(
      (seg, idx) => {
        const href =
          '/' +
          segments
            .slice(
              0,
              idx + 1
            )
            .join('/');

        let name =
          seg.charAt(0).toUpperCase() +
          seg.slice(1);

        if (name === 'Inventory') {
          name = 'Crypto Assets';
        }

        if (name === 'Profile') {
          name = 'Profile';
        }

        return {
          name,
          href,
        };
      }
    );
  };

  const breadcrumbs =
    getBreadcrumbs();

  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-900 bg-white/60 dark:bg-zinc-950/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">

      {/* Breadcrumbs Navigation */}
      <div className="flex items-center gap-1.5 text-sm">

        <Link
          href="/dashboard"
          className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          PQShield
        </Link>

        {breadcrumbs.map(
          (crumb, idx) => (
            <div
              key={crumb.href}
              className="flex items-center gap-1.5"
            >

              <ChevronRight className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-650 shrink-0" />

              <Link
                href={crumb.href}
                className={
                  idx ===
                  breadcrumbs.length - 1
                    ? 'text-zinc-805 dark:text-zinc-200 font-medium select-none'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors'
                }
              >
                {crumb.name}
              </Link>

            </div>
          )
        )}

      </div>

      {/* Utilities Section */}
      <div className="flex items-center gap-4">

        {/* Connection Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">

          <span className="relative flex h-1.5 w-1.5">

            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />

            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />

          </span>

          <span className="text-[10px] font-mono text-indigo-400 dark:text-indigo-300 uppercase tracking-wider">
            Gateway Simulated
          </span>

        </div>

        {/* Search */}
        <div className="relative w-64 hidden sm:block">

          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />

          <input
            type="text"
            placeholder="Search assets, files, risk..."
            className="w-full h-9 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 text-xs text-zinc-850 dark:text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
          />

        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="h-9 w-9 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          title={`Switch to ${
            theme === 'dark'
              ? 'light'
              : 'dark'
          } mode`}
        >

          {theme === 'dark' ? (
            <Sun className="h-4.5 w-4.5 text-amber-400" />
          ) : (
            <Moon className="h-4.5 w-4.5 text-indigo-500 dark:text-indigo-400" />
          )}

        </button>

        {/* Notifications */}
        <div className="relative">

          <button
            onClick={() =>
              setShowNotifications(
                !showNotifications
              )
            }
            className="h-9 w-9 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 rounded-lg flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >

            <Bell className="h-4 w-4" />

            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>

          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">

              <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">

                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  Recent Scans Activity
                </span>

                <span className="text-[10px] text-zinc-500">
                  Auto-refreshing
                </span>

              </div>

              <div className="divide-y divide-zinc-200 dark:divide-zinc-800/60 max-h-64 overflow-y-auto">

                {scans.length === 0 ? (
                  <div className="px-4 py-6 text-center">

                    <p className="text-[10px] text-zinc-500">
                      No recent scan activity
                    </p>

                  </div>
                ) : (
                  scans.map(
                    (scan) => (
                      <div
                        key={scan.id}
                        className="p-3 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 flex gap-2.5 items-start"
                      >

                        {scan.status ===
                        'completed' ? (
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        )}

                        <div className="flex flex-col gap-0.5">

                          <span className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-[200px]">
                            Scan on{' '}
                            {scan.repoName}
                          </span>

                          <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono">
                            Commit:{' '}
                            {scan.commitSha.slice(
                              0,
                              7
                            )}
                          </span>

                          <span className="text-[9px] text-zinc-500 mt-1">
                            Status:{' '}
                            <span className="text-emerald-400">
                              {scan.status}
                            </span>{' '}
                            •{' '}
                            {scan.findingsCount}{' '}
                            assets
                          </span>

                        </div>

                      </div>
                    )
                  )
                )}

              </div>

              <div className="px-4 py-1.5 border-t border-zinc-200 dark:border-zinc-800 text-center">

                <Link
                  href="/scans"
                  onClick={() =>
                    setShowNotifications(
                      false
                    )
                  }
                  className="text-[10px] font-semibold text-indigo-650 dark:text-indigo-400 hover:text-indigo-550 dark:hover:text-indigo-300 transition-colors uppercase tracking-wider"
                >
                  View Scan Console
                </Link>

              </div>

            </div>
          )}

        </div>

        {/* Authentication */}
        {isLoadingUser ? (
          <div className="hidden sm:flex items-center h-9 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500">
            Loading...
          </div>
        ) : currentUser ? (

          /* Logged-in user */
          <div className="relative">

            <button
              onClick={() =>
                setShowUserMenu(
                  !showUserMenu
                )
              }
              className="h-9 px-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 rounded-lg flex items-center gap-2 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer max-w-[220px]"
            >

              <CircleUserRound className="h-4 w-4 text-indigo-400 shrink-0" />

              <span className="text-xs font-medium truncate hidden sm:block">
                {currentUser.email}
              </span>

              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  showUserMenu
                    ? 'rotate-90'
                    : ''
                }`}
              />

            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-50">

                {/* User information */}
                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">

                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                    {currentUser.email}
                  </p>

                  <p className="text-[10px] text-emerald-500 mt-1">
                    {currentUser.is_active
                      ? 'Active account'
                      : 'Inactive account'}
                  </p>

                </div>

                {/* Profile */}
                <Link
                  href="/profile"
                  onClick={() =>
                    setShowUserMenu(
                      false
                    )
                  }
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >

                  <User className="h-4 w-4 text-zinc-500" />

                  Profile

                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >

                  <LogOut className="h-4 w-4" />

                  Logout

                </button>

              </div>
            )}

          </div>

        ) : (

          /* Visitor */
          <div className="flex items-center gap-2">

            <Link
              href="/login"
              className="h-9 px-3 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              Login
            </Link>

            <Link
              href="/login?mode=register"
              className="h-9 px-3 flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Register
            </Link>

          </div>

        )}

        {/* Quick Scan */}
        <Link
          href="/scans"
          className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-semibold shadow-[0_2px_8px_rgba(79,70,229,0.25)] transition-all active:scale-[0.98]"
        >

          <Terminal className="h-3.5 w-3.5" />

          Run Scan

        </Link>

      </div>

    </header>
  );
}