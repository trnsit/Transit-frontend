'use client';

import React, { useState } from 'react';
import {
  useRouter,
  useSearchParams,
} from 'next/navigation';
import {
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  Mail,
  Lock,
} from 'lucide-react';

import {
  apiRequest,
  saveAccessToken,
} from '@/lib/api';

interface TokenResponse {
  access_token: string;
  token_type: string;
}

interface OAuthLoginResponse {
  url: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [isLoading, setIsLoading] =
    useState<
      'password' | 'google' | 'github' | null
    >(null);

  const [error, setError] = useState<
    string | null
  >(null);
  
  const searchParams = useSearchParams();

  const [isRegistering, setIsRegistering] =
  useState(
    searchParams.get('mode') === 'register'
  );

  /*
   * Email/password login or registration
   */
  const handlePasswordAuth = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setError(null);

      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }

      if (!password) {
        setError('Please enter your password.');
        return;
      }

      if (isRegistering) {
        if (password.length < 6) {
          setError(
            'Password must be at least 6 characters.'
          );
          return;
        }

        if (password !== confirmPassword) {
          setError(
            'Passwords do not match.'
          );
          return;
        }
      }

      setIsLoading('password');

      /*
       * Register first.
       */
      if (isRegistering) {
        await apiRequest(
          '/register',
          {
            method: 'POST',
            body: JSON.stringify({
              email: email.trim(),
              password,
            }),
          }
        );
      }

      /*
       * Login.
       */
      const response =
        await apiRequest<TokenResponse>(
          '/login',
          {
            method: 'POST',
            body: JSON.stringify({
              email: email.trim(),
              password,
            }),
          }
        );

      if (!response.access_token) {
        throw new Error(
          'Authentication token was not returned.'
        );
      }

      saveAccessToken(
        response.access_token
      );

      router.replace('/dashboard');

    } catch (err) {
      console.error(
        'Authentication failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.'
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

      const response =
        await apiRequest<OAuthLoginResponse>(
          '/auth/google/login'
        );

      if (!response.url) {
        throw new Error(
          'Google authorization URL was not returned.'
        );
      }

      window.location.href =
        response.url;

    } catch (err) {
      console.error(
        'Google OAuth failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start Google authentication.'
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

      const response =
        await apiRequest<OAuthLoginResponse>(
          '/auth/github/login'
        );

      if (!response.url) {
        throw new Error(
          'GitHub authorization URL was not returned.'
        );
      }

      window.location.href =
        response.url;

    } catch (err) {
      console.error(
        'GitHub OAuth failed:',
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start GitHub authentication.'
      );

      setIsLoading(null);
    }
  };

  /*
   * Switch login/register mode.
   */
  const toggleAuthMode = () => {
    setIsRegistering(
      !isRegistering
    );

    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">

          <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="h-7 w-7 text-indigo-400" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-zinc-100">
            Transit
          </h1>

          <p className="mt-1 text-xs text-zinc-500 text-center">
            Post-Quantum Cryptography Migration Platform
          </p>

        </div>

        {/* Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 shadow-2xl">

          {/* Header */}
          <div className="mb-6">

            <h2 className="text-lg font-bold text-zinc-100">
              {isRegistering
                ? 'Create your Transit account'
                : 'Sign in to Transit'}
            </h2>

            <p className="text-xs text-zinc-500 mt-1">
              {isRegistering
                ? 'Create an account using your email and password.'
                : 'Choose how you want to authenticate.'}
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 bg-red-950/30 border border-red-900/50 rounded-lg px-3 py-3 flex items-start gap-2.5">

              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />

              <p className="text-xs text-red-300">
                {error}
              </p>

            </div>
          )}

          {/* Email/password */}
          <form
            onSubmit={handlePasswordAuth}
            className="space-y-4"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="block text-xs font-medium text-zinc-400 mb-2"
              >
                Email
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={
                    isLoading !== null
                  }
                  className="w-full h-11 pl-10 pr-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="block text-xs font-medium text-zinc-400 mb-2"
              >
                Password
              </label>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Enter your password"
                  autoComplete={
                    isRegistering
                      ? 'new-password'
                      : 'current-password'
                  }
                  disabled={
                    isLoading !== null
                  }
                  className="w-full h-11 pl-10 pr-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
                />

              </div>

            </div>

            {/* Confirm password */}
            {isRegistering && (
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-medium text-zinc-400 mb-2"
                >
                  Confirm Password
                </label>

                <div className="relative">

                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={
                      isLoading !== null
                    }
                    className="w-full h-11 pl-10 pr-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
                  />

                </div>

              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isLoading !== null
              }
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >

              {isLoading === 'password' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />

                  {isRegistering
                    ? 'Creating account...'
                    : 'Signing in...'}
                </>
              ) : (
                isRegistering
                  ? 'Create Account'
                  : 'Sign In'
              )}

            </button>

          </form>

          {/* Switch */}
          <div className="text-center mt-4">

            <button
              type="button"
              onClick={toggleAuthMode}
              disabled={
                isLoading !== null
              }
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"}
            </button>

          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">

            <div className="flex-1 h-px bg-zinc-800" />

            <span className="text-[10px] text-zinc-600 uppercase tracking-wider">
              or
            </span>

            <div className="flex-1 h-px bg-zinc-800" />

          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={
              isLoading !== null
            }
            className="w-full h-11 bg-white hover:bg-zinc-100 text-zinc-900 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {isLoading === 'google' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}

            {isLoading === 'google'
              ? 'Connecting to Google...'
              : 'Continue with Google'}

          </button>

          {/* GitHub */}
          <button
            type="button"
            onClick={handleGitHubLogin}
            disabled={
              isLoading !== null
            }
            className="w-full h-11 mt-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {isLoading === 'github' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}

            {isLoading === 'github'
              ? 'Connecting to GitHub...'
              : 'Continue with GitHub'}

          </button>

          {/* Explanation */}
          <div className="mt-5 px-3 py-3 bg-zinc-950/60 border border-zinc-800 rounded-lg">

            <p className="text-[10px] leading-relaxed text-zinc-600">
              Sign in using your Transit account,
              Google, or GitHub. New users can
              create a Transit account through any
              supported authentication method.
            </p>

          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-zinc-700 mt-5">
          Transit Development Environment
        </p>

      </div>

    </div>
  );
}