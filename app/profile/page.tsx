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
  Shield,
  KeyRound,
  Lock,
  Sparkles
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
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const token = getAccessToken();

      if (!token) {
        router.replace('/login');
        return;
      }

      try {
        const response = await apiRequest<UserResponse>('/users/me');
        setUser(response);
      } catch (err) {
        console.error('Failed to load profile:', err);
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
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-cyan-400 font-mono text-xs">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>INITIALIZING OPERATOR SECURITY CREDENTIALS...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 text-rose-400">
            <AlertCircle className="h-5 w-5" />
            <h2 className="text-sm font-semibold">Security Session Invalidation</h2>
          </div>
          <p className="text-xs text-rose-300 mt-2 leading-relaxed">
            {error || 'Unable to retrieve operator session record from Gateway.'}
          </p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-4 h-9 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Re-authenticate Operator
          </button>
        </div>
      </div>
    );
  }

  const createdDate = new Date(user.created_at).toLocaleString();
  const updatedDate = new Date(user.updated_at).toLocaleString();
  const initials = user.email ? user.email.slice(0, 2).toUpperCase() : 'OP';

  return (
    <div className="p-6 md:p-8 space-y-7 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Operator Security Credentials
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Verified Identity
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transit identity tokens, zero-trust cryptographic role credentials, and account activity metadata.
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#0d121f]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Profile Banner */}
        <div className="p-6 md:p-7 border-b border-slate-800 bg-gradient-to-r from-cyan-950/30 via-slate-900/40 to-transparent">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-extrabold text-xl text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                {initials}
              </div>

              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {user.email}
                </h2>
                <div className="flex items-center gap-2 mt-1 font-mono text-xs">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {user.is_active ? 'Active Session' : 'Suspended'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 text-[11px]">Level 4 Cryptographic Architect</span>
                </div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2 self-start sm:self-auto">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-300">Transit Sentinel Operator</span>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="divide-y divide-slate-800/60 text-xs">
          {/* Email */}
          <div className="px-6 py-4.5 flex items-center gap-4 hover:bg-slate-800/20 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Primary Identity Email
              </p>
              <p className="text-sm font-semibold text-slate-100 mt-0.5">
                {user.email}
              </p>
            </div>
          </div>

          {/* Account Status */}
          <div className="px-6 py-4.5 flex items-center gap-4 hover:bg-slate-800/20 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Security Posture Status
              </p>
              <p className="text-sm font-semibold text-emerald-400 mt-0.5">
                {user.is_active ? 'Cryptographically Authorized' : 'Deactivated'}
              </p>
            </div>
          </div>

          {/* User ID */}
          <div className="px-6 py-4.5 flex items-center gap-4 hover:bg-slate-800/20 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Transit Operator UUID
              </p>
              <p className="text-xs font-mono text-cyan-300 mt-0.5 break-all">
                {user.id}
              </p>
            </div>
          </div>

          {/* Created */}
          <div className="px-6 py-4.5 flex items-center gap-4 hover:bg-slate-800/20 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Identity Registration Timestamp
              </p>
              <p className="text-sm text-slate-200 mt-0.5 font-mono">
                {createdDate}
              </p>
            </div>
          </div>

          {/* Updated */}
          <div className="px-6 py-4.5 flex items-center gap-4 hover:bg-slate-800/20 transition-colors">
            <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Session Credential Last Modified
              </p>
              <p className="text-sm text-slate-200 mt-0.5 font-mono">
                {updatedDate}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}