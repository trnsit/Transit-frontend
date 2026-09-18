'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { apiRequest, saveAccessToken } from '@/lib/api';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface OAuthLoginResponse {
  url: string;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState<
    'password' | 'google' | 'github' | null
  >(null);

  const [error, setError] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(
    searchParams.get('mode') === 'register'
  );

  /*
   * Email/password authentication
   */
  const handlePasswordAuth = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setError(null);

      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }

      if (!password) {
        setError('Please enter your password.');
        return;
      }

      if (isRegistering) {
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
      }

      setIsLoading('password');

      if (isRegistering) {
        await apiRequest('/register', {
          method: 'POST',
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });
      }

      const response = await apiRequest<TokenResponse>('/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.access_token) {
        throw new Error('Authentication token was not returned.');
      }

      saveAccessToken(response.access_token);
      router.replace('/dashboard');
    } catch (err) {
      console.error('Authentication failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please verify credentials.'
      );
      setIsLoading(null);
    }
  };

  /*
   * Google OAuth
   */
  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoading('google');

      const response = await apiRequest<OAuthLoginResponse>(
        '/auth/google/login'
      );

      if (!response.url) {
        throw new Error('Google authorization URL was not returned.');
      }

      window.location.href = response.url;
    } catch (err) {
      console.error('Google OAuth failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to initialize Google authentication.'
      );
      setIsLoading(null);
    }
  };

  /*
   * GitHub OAuth
   */
  const handleGitHubLogin = async () => {
    try {
      setError(null);
      setIsLoading('github');

      const response = await apiRequest<OAuthLoginResponse>(
        '/auth/github/login'
      );

      if (!response.url) {
        throw new Error('GitHub authorization URL was not returned.');
      }

      window.location.href = response.url;
    } catch (err) {
      console.error('GitHub OAuth failed:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to initialize GitHub authentication.'
      );
      setIsLoading(null);
    }
  };

  const toggleAuthMode = (register: boolean) => {
    setIsRegistering(register);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/10 via-indigo-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-cyan-300 p-0.5 shadow-[0_0_35px_rgba(6,182,212,0.4)]">
            <div className="h-full w-full bg-[#090d16] rounded-2xl flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
            </div>
            <span className="absolute -bottom-1 px-2 py-0.5 rounded-full bg-cyan-500 text-[8px] font-mono font-bold tracking-widest text-black uppercase">
              v2.0
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            TRANSIT
          </h1>

          <p className="mt-1.5 text-xs text-slate-400 max-w-xs leading-relaxed">
            Post-Quantum Cryptographic Security Intelligence & Migration Engine
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#0d121f]/85 border border-slate-800/90 rounded-2xl p-7 shadow-2xl backdrop-blur-2xl relative overflow-hidden">
          {/* Subtle Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-80" />

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => toggleAuthMode(false)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                !isRegistering
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => toggleAuthMode(true)}
              className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isRegistering
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 bg-rose-950/30 border border-rose-800/60 rounded-xl p-3.5 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-300 leading-snug">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handlePasswordAuth} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-[11px] font-mono tracking-wider text-slate-400 mb-1.5 uppercase"
              >
                Operator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@organization.com"
                  autoComplete="email"
                  disabled={isLoading !== null}
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-[11px] font-mono tracking-wider text-slate-400 mb-1.5 uppercase"
              >
                Security Key / Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete={
                    isRegistering ? 'new-password' : 'current-password'
                  }
                  disabled={isLoading !== null}
                  className="w-full h-11 pl-10 pr-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            {/* Confirm Password Field */}
            {isRegistering && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[11px] font-mono tracking-wider text-slate-400 mb-1.5 uppercase"
                >
                  Confirm Security Key
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    disabled={isLoading !== null}
                    className="w-full h-11 pl-10 pr-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all disabled:opacity-60"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading !== null}
              className="w-full h-11 mt-2 bg-gradient-to-r from-cyan-500 via-cyan-400 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-[#07090e] font-bold rounded-xl text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.35)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer uppercase"
            >
              {isLoading === 'password' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-[#07090e]" />
                  <span>
                    {isRegistering
                      ? 'Initializing Account...'
                      : 'Authenticating...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {isRegistering
                      ? 'Create Operator Account'
                      : 'Authorize & Enter Console'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
              Single Sign-On
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Social OAuth Providers */}
          <div className="space-y-2.5">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading !== null}
              className="w-full h-11 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {isLoading === 'google' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>
                {isLoading === 'google'
                  ? 'Connecting to Google SSO...'
                  : 'Continue with Google Workspace'}
              </span>
            </button>

            {/* GitHub OAuth Button */}
            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={isLoading !== null}
              className="w-full h-11 bg-slate-800/90 hover:bg-slate-750 text-slate-100 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading === 'github' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="h-4 w-4 fill-current text-white"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              <span>
                {isLoading === 'github'
                  ? 'Connecting to GitHub...'
                  : 'Continue with GitHub'}
              </span>
            </button>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Protected by NIST-approved Post-Quantum Cryptographic validation
              and zero-trust token isolation protocols.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 mt-6 text-[10px] font-mono text-slate-500">
          <span>Transit Cryptographic Intelligence Engine</span>
          <span>•</span>
          <span className="text-emerald-400">PQC Active</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#07090e] flex items-center justify-center">
          <RefreshCw className="h-6 w-6 text-cyan-400 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}