'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, ShieldCheck, AlertCircle, } from 'lucide-react';
import { saveAccessToken } from '@/lib/api';

export default function LoginSuccessPage() {
  const router = useRouter();

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    /*
     * Read the token from:
     *
     * /login-success?token=...
     */
    const params =
      new URLSearchParams(
        window.location.search
      );

    const token =
      params.get('token');

    if (!token) {
      setError(
        'No authentication token was returned.'
      );
      return;
    }

    /*
     * Store our Transit JWT.
     */
    saveAccessToken(token);

    /*
     * Remove the token from the browser URL
     * before navigating.
     *
     * This is important because we don't want
     * the JWT remaining visible in the URL.
     */
    window.history.replaceState(
      {},
      document.title,
      '/login-success'
    );

    /*
     * Redirect to dashboard.
     */
    router.replace('/dashboard');
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 text-center">

          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />

          <h1 className="mt-4 text-lg font-bold text-zinc-100">
            Authentication Failed
          </h1>

          <p className="text-xs text-red-300 mt-2">
            {error}
          </p>

          <button
            onClick={() =>
              router.replace('/login')
            }
            className="mt-5 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-indigo-400" />
        </div>

        <RefreshCw className="h-5 w-5 text-indigo-400 animate-spin mt-5" />

        <p className="text-xs text-zinc-500 mt-3">
          Completing authentication...
        </p>
      </div>
    </div>
  );
}