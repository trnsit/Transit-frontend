'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck, AlertCircle } from 'lucide-react';
import { saveAccessToken } from '@/lib/api';

export default function LoginSuccessPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setError('No authentication token was returned.');
      return;
    }

    saveAccessToken(token);

    window.history.replaceState({}, document.title, '/login-success');
    router.replace('/dashboard');
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#0d121f] border border-rose-800/60 rounded-2xl p-7 text-center shadow-2xl backdrop-blur-xl">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="h-6 w-6" />
          </div>

          <h1 className="mt-4 text-lg font-bold text-white">
            Authentication Failed
          </h1>

          <p className="text-xs text-rose-300 mt-2 leading-relaxed">
            {error}
          </p>

          <button
            onClick={() => router.replace('/login')}
            className="mt-6 h-10 px-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] flex items-center justify-center relative overflow-hidden">
      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col items-center relative z-10">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-cyan-300 p-0.5 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
          <div className="h-full w-full bg-[#090d16] rounded-2xl flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-cyan-400" />
          </div>
        </div>

        <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin mt-6 drop-shadow-[0_0_8px_#22d3ee]" />

        <p className="text-xs font-mono tracking-wider text-slate-300 uppercase mt-4">
          Authorizing Session Credentials...
        </p>
        <span className="text-[10px] text-slate-500 mt-1">
          Redirecting to Transit Command Center
        </span>
      </div>
    </div>
  );
}