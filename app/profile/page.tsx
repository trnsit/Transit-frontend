'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Fingerprint,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import {
  apiRequest,
  getAccessToken,
} from '@/lib/api';

interface UserResponse {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] =
    useState<UserResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAccessToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const response =
          await apiRequest<UserResponse>(
            '/users/me'
          );

        setUser(response);
      } catch (err) {
        console.error(
          'Failed to load profile:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load profile.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="p-6">

        <div className="flex items-center gap-2 text-sm text-zinc-500">

          <RefreshCw className="h-4 w-4 animate-spin" />

          Loading profile...

        </div>

      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">

        <div className="max-w-lg bg-red-950/20 border border-red-900/40 rounded-xl p-5">

          <div className="flex items-center gap-2">

            <AlertCircle className="h-5 w-5 text-red-400" />

            <h2 className="text-sm font-semibold text-red-300">
              Unable to load profile
            </h2>

          </div>

          <p className="text-xs text-red-400 mt-2">
            {error || 'User information was not found.'}
          </p>

        </div>

      </div>
    );
  }

  const createdDate =
    new Date(
      user.created_at
    ).toLocaleString();

  const updatedDate =
    new Date(
      user.updated_at
    ).toLocaleString();

  return (
    <div className="p-6 max-w-4xl">

      {/* Page Header */}
      <div className="mb-8">

        <div className="flex items-center gap-3">

          <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">

            <User className="h-5 w-5 text-indigo-400" />

          </div>

          <div>

            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Profile
            </h1>

            <p className="text-xs text-zinc-500 mt-1">
              View your Transit account information.
            </p>

          </div>

        </div>

      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">

        {/* Profile Header */}
        <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">

          <div className="flex items-center gap-4">

            <div className="h-14 w-14 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">

              <User className="h-7 w-7 text-indigo-400" />

            </div>

            <div>

              <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {user.email}
              </h2>

              <div className="flex items-center gap-2 mt-1">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                <span className="text-[10px] text-emerald-500">
                  {user.is_active
                    ? 'Active'
                    : 'Inactive'}
                </span>

              </div>

            </div>

          </div>

        </div>

        {/* Details */}
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">

          {/* Email */}
          <div className="px-6 py-5 flex items-center gap-4">

            <Mail className="h-5 w-5 text-zinc-500 shrink-0" />

            <div>

              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Email
              </p>

              <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">
                {user.email}
              </p>

            </div>

          </div>

          {/* Account Status */}
          <div className="px-6 py-5 flex items-center gap-4">

            <ShieldCheck className="h-5 w-5 text-zinc-500 shrink-0" />

            <div>

              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Account Status
              </p>

              <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">
                {user.is_active
                  ? 'Active'
                  : 'Inactive'}
              </p>

            </div>

          </div>

          {/* User ID */}
          <div className="px-6 py-5 flex items-center gap-4">

            <Fingerprint className="h-5 w-5 text-zinc-500 shrink-0" />

            <div className="min-w-0">

              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                User ID
              </p>

              <p className="text-xs font-mono text-zinc-700 dark:text-zinc-300 mt-1 break-all">
                {user.id}
              </p>

            </div>

          </div>

          {/* Created */}
          <div className="px-6 py-5 flex items-center gap-4">

            <Calendar className="h-5 w-5 text-zinc-500 shrink-0" />

            <div>

              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Account Created
              </p>

              <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">
                {createdDate}
              </p>

            </div>

          </div>

          {/* Updated */}
          <div className="px-6 py-5 flex items-center gap-4">

            <Calendar className="h-5 w-5 text-zinc-500 shrink-0" />

            <div>

              <p className="text-[10px] uppercase tracking-wider text-zinc-500">
                Last Updated
              </p>

              <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">
                {updatedDate}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}