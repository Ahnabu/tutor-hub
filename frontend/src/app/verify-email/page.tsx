'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { showErrorToast, showSuccessToast } from '@/lib/errorHandler';
import { Navbar } from '@/components/Navbar';
import { OtpInput } from '@/components/OtpInput';
import {
  MailCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Check,
  Clock,
} from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [editingEmail, setEditingEmail] = useState(false);
  const [tempEmail, setTempEmail] = useState(email);

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const submitVerification = useCallback(
    async (codeToVerify: string) => {
      if (loading || verified || codeToVerify.length !== 6 || !email.trim()) return;

      setError(null);
      setInfoMessage(null);
      setLoading(true);

      try {
        const res = await api.post('/auth/verify-email', {
          email: email.trim().toLowerCase(),
          otp: codeToVerify.trim(),
        });

        setVerified(true);
        showSuccessToast('Email verified successfully! Welcome to TutorHub.');

        setTimeout(() => {
          login(res.data.data.user);
        }, 1000);
      } catch (err: unknown) {
        const msg = showErrorToast(err, 'Verification failed. Please check the code and try again.');
        setError(msg);
        setOtp(''); // Clear single-use OTP on failure so user re-types fresh
      } finally {
        setLoading(false);
      }
    },
    [email, loading, verified, login]
  );

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitVerification(otp);
  };

  const handleAutoSubmit = (completedCode: string) => {
    submitVerification(completedCode);
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email.trim() || resending || loading || verified) return;

    setError(null);
    setInfoMessage(null);
    setResending(true);
    setOtp(''); // Reset single-use code input

    try {
      const res = await api.post('/auth/resend-otp', {
        email: email.trim().toLowerCase(),
      });
      const successMsg = res.data?.data?.message || 'A fresh one-time verification code has been sent!';
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

  const saveEditedEmail = () => {
    if (tempEmail.trim()) {
      setEmail(tempEmail.trim());
      setEditingEmail(false);
      setOtp('');
      setError(null);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute -top-16 -left-12 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-16 -right-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Card */}
      <div className="relative bg-slate-900/80 border border-white/[0.1] backdrop-blur-2xl rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Animated Top Header Badge */}
        <div className="text-center mb-7">
          <div className="relative inline-flex mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/15 transition-transform duration-500 hover:scale-105">
              {verified ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400 animate-bounce" />
              ) : (
                <MailCheck className="h-8 w-8 text-emerald-400 animate-[pulse_2.5s_infinite]" />
              )}
            </div>
            {/* Status dot */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-900" />
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {verified ? 'Verification Complete!' : 'Verify your email'}
          </h1>

          {/* Email target chip & edit toggle */}
          <div className="mt-2.5 flex items-center justify-center gap-2 flex-wrap">
            {editingEmail ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="email"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="px-3 py-1 text-xs bg-slate-950 border border-emerald-500/50 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={saveEditedEmail}
                  className="p-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
                  title="Save"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-slate-950/60 border border-white/[0.08] px-3 py-1 rounded-full text-xs text-slate-300">
                <span>Code sent to:</span>
                <span className="font-semibold text-emerald-400">{email || 'your email'}</span>
                <button
                  type="button"
                  onClick={() => {
                    setTempEmail(email);
                    setEditingEmail(true);
                  }}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer ml-0.5"
                  title="Change email"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Security & One-Time Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-[11px] font-medium text-emerald-300 mt-3.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Single-Use Code • Expires in 10 minutes</span>
          </div>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 animate-[shake_0.4s_ease-in-out]">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">Error:</span> {error}
            </div>
          </div>
        )}

        {infoMessage && !error && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-emerald-300 animate-fadeIn">
            <MailCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1">{infoMessage}</div>
          </div>
        )}

        {/* Form container */}
        <form onSubmit={handleManualSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Enter 6-Digit Code
              </label>
              {otp.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOtp('')}
                  className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Individual modern digit boxes */}
            <OtpInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                setError(null);
              }}
              onComplete={handleAutoSubmit}
              disabled={loading || verified}
              hasError={!!error}
              autoFocus={true}
            />

            <p className="text-[11px] text-slate-500 text-center mt-3">
              💡 Tip: Paste your 6-digit code or type it digit-by-digit
            </p>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={loading || verified || otp.length !== 6}
            className={`w-full h-12 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none
              ${
                verified
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                  : otp.length === 6 && !loading
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-slate-800 text-slate-500 border border-white/[0.05] cursor-not-allowed opacity-60'
              }
            `}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                <span>Verifying One-Time Code...</span>
              </>
            ) : verified ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-slate-950" />
                <span>Verified! Taking you to TutorHub...</span>
              </>
            ) : (
              <>
                <span>Verify & Complete Registration</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Resend Cooldown Section */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          {cooldown > 0 ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/50 border border-white/[0.08] text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
              <span>
                Resend available in{' '}
                <strong className="text-emerald-400 font-mono font-bold">{cooldown}s</strong>
              </span>
            </div>
          ) : (
            <button
              type="button"
              disabled={resending || loading || verified}
              onClick={handleResend}
              className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-emerald-400 disabled:opacity-50 transition-colors cursor-pointer group"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 transition-transform group-hover:rotate-180 duration-500 ${
                  resending ? 'animate-spin text-emerald-400' : ''
                }`}
              />
              <span>
                {resending ? 'Dispatching new code...' : "Didn't receive the email? Request New Code"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#090D16] text-[#F8FAFC] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-12 relative overflow-hidden">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading verification...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
