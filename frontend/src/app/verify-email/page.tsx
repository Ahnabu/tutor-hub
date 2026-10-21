'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { Navbar } from '@/components/Navbar';
import { MailCheck, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-email', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      showSuccessToast('Email verified successfully! Welcome to TutorHub.');
      login(res.data.data.user);
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Verification failed. Please check the code and try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setError(null);
    setInfoMessage(null);
    setResending(true);

    try {
      const res = await api.post('/auth/resend-otp', {
        email: email.trim().toLowerCase(),
      });
      const successMsg = res.data.data.message || 'A new verification code has been sent.';
      setInfoMessage(successMsg);
      showSuccessToast(successMsg);
      setCooldown(60);
    } catch (err: unknown) {
      const msg = showErrorToast(err, 'Could not resend code. Please try again.');
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/60 border border-white/[0.08] backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-2xl">
      <div className="text-center mb-6">
        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/10">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Verify your email</h1>
        <p className="text-sm text-slate-400 mt-1">
          Enter the 6-digit verification code sent to your email
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-2.5 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2.5 text-xs text-emerald-300">
          <MailCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 bg-slate-950/50 border border-white/[0.08] rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            6-Digit Verification Code
          </label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="• • • • • •"
            className="w-full px-3.5 py-3 text-center tracking-[0.5em] font-mono text-xl font-bold bg-slate-950/50 border border-white/[0.08] rounded-xl text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full mt-2 h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify & Continue</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          type="button"
          disabled={cooldown > 0 || resending}
          onClick={handleResend}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${resending ? 'animate-spin' : ''}`} />
          <span>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't receive code? Resend"}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
