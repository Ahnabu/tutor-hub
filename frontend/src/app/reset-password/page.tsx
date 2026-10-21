'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { Navbar } from '@/components/Navbar';
import { KeyRound, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match';
      setError(msg);
      showErrorToast(new Error(msg));
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });

      showSuccessToast('Your password has been successfully reset!');
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Failed to reset password. The link may have expired.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
        <AlertCircle className="h-10 w-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Invalid Reset Link</h2>
        <p className="text-sm text-slate-400 mb-6">
          This password reset link is invalid or incomplete.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl transition-all"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create a new secure password for your account
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-emerald-300 font-medium">
            Password has been reset successfully!
          </p>
          <Link
            href="/login"
            className="inline-block mt-4 text-xs font-semibold text-slate-950 bg-emerald-500 hover:bg-emerald-400 px-5 py-2.5 rounded-xl transition-all"
          >
            Log in with new password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 chars with uppercase & number"
              className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save Password</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </main>
    </div>
  );
}
